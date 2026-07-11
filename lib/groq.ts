import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
const MODEL = "openai/gpt-oss-20b";

export async function summarizeNotes(content: string): Promise<string> {
  try {
    const truncated = content.slice(0, 3000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Kamu adalah tutor pribadi yang ahli merangkum materi akademik. Tugasmu adalah membuat resume dari catatan berikut agar saya bisa memahami materi dengan cepat dalam waktu 10–15 menit.

## FORMAT OUTPUT (WAJIB)
Gunakan struktur berikut dalam format Markdown:

### 1. Gambaran Umum
- 2–4 paragraf singkat yang menjelaskan materi secara keseluruhan.
- Sebutkan tujuan pembelajaran utama.

### 2. Konsep-Konsep Utama
- Jelaskan 3–5 konsep paling penting.
- Untuk setiap konsep: berikan definisi singkat, lalu jelaskan mengapa konsep itu penting.
- Gunakan analogi sederhana jika membantu pemahaman.

### 3. Topik-Topik Penting
- Uraikan setiap subbab/topik krusial dalam 2–3 kalimat.
- Fokus pada "apa yang perlu dipahami", bukan "apa yang tertulis."

### 4. Poin-Poin Kunci (Wajib Diingat)
- Buat daftar bernomor 5–8 poin.
- Gunakan bahasa yang mudah diingat, seperti flashcard.

### 5. Ringkasan Akhir
- 3–5 bullet point yang merangkum keseluruhan materi.
- Sertakan satu kalimat takeaway utama.

## ATURAN KETAT
- JANGAN buat tabel, diagram, atau format grid dalam bentuk apa pun.
- Gunakan bahasa Indonesia sehari-hari yang sederhana. Hindari jargon akademik berlebihan.
- Jika ada istilah teknis, jelaskan dalam 1 kalimat menggunakan bahasa orang awam.
- Jika ada proses/algoritma, uraikan dalam langkah-langkah singkat (maksimal 5 langkah).
- Hilangkan detail yang terlalu teknis, histori penemuan, atau data yang tidak esensial.
- Fokus pada pemahaman konsep, bukan menghafal.
- Jika materi terpotong atau tidak lengkap, sebutkan bagian mana yang tidak tersedia dan rangkum hanya dari bagian yang ada.`,
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