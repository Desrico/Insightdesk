<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MaiaTicketAnalysisService
{
    public function analyze(Ticket $ticket): array
    {
        $apiKey = config('services.maia.api_key');
        $baseUrl = config('services.maia.base_url');
        $model = config('services.maia.model');

        if (!$apiKey) {
            throw new RuntimeException('Maia API key belum dikonfigurasi.');
        }

        $response = Http::timeout(30)
            ->withToken($apiKey)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post($baseUrl, [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Anda adalah asisten AI untuk sistem support ticket. Jawab hanya dalam JSON valid tanpa markdown.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $this->buildPrompt($ticket),
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal memanggil Maia Router API: ' . $response->body());
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        if (!$content) {
            throw new RuntimeException('Maia Router tidak mengembalikan konten analisis.');
        }

        $content = trim($content);
        $content = preg_replace('/^```json\s*/', '', $content);
        $content = preg_replace('/^```\s*/', '', $content);
        $content = preg_replace('/\s*```$/', '', $content);

        $decoded = json_decode($content, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Response AI bukan JSON valid: ' . $content);
        }

        return [
            'summary' => $decoded['summary'] ?? null,
            'category' => $decoded['category'] ?? null,
            'sentiment' => $decoded['sentiment'] ?? null,
            'priority_suggestion' => $decoded['priority_suggestion'] ?? null,
            'recommendation' => $decoded['recommendation'] ?? null,
            'raw_response' => $decoded,
        ];
    }

    private function buildPrompt(Ticket $ticket): string
{
    return <<<PROMPT
Analisis tiket dukungan berikut.

Kembalikan hanya JSON valid dengan struktur berikut:
{
  "summary": "ringkasan singkat tiket dalam bahasa Indonesia",
  "category": "salah satu dari: Autentikasi, Performa Sistem, Tampilan, Bug Sistem, Akun Pengguna, Permintaan Fitur, atau Lainnya",
  "sentiment": "salah satu dari: Positif, Netral, Negatif, atau Campuran",
  "priority_suggestion": "salah satu dari: Rendah, Sedang, atau Tinggi",
  "recommendation": "rekomendasi tindakan singkat untuk operator dalam bahasa Indonesia"
}

Data tiket:
Subjek: {$ticket->title}
Deskripsi: {$ticket->description}
Status Saat Ini: {$ticket->status}

Aturan:
- Jangan gunakan bahasa Inggris untuk category, sentiment, dan priority_suggestion.
- Jangan gunakan markdown.
- Jangan tambahkan teks di luar JSON.
PROMPT;
}
}