import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
const MODEL = "llama-3.1-8b-instant";

export async function summarizeNotes(content: string): Promise<string> {
  try {
    const truncated = content.slice(0, 3000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Buatkan resume materi dari file yang saya unggah dengan tujuan membantu saya memahami materi lebih cepat dan lebih mudah.

Struktur:

Gambaran umum materi
Konsep-konsep utama beserta penjelasannya
Penjelasan singkat setiap subbab/topik penting
Poin-poin yang wajib diingat
Ringkasan akhir dalam beberapa poin

Ketentuan:

Fokus pada pemahaman, bukan sekadar merangkum isi file.
Gunakan bahasa Indonesia yang sederhana dan jelas.
Hilangkan detail yang tidak penting atau terlalu teknis.
Jika ada istilah teknis, jelaskan dengan singkat.
Jika ada proses atau algoritma, jelaskan alurnya secara sederhana.
Buat resume yang cukup ringkas untuk dibaca dalam 10–15 menit, tetapi tetap mencakup seluruh konsep penting.`,
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