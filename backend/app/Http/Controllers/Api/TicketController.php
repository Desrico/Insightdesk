<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
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
}