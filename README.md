# Product Requirement Document (PRD)
## AI Lecture Notes Organizer (Embege)

Dokumen Persyaratan Produk (PRD) ini menjelaskan visi, fitur, arsitektur teknis, dan skema basis data untuk aplikasi **AI Lecture Notes Organizer** (Embege). Aplikasi ini dirancang untuk membantu mahasiswa mengorganisasi materi kuliah, mengekstrak teks dari berbagai berkas catatan, serta memanfaatkan kecerdasan buatan (AI) untuk membuat ringkasan otomatis dan flashcard belajar yang interaktif.

---

## 1. Latar Belakang & Masalah
Mahasiswa sering kali kesulitan mengelola dan mempelajari tumpukan materi kuliah yang tersebar di berbagai format dokumen seperti PDF, DOCX, TXT, dan PPTX. Membaca ulang dokumen materi yang panjang dan teknis membutuhkan waktu yang sangat banyak. Terlebih lagi, proses pembuatan rangkuman manual dan alat bantu belajar seperti *flashcards* (kartu memori) sering kali memakan waktu produktif mahasiswa. 

**AI Lecture Notes Organizer** hadir untuk menyelesaikan masalah ini dengan mengotomatisasi ekstraksi teks dokumen, merangkum poin-poin penting menggunakan model bahasa besar (LLM) Groq (Llama 3), serta memproduksi kartu belajar (*flashcards*) interaktif secara instan.

---

## 2. Tujuan Produk
*   **Sentralisasi Materi**: Menyediakan satu wadah terorganisir untuk mengelompokkan catatan berdasarkan mata kuliah.
*   **Efisiensi Waktu Belajar**: Mempercepat proses pemahaman materi kuliah dengan menyediakan rangkuman terstruktur yang dapat dibaca dalam waktu 10–15 menit.
*   **Metode Belajar Aktif**: Mendorong teknik belajar *active recall* melaui kartu belajar (*flashcards*) interaktif yang dibuat secara otomatis dari materi yang diunggah.
*   **Aksesibilitas Dokumen Hasil Scan**: Menyediakan solusi ekstraksi teks berbasis OCR (Optical Character Recognition) secara otomatis apabila dokumen PDF yang diunggah merupakan berkas hasil pemindaian (scan) gambar.

---

## 3. Profil & Target Pengguna
*   **Target Utama**: Mahasiswa Universitas Muhammadiyah Malang (UMM) dan mahasiswa umum.
*   **Karakteristik Pengguna**: 
    *   Memiliki banyak materi kuliah dalam format PDF, PPTX, atau Word.
    *   Menginginkan metode belajar yang praktis, cepat, dan interaktif.
    *   Memiliki kebutuhan untuk me-review materi kuliah menjelang Ujian Tengah Semester (UTS) atau Ujian Akhir Semester (UAS).

---

## 4. Fitur Utama & Kebutuhan Fungsional

### A. Otentikasi & Profil Pengguna
*   **Registrasi & Login**: Pengguna dapat mendaftarkan akun baru atau masuk menggunakan email dan kata sandi yang divalidasi oleh Supabase Auth.
*   **Pembuatan Profil Otomatis**: Saat pengguna mendaftar, sistem secara otomatis membuat profil pengguna di database, mengambil nama default dari bagian depan email pengguna (misalnya, `budi` dari `budi@gmail.com`).

### B. Manajemen Mata Kuliah (Course Management)
*   **Tambah Mata Kuliah**: Pengguna dapat menambahkan mata kuliah baru dengan menentukan nama mata kuliah, ikon emoji (sebagai representasi visual), dan warna aksen UI.
*   **Hapus Mata Kuliah**: Pengguna dapat menghapus mata kuliah. Tindakan ini juga akan menghapus seluruh catatan dan flashcard terkait mata kuliah tersebut (*cascade delete*).
*   **Visualisasi Progres**: Setiap mata kuliah menampilkan status jumlah catatan dan persentase catatan yang telah selesai diproses oleh AI.

### C. Manajemen Catatan & Ekstraksi Teks (Lecture Notes Management)
*   **Unggah Dokumen**: Pengguna dapat mengunggah file catatan ke sistem. Format yang didukung adalah `.pdf`, `.docx`, `.txt`, dan `.pptx`.
*   **Ekstraksi Teks (Text Extraction)**:
    *   **PDF**: Teks diekstrak menggunakan library `pdf-parse`. Jika berkas PDF terdeteksi memiliki teks sangat sedikit (< 50 karakter), sistem menduga PDF tersebut merupakan hasil scan dan otomatis memicu ekstraksi gambar dengan OCR Space API.
    *   **DOCX**: Teks diekstrak menggunakan library `mammoth`.
    *   **TXT & PPTX**: Teks dibaca sebagai string polos dan dibersihkan dari tag markup yang tidak perlu.
*   **Penyimpanan Cloud**: Berkas dokumen yang diunggah akan disimpan dengan aman secara privat di Supabase Storage Bucket.

### D. Fitur AI (Ringkasan & Flashcard)
*   **Pemrosesan Pararel**: Setelah teks berhasil diekstrak, sistem mengirimkan teks tersebut ke Groq API secara paralel untuk menghemat waktu respon.
*   **Peringkas Otomatis (AI Summarizer)**:
    *   Menggunakan model **Llama-3.1-8b-instant** melalui Groq SDK.
    *   Menghasilkan ringkasan terstruktur dalam Bahasa Indonesia yang mencakup: Gambaran umum, konsep-konsep utama, penjelasan singkat subbab penting, poin-poin wajib diingat, dan ringkasan akhir.
*   **Pembuat Flashcard Otomatis**:
    *   Menghasilkan 12 pasang pertanyaan & jawaban dalam format JSON terstruktur.
    *   Flashcard dimasukkan langsung ke basis data untuk dapat langsung digunakan oleh mahasiswa.

### E. Mode Studi Interaktif
*   **Tab Ringkasan**: Menampilkan hasil rangkuman AI dengan rendering Markdown yang rapi (judul subbab, poin-poin penting, teks tebal).
*   **Tab Flashcard**:
    *   **Study Mode**: Menampilkan satu kartu besar pada satu waktu dengan efek animasi balik (*flip card*) 3D untuk melihat jawaban.
    *   **List Mode**: Menampilkan seluruh daftar kartu yang dihasilkan dalam grid responsif untuk kemudahan membaca cepat.
*   **Tab Teks Asli**: Menampilkan hasil ekstraksi teks mentah dari dokumen yang diunggah untuk referensi silang.

---

## 5. Arsitektur Teknis & Stack Teknologi

```mermaid
graph TD
    User([Pengguna / Mahasiswa]) -->|Akses UI / Unggah Berkas| Frontend[Next.js Frontend]
    
    subgraph Frontend App (Next.js 14 App Router)
        Frontend -->|State & Auth client| SupabaseClient[Supabase Client]
        Frontend -->|Trigger AI / Ekstraksi| RouteAI[/api/ai/process Route]
    end

    subgraph Backend & Database (Supabase)
        SupabaseClient -->|Auth & Query Data| DB[(PostgreSQL Database)]
        SupabaseClient -->|Upload File| Storage[Supabase Private Storage]
    end

    subgraph Processing Server
        RouteAI -->|Unduh Dokumen| Storage
        RouteAI -->|Parse File Buffer| Extractor[Parser: pdf-parse / mammoth]
        Extractor -->|Teks Hasil Scan < 50 Karakter| OCR[OCR Space API]
        RouteAI -->|Kirim Teks Bersih| GroqLLM[Groq SDK: Llama-3.1]
        GroqLLM -->|Simpan Rangkuman & Flashcards| DB
    end
```

### Stack Detail
*   **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS (Glassmorphism & premium UI theme).
*   **Backend / Serverless**: Next.js API Routes (Route Handlers).
*   **Database**: Supabase PostgreSQL.
*   **Storage**: Supabase Storage (Private bucket untuk keamanan berkas).
*   **AI Engine**: Groq Cloud SDK dengan model `llama-3.1-8b-instant`.
*   **OCR API**: OCR Space API (sebagai mesin cadangan untuk PDF scan).
*   **File Parser**: `pdf-parse` (PDF) dan `mammoth` (DOCX).

---

## 6. Skema Basis Data

Aplikasi menggunakan Supabase PostgreSQL dengan kebijakan **Row Level Security (RLS)** yang ketat untuk menjamin keamanan dan privasi data pengguna. Berikut adalah struktur tabel utama:

### A. Tabel `profiles`
Menyimpan profil pengguna yang terintegrasi secara otomatis dengan modul `auth.users` Supabase melalui trigger database.
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);
```

### B. Tabel `courses`
Menyimpan data mata kuliah yang dibuat oleh masing-masing pengguna.
```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_name text not null,
  color text default '#6366f1',
  emoji text default '📚',
  created_at timestamptz default now()
);
```

### C. Tabel `notes`
Menyimpan dokumen catatan yang diunggah, teks mentah hasil ekstraksi, ringkasan AI, dan status pemrosesan.
```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  file_url text,
  file_name text,
  file_type text, -- 'pdf' | 'docx' | 'txt' | 'pptx'
  content text,
  summary text,
  status text default 'pending', -- 'pending' | 'processing' | 'done' | 'error'
  created_at timestamptz default now()
);
```

### D. Tabel `flashcards`
Menyimpan pertanyaan dan jawaban kartu belajar yang dihasilkan oleh AI untuk catatan terkait.
```sql
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text not null,
  created_at timestamptz default now()
);
```

---

## 7. Alur Kerja Pengguna (User Flow)

1.  **Daftar & Masuk**: Pengguna melakukan pendaftaran akun melalui halaman `/auth`.
2.  **Kelola Mata Kuliah**: Pengguna masuk ke `/dashboard` dan membuat folder mata kuliah pertama mereka (misal: "Kecerdasan Buatan" dengan emoji 💻 dan warna biru).
3.  **Unggah Dokumen**: Pengguna mengklik mata kuliah tersebut untuk masuk ke halaman detil kuliah `/courses/[courseId]`, kemudian mengunggah file materi kuliah berformat PDF/DOCX/TXT/PPTX. Dokumen masuk ke daftar catatan dengan status **Belum diproses** (pending).
4.  **Proses AI**: Pengguna mengklik tombol **Proses AI**. Backend akan mengunduh dokumen dari penyimpanan cloud, mengekstrak teksnya (atau melarikan ke OCR jika berupa scan gambar), dan mengirimkan ke model Llama 3 untuk membuat rangkuman dan flashcard secara bersamaan. Halaman web melakukan *polling* setiap 2 detik untuk memperbarui status pemrosesan secara dinamis.
5.  **Mulai Belajar**: Setelah status berubah menjadi **Selesai**, pengguna dapat mengklik **Lihat** untuk menuju halaman `/notes/[noteId]`. Pengguna dapat membaca ringkasan AI yang terstruktur, menggunakan kartu flashcard interaktif (mode belajar satu per satu atau daftar lengkap), dan membaca kembali teks asli.
