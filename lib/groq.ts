import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-4-scout";

export async function summarizeNotes(content: string): Promise<string> {
  try {
    const truncated = content.slice(0, 3000);
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten akademik. Buat ringkasan terstruktur dalam Bahasa Indonesia.
Format:
## 📌 Ringkasan Utama
[3-5 kalimat]

## 🔑 Poin-Poin Kunci
- [poin 1]
- [poin 2]

## 💡 Konsep Penting
[3-5 konsep]

## 📝 Kesimpulan
[1 paragraf]`,
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
      max_tokens: 1000,
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