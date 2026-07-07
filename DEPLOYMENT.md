# AuthenSynth AI Deployment & Run Guide

Sistem ini terdiri dari dua bagian utama:
1. **Backend (FastAPI)**: Memproses data, menjalankan logic model HF (opsional/MVP), dan menghubungkan ke OpenAI Reasoning Layer.
2. **Frontend (Vite + React)**: Antarmuka pengguna bergaya modern untuk mengirimkan konten dan melihat hasil deteksi.

Berikut adalah dua cara untuk menjalankan aplikasi ini di komputer lokal Anda:

---

### OPSI 1: Menjalankan Menggunakan Docker (Rekomendasi)
Cara ini sangat direkomendasikan karena Docker akan otomatis mengatur database (Postgres, Redis, Qdrant), serta *environment* untuk backend dan frontend tanpa perlu repot menginstal dependensi satu per satu.

**Persyaratan:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstal dan berjalan.

**Langkah-langkah:**
1. Buka Terminal / Command Prompt di dalam folder proyek (`D:\Project AI\AuthenSynth-AI`).
2. Jalankan perintah berikut untuk mem-build dan menjalankan semua container di *background*:
   ```bash
   docker-compose up -d --build
   ```
3. Akses Aplikasi:
   - **Frontend UI**: Buka `http://localhost` di browser.
   - **Backend API Docs**: Buka `http://localhost:8000/docs` di browser.
4. (Opsional) Jika ingin memasukkan `OPENAI_API_KEY` agar hasil penalaran berfungsi penuh, Anda bisa mengedit file `docker-compose.yml` di bagian `backend > environment` dan mengganti nilai `${OPENAI_API_KEY}` dengan *key* asli Anda, lalu jalankan `docker-compose up -d` kembali.
5. Untuk menghentikan sistem, jalankan:
   ```bash
   docker-compose down
   ```

---

### OPSI 2: Menjalankan Secara Manual (Tanpa Docker)
Gunakan cara ini jika Anda ingin melakukan *development* atau proses *debugging* secara langsung di mesin Anda.

**Persyaratan:**
- Node.js (v18+) untuk Frontend
- Python (v3.10+) untuk Backend

#### 1. Menjalankan Backend (Terminal 1)
1. Buka terminal baru dan masuk ke direktori backend:
   ```bash
   cd "D:\Project AI\AuthenSynth-AI\backend"
   ```
2. Buat *Virtual Environment* (Rekomendasi):
   ```bash
   python -m venv venv
   # Di Windows:
   venv\Scripts\activate
   ```
3. Instal semua dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Set *Environment Variable* untuk OpenAI API Key (jika ingin mencoba *reasoning layer* yang utuh):
   ```bash
   set OPENAI_API_KEY=sk-kunci-rahasia-anda
   ```
5. Jalankan server FastAPI:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
6. Backend sekarang berjalan di `http://localhost:8000`.

#### 2. Menjalankan Frontend (Terminal 2)
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd "D:\Project AI\AuthenSynth-AI\frontend"
   ```
2. Instal semua package Node.js:
   ```bash
   npm install
   ```
3. Jalankan Vite Development Server:
   ```bash
   npm run dev
   ```
4. Frontend akan berjalan dan biasanya dapat diakses di `http://localhost:5173` (cek terminal Anda untuk melihat URL persisnya).

---

> **Catatan Penting**: 
> Saat menjalankan tanpa Docker, karena kita tidak langsung menyalakan server Postgres, Redis, atau Qdrant, backend MVP dirancang untuk berjalan *stateless* (tidak error jika DB tidak ada) untuk proses deteksi tahap awal. Namun untuk sistem penuh, Anda tetap membutuhkan layanan database tersebut.
