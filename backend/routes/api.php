<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/tickets', [TicketController::class, 'store']);
Route::get('/tickets', [TicketController::class, 'index']);
Route::post('/tickets', [TicketController::class, 'store']);
Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
Route::post('/tickets/{ticket}/analyze', [TicketController::class, 'analyze']);
