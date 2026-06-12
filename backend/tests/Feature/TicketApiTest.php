<?php

namespace Tests\Feature;

use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_list_limits_per_page_to_one_hundred(): void
    {
        $this->getJson('/api/tickets?per_page=500')
            ->assertOk()
            ->assertJsonPath('data.per_page', 100);
    }

    public function test_ticket_detail_contains_histories_and_ai_analysis(): void
    {
        $ticket = $this->createTicket();

        $this->getJson("/api/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status_histories',
                    'ai_analysis',
                ],
            ]);
    }

    public function test_create_ticket_validation_returns_unprocessable_entity(): void
    {
        $this->postJson('/api/tickets', [
            'title' => '',
            'description' => '',
            'requester_email' => 'invalid-email',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'description',
                'requester_email',
                'category',
            ]);
    }

    public function test_update_status_requires_version(): void
    {
        $ticket = $this->createTicket();

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => 'resolved',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('version');
    }

    private function createTicket(): Ticket
    {
        return Ticket::create([
            'title' => 'Tiket pengujian',
            'description' => 'Deskripsi tiket pengujian',
            'priority' => 'medium',
            'status' => 'open',
            'version' => 1,
        ]);
    }
}
