<?php

namespace Tests\Feature;

use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateTicketStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_update_increments_version_and_creates_history(): void
    {
        $ticket = $this->createTicket();

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => 'in_progress',
            'note' => 'Mulai ditangani',
            'version' => 1,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.version', 2);

        $this->assertDatabaseHas('ticket_status_histories', [
            'ticket_id' => $ticket->id,
            'from_status' => 'open',
            'to_status' => 'in_progress',
            'note' => 'Mulai ditangani',
        ]);
    }

    public function test_stale_version_returns_conflict_without_changing_ticket(): void
    {
        $ticket = $this->createTicket();
        $ticket->update([
            'status' => 'resolved',
            'version' => 2,
        ]);

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => 'open',
            'version' => 1,
        ])
            ->assertConflict()
            ->assertJsonPath('errors.current_version', 2);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'resolved',
            'version' => 2,
        ]);
        $this->assertDatabaseCount('ticket_status_histories', 0);
    }

    public function test_closed_status_is_not_allowed(): void
    {
        $ticket = $this->createTicket();

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => 'closed',
            'version' => 1,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    private function createTicket(): Ticket
    {
        return Ticket::create([
            'title' => 'Tiket pengujian',
            'description' => 'Deskripsi tiket pengujian',
            'status' => 'open',
            'priority' => 'medium',
            'version' => 1,
        ]);
    }
}
