<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserAddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_home_office_and_other_addresses(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/addresses', [
                'type'          => 'Home',
                'full_name'     => 'Devarajan R',
                'phone_number'  => '06369810946',
                'address_line1' => 'No. 18, Mettu Street',
                'address_line2' => 'Near Temple',
                'city'          => 'Sethiyathope',
                'state'         => 'Tamil Nadu',
                'pincode'       => '608702',
                'is_default'    => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Address saved successfully',
                'data'    => [
                    'type'          => 'Home',
                    'full_name'     => 'Devarajan R',
                    'city'          => 'Sethiyathope',
                    'is_default'    => true,
                ],
            ]);

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'type'    => 'Home',
            'city'    => 'Sethiyathope',
        ]);
    }

    public function test_authenticated_user_can_update_address(): void
    {
        $user = User::factory()->create();
        $address = UserAddress::create([
            'user_id'       => $user->id,
            'type'          => 'Office',
            'full_name'     => 'Devarajan Office',
            'phone_number'  => '06369810946',
            'address_line1' => 'Tech Park',
            'city'          => 'Chennai',
            'state'         => 'Tamil Nadu',
            'pincode'       => '600001',
            'is_default'    => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/user/addresses/{$address->id}", [
                'type'          => 'Office',
                'full_name'     => 'Devarajan R (Office Hub)',
                'phone_number'  => '06369810946',
                'address_line1' => 'Tech Park Tower B',
                'city'          => 'Chennai',
                'state'         => 'Tamil Nadu',
                'pincode'       => '600001',
                'is_default'    => true,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Address updated successfully',
                'data'    => [
                    'full_name'  => 'Devarajan R (Office Hub)',
                    'is_default' => true,
                ],
            ]);
    }

    public function test_authenticated_user_can_delete_address(): void
    {
        $user = User::factory()->create();
        $address = UserAddress::create([
            'user_id'       => $user->id,
            'type'          => 'Other',
            'full_name'     => 'Friend House',
            'phone_number'  => '06369810946',
            'address_line1' => 'Street 5',
            'city'          => 'Cuddalore',
            'state'         => 'Tamil Nadu',
            'pincode'       => '607001',
            'is_default'    => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/user/addresses/{$address->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('user_addresses', ['id' => $address->id]);
    }
}
