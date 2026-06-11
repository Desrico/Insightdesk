# InsightDesk

InsightDesk adalah aplikasi web full-stack untuk mengelola support ticket dan feedback pengguna. Sistem ini membantu operator melihat daftar ticket, membuat ticket baru, melihat detail ticket, memperbarui status, menyimpan riwayat status, dan menyiapkan hasil analisis AI.

## Tech Stack

- Frontend: React
- Backend: Laravel REST API
- Database: MySQL
- AI/LLM: Gemini 2.5 Flash
- Container: Docker Compose
- API Documentation: OpenAPI/Swagger
- Testing: PHPUnit/Pest

## Main Features

- Create ticket
- View ticket list
- View ticket detail
- Update ticket status
- Status history
- AI analysis result table
- Swagger/OpenAPI documentation

## Run with Docker

```bash
docker compose up --build
```

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
```

## Testing

Run backend tests:

```bash
docker compose exec backend php artisan test
```

## Notes

AI analysis integration with Gemini 2.5 Flash is planned as part of the next implementation stage. Current backend already provides the table structure for storing AI analysis results.
