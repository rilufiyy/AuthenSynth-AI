# AuthenSynth-AI (AI-Content-Authenticity-Detection-Platform)

AuthenSynth AI is a production-grade, hybrid AI detection system that analyzes text, images, audio, video, and code to determine authenticity, delivering probability scores and transparent explanations.

## System Architecture

AuthenSynth AI uses a multi-layered hybrid architecture combining local Hugging Face models for raw probability scoring, and an OpenAI Reasoning Layer for semantic evaluation and confidence calibration.

### 1. Ingestion & Router Layer
- **Modality Router**: Mendeteksi tipe konten (MIME/format) dan meneruskannya ke pipeline yang sesuai (Teks, Gambar, Audio, Video, Kode).

### 2. Preprocessing & Local HF Models Layer
Memproses raw input dan menggunakan model spesifik untuk mendapatkan probabilitas dasar `w_local`:
- **Teks**: Tokenize/Clean → RoBERTa Detector
- **Gambar**: Resize/Patch → CNNSynth SDXL Detect
- **Audio**: Spectrogram → AudioSeal Wav2Vec2
- **Video**: Frame Sample/Audio Split → FaceForensics EfficientNet
- **Code**: AST Parse → CodeBERT AST Feats

### 3. Reasoning & Aggregation Layer
- **OpenAI Reasoning Layer (Forensic AI Analyst)**: Menggunakan GPT-4o dengan *Chain-of-Thought* untuk melakukan evaluasi semantik dan tekstual, melakukan cross-validasi terhadap skor *local model*.
- **Score Calibration & Weighted Aggregator**: Menggabungkan `w_local` (Hugging Face) dan `w_openai` (GPT-4o) untuk menentukan "Confidence Band" (Low, Moderate, Uncertain, High, Very High).

### 4. Verdict & Output Layer
- Mengembalikan hasil akhir dalam format JSON terstruktur yang berisi:
  - `verdict`: ai_generated / human_generated
  - `confidence` & `band`
  - `primary_indicators` & `counter_evidence`
  - `conflict_flag` (Jika ada perbedaan besar antara lokal dan OpenAI)
  - `explanation` & `adversarial_warning`

## Project Schema & Directory Structure

```text
AuthenSynth-AI/
├── backend/                  # FastAPI Backend API
│   ├── app/
│   │   ├── api/              # API Routes (/v1/detect, dll)
│   │   ├── models/           # Pydantic Schemas (Request/Response)
│   │   ├── pipelines/        # Preprocessing & HF Models
│   │   ├── reasoning/        # OpenAI Agent & Calibration
│   │   ├── services/         # Verdict Engine & XAI
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Vite + React (TypeScript) Frontend UI
│   ├── src/
│   │   ├── App.tsx           # Main UI Component
│   │   ├── App.css           # UI Styling (Dark Glassmorphism)
│   │   └── index.css         # Base styles
│   ├── Dockerfile
│   └── package.json
├── DEPLOYMENT.md             # Panduan Menjalankan Sistem (Lokal & Docker)
├── docker-compose.yml        # Orchestration untuk Backend, Frontend, Postgres, Redis, Qdrant
└── README.md                 # Dokumentasi Arsitektur
```

> **Untuk panduan instalasi dan menjalankan aplikasi (dengan atau tanpa Docker), silakan baca [DEPLOYMENT.md](DEPLOYMENT.md).**
