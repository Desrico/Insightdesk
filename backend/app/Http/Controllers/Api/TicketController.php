<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\Ticket;
use App\Services\MaiaTicketAnalysisService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::query()
            ->with('aiAnalysis')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return ApiResponse::success('Data tiket berhasil diambil.', $tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
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

        return ApiResponse::success('Tiket berhasil dibuat.', $ticket, 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['statusHistories', 'aiAnalysis']);

        return ApiResponse::success('Detail tiket berhasil diambil.', $ticket);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['version']) && (int) $validated['version'] !== $ticket->version) {
            return ApiResponse::error(
                'Conflict detected. Tiket sudah diperbarui oleh proses lain.',
                ['current_version' => $ticket->version],
                409
            );
        }

        $oldStatus = $ticket->status;

        $ticket->update([
            'status' => $validated['status'],
            'version' => $ticket->version + 1,
        ]);

        $ticket->statusHistories()->create([
            'from_status' => $oldStatus,
            'to_status' => $ticket->status,
            'note' => $validated['note'] ?? null,
        ]);

        return ApiResponse::success(
            'Status tiket berhasil diperbarui.',
            $ticket->load(['statusHistories', 'aiAnalysis'])
        );
    }

    public function analyze(Ticket $ticket, MaiaTicketAnalysisService $service): JsonResponse
    {
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
                ['detail' => $exception->getMessage()],
                500
            );
        }
    }
}