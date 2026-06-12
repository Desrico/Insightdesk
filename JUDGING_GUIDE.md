# InsightDesk Judging Guide

Dokumen ini memetakan kriteria kompetisi ke bukti implementasi dan command demo.

## Must Have

### 1. Docker

Clean-state command:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d --wait
docker compose ps
```

Bukti:

- `docker-compose.yml` memiliki healthcheck dan dependency readiness.
- Backend menunggu MySQL sehat sebelum migrasi.
- Frontend menunggu backend sehat.
- `.dockerignore` menjaga build context tetap kecil.

### 2. Clean Code

Dua file utama untuk live defense:

- `backend/app/Services/DashboardSummaryService.php`
  - Single Responsibility: hanya query, cache, dan invalidation summary.
  - Controller tidak mengetahui detail cache key atau TTL.
- `backend/app/Services/MaiaTicketAnalysisService.php`
  - Dependency Injection untuk `SensitiveDataMasker`.
  - Integrasi HTTP, prompt construction, sanitasi output, dan error boundary
    berada di service layer, bukan controller.

YAGNI diterapkan dengan tetap memakai modular monolith. Queue atau microservice
tidak ditambahkan karena analisis AI masih dipicu langsung dan skala MVP belum
membutuhkan distributed architecture.

### 3. TDD

Bukti commit history:

```text
d14351b add failing create ticket feature test
f5f082e implement create ticket endpoint
```

Command:

```bash
docker compose exec backend php artisan test
```

### 4. OpenAPI / Swagger

Swagger UI:

```text
http://localhost:8000/api-docs
```

Spec:

```text
backend/public/openapi.yaml
```

Endpoint demo yang disarankan adalah `PATCH /api/tickets/{ticket}/status`
karena menunjukkan validation, response schema, dan HTTP `409` untuk conflict.
API MVP bersifat publik dan belum memiliki authentication.

### 5. AI Usage

Bukti:

```text
AI_USAGE_LOG.md
```

Contoh keputusan penting: optimistic locking awalnya hanya membandingkan versi
di memory. Implementasi diperbaiki menjadi conditional database update
`WHERE id = ? AND version = ?` agar dua request bersamaan tidak sama-sama lolos.

## Nice To Have

### Race Condition Handling

Strategi: optimistic locking dengan kolom `version`.

1. Dua browser membaca versi yang sama.
2. Request pertama berhasil dan menaikkan versi.
3. Request kedua tidak menemukan row dengan versi lama.
4. Backend mengembalikan `409`.
5. Frontend memuat ulang detail terbaru.

### CI Pipeline (CD Pending)

Workflow:

```text
.github/workflows/ci.yml
```

Pipeline otomatis menjalankan backend tests, frontend lint/build, OpenAPI lint,
dan Docker Compose validation pada push dan pull request. Ini memenuhi bagian
continuous integration. Continuous deployment belum diklaim sampai workflow
terhubung ke platform deployment dan URL production tersedia.

### Caching

Endpoint:

```text
GET /api/dashboard/summary
```

Strategi cache-aside selama 60 detik. Cache dihapus setelah tiket dibuat,
status berubah, atau hasil AI disimpan.

### Structured Logging

Request API menghasilkan JSON log dengan request ID, method, path, status, IP,
dan duration. Conflict dan kegagalan AI memiliki event log tersendiri.

```bash
docker compose exec backend tail -f storage/logs/laravel.log
```

## Extraordinary Evidence

- Concurrent edit memiliki conditional atomic update, bukan sekadar UI check.
- AI menghasilkan summary, category, sentiment, priority suggestion, dan
  recommendation yang disimpan agar tidak perlu dianalisis ulang untuk display.
- Flow browser mencakup create ticket, dashboard, detail, status history,
  conflict handling, dan AI analysis.

## Criteria Status

| Kriteria | Status | Bukti |
| --- | --- | --- |
| Must Have: Docker | Pass | Clean-state Compose, seluruh service healthy |
| Must Have: Clean code | Pass | Service layer, DI, focused controllers |
| Must Have: TDD | Pass | Commit test gagal sebelum implementasi |
| Must Have: OpenAPI | Pass | Swagger UI dan Redocly-valid spec |
| Must Have: AI usage disclosure | Pass | `AI_USAGE_LOG.md` |
| Nice: Event-driven service management | Not implemented | Di luar scope MVP |
| Nice: Race condition handling | Pass | Atomic optimistic locking |
| Nice: CI/CD | Partial | CI tersedia, deployment belum otomatis |
| Nice: Caching | Pass | Cache-aside dashboard + invalidation |
| Nice: Structured logging | Pass | JSON log + request ID |

Tiga dari lima Nice to Have sudah Pass, sehingga melewati batas minimum 50%
berdasarkan panduan kompetisi tanpa menghitung CI/CD yang masih Partial.

## Known Limitations

- Authentication dan role authorization belum diterapkan.
- Analisis AI masih synchronous sehingga latency bergantung provider.
- Tidak ada message queue atau multi-service event bus.
- Error monitoring saat ini berbasis structured log, belum dashboard SaaS.
- Deployment URL dan production smoke test harus diselesaikan di platform host.

## Measured Startup

Pada validasi terakhir di Docker Desktop dengan image/dependency lokal tersedia,
clean database volume hingga seluruh service healthy membutuhkan sekitar 35
detik. Pada clone baru yang harus mengunduh image serta dependency, waktu dapat
menjadi beberapa menit tergantung jaringan.
