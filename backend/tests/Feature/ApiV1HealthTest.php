<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiV1HealthTest extends TestCase
{
    /**
     * Test the API v1 ping endpoint returns operational status.
     */
    public function test_api_v1_ping_returns_successful_json_response(): void
    {
        $response = $this->getJson('/api/v1/ping');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'HealthMix API is operational.',
                'version' => 'v1',
            ]);
    }
}
