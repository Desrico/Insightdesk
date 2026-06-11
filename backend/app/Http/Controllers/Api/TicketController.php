<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::query()
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'message' => 'Tickets retrieved successfully.',
            'data' => $tickets,
        ]);
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

        return response()->json([
            'message' => 'Ticket created successfully.',
            'data' => $ticket,
        ], 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load('statusHistories');

        return response()->json([
            'message' => 'Ticket detail retrieved successfully.',
            'data' => $ticket,
        ]);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['version']) && (int) $validated['version'] !== $ticket->version) {
            return response()->json([
                'message' => 'Conflict detected. Ticket has been updated by another process.',
                'current_version' => $ticket->version,
            ], 409);
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

        return response()->json([
            'message' => 'Ticket status updated successfully.',
            'data' => $ticket->load('statusHistories'),
        ]);
    }
}