<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'full_name'       => 'Old Name',
            'email'           => 'devarajan.r1011@gmail.com',
            'contact_number'  => '0000000000',
            'whatsapp_number' => '0000000000',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/profile', [
                'full_name'       => 'Devarajan R',
                'whatsapp_number' => '06369810946',
                'contact_number'  => '06369810946',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data'    => [
                    'id'              => $user->id,
                    'full_name'       => 'Devarajan R',
                    'email'           => 'devarajan.r1011@gmail.com',
                    'whatsapp_number' => '06369810946',
                    'contact_number'  => '06369810946',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id'              => $user->id,
            'full_name'       => 'Devarajan R',
            'whatsapp_number' => '06369810946',
            'contact_number'  => '06369810946',
        ]);
    }

    public function test_update_profile_validation_fails_without_full_name(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/profile', [
                'whatsapp_number' => '06369810946',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['full_name']);
    }
}
