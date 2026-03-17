export const maxDuration = 120; // seconds

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getUserFromRequest } from "@/lib/supabase-server";
import { summarizeNotes, generateFlashcards } from "@/lib/groq";
import { extractText } from "@/lib/extract";

// Proses AI berat yang berjalan di background (tidak blocking response)
async function processInBackground(noteId: string, userId: string, fileUrl: string, fileType: string) {
  const start = Date.now();
  try {
    // 1. Download file from Supabase Storage
    console.log(`[AI] Downloading file...`);
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Failed to download file");
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    console.log(`[AI] Download selesai (${Date.now() - start}ms)`);

    // 2. Extract text
    const content = await extractText(buffer, fileType || "txt");
    console.log(`[AI] Ekstraksi selesai (${Date.now() - start}ms), panjang teks: ${content.length} chars`);

    if (!content || content.trim().length < 50) {
      await supabaseAdmin.from("notes").update({ status: "error", content: "Teks tidak dapat diekstrak." }).eq("id", noteId);
      return;
    }

    // 3. AI: Summarize + Generate flashcards PARALEL
    console.log(`[AI] Memulai AI processing...`);
    const [summary, rawCards] = await Promise.all([
      summarizeNotes(content),
      generateFlashcards(content),
    ]);
    console.log(`[AI] AI selesai (${Date.now() - start}ms), flashcards: ${rawCards.length}`);

    // 4. Update note
    await supabaseAdmin.from("notes").update({
      content,
      summary,
      status: "done",
    }).eq("id", noteId);

    // 5. Insert flashcards (delete old ones first)
    await supabaseAdmin.from("flashcards").delete().eq("note_id", noteId);

    if (rawCards.length > 0) {
      await supabaseAdmin.from("flashcards").insert(
        rawCards.map((c: { question: string; answer: string }) => ({
          note_id: noteId,
          user_id: userId,
          question: c.question,
          answer: c.answer,
        }))
      );
    }

    console.log(`[AI] Proses selesai total: ${Date.now() - start}ms ✅`);
  } catch (err: unknown) {
    console.error("AI Process error:", err);
    await supabaseAdmin.from("notes").update({ status: "error" }).eq("id", noteId);
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId, fileUrl, fileType } = await req.json();
  if (!noteId || !fileUrl) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  // Set status ke "processing" lalu LANGSUNG response ke frontend
  await supabaseAdmin.from("notes").update({ status: "processing" }).eq("id", noteId);

  // Fire-and-forget: jalankan di background, tidak blocking response
  processInBackground(noteId, user.id, fileUrl, fileType);

  // Frontend langsung dapat response cepat — tidak perlu menunggu AI selesai
  return NextResponse.json({ ok: true, message: "Processing started" });
}
