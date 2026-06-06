import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.1-8b-instant";

export async function summarizeNotes(content: string): Promise<string> {
  try {
    const truncated = content.slice(0, 3000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Buatkan resume lengkap dari file yang saya unggah dengan ketentuan berikut:

Tujuan

Resume digunakan untuk belajar dan persiapan ujian, sehingga harus fokus pada pemahaman konsep, bukan sekadar ringkasan singkat.

Struktur Resume
Judul Materi

1. Gambaran Umum Materi
Jelaskan tujuan pembelajaran materi.
Jelaskan mengapa materi ini penting dipelajari.
Hubungkan dengan konteks ilmu komputer/informatika jika relevan.

2. Konsep-Konsep Utama

Untuk setiap konsep yang ada di materi:

Nama Konsep
Definisi
Fungsi/Tujuan
Cara Kerja
Karakteristik
Kelebihan
Kekurangan
Kapan digunakan
Contoh sederhana

Gunakan subjudul terpisah untuk setiap konsep.

3. Penjelasan Detail Materi

Jelaskan seluruh isi modul secara runtut dari awal hingga akhir.

Ketentuan:

Jangan hanya menyalin isi file.
Jelaskan ulang dengan bahasa Indonesia yang baik dan benar.
Gunakan istilah teknis yang tepat.
Hindari perumpamaan yang tidak logis atau berlebihan.
Jika terdapat proses atau algoritma, jelaskan langkah demi langkah.

4. Struktur Data / Sintaks / Rumus Penting (Jika Ada)

Untuk setiap struktur data, sintaks, atau rumus:

Bentuk umum
Penjelasan tiap bagian
Fungsi
Contoh penggunaan
Hasil yang diharapkan

5. Analisis Contoh pada Modul

Jika modul memiliki contoh:

Tulis ulang contoh.
Jelaskan setiap langkahnya.
Jelaskan mengapa hasil tersebut muncul.
Jelaskan logika di balik contoh tersebut.
6. Tabel Ringkasan Materi
Konsep	Fungsi	Kelebihan	Kekurangan

Isi seluruh konsep penting ke dalam tabel.

7. Poin-Poin yang Sering Keluar di Ujian atau Praktikum

Buat daftar:

Definisi penting
Perbedaan antar konsep
Langkah algoritma
Sintaks yang harus dihafal
Kesalahan yang sering dilakukan mahasiswa
8. Ringkasan Super Singkat (1 Halaman)

Buat versi ringkas yang bisa dibaca dalam 3–5 menit sebelum ujian.`,
        },
        { role: "user", content: `Catatan:\n\n${truncated}` },
      ],
      max_tokens: 600,
    });
    return res.choices[0].message.content || "";
  } catch (error) {
    console.error("Gagal meringkas:", error);
    return "Gagal membuat ringkasan.";
  }
}

export async function generateFlashcards(
  content: string
): Promise<Array<{ question: string; answer: string }>> {
  try {
    const truncated = content.slice(0, 2000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Buat 10 flashcard. Balas HANYA JSON array tanpa teks lain.
Format: [{"question":"...","answer":"..."}]`,
        },
        { role: "user", content: `Catatan:\n\n${truncated}` },
      ],
      max_tokens: 600,
    });
    const raw = res.choices[0].message.content || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Gagal flashcards:", error);
    return [];
  }
}