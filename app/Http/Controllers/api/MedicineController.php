<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MedicineController extends Controller
{
    /**
     * Return aggregated medicine stock-out totals grouped by medicine name.
     *
     * Expected return shape: [ { name: string, medicine_stock_out: int, color?: string }, ... ]
     */
    public function stockOut(Request $request)
    {
        try {
            // Attempt to join the stock-out -> stock-in -> medicines tables.
            // Adjust column names if your schema differs.
            $rows = DB::table('medicine_stock_out as mso')
                ->join('medicine_stock_in as msi', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
                ->leftJoin('medicines as m', 'm.medicine_id', '=', 'msi.medicine_id')
                ->select(
                    DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id)) as name"),
                    DB::raw('SUM(mso.quantity_dispensed) as medicine_stock_out'),
                    DB::raw('m.medicine_category as category'),
                    DB::raw('NULL as color')
                )
                ->groupBy(DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id))"), 'm.medicine_category')
                ->orderByDesc('medicine_stock_out')
                ->get()
                ->map(function ($r) {
                    return [
                        'name' => $r->name,
                        'medicine_stock_out' => (int) $r->medicine_stock_out,
                        'category' => $r->category,
                        'color' => null,
                    ];
                })
                ->values();

            return response()->json($rows);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}