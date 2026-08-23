<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CartFavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected CartFavoriteService $cartService;

    public function __construct(CartFavoriteService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'full_name'      => 'required|string|max:255',
                'email'          => 'required|email|unique:users,email',
                'contact_number' => 'required|string|max:20|unique:users,contact_number',
                'password'       => 'required|string|min:8',
                'guest_token'    => 'nullable|string',
            ]);

            $user = User::create([
                'full_name'      => $validated['full_name'],
                'email'          => $validated['email'],
                'contact_number' => $validated['contact_number'],
                'password'       => $validated['password'],
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            // Merge guest cart and favorites if guest_token provided
            $guestToken = $request->header('X-Guest-Token') ?: ($validated['guest_token'] ?? null);
            $mergeResult = null;
            if (!empty($guestToken)) {
                $mergeResult = $this->cartService->mergeGuestToUser($user->id, $guestToken);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Registration successful',
                'data'    => [
                    'user'  => $user,
                    'token' => $token,
                    'merge' => $mergeResult,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Something went wrong: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Authenticate user and issue a Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email'       => 'required|email',
                'password'    => 'required|string',
                'guest_token' => 'nullable|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid email or password',
                    'data'    => null,
                ], 401);
            }

            if ($user->is_blocked) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Your account has been suspended by administration. Reason: ' . ($user->blocked_reason ?: 'Terms of service violation'),
                    'data'    => null,
                ], 403);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            // Merge guest cart and favorites if guest_token provided
            $guestToken = $request->header('X-Guest-Token') ?: ($validated['guest_token'] ?? null);
            $mergeResult = null;
            if (!empty($guestToken)) {
                $mergeResult = $this->cartService->mergeGuestToUser($user->id, $guestToken);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Login successful',
                'data'    => [
                    'user'  => $user,
                    'token' => $token,
                    'merge' => $mergeResult,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Something went wrong: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
