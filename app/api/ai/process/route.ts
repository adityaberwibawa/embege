export const maxDuration = 60;

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
    await supabaseAdmin.from("notes").update({ status: "processing" }).eq("id", noteId);

    // Download file
    const urlParts = fileUrl.split("/storage/v1/object/public/notes/");
    const filePath = decodeURIComponent(urlParts[1]);
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage.from("notes")
      .download(filePath);
    if (fileError || !fileData) throw new Error("Download failed: " + fileError?.message);
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Extract text
    const content = await extractText(buffer, fileType || "txt", fileUrl);
    if (!content || content.trim().length < 50) {
      await supabaseAdmin.from("notes").update({ status: "error" }).eq("id", noteId);
      return NextResponse.json({ error: "No content" }, { status: 422 });
    }

    // AI parallel
    const [summary, rawCards] = await Promise.all([
      summarizeNotes(content),
      generateFlashcards(content),
    ]);

    // Save
    await supabaseAdmin.from("notes").update({ content, summary, status: "done" }).eq("id", noteId);
    await supabaseAdmin.from("flashcards").delete().eq("note_id", noteId);
    if (rawCards.length > 0) {
      await supabaseAdmin.from("flashcards").insert(
        rawCards.map((c: { question: string; answer: string }) => ({
          note_id: noteId, user_id: user.id,
          question: c.question, answer: c.answer,
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await supabaseAdmin.from("notes").update({ status: "error" }).eq("id", noteId);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}