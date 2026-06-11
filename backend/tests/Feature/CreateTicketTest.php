<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_ticket(): void
    {
        $payload = [
            'title' => 'Login tidak bisa digunakan',
            'description' => 'Saya tidak bisa login sejak pagi meskipun sudah reset password.',
            'requester_name' => 'User Test',
            'requester_email' => 'user@test.com',
            'priority' => 'high',
        ];

        $response = $this->postJson('/api/tickets', $payload);

        $response->assertCreated()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'title',
                    'description',
                    'requester_name',
                    'requester_email',
                    'priority',
                    'status',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('tickets', [
            'title' => 'Login tidak bisa digunakan',
            'priority' => 'high',
            'status' => 'open',
        ]);
    }
}
