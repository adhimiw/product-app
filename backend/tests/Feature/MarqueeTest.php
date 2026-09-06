<?php

namespace Tests\Feature;

use App\Models\Marquee;
use Tests\TestCase;

class MarqueeTest extends TestCase
{
    public function test_public_marquee_api_returns_active_items(): void
    {
        $response = $this->getJson('/api/marquee');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'is_enabled',
                'items' => [
                    '*' => ['id', 'text', 'icon', 'link_url', 'badge_text', 'show_first', 'is_active', 'sort_order'],
                ],
            ],
        ]);
    }

    public function test_admin_marquee_crud_flow(): void
    {
        // 1. Create marquee announcement
        $createResponse = $this->postJson('/api/admin/marquees', [
            'text'       => 'WEEKEND MEGA SALE 30% OFF',
            'icon'       => '🔥',
            'link_url'   => '/shop',
            'badge_text' => 'FLASH',
            'show_first' => true,
            'is_active'  => true,
            'sort_order' => 1,
        ]);

        $createResponse->assertStatus(201);
        $createResponse->assertJson([
            'status' => true,
            'data'   => [
                'text'       => 'WEEKEND MEGA SALE 30% OFF',
                'icon'       => '🔥',
                'badge_text' => 'FLASH',
                'show_first' => true,
                'is_active'  => true,
            ],
        ]);

        $itemId = $createResponse->json('data.id');

        // 2. Update marquee announcement
        $updateResponse = $this->putJson("/api/admin/marquees/{$itemId}", [
            'text'       => 'WEEKEND MEGA SALE 35% OFF',
            'icon'       => '🎉',
            'link_url'   => '/shop',
            'badge_text' => 'HOT',
            'show_first' => false,
            'is_active'  => true,
            'sort_order' => 2,
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJson([
            'status' => true,
            'data'   => [
                'text'       => 'WEEKEND MEGA SALE 35% OFF',
                'icon'       => '🎉',
                'badge_text' => 'HOT',
                'show_first' => false,
            ],
        ]);

        // 3. Toggle Status
        $toggleResponse = $this->patchJson("/api/admin/marquees/{$itemId}/toggle");
        $toggleResponse->assertStatus(200);
        $this->assertFalse($toggleResponse->json('data.is_active'));

        // 4. Toggle Global Visibility
        $globalToggleResponse = $this->postJson('/api/admin/marquees/toggle-global', [
            'is_enabled' => true,
        ]);
        $globalToggleResponse->assertStatus(200);
        $this->assertTrue($globalToggleResponse->json('data.is_enabled'));

        // 5. Delete marquee announcement
        $deleteResponse = $this->deleteJson("/api/admin/marquees/{$itemId}");
        $deleteResponse->assertStatus(200);
        $this->assertNull(Marquee::find($itemId));
    }
}
