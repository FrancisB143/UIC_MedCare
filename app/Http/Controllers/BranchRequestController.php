<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BranchRequestController extends Controller
{
    /**
     * Store a new branch request and create a notification for the target branch.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'from_branch_id' => 'required|integer|exists:branches,branch_id',
                'to_branch_id' => 'required|integer|exists:branches,branch_id',
                'medicine_id' => 'required|integer|exists:medicines,medicine_id',
                'quantity_requested' => 'required|integer|min:1',
                'requested_by' => 'required|integer|exists:users,user_id'
            ]);

            Log::info('Creating branch request: ' . json_encode($validated));

            DB::beginTransaction();

            $requestId = DB::table('branch_requests')->insertGetId([
                'from_branch_id' => $validated['from_branch_id'],
                'to_branch_id' => $validated['to_branch_id'],
                'medicine_id' => $validated['medicine_id'],
                'quantity_requested' => $validated['quantity_requested'],
                'status' => 'pending',
                'requested_by' => $validated['requested_by'],
                'created_at' => now()
            ]);

            // create notification for the target branch using the branch name for readability
            $medicine = DB::table('medicines')->where('medicine_id', $validated['medicine_id'])->value('medicine_name');
            $fromBranchName = DB::table('branches')->where('branch_id', $validated['from_branch_id'])->value('branch_name');
            $displayFrom = $fromBranchName ?? ('Branch ' . $validated['from_branch_id']);
            $message = sprintf('%s requested %d units of %s', $displayFrom, $validated['quantity_requested'], $medicine ?? 'medicine');

            // append request token for linkage, stored but the UI will strip it when displaying
            $notifMessage = $message . ' [req:' . $requestId . ']';
            DB::table('notifications')->insert([
                'branch_id' => $validated['to_branch_id'],
                'type' => 'request',
                'message' => $notifMessage,
                'reference_id' => $validated['medicine_id'],
                'is_read' => 0,
                'created_at' => now()
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Request created', 'request_id' => $requestId], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Validation failed in BranchRequestController@store: ' . json_encode($e->errors()));
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating branch request: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Get pending requests for a branch (to_branch_id)
    public function index($branchId)
    {
        try {
            $rows = DB::table('branch_requests as br')
                ->leftJoin('medicines as m', 'br.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as f', 'br.from_branch_id', '=', 'f.branch_id')
                ->leftJoin('users as u', 'br.requested_by', '=', 'u.user_id')
                ->select('br.branch_request_id', 'br.from_branch_id', 'br.to_branch_id', 'br.medicine_id', 'm.medicine_name', 'br.quantity_requested', 'br.status', 'br.requested_by', 'u.name as requested_by_name', 'br.created_at')
                ->where('br.to_branch_id', $branchId)
                ->where('br.status', 'pending')
                ->orderBy('br.created_at', 'desc')
                ->get();

            return response()->json($rows->toArray());
        } catch (\Exception $e) {
            Log::error('Error fetching pending branch requests: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }

    // Approve a request: update status and set confirmed_by
    public function approve(Request $request, $requestId)
    {
        try {
            $validated = $request->validate([
                'confirmed_by' => 'required|integer|exists:users,user_id'
            ]);

            DB::beginTransaction();

            // Fetch the request row
            $req = DB::table('branch_requests')->where('branch_request_id', $requestId)->first();
            if (!$req) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Request not found'], 404);
            }

            // Determine approver branch (the branch that received the request) and requester branch
            $approverBranchId = $req->to_branch_id;
            $requesterBranchId = $req->from_branch_id;
            $medicineId = $req->medicine_id;
            $qtyRequested = intval($req->quantity_requested);

            // Calculate total available stock in approver branch for this medicine
            $stockInRows = DB::table('medicine_stock_in as msi')
                ->leftJoin('medicine_stock_out as mso', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
                ->leftJoin('medicine_archived as ma', 'msi.medicine_stock_in_id', '=', 'ma.medicine_stock_in_id')
                // include expiration_date in select and groupBy so ORDER BY is valid on SQL Server
                ->select('msi.medicine_stock_in_id', 'msi.quantity', 'msi.expiration_date', DB::raw('ISNULL(SUM(mso.quantity_dispensed),0) as total_dispensed'), DB::raw('ISNULL(SUM(ma.quantity),0) as total_archived'))
                ->where('msi.branch_id', $approverBranchId)
                ->where('msi.medicine_id', $medicineId)
                ->groupBy('msi.medicine_stock_in_id', 'msi.quantity', 'msi.expiration_date')
                ->orderBy('msi.expiration_date', 'asc')
                ->get();

            $totalAvailable = 0;
            foreach ($stockInRows as $r) {
                $available = intval($r->quantity) - intval($r->total_dispensed) - intval($r->total_archived);
                if ($available > 0) $totalAvailable += $available;
            }

            if ($totalAvailable < $qtyRequested) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Insufficient stock to approve request'], 400);
            }

            // Deduct stock from approver branch using FEFO across stock_in records
            $remaining = $qtyRequested;
            foreach ($stockInRows as $r) {
                if ($remaining <= 0) break;
                $available = intval($r->quantity) - intval($r->total_dispensed) - intval($r->total_archived);
                if ($available <= 0) continue;
                $toDispense = min($available, $remaining);

                // insert medicine_stock_out record
                DB::table('medicine_stock_out')->insert([
                    'medicine_stock_in_id' => $r->medicine_stock_in_id,
                    'quantity_dispensed' => $toDispense,
                    'user_id' => $validated['confirmed_by'],
                    'branch_id' => $approverBranchId,
                    'timestamp_dispensed' => now()
                ]);

                $remaining -= $toDispense;
            }

            // Add medicine_stock_in record to the requesting branch to reflect transfer
            // Use today's date_received and set expiration_date to today+1 year as a conservative default
            $dateReceived = date('Y-m-d');
            $expirationDate = date('Y-m-d', strtotime('+1 year'));
            DB::table('medicine_stock_in')->insert([
                'medicine_id' => $medicineId,
                'quantity' => $qtyRequested,
                'date_received' => $dateReceived,
                'expiration_date' => $expirationDate,
                'user_id' => $validated['confirmed_by'],
                'branch_id' => $requesterBranchId,
                'timestamp_dispensed' => now()
            ]);

            // Update branch request status to approved and set confirmed_by
            $updated = DB::table('branch_requests')
                ->where('branch_request_id', $requestId)
                ->update(['status' => 'approved', 'confirmed_by' => $validated['confirmed_by'], 'updated_at' => now()]);

            if (!$updated) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Failed to update request status'], 500);
            }

            // Create notification back to requester branch
            $medicine = DB::table('medicines')->where('medicine_id', $medicineId)->value('medicine_name');
            $msg = sprintf('Your request for %d units of %s has been approved', $qtyRequested, $medicine ?? 'medicine');
            DB::table('notifications')->insert(['branch_id' => $requesterBranchId, 'type' => 'request', 'message' => $msg, 'reference_id' => $medicineId, 'is_read' => 0, 'created_at' => now()]);

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log full exception for debugging
            Log::error('Error approving branch request: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            // Return the exception message to the frontend to aid debugging (kept concise)
            return response()->json(['success' => false, 'message' => 'Server error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Reject a request: update status and set confirmed_by
    public function reject(Request $request, $requestId)
    {
        try {
            $validated = $request->validate([
                'confirmed_by' => 'required|integer|exists:users,user_id',
                'reason' => 'nullable|string'
            ]);

            $updated = DB::table('branch_requests')
                ->where('branch_request_id', $requestId)
                ->update(['status' => 'rejected', 'confirmed_by' => $validated['confirmed_by'], 'updated_at' => now()]);

            if (!$updated) return response()->json(['success' => false, 'message' => 'Request not found'], 404);

            // Notify requester
            $req = DB::table('branch_requests')->where('branch_request_id', $requestId)->first();
            $medicine = DB::table('medicines')->where('medicine_id', $req->medicine_id)->value('medicine_name');
            $msg = sprintf('Your request for %d units of %s has been rejected', $req->quantity_requested, $medicine ?? 'medicine');
            if (!empty($validated['reason'])) $msg .= ': ' . $validated['reason'];
            DB::table('notifications')->insert(['branch_id' => $req->from_branch_id, 'type' => 'request', 'message' => $msg, 'reference_id' => $req->medicine_id, 'is_read' => 0, 'created_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error rejecting branch request: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }
}
