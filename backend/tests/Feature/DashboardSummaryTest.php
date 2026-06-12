<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Services\DashboardSummaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DashboardSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_summary_is_cached_and_invalidated_after_ticket_creation(): void
    {
        Ticket::create([
            'title' => 'Tiket awal',
            'description' => 'Deskripsi tiket awal',
            'status' => 'open',
            'priority' => 'medium',
            'version' => 1,
        ]);

        $this->withHeader('X-Request-ID', 'dashboard-summary-test')
            ->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertHeader('X-Request-ID', 'dashboard-summary-test')
            ->assertJsonPath('data.total_tickets', 1)
            ->assertJsonPath('data.new_tickets', 1);

        $this->assertTrue(Cache::has(DashboardSummaryService::CACHE_KEY));

        $this->postJson('/api/tickets', [
            'title' => 'Tiket baru',
            'description' => 'Deskripsi tiket baru',
            'category' => 'Masalah Teknis',
        ])->assertCreated();

        $this->assertFalse(Cache::has(DashboardSummaryService::CACHE_KEY));

        $this->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.total_tickets', 2)
            ->assertJsonPath('data.new_tickets', 2);
    }
}
