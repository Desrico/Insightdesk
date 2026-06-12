<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/tickets', [TicketController::class, 'store']);
Route::get('/tickets', [TicketController::class, 'index']);
Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
Route::post('/tickets/{ticket}/analyze', [TicketController::class, 'analyze']);
Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'insightdesk-backend'
    ]);
});
