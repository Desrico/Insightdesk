<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Cache;

class DashboardSummaryService
{
    public const CACHE_KEY = 'dashboard_summary';

    private const CACHE_TTL_SECONDS = 60;

    public function get(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function (): array {
            return [
                'total_tickets' => Ticket::count(),
                'new_tickets' => Ticket::where('status', 'open')->count(),
                'in_progress_tickets' => Ticket::where('status', 'in_progress')->count(),
                'resolved_tickets' => Ticket::where('status', 'resolved')->count(),
                'ai_analyzed_tickets' => Ticket::whereHas('aiAnalysis')->count(),
            ];
        });
    }

    public function invalidate(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
