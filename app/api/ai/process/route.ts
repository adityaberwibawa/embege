import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getUserFromRequest } from "@/lib/supabase-server";
import { summarizeNotes, generateFlashcards } from "@/lib/groq";
import { extractText } from "@/lib/extract";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId, fileUrl, fileType } = await req.json();
  if (!noteId || !fileUrl) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    // 1. Download file from Supabase Storage
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Failed to download file");
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // 2. Extract text
    const content = await extractText(buffer, fileType || "txt");
    if (!content || content.trim().length < 50) {
      await supabaseAdmin.from("notes").update({ status: "error", content: "Teks tidak dapat diekstrak." }).eq("id", noteId);
      return NextResponse.json({ error: "No content extracted" }, { status: 422 });
    }

    // 3. AI: Summarize
    const summary = await summarizeNotes(content);

    // 4. AI: Generate flashcards
    const rawCards = await generateFlashcards(content);

    // 5. Update note
    await supabaseAdmin.from("notes").update({
      content,
      summary,
      status: "done",
    }).eq("id", noteId);

    // 6. Insert flashcards (delete old ones first)
    await supabaseAdmin.from("flashcards").delete().eq("note_id", noteId);

    if (rawCards.length > 0) {
      await supabaseAdmin.from("flashcards").insert(
        rawCards.map((c: any) => ({
          note_id:  noteId,
          user_id:  user.id,
          question: c.question,
          answer:   c.answer,
        }))
      );
    }

    return NextResponse.json({ ok: true, flashcards: rawCards.length });

  } catch (err: any) {
    console.error("AI Process error:", err);
    await supabaseAdmin.from("notes").update({ status: "error" }).eq("id", noteId);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
