"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Note, Flashcard, Course } from "@/types";
import Sidebar from "@/components/Sidebar";

export default function NotePage() {
  const router = useRouter();
  const { noteId } = useParams<{ noteId: string }>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [tab, setTab] = useState<"summary" | "flashcards" | "raw">("summary");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [fcIndex, setFcIndex] = useState(0);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      setUserId(data.session.user.id);
      fetchData(data.session.user.id);
    });
  }, [noteId]);

  async function fetchData(uid: string) {
    const [{ data: allCourses }, { data: n }, { data: fc }] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("notes").select("*").eq("id", noteId).single(),
      supabase.from("flashcards").select("*").eq("note_id", noteId).order("created_at"),
    ]);
    if (allCourses) setCourses(allCourses);
    if (n) setNote(n);
    if (fc) setFlashcards(fc);
  }

  function toggleFlip(id: string) {
    setFlipped(p => ({ ...p, [id]: !p[id] }));
  }

  const course = courses.find(c => c.id === note?.course_id);

  return (
    <div className="app-container app-shell-glass">
      <Sidebar courses={courses} activeCourseId={note?.course_id} />

      <main className="main-content">
        {/* Header */}
        <div className="page-header-main" style={{ marginBottom: 28 }}>
          <button onClick={() => router.push(`/courses/${note?.course_id}`)} className="back-link-btn">
            ← {course?.course_name}
          </button>
          <h2 className="page-title" style={{ marginTop: 0 }}>{note?.title}</h2>
          <p className="page-subtitle">
            {note?.file_type?.toUpperCase()} · {flashcards.length} flashcard
          </p>
        </div>

        {/* Tabs */}
        <div className="pill-tabs">
          {([["summary", "📝 Ringkasan"], ["flashcards", "🃏 Flashcard"], ["raw", "📄 Teks Asli"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setFcIndex(0); }}
              className="btn" style={{
                padding: "8px 18px", fontSize: 13, borderRadius: 7,
                background: tab === t ? "var(--yellow)" : "transparent",
                color: tab === t ? "#000" : "var(--text-muted)", border: "none",
              }}>{label}</button>
          ))}
        </div>

        {/* Summary tab */}
        {tab === "summary" && (
          <div className="card fade" style={{ maxWidth: 720 }}>
            {note?.summary ? (
              <div style={{ lineHeight: 1.85, fontSize: 15, maxWidth: "100%" }}
                dangerouslySetInnerHTML={{
                  __html: note.summary
                    .replace(/## (.+)/g, '<h3 style="font-family:Space Grotesk,sans-serif;font-size:18px;font-weight:700;margin:20px 0 10px;color:var(--yellow)">$1</h3>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- (.+)/gm, '<li style="margin-bottom:6px">$1</li>')
                    .replace(/\n/g, '<br/>')
                }} />
            ) : (
              <p style={{ color: "var(--muted)" }}>Ringkasan belum tersedia.</p>
            )}
          </div>
        )}

        {/* Flashcards tab */}
        {tab === "flashcards" && (
          <div>
            {flashcards.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Belum ada flashcard.</p>
            ) : (
              <>
                {/* Study mode - single card */}
                <div style={{ maxWidth: 560, marginBottom: 32, width: "100%" }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, fontWeight: 600 }}>
                    KARTU {fcIndex + 1} / {flashcards.length} · Klik untuk lihat jawaban
                  </p>

                  <div className="flashcard-scene" style={{ height: 350 }}
                    onClick={() => toggleFlip(flashcards[fcIndex].id)}>
                    <div className={`flashcard-card ${flipped[flashcards[fcIndex].id] ? "flipped" : ""}`} style={{ height: 350 }}>
                      {/* Front */}
                      <div className="flashcard-front card" style={{
                        height: 350, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#1A1A1A", border: "1px solid var(--border-dark)", padding: 24
                      }}>
                        <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                           <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, color: "var(--text-light)", textAlign: "center", lineHeight: 1.6, margin: "auto" }}>
                            {flashcards[fcIndex].question}
                          </p>
                        </div>
                      </div>
                      {/* Back */}
                      <div className="flashcard-back card" style={{
                        height: 350, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${course?.color || "#e8900a"}18`, padding: 24
                      }}>
                        <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <p style={{ fontSize: 15, textAlign: "center", lineHeight: 1.7, color: "var(--text)", margin: "auto" }}>
                            {flashcards[fcIndex].answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <button className="btn btn-outline" onClick={() => { setFcIndex(i => Math.max(0, i - 1)); setFlipped({}); }}
                      disabled={fcIndex === 0} style={{ flex: 1, justifyContent: "center", minWidth: 140 }}>← Sebelumnya</button>
                    <button className="btn btn-navy" onClick={() => { setFcIndex(i => Math.min(flashcards.length - 1, i + 1)); setFlipped({}); }}
                      disabled={fcIndex === flashcards.length - 1} style={{ flex: 1, justifyContent: "center", minWidth: 140 }}>Berikutnya →</button>
                  </div>
                </div>

                {/* All cards list */}
                <h4 className="section-title" style={{ fontSize: 17, marginBottom: 14 }}>Semua Flashcard</h4>
                <div className="responsive-grid" style={{ gap: 12 }}>
                  {flashcards.map((fc, i) => (
                    <div key={fc.id} className="card fade" style={{ animationDelay: `${i * .04}s`, opacity: 0, cursor: "pointer" }}
                      onClick={() => toggleFlip(fc.id)}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".06em", marginBottom: 8 }}>
                        {flipped[fc.id] ? "JAWABAN" : "PERTANYAAN"}
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.65 }}>
                        {flipped[fc.id] ? fc.answer : fc.question}
                      </p>
                       <p style={{ fontSize: 11, color: "var(--yellow)", marginTop: 10 }}>Klik untuk {flipped[fc.id] ? "lihat pertanyaan" : "lihat jawaban"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Raw text tab */}
        {tab === "raw" && (
          <div className="card fade" style={{ maxWidth: 720 }}>
            {note?.content ? (
              <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text-gray)", fontFamily: "IBM Plex Mono, monospace" }}>
                {note.content}
              </pre>
            ) : (
              <p style={{ color: "var(--muted)" }}>Teks belum diekstrak.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
