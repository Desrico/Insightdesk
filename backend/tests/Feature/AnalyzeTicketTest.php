<?php

namespace Tests\Feature;

use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AnalyzeTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_can_be_analyzed_and_result_is_persisted(): void
    {
        config([
            'services.maia.api_key' => 'test-key',
            'services.maia.base_url' => 'https://maia.test/analyze',
            'services.maia.model' => 'test-model',
        ]);

        Http::fake([
            'https://maia.test/analyze' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                'summary' => 'Pengguna tidak dapat login.',
                                'category' => 'Autentikasi',
                                'sentiment' => 'Negatif',
                                'priority_suggestion' => 'Tinggi',
                                'recommendation' => 'Periksa layanan autentikasi.',
                            ]),
                        ],
                    ],
                ],
            ]),
        ]);

        $ticket = $this->createTicket();

        $this->postJson("/api/tickets/{$ticket->id}/analyze")
            ->assertOk()
            ->assertJsonPath('data.ai_analysis.category', 'Autentikasi')
            ->assertJsonPath('data.ai_analysis.priority_suggestion', 'Tinggi');

        $this->assertDatabaseHas('ticket_ai_analyses', [
            'ticket_id' => $ticket->id,
            'category' => 'Autentikasi',
            'sentiment' => 'Negatif',
        ]);

        Http::assertSent(function ($request): bool {
            $prompt = data_get($request->data(), 'messages.1.content', '');

            return str_contains($prompt, '[EMAIL_REDACTED]')
                && str_contains($prompt, '[PHONE_REDACTED]')
                && ! str_contains($prompt, 'user@example.com')
                && ! str_contains($prompt, '0812-3456-7890');
        });
    }

    public function test_ai_failure_returns_safe_error_without_internal_detail(): void
    {
        config(['services.maia.api_key' => null]);
        $ticket = $this->createTicket();

        $this->postJson("/api/tickets/{$ticket->id}/analyze")
            ->assertStatus(500)
            ->assertJson([
                'success' => false,
                'message' => 'Gagal menganalisis tiket dengan AI.',
                'errors' => null,
            ])
            ->assertJsonMissingPath('errors.detail');
    }

    private function createTicket(): Ticket
    {
        return Ticket::create([
            'title' => 'Login gagal',
            'description' => 'User user@example.com dengan nomor 0812-3456-7890 tidak dapat login.',
            'priority' => 'high',
            'status' => 'open',
            'version' => 1,
        ]);
    }
}
