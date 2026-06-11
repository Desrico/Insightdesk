# AI Usage Log

## Interaction 1

Tool: ChatGPT GPT-5.5 Thinking
Pattern: Planning and implementation guidance
Prompt: Membantu menyusun urutan implementasi Fase 2 sesuai roadmap proposal InsightDesk.
Decision: Digunakan sebagai panduan awal implementasi.
Reason: Output membantu menjaga urutan kerja agar sesuai dengan must-have kompetisi.

## Interaction 2

Tool: ChatGPT GPT-5.5 Thinking
Pattern: Docker setup guidance
Prompt: Membantu setup Docker Compose untuk React, Laravel, dan MySQL.
Decision: Digunakan sebagai baseline Docker dan disesuaikan saat terjadi konflik port MySQL.
Reason: Docker Compose adalah must-have requirement dan harus bisa dijalankan dari clean state.

## Interaction 3

Tool: ChatGPT GPT-5.5 Thinking
Pattern: Backend implementation guidance
Prompt: Membantu membuat migration, model, controller, request validation, dan endpoint ticket.
Decision: Digunakan sebagian, lalu disesuaikan dengan struktur Laravel project.
Reason: Output membantu mempercepat implementasi backend tetapi tetap diperiksa manual.

## Interaction 4

Tool: ChatGPT GPT-5.5 Thinking
Pattern: Debugging
Prompt: Membantu memperbaiki error koneksi database Docker yang masih membaca SQLite atau 127.0.0.1.
Decision: Diterima dan diterapkan.
Reason: Solusi sesuai karena backend Docker harus memakai DB_HOST=mysql, bukan 127.0.0.1.
