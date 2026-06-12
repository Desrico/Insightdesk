# Panduan Deployment InsightDesk ke Railway

Panduan ini menggunakan satu Railway project dengan tiga service:

1. `MySQL`
2. `backend` (Laravel REST API)
3. `frontend` (React/Vite yang disajikan oleh Caddy)

Repository berbentuk isolated monorepo. Setiap service aplikasi harus memakai
root directory yang berbeda.

## 1. Persiapan GitHub

Pastikan seluruh perubahan sudah berada di repository:

```text
https://github.com/Desrico/Insightdesk
```

Branch deployment yang digunakan adalah `main`.

Jangan memasukkan file `.env`, API key, password database, folder `vendor`,
`node_modules`, atau hasil build `dist` ke GitHub.

## 2. Membuat Railway Project

1. Buka `https://railway.com/new`.
2. Pilih **Deploy from GitHub repo**.
3. Hubungkan akun GitHub jika diminta.
4. Pilih repository `Desrico/Insightdesk`.
5. Beri nama project, misalnya `insightdesk-production`.

Deployment pertama dari root repository boleh gagal. Selanjutnya kita akan
memisahkan frontend dan backend sebagai service monorepo.

## 3. Menambahkan MySQL

1. Pada Project Canvas, klik **+ New**.
2. Pilih **Database > Add MySQL**.
3. Ubah nama service menjadi `MySQL` jika namanya berbeda.
4. Tunggu sampai service berstatus aktif.

Railway menyediakan variable berikut dari service MySQL:

```text
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
MYSQL_URL
```

Backend akan mengakses database melalui private networking Railway, bukan
melalui domain publik.

## 4. Membuat Service Backend

1. Klik **+ New > GitHub Repo**.
2. Pilih kembali repository `Desrico/Insightdesk`.
3. Ubah nama service menjadi `backend`.
4. Buka **Settings**.
5. Atur **Root Directory** menjadi:

```text
/backend
```

6. Buka **Variables** dan tambahkan:

```text
RAILWAY_DOCKERFILE_PATH=Dockerfile.railway
APP_NAME=InsightDesk
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:ISI_DENGAN_APP_KEY
APP_URL=https://DOMAIN-BACKEND.up.railway.app
FRONTEND_URL=https://DOMAIN-FRONTEND.up.railway.app
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=info
DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
MAIA_API_KEY=ISI_API_KEY_MAIA
MAIA_BASE_URL=https://api.maiarouter.ai/v1/chat/completions
MAIA_MODEL=maia/gemini-3.1-flash-lite-preview
```

Gunakan fitur **Add Reference** di Railway untuk variable database. Jangan
menyalin password MySQL secara manual jika reference variable tersedia.

### Membuat APP_KEY

Jalankan dari project lokal yang sedang aktif:

```bash
docker compose exec backend php artisan key:generate --show
```

Salin hasil `base64:...` ke `APP_KEY`. Jangan menaruh nilai ini di GitHub.

### Pre-deploy migration

Di **Settings > Deploy**, isi **Pre-deploy Command**:

```bash
php artisan migrate --force
```

Migration berjalan sebelum versi backend baru menerima traffic.

### Healthcheck backend

Di **Settings > Deploy > Healthcheck Path**, isi:

```text
/up
```

Railway menyuntikkan variable `PORT`, dan `Dockerfile.railway` sudah membuat
Laravel mendengarkan port tersebut.

### Membuat domain backend

1. Buka **Settings > Networking**.
2. Klik **Generate Domain**.
3. Salin URL, misalnya:

```text
https://insightdesk-backend-production.up.railway.app
```

4. Perbarui `APP_URL` dengan URL tersebut.
5. Biarkan `FRONTEND_URL` sementara sampai domain frontend tersedia.
6. Redeploy backend.

## 5. Membuat Service Frontend

1. Klik **+ New > GitHub Repo**.
2. Pilih repository `Desrico/Insightdesk`.
3. Ubah nama service menjadi `frontend`.
4. Buka **Settings**.
5. Atur **Root Directory**:

```text
/frontend
```

6. Buka **Variables** dan tambahkan:

```text
RAILWAY_DOCKERFILE_PATH=Dockerfile.railway
VITE_API_BASE_URL=https://DOMAIN-BACKEND.up.railway.app/api
```

`VITE_API_BASE_URL` dipakai pada build frontend. Nilainya wajib diakhiri `/api`
dan harus menggunakan domain publik backend, bukan private domain Railway,
karena request dilakukan dari browser pengguna.

### Healthcheck frontend

Di **Settings > Deploy > Healthcheck Path**, isi:

```text
/
```

### Membuat domain frontend

1. Buka **Settings > Networking**.
2. Klik **Generate Domain**.
3. Salin URL frontend.
4. Kembali ke variable backend.
5. Isi `FRONTEND_URL` dengan URL frontend tanpa garis miring terakhir:

```text
https://insightdesk-frontend-production.up.railway.app
```

6. Redeploy backend agar CORS menerima domain frontend.

## 6. Urutan Redeploy Final

Setelah kedua domain tersedia:

1. Pastikan `APP_URL` backend memakai domain backend.
2. Pastikan `FRONTEND_URL` backend memakai domain frontend.
3. Pastikan `VITE_API_BASE_URL` frontend memakai domain backend dan `/api`.
4. Redeploy backend.
5. Redeploy frontend.

## 7. Smoke Testing

Buka endpoint berikut:

```text
Frontend:
https://DOMAIN-FRONTEND.up.railway.app

Backend health:
https://DOMAIN-BACKEND.up.railway.app/up

Swagger:
https://DOMAIN-BACKEND.up.railway.app/api-docs

API:
https://DOMAIN-BACKEND.up.railway.app/api/dashboard/summary
```

Lakukan flow browser lengkap:

1. Buka frontend.
2. Pilih jenis laporan.
3. Kirim satu laporan.
4. Masuk ke halaman Admin.
5. Pastikan laporan muncul.
6. Buka detail laporan.
7. Jalankan analisis AI.
8. Ubah status dari `Baru` menjadi `Diproses`, lalu `Selesai`.
9. Refresh dashboard dan pastikan statistik berubah.

## 8. Pemeriksaan Log

Pada Railway, buka service backend kemudian tab **Logs**. Pastikan:

- Tidak ada error koneksi database.
- Migration berhasil.
- Request API menghasilkan structured log.
- Request memiliki `request_id`, method, path, status, dan duration.
- Error AI tidak membocorkan API key.

## 9. Automatic Deployment

Service yang terhubung ke GitHub akan otomatis redeploy ketika ada push baru ke
branch yang dikonfigurasi. Gunakan branch `main` untuk deployment final.

Atur watch paths agar perubahan frontend tidak membangun backend dan sebaliknya:

Backend:

```text
/backend/**
```

Frontend:

```text
/frontend/**
```

## 10. Masalah Umum

### Application failed to respond

Pastikan aplikasi mendengarkan variable `PORT`. Kedua
`Dockerfile.railway` sudah menangani hal ini.

### Frontend menampilkan Failed to fetch

Periksa:

- `VITE_API_BASE_URL` menggunakan `https://`.
- URL berakhir dengan `/api`.
- `FRONTEND_URL` backend sama persis dengan origin frontend.
- Frontend sudah dibangun ulang setelah variable berubah.

### SQLSTATE connection refused

Periksa reference variable `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`,
dan `DB_PASSWORD`. Jangan memakai `localhost` atau port Docker Desktop.

### APP_KEY missing

Isi `APP_KEY` dengan output `php artisan key:generate --show`, kemudian
redeploy backend.

### Table not found

Pastikan Pre-deploy Command berisi:

```bash
php artisan migrate --force
```

### Analisis AI gagal

Periksa `MAIA_API_KEY`, `MAIA_BASE_URL`, dan `MAIA_MODEL` pada backend. Lihat
structured log backend untuk event kegagalan AI.

## 11. Checklist Submission

- [ ] Repository GitHub public dan commit terbaru sudah ada.
- [ ] MySQL aktif.
- [ ] Backend deployment sukses.
- [ ] Frontend deployment sukses.
- [ ] Semua healthcheck lulus.
- [ ] URL frontend dapat diakses tanpa login Railway.
- [ ] Swagger dapat dibuka.
- [ ] Create ticket berhasil.
- [ ] Dashboard dan detail ticket berhasil.
- [ ] Analisis AI berhasil.
- [ ] Update status berhasil.
- [ ] README berisi URL deployment final.
- [ ] Technical report mencantumkan hasil smoke test.

## Referensi Resmi Railway

- Monorepo: https://docs.railway.com/deployments/monorepo
- Laravel: https://docs.railway.com/guides/laravel
- React: https://docs.railway.com/guides/react
- MySQL: https://docs.railway.com/databases/mysql
- Variables: https://docs.railway.com/variables
- Dockerfile: https://docs.railway.com/builds/dockerfiles
- Healthchecks: https://docs.railway.com/deployments/healthchecks
- Public networking: https://docs.railway.com/networking/public-networking
