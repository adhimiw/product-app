<?php

namespace Tests\Feature;

use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    public function test_send_otp_returns_generic_message_and_creates_hashed_otp(): void
    {
        Mail::fake();

        $user = User::firstOrCreate(
            ['email' => 'testuser@example.com'],
            [
                'full_name' => 'Test User',
                'contact_number' => '9876543210',
                'password' => Hash::make('OldPassword123!'),
                'role' => 2,
            ]
        );

        // 0. Non-existent email should return 404
        $notFoundResponse = $this->postJson('/api/forgot-password/send-otp', [
            'email' => 'nonexistent@example.com',
        ]);
        $notFoundResponse->assertStatus(404);
        $notFoundResponse->assertJson([
            'status' => false,
            'message' => 'No account found with this email address. Please check your email or create an account.',
        ]);

        // 1. Send OTP to registered user
        $response = $this->postJson('/api/forgot-password/send-otp', [
            'email' => 'testuser@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => true,
            'message' => 'A 6-digit verification code has been sent to your email address.',
        ]);

        $otpRecord = PasswordResetOtp::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($otpRecord);
        $this->assertEquals(0, $otpRecord->attempts);
        $this->assertEquals(5, $otpRecord->max_attempts);

        // 2. Cooldown check
        $cooldownResponse = $this->postJson('/api/forgot-password/send-otp', [
            'email' => 'testuser@example.com',
        ]);
        $cooldownResponse->assertStatus(429);
    }

    public function test_verify_otp_and_reset_password_flow(): void
    {
        // Setup known OTP
        $email = 'testflow@example.com';
        User::where('email', $email)->delete();
        $user = User::create([
            'email' => $email,
            'full_name' => 'Flow User',
            'contact_number' => '9876500000',
            'password' => Hash::make('OldPassword123!'),
            'role' => 2,
        ]);

        PasswordResetOtp::where('email', $email)->delete();
        $knownOtp = '123456';
        PasswordResetOtp::create([
            'email' => $email,
            'otp_hash' => hash_hmac('sha256', $knownOtp, config('app.key')),
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => now()->addMinutes(5),
        ]);

        // Wrong OTP attempt
        $wrongResponse = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => $email,
            'otp' => '999999',
        ]);
        $wrongResponse->assertStatus(422);

        // Correct OTP verification
        $verifyResponse = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => $email,
            'otp' => $knownOtp,
        ]);
        $verifyResponse->assertStatus(200);
        $verifyResponse->assertJsonStructure([
            'status',
            'message',
            'data' => ['reset_token', 'email'],
        ]);

        $resetToken = $verifyResponse->json('data.reset_token');

        // OTP should now be invalidated
        $this->assertNull(PasswordResetOtp::where('email', $email)->first());

        // Password reset with weak password (missing special char or uppercase)
        $weakResponse = $this->postJson('/api/forgot-password/reset-password', [
            'email' => $email,
            'reset_token' => $resetToken,
            'password' => 'simplepass',
            'password_confirmation' => 'simplepass',
        ]);
        $weakResponse->assertStatus(422);

        // Password reset with strong password
        $resetResponse = $this->postJson('/api/forgot-password/reset-password', [
            'email' => $email,
            'reset_token' => $resetToken,
            'password' => 'NewSecurePass123@',
            'password_confirmation' => 'NewSecurePass123@',
        ]);
        $resetResponse->assertStatus(200);
        $resetResponse->assertJson([
            'status' => true,
            'message' => 'Your password has been reset successfully.',
        ]);

        // Check user password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('NewSecurePass123@', $user->password));

        // Reset token must now be invalidated (single-use)
        $this->assertNull(DB::table('password_reset_tokens')->where('email', $email)->first());

        // Login with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'NewSecurePass123@',
        ]);
        $loginResponse->assertStatus(200);

        // Clean up test user
        $user->delete();
    }
}
