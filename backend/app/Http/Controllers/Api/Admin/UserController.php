<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of registered users (Customers & Vendors).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query()
                ->withCount(['orders', 'addresses', 'carts', 'favorites'])
                ->withSum('orders', 'total_amount');

            // Default filter: Role 2 (Customer) & Role 3 (Vendor), or specific role if requested
            if ($request->filled('role')) {
                $role = (int) $request->input('role');
                if (in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_CUSTOMER, User::ROLE_VENDOR])) {
                    $query->where('role', $role);
                }
            } else {
                // By default show Customers (2) and Vendors (3) unless include_admin is true
                if (!$request->boolean('include_admin', false)) {
                    $query->whereIn('role', [User::ROLE_CUSTOMER, User::ROLE_VENDOR]);
                }
            }

            // Search by Name, Email, Contact Number, or WhatsApp Number
            if ($request->filled('search')) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('contact_number', 'like', "%{$search}%")
                      ->orWhere('whatsapp_number', 'like', "%{$search}%");
                });
            }

            // Filter by Blocked Status
            if ($request->filled('status')) {
                $status = $request->input('status');
                if ($status === 'blocked') {
                    $query->where('is_blocked', true);
                } elseif ($status === 'active') {
                    $query->where('is_blocked', false);
                }
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortDir = $request->input('sort_dir', 'desc');
            $allowedSorts = ['id', 'full_name', 'email', 'created_at', 'role', 'orders_count', 'orders_sum_total_amount'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, strtolower($sortDir) === 'asc' ? 'asc' : 'desc');
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $perPage = (int) $request->input('per_page', 25);
            $users = $query->paginate($perPage);

            // Compute quick stats
            $stats = [
                'total_users'     => User::whereIn('role', [User::ROLE_CUSTOMER, User::ROLE_VENDOR])->count(),
                'total_customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
                'total_vendors'   => User::where('role', User::ROLE_VENDOR)->count(),
                'total_blocked'   => User::whereIn('role', [User::ROLE_CUSTOMER, User::ROLE_VENDOR])->where('is_blocked', true)->count(),
            ];

            return response()->json([
                'status'  => true,
                'message' => 'Users retrieved successfully',
                'data'    => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page'    => $users->lastPage(),
                    'per_page'     => $users->perPage(),
                    'total'        => $users->total(),
                ],
                'stats' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Display the specified user details.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = User::with(['addresses', 'orders' => function ($q) {
                $q->latest()->limit(5)->with('items');
            }])
            ->withCount(['orders', 'addresses', 'carts', 'favorites'])
            ->withSum('orders', 'total_amount')
            ->find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                    'data'    => null,
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'User details retrieved successfully',
                'data'    => $user,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to retrieve user: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Update user information without touching the password.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                    'data'    => null,
                ], 404);
            }

            $validated = $request->validate([
                'full_name'       => 'required|string|max:255',
                'email'           => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
                'contact_number'  => 'nullable|string|max:20',
                'whatsapp_number' => 'nullable|string|max:20',
                'role'            => ['required', 'integer', Rule::in([User::ROLE_CUSTOMER, User::ROLE_VENDOR])],
                'is_blocked'      => 'nullable|boolean',
                'blocked_reason'  => 'nullable|string|max:255',
            ]);

            // Update allowed fields (Password is strictly NOT included or modified)
            $user->full_name       = $validated['full_name'];
            $user->email           = $validated['email'];
            $user->contact_number  = $validated['contact_number'] ?? null;
            $user->whatsapp_number = $validated['whatsapp_number'] ?? null;
            $user->role            = (int) $validated['role'];

            if (array_key_exists('is_blocked', $validated)) {
                $user->is_blocked = (bool) $validated['is_blocked'];
                $user->blocked_reason = $validated['blocked_reason'] ?? null;

                if ($user->is_blocked) {
                    $user->tokens()->delete(); // Revoke active sessions on block
                }
            }

            $user->save();

            return response()->json([
                'status'  => true,
                'message' => 'User updated successfully (password untouched)',
                'data'    => $user->fresh(),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update user: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Toggle block/unblock status for a user.
     */
    public function toggleBlock(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                    'data'    => null,
                ], 404);
            }

            if ($user->role === User::ROLE_SUPER_ADMIN) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Super Administrator accounts cannot be blocked.',
                    'data'    => null,
                ], 403);
            }

            $user->is_blocked = !$user->is_blocked;
            if ($user->is_blocked) {
                $user->blocked_reason = $request->input('reason', 'Blocked by Admin');
                $user->tokens()->delete(); // Immediately revoke any active Sanctum tokens
            } else {
                $user->blocked_reason = null;
            }

            $user->save();

            $statusText = $user->is_blocked ? 'blocked' : 'unblocked';

            return response()->json([
                'status'  => true,
                'message' => "User account has been successfully {$statusText}.",
                'data'    => [
                    'id'             => $user->id,
                    'is_blocked'     => $user->is_blocked,
                    'blocked_reason' => $user->blocked_reason,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update block status: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Remove the specified user from database.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                    'data'    => null,
                ], 404);
            }

            if ($user->role === User::ROLE_SUPER_ADMIN) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Protection: Super Administrator accounts cannot be deleted.',
                    'data'    => null,
                ], 403);
            }

            DB::transaction(function () use ($user) {
                // Delete user relations
                $user->tokens()->delete();
                $user->carts()->delete();
                $user->favorites()->delete();
                $user->addresses()->delete();
                $user->delete();
            });

            return response()->json([
                'status'  => true,
                'message' => 'User account and associated records deleted successfully',
                'data'    => ['id' => $id],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete user: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
