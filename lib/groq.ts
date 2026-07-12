import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
const MODEL = "qwen/qwen3-32b";

export async function summarizeNotes(content: string): Promise<string> {
  try {
    const truncated = content.slice(0, 3000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Kamu adalah tutor pribadi yang merangkum materi akademik. Tugasmu: buat resume agar saya paham dalam 10–15 menit.

## ATURAN FORMAT (WAJIB DIPATUHI)
- **JANGAN** buat tabel, grid, kolom, atau baris yang sejajar dalam bentuk apa pun.
- **JANGAN** gunakan karakter pipe (|) untuk memisah informasi.
- **JANGAN** buat heading dengan garis pemisah panjang (-----).
- Gunakan HANYA bullet points, paragraf, dan heading Markdown biasa (#, ##, ###).
- Setiap konsep/topik harus ditulis dalam **satu atau lebih bullet point**, bukan dalam kolom.

## STRUKTUR OUTPUT
### 1. Gambaran Umum
2–4 paragraf singkat.

### 2. Konsep-Konsep Utama
Untuk setiap konsep, gunakan format persis seperti ini:

- **Fungsi Agregat**: Perintah yang mengolah banyak baris menjadi satu nilai.  
  → Kenapa penting: Membantu meringkas data besar.  
  → Analogi: Seperti blender yang mengubah banyak bahan menjadi satu smoothie.

- **GROUP BY**: Klausa yang mengelompokkan baris berdasarkan kolom sebelum agregasi.  
  → Kenapa penting: Memungkinkan perhitungan per kelompok.  
  → Analogi: Seperti memotong kue menjadi potongan sebelum dihitung.

(Gunakan format di atas. Jangan ubah menjadi tabel.)

### 3. Topik-Topik Penting
Uraikan dalam bullet point, 2–3 kalimat per topik.

### 4. Poin-Poin Kunci
Daftar bernomor 5–8 poin, bahasa flashcard.

### 5. Ringkasan Akhir
3–5 bullet point.

## ATURAN BAHASA & ISI
- Bahasa Indonesia sederhana, sehari-hari.
- Istilah teknis? Jelaskan dalam 1 kalimat bahasa orang awam.
- Proses/algoritma? Maksimal 5 langkah singkat.
- Hilangkan detail tidak esensial, histori penemuan, atau data teknis berlebihan.
- Jika materi terpotong, sebutkan bagian yang tidak tersedia.`,
        },
        { role: "user", content: `Catatan:\n\n${truncated}` },
      ],
      max_tokens: 3000,
      temperature: 0.3,
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
          content: `Buat 12 flashcard. Balas HANYA JSON array tanpa teks lain.
Format: [{"question":"...","answer":"..."}]`,
        },
        { role: "user", content: `Catatan:\n\n${truncated}` },
      ],
      max_tokens: 1500,
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