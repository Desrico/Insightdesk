# InsightDesk

InsightDesk adalah aplikasi web full-stack untuk mengelola support ticket dan feedback pengguna. Sistem ini membantu operator melihat daftar ticket, membuat ticket baru, melihat detail ticket, memperbarui status, menyimpan riwayat status, dan menyiapkan hasil analisis AI.

## Tech Stack

- Frontend: React
- Backend: Laravel REST API
- Database: MySQL
- AI/LLM: Maia Router dengan model yang dikonfigurasi melalui environment
- Container: Docker Compose
- API Documentation: OpenAPI/Swagger
- Testing: PHPUnit/Pest

## Main Features

- Create ticket
- View ticket list
- View ticket detail
- Update ticket status
- Status history
- AI ticket analysis dan penyimpanan hasil
- Cached dashboard summary
- Structured JSON request logging
- Optimistic locking pada perubahan status
- Swagger/OpenAPI documentation
- PII masking sebelum data tiket dikirim ke AI
- GitHub Actions CI untuk test, lint, build, dan contract validation

## Run with Docker

```bash
docker compose up --build -d
docker compose ps
```

Tunggu sampai service `mysql`, `backend`, dan `frontend` berstatus `healthy`.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

API Documentation:

```text
http://localhost:8000/api-docs
```

## Database Connection

MySQL Docker can be accessed from local database tools using:

```text
Host     : 127.0.0.1
Port     : 3308
Database : insightdesk
Username : insightdesk_user
Password : insightdesk_password
```

Inside Docker, Laravel connects to MySQL using:

```text
DB_HOST=mysql
DB_PORT=3306
```

## API Endpoints

```text
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/{ticket}
PATCH  /api/tickets/{ticket}/status
POST   /api/tickets/{ticket}/analyze
GET    /api/dashboard/summary
```

Update status wajib mengirim `version` terakhir dari tiket. API mengembalikan
HTTP `409` jika data telah diperbarui proses lain.

## Testing

Run backend tests:

```bash
docker compose exec backend php artisan test
```

Frontend validation:

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

Clean-state validation:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
docker compose ps
docker compose exec backend php artisan test
```

## AI Configuration

Set `MAIA_API_KEY`, `MAIA_BASE_URL`, dan `MAIA_MODEL` pada `backend/.env`.
Tanpa API key, fitur lain tetap berjalan dan endpoint analisis mengembalikan
error terkontrol.

Model bersifat environment-driven. Proposal awal menargetkan Gemini 2.5 Flash,
sedangkan implementasi dapat memakai model Maia Router yang tersedia melalui
`MAIA_MODEL` tanpa perubahan source.

## Structured Logs

```bash
docker compose exec backend tail -f storage/logs/laravel.log
```

Setiap request API membawa `X-Request-ID` untuk korelasi log.

## Competition Evidence

Pemetaan kriteria Must Have, Nice to Have, command demo, trade-off, dan
limitasi tersedia di:

```text
JUDGING_GUIDE.md
```

Technical report final tersedia sebagai `technical-report.pdf` (2 halaman),
dengan source yang dapat diperbarui di `technical-report.md`.

Git history TDD:

```text
d14351b add failing create ticket feature test
f5f082e implement create ticket endpoint
```
