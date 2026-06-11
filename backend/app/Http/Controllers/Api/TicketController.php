<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\Ticket;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::query()
            ->with('aiAnalysis')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return ApiResponse::success('Tickets retrieved successfully.', $tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = Ticket::create([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'requester_name' => $request->validated('requester_name'),
            'requester_email' => $request->validated('requester_email'),
            'category' => $request->validated('category'),
            'priority' => $request->validated('priority') ?? 'medium',
            'status' => 'open',
            'version' => 1,
        ]);

        return ApiResponse::success('Ticket created successfully.', $ticket, 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['statusHistories', 'aiAnalysis']);

        return ApiResponse::success('Ticket detail retrieved successfully.', $ticket);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['version']) && (int) $validated['version'] !== $ticket->version) {
            return ApiResponse::error(
                'Conflict detected. Ticket has been updated by another process.',
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
            'Ticket status updated successfully.',
            $ticket->load(['statusHistories', 'aiAnalysis'])
        );
    }
}