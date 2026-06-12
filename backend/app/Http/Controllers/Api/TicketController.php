<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\Ticket;
use App\Services\DashboardSummaryService;
use App\Services\MaiaTicketAnalysisService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page', 10), 100));

        $tickets = Ticket::query()
            ->with('aiAnalysis')
            ->latest()
            ->paginate($perPage);

        return ApiResponse::success('Data tiket berhasil diambil.', $tickets);
    }

    public function store(
        StoreTicketRequest $request,
        DashboardSummaryService $dashboardSummary
    ): JsonResponse {
        $validated = $request->validated();

        $ticket = Ticket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'requester_name' => $validated['requester_name'] ?? null,
            'requester_email' => $validated['requester_email'] ?? null,
            'category' => $validated['category'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
            'version' => 1,
        ]);

        $dashboardSummary->invalidate();

        return ApiResponse::success('Tiket berhasil dibuat.', $ticket, 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['statusHistories', 'aiAnalysis']);

        return ApiResponse::success('Detail tiket berhasil diambil.', $ticket);
    }

    public function updateStatus(
        UpdateTicketStatusRequest $request,
        Ticket $ticket,
        DashboardSummaryService $dashboardSummary
    ): JsonResponse {
        $validated = $request->validated();
        $expectedVersion = (int) $validated['version'];
        $oldStatus = $ticket->status;
        $updated = DB::transaction(function () use ($ticket, $validated, $expectedVersion, $oldStatus): bool {
            $affectedRows = Ticket::query()
                ->whereKey($ticket->id)
                ->where('version', $expectedVersion)
                ->update([
                    'status' => $validated['status'],
                    'version' => $expectedVersion + 1,
                    'updated_at' => now(),
                ]);

            if ($affectedRows === 0) {
                return false;
            }

            $ticket->statusHistories()->create([
                'from_status' => $oldStatus,
                'to_status' => $validated['status'],
                'note' => $validated['note'] ?? null,
            ]);

            return true;
        });

        if (! $updated) {
            $currentVersion = Ticket::query()->whereKey($ticket->id)->value('version');

            Log::warning('ticket.optimistic_lock_conflict', [
                'ticket_id' => $ticket->id,
                'expected_version' => $expectedVersion,
                'current_version' => $currentVersion,
            ]);

            return ApiResponse::error(
                'Conflict detected. Tiket sudah diperbarui oleh proses lain.',
                ['current_version' => $currentVersion],
                409
            );
        }

        $dashboardSummary->invalidate();
        $ticket->refresh();

        Log::info('ticket.status_updated', [
            'ticket_id' => $ticket->id,
            'from_status' => $oldStatus,
            'to_status' => $ticket->status,
            'version' => $ticket->version,
        ]);

        return ApiResponse::success(
            'Status tiket berhasil diperbarui.',
            $ticket->load(['statusHistories', 'aiAnalysis'])
        );
    }

    public function analyze(
        Ticket $ticket,
        MaiaTicketAnalysisService $service,
        DashboardSummaryService $dashboardSummary
    ): JsonResponse {
        try {
            $analysis = $service->analyze($ticket);

            $ticket->aiAnalysis()->updateOrCreate(
                ['ticket_id' => $ticket->id],
                [
                    'summary' => $analysis['summary'],
                    'category' => $analysis['category'],
                    'sentiment' => $analysis['sentiment'],
                    'priority_suggestion' => $analysis['priority_suggestion'],
                    'recommendation' => $analysis['recommendation'],
                    'raw_response' => $analysis['raw_response'],
                    'analyzed_at' => now(),
                ]
            );

            $dashboardSummary->invalidate();

            return ApiResponse::success(
                'Tiket berhasil dianalisis dengan AI.',
                $ticket->load(['statusHistories', 'aiAnalysis'])
            );
        } catch (Throwable $exception) {
            Log::error('AI ticket analysis failed', [
                'ticket_id' => $ticket->id,
                'message' => $exception->getMessage(),
            ]);

            return ApiResponse::error(
                'Gagal menganalisis tiket dengan AI.',
                null,
                500
            );
        }
    }
}
