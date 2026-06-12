# Technical Report - InsightDesk

## 1. Architecture

InsightDesk menggunakan modular monolith: React frontend, Laravel REST API,
MySQL, dan layanan AI melalui Maia Router. Browser hanya berkomunikasi dengan
Laravel. Backend menangani validasi, business rules, optimistic locking,
caching, structured logging, masking data sensitif, database, dan AI provider.

```text
User / Operator
      |
      v
React Frontend
      |
      v
Laravel REST API
      |--------------------|
      v                    v
MySQL + DB Cache      Maia Router / AI Model
```

Data utama terdiri dari ticket, status history, dan satu AI analysis per ticket.
Dashboard summary memakai cache-aside dengan TTL 60 detik. Cache di-invalidasi
setelah create ticket, update status, dan penyimpanan hasil AI.

## 2. Key Technical Decisions

### Modular Monolith

Arsitektur sengaja tetap sederhana sesuai YAGNI. Controller mengatur HTTP flow,
request object menangani validasi, service menangani cache dan AI integration,
sedangkan Eloquent model menangani relasi data. Pemisahan ini memberi struktur
SOLID tanpa menambah queue atau microservice yang belum diperlukan untuk MVP.

### Optimistic Locking

Setiap ticket memiliki kolom `version`. Update status dilakukan secara atomik
dengan conditional query berdasarkan ID dan expected version. Jika row tidak
ter-update, API mengembalikan HTTP `409`, mencatat structured warning, dan
frontend memuat ulang versi terbaru. Strategi ini mencegah lost update ketika
beberapa operator mengedit ticket yang sama.

### AI Integration and Privacy

Model AI dikonfigurasi melalui `MAIA_MODEL`, sehingga deployment dapat memilih
model yang tersedia di Maia Router tanpa mengubah source. Sebelum title dan
description dikirim, email serta nomor telepon dimasking. Prompt juga
menegaskan bahwa isi ticket adalah data, bukan instruksi. Output AI disimpan
sebagai rekomendasi, bukan keputusan final operator.

### Structured Logging

Middleware menambahkan atau meneruskan `X-Request-ID`, lalu mencatat event JSON
berisi method, path, status, duration, dan IP. Conflict optimistic lock dan
kegagalan AI dicatat sebagai event khusus. Detail exception tetap berada di log
dan tidak dikirim ke client.

### Docker and Readiness

Docker Compose menjalankan MySQL, backend, dan frontend dengan healthcheck.
Startup order menggunakan kondisi healthy, bukan hanya container started.
Backend melakukan install dependency, migrasi idempotent, dan mempertahankan
APP_KEY yang sudah ada. Clean-state build telah diuji dengan volume database
baru.

### Testing and API Contract

Test suite mencakup create validation, list pagination, detail relations,
dashboard cache invalidation, AI success/failure, PII masking, status history,
dan stale-version conflict. OpenAPI mendokumentasikan enam endpoint serta
respons `409`, `422`, dan `500`. Git history menunjukkan failing create-ticket
test dibuat sebelum implementasi endpoint.

## 3. AI Usage

OpenAI Codex digunakan untuk planning, repository inspection, implementation,
debugging, test generation, Docker diagnosis, dan documentation review. Semua
perubahan diperiksa melalui diff, test, lint, OpenAPI validation, serta clean
Docker build. Riwayat prompt dan keputusan penggunaan tersedia di
`AI_USAGE_LOG.md`.

Contoh judgment penting adalah menolak optimistic locking berbasis perbandingan
object di memory karena masih race-prone. Implementasi diganti dengan
conditional database update agar conflict handling benar pada request paralel.

## 4. Validation Result

- Backend: 12 tests, 59 assertions.
- Frontend: ESLint dan production build lulus.
- OpenAPI: Redocly lint lulus.
- Docker: MySQL, backend, dan frontend healthy dari clean volume.
- Smoke test: frontend, `/up`, Swagger UI, dan OpenAPI mengembalikan HTTP 200.
- CI: backend, frontend, OpenAPI, dan Compose checks berjalan pada push/PR.

## 5. Limitations

- Authentication dan role authorization belum tersedia.
- AI request masih synchronous dan dapat menambah latency hingga timeout.
- PII masking berbasis pattern tidak menggantikan sistem DLP lengkap.
- Structured logs belum dikirim ke managed monitoring dashboard.
- Tidak ada event bus atau multi-service architecture.
- URL deployment production belum dicantumkan sampai deployment selesai.
- Continuous deployment belum dikonfigurasi; workflow saat ini adalah CI.
