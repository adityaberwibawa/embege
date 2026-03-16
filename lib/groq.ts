import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model Groq yang sangat cepat dan handal
const MODEL_NAME = "llama-3.3-70b-versatile";

// Summarize lecture notes
export async function summarizeNotes(content: string): Promise<string> {
  try {
    // Llama 3 memiliki konteks yang jauh lebih besar (128k tokens), kita tingkatkan limitnya
    const truncated = content.slice(0, 30000); 
    const res = await groq.chat.completions.create({
      model: MODEL_NAME,
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
      temperature: 0.5,
      max_tokens: 1500,
    });
    return res.choices[0].message.content || "";
  } catch (error) {
    console.error("Gagal meringkas catatan:", error);
    return "Maaf, terjadi kesalahan saat mencoba meringkas catatan kuliah.";
  }
}

// Generate flashcards from notes
export async function generateFlashcards(
  content: string
): Promise<Array<{ question: string; answer: string }>> {
  try {
    const truncated = content.slice(0, 30000);
    const res = await groq.chat.completions.create({
      model: MODEL_NAME,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `Buat 8-12 flashcard dari catatan kuliah. 
PENTING: Keluarkan HANYA output dalam format JSON object. 
Format yang harus digunakan: {"flashcards": [{"question": "...", "answer": "..."}, ...]}
Pertanyaan harus spesifik dan informatif. Jawaban singkat namun lengkap.`,
        },
        { role: "user", content: `Catatan:\n\n${truncated}` },
      ],
      max_tokens: 1500,
    });

    const raw = res.choices[0].message.content || '{"flashcards": []}';
    const parsed = JSON.parse(raw);
    return parsed.flashcards || [];
  } catch (error) {
    console.error("Gagal membuat flashcards:", error);
    return [];
  }
}
