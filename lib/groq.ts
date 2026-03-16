import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Summarize lecture notes
export async function summarizeNotes(content: string): Promise<string> {
  const truncated = content.slice(0, 8000); // Groq context limit safety
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Kamu adalah asisten akademik yang membantu mahasiswa. 
Buat ringkasan terstruktur dari catatan kuliah berikut dalam Bahasa Indonesia.
Format output:
## 📌 Ringkasan Utama
[2-3 kalimat inti]

## 🔑 Poin-Poin Kunci
- [poin 1]
- [poin 2]
- [dst...]

## 💡 Konsep Penting
[Jelaskan 2-3 konsep terpenting]

## 📝 Kesimpulan
[1 paragraf penutup]`,
      },
      { role: "user", content: `Catatan kuliah:\n\n${truncated}` },
    ],
    max_tokens: 1024,
  });
  return res.choices[0].message.content || "";
}

// Generate flashcards from notes
export async function generateFlashcards(
  content: string
): Promise<Array<{ question: string; answer: string }>> {
  const truncated = content.slice(0, 6000);
  const res = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `Buat 8-12 flashcard dari catatan kuliah. 
PENTING: Balas HANYA dengan JSON array, tidak ada teks lain.
Format: [{"question": "...", "answer": "..."}, ...]
Pertanyaan harus spesifik dan informatif. Jawaban singkat namun lengkap.`,
      },
      { role: "user", content: `Catatan:\n\n${truncated}` },
    ],
    max_tokens: 1500,
  });

  const raw = res.choices[0].message.content || "[]";
  try {
    // Strip markdown fences if present
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}
