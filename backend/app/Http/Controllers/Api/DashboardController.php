<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardSummaryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function summary(DashboardSummaryService $dashboardSummary): JsonResponse
    {
        return ApiResponse::success(
            'Ringkasan dashboard berhasil diambil.',
            $dashboardSummary->get()
        );
    }
}
