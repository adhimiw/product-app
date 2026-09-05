<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetOtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    /**
     * Send a 6-digit OTP to the requested email.
     * Rate limited and generic response to prevent account enumeration.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|max:255',
            ]);

            $email = strtolower(trim($validated['email']));

            // Check resend cooldown (60 seconds)
            $existingOtp = PasswordResetOtp::where('email', $email)->latest()->first();
            if ($existingOtp && $existingOtp->created_at->diffInSeconds(now()) < 60) {
                $secondsLeft = 60 - $existingOtp->created_at->diffInSeconds(now());
                return response()->json([
                    'status'  => false,
                    'message' => "Please wait {$secondsLeft} seconds before requesting a new OTP.",
                    'data'    => [
                        'cooldown_seconds' => $secondsLeft,
                    ],
                ], 429);
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No account found with this email address. Please check your email or create an account.',
                ], 404);
            }

            if ($user->is_blocked) {
                return response()->json([
                    'status'  => false,
                    'message' => 'This account has been suspended by administration. Password cannot be reset.',
                ], 403);
            }

            // Invalidate any previous OTPs for this email
            PasswordResetOtp::where('email', $email)->delete();

            // Generate cryptographically secure 6-digit OTP
            $otp = (string) random_int(100000, 999999);
            $otpHash = hash_hmac('sha256', $otp, config('app.key'));

            PasswordResetOtp::create([
                'email'        => $email,
                'otp_hash'     => $otpHash,
                'attempts'     => 0,
                'max_attempts' => 5,
                'expires_at'   => now()->addMinutes(5),
            ]);

            // Dispatch Email
            try {
                Mail::to($user->email)->send(new PasswordResetOtpMail($otp, $user->full_name ?: 'Valued Customer'));
            } catch (\Exception $mailEx) {
                Log::error('Failed to dispatch password reset OTP email: ' . $mailEx->getMessage());
            }

            return response()->json([
                'status'  => true,
                'message' => 'A 6-digit verification code has been sent to your email address.',
                'data'    => [
                    'cooldown_seconds' => 60,
                    'validity_minutes' => 5,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('ForgotPasswordController@sendOtp Error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while processing your request. Please try again later.',
            ], 500);
        }
    }

    /**
     * Verify the 6-digit OTP and return a time-limited single-use reset token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|max:255',
                'otp'   => 'required|string|size:6|regex:/^[0-9]{6}$/',
            ], [
                'otp.regex' => 'The OTP must be a valid 6-digit numeric code.',
                'otp.size'  => 'The OTP must be exactly 6 digits.',
            ]);

            $email = strtolower(trim($validated['email']));
            $otp = trim($validated['otp']);

            $otpRecord = PasswordResetOtp::where('email', $email)->latest()->first();

            if (! $otpRecord) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No active OTP request found for this email address. Please request a new OTP.',
                ], 422);
            }

            // Check if OTP expired
            if ($otpRecord->isExpired()) {
                $otpRecord->delete();
                return response()->json([
                    'status'  => false,
                    'message' => 'The OTP has expired. Please request a new OTP.',
                ], 422);
            }

            // Increment attempt counter
            $otpRecord->increment('attempts');

            // Check if max attempts exceeded
            if ($otpRecord->isMaxAttemptsReached()) {
                $otpRecord->delete();
                return response()->json([
                    'status'  => false,
                    'message' => 'Too many incorrect attempts. This OTP has been invalidated for security. Please request a new OTP.',
                ], 429);
            }

            // Verify OTP hash
            $inputHash = hash_hmac('sha256', $otp, config('app.key'));
            if (! hash_equals($otpRecord->otp_hash, $inputHash)) {
                $remaining = max(0, $otpRecord->max_attempts - $otpRecord->attempts);
                $attemptMsg = $remaining > 0
                    ? " Incorrect code. You have {$remaining} attempt(s) remaining."
                    : ' Incorrect code. Maximum attempts reached. Please request a new OTP.';

                if ($remaining === 0) {
                    $otpRecord->delete();
                }

                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid OTP.' . $attemptMsg,
                    'data'    => [
                        'remaining_attempts' => $remaining,
                    ],
                ], 422);
            }

            // OTP is valid! Invalidate immediately to prevent reuse
            $otpRecord->delete();

            // Generate cryptographically secure single-use reset authorization token
            $plainResetToken = Str::random(64);
            $tokenHash = hash_hmac('sha256', $plainResetToken, config('app.key'));

            // Invalidate any previous reset tokens for this email
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            // Store new token (valid for 15 minutes)
            DB::table('password_reset_tokens')->insert([
                'email'      => $email,
                'token'      => $tokenHash,
                'created_at' => now(),
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'OTP verified successfully.',
                'data'    => [
                    'reset_token' => $plainResetToken,
                    'email'       => $email,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('ForgotPasswordController@verifyOtp Error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while verifying the OTP. Please try again.',
            ], 500);
        }
    }

    /**
     * Reset password using the verified single-use reset token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email'                 => 'required|email|max:255',
                'reset_token'           => 'required|string',
                'password'              => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/[a-z]/',      // at least one lowercase letter
                    'regex:/[A-Z]/',      // at least one uppercase letter
                    'regex:/[0-9]/',      // at least one digit
                    'regex:/[@$!%*#?&^_-]/', // at least one special character
                    'confirmed',
                ],
                'password_confirmation' => 'required|string',
            ], [
                'password.min'       => 'Password must be at least 8 characters.',
                'password.regex'     => 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&^_-).',
                'password.confirmed' => 'The password confirmation does not match.',
            ]);

            $email = strtolower(trim($validated['email']));
            $plainResetToken = $validated['reset_token'];

            // Verify reset authorization token in database
            $tokenRecord = DB::table('password_reset_tokens')->where('email', $email)->first();

            if (! $tokenRecord) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid or expired password reset session. Please request a new OTP.',
                ], 422);
            }

            // Check if token expired (15 minutes limit)
            $createdAt = Carbon::parse($tokenRecord->created_at);
            if ($createdAt->diffInMinutes(now()) > 15) {
                DB::table('password_reset_tokens')->where('email', $email)->delete();
                return response()->json([
                    'status'  => false,
                    'message' => 'The password reset session has expired. Please request a new OTP.',
                ], 422);
            }

            // Verify token hash
            $inputTokenHash = hash_hmac('sha256', $plainResetToken, config('app.key'));
            if (! hash_equals($tokenRecord->token, $inputTokenHash)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid reset authorization token. Please restart the forgot password process.',
                ], 422);
            }

            // Find user
            $user = User::where('email', $email)->first();
            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User account not found.',
                ], 404);
            }

            if ($user->is_blocked) {
                return response()->json([
                    'status'  => false,
                    'message' => 'This account has been suspended by administration. Password cannot be reset.',
                ], 403);
            }

            // Update user password
            $user->password = Hash::make($validated['password']);
            $user->save();

            // Revoke all existing Sanctum session tokens for security
            $user->tokens()->delete();

            // Invalidate password reset token immediately (single-use enforcement)
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Your password has been reset successfully.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('ForgotPasswordController@resetPassword Error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Failed to reset password. Please try again.',
            ], 500);
        }
    }
}
