# AI Usage Log

## Interaction 1

Tool: OpenAI Codex (GPT-5 family)
Pattern: Planning and implementation guidance
Prompt: Membantu menyusun urutan implementasi Fase 2 sesuai roadmap proposal InsightDesk.
Decision: Digunakan sebagai panduan awal implementasi.
Reason: Output membantu menjaga urutan kerja agar sesuai dengan must-have kompetisi.

## Interaction 2

Tool: OpenAI Codex (GPT-5 family)
Pattern: Docker setup guidance
Prompt: Membantu setup Docker Compose untuk React, Laravel, dan MySQL.
Decision: Digunakan sebagai baseline Docker dan disesuaikan saat terjadi konflik port MySQL.
Reason: Docker Compose adalah must-have requirement dan harus bisa dijalankan dari clean state.

## Interaction 3

Tool: OpenAI Codex (GPT-5 family)
Pattern: Backend implementation guidance
Prompt: Membantu membuat migration, model, controller, request validation, dan endpoint ticket.
Decision: Digunakan sebagian, lalu disesuaikan dengan struktur Laravel project.
Reason: Output membantu mempercepat implementasi backend tetapi tetap diperiksa manual.

## Interaction 4

Tool: OpenAI Codex (GPT-5 family)
Pattern: Debugging
Prompt: Membantu memperbaiki error koneksi database Docker yang masih membaca SQLite atau 127.0.0.1.
Decision: Diterima dan diterapkan.
Reason: Solusi sesuai karena backend Docker harus memakai DB_HOST=mysql, bukan 127.0.0.1.

## Interaction 5

Tool: OpenAI Codex (GPT-5 family)
Pattern: AI integration guidance
Prompt: Membantu integrasi Gemini 2.5 Flash melalui Laravel service layer dan menyimpan hasil AI ke MySQL.
Decision: Digunakan sebagai baseline implementasi, lalu disesuaikan dengan struktur controller, route, dan tabel yang sudah dibuat.
Reason: Tahap ini sesuai roadmap dan membuat fitur AI pada InsightDesk berjalan end-to-end.

## Interaction 6

Tool: OpenAI Codex (GPT-5 family)
Pattern: Agentic implementation and code review
Prompt: Menambahkan dashboard caching, structured logging, dan optimistic locking sederhana.
Decision: Saran cache service dan request middleware diterima. Pengecekan versi di memory ditolak dan diganti conditional database update.
Reason: Conditional update diperlukan agar dua concurrent request tidak sama-sama berhasil.

## Interaction 7

Tool: OpenAI Codex (GPT-5 family)
Pattern: Testing and Docker debugging
Prompt: Finalisasi API docs, testing, bug fixing, dan validasi Docker clean state.
Decision: Digunakan untuk memperluas test, melengkapi OpenAPI, dan memperbaiki healthcheck frontend dari `localhost` ke `127.0.0.1`.
Reason: BusyBox memilih IPv6 `::1`, sedangkan Vite hanya menerima koneksi healthcheck melalui IPv4.

## Interaction 8

Tool: OpenAI Codex (GPT-5 family)
Pattern: Security and competition readiness review
Prompt: Memperbaiki kekurangan agar implementasi sejalan dengan proposal dan seluruh kriteria penilaian.
Decision: Menambahkan masking email/telepon, CI workflow, dan judging guide; tidak menambahkan microservice atau queue.
Reason: Perubahan menutup gap proposal dan Nice to Have tanpa melanggar YAGNI untuk MVP.
