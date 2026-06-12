<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogApiRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-ID', (string) Str::uuid());
        $startedAt = hrtime(true);

        Log::withContext([
            'request_id' => $requestId,
        ]);

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            Log::error('api.request_failed', [
                'method' => $request->method(),
                'path' => $request->path(),
                'duration_ms' => $this->durationInMilliseconds($startedAt),
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        $response->headers->set('X-Request-ID', $requestId);

        Log::info('api.request_completed', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => $this->durationInMilliseconds($startedAt),
            'ip' => $request->ip(),
        ]);

        return $response;
    }

    private function durationInMilliseconds(int $startedAt): float
    {
        return round((hrtime(true) - $startedAt) / 1_000_000, 2);
    }
}
