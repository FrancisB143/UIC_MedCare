<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get user by email from MSSQL database
     */
    public function getUserByEmail(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $email = $request->input('email');
            Log::info("Searching for user with email: {$email}");

            // Query users table with branch information
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.email', $email)
                ->first();

            if (!$user) {
                Log::info("User not found with email: {$email}");
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Format response to match UserService expectations
            $userData = [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'name' => $user->name,
                'branch_id' => $user->branch_id,
                'branch_name' => $user->branch_name,
                'branches' => [
                    'branch_id' => $user->branch_id,
                    'branch_name' => $user->branch_name
                ]
            ];

            Log::info("User found: " . json_encode($userData));

            return response()->json([
                'success' => true,
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getUserByEmail: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get user's branch information
     */
    public function getUserBranch($userId)
    {
        try {
            Log::info("Getting branch info for user ID: {$userId}");

            $branchInfo = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'branches.branch_id',
                    'branches.branch_name',
                    'branches.address'
                )
                ->where('users.user_id', $userId)
                ->first();

            if (!$branchInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch information not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'branch' => $branchInfo
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getUserBranch: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get all users (for admin purposes)
     */
    public function getAllUsers()
    {
        try {
            $users = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->get();

            return response()->json([
                'success' => true,
                'users' => $users
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getAllUsers: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Create new user
     */
    public function createUser(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|unique:users,email',
                'name' => 'required|string|max:255',
                'branch_id' => 'required|integer|exists:branches,branch_id'
            ]);

            $userId = DB::table('users')->insertGetId([
                'email' => $request->input('email'),
                'name' => $request->input('name'),
                'branch_id' => $request->input('branch_id'),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Get the created user with branch info
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.user_id', $userId)
                ->first();

            return response()->json([
                'success' => true,
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            Log::error("Error in createUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, $userId)
    {
        try {
            $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $userId . ',user_id',
                'name' => 'sometimes|string|max:255',
                'branch_id' => 'sometimes|integer|exists:branches,branch_id'
            ]);

            $updateData = [];
            if ($request->has('email')) {
                $updateData['email'] = $request->input('email');
            }
            if ($request->has('name')) {
                $updateData['name'] = $request->input('name');
            }
            if ($request->has('branch_id')) {
                $updateData['branch_id'] = $request->input('branch_id');
            }
            $updateData['updated_at'] = now();

            $updated = DB::table('users')
                ->where('user_id', $userId)
                ->update($updateData);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Get the updated user with branch info
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.user_id', $userId)
                ->first();

            return response()->json([
                'success' => true,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error("Error in updateUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function deleteUser($userId)
    {
        try {
            $deleted = DB::table('users')
                ->where('user_id', $userId)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Error in deleteUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }
}
