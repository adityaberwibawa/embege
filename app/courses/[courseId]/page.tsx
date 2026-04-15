"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Course, Note } from "@/types";
import Sidebar from "@/components/Sidebar";

const ACCEPTED = ".pdf,.docx,.txt,.pptx";

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [processing, setProcessing] = useState<string[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      setUserId(data.session.user.id);
      fetchData(data.session.user.id);
    });
  }, [courseId]);

  async function fetchData(uid: string) {
    const [{ data: allCourses }, { data: c }, { data: n }] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("courses").select("*").eq("id", courseId).single(),
      supabase.from("notes").select("*").eq("course_id", courseId).order("created_at", { ascending: false }),
    ]);
    if (allCourses) setCourses(allCourses);
    if (c) setCourse(c);
    if (n) setNotes(n);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg("Mengunggah file...");

    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
    const path = `${userId}/${courseId}/${Date.now()}_${file.name}`;

    const { error: storageErr } = await supabase.storage.from("notes").upload(path, file);
    if (storageErr) { setUploadMsg("Gagal upload: " + storageErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("notes").getPublicUrl(path);

    const { data: note, error: noteErr } = await supabase.from("notes").insert({
      course_id: courseId,
      user_id: userId,
      title: file.name.replace(/\.[^.]+$/, ""),
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: ext,
      status: "pending",
    }).select().single();

    if (noteErr || !note) { setUploadMsg("Gagal menyimpan catatan."); setUploading(false); return; }

    setUploadMsg("File berhasil diunggah! ✅");
    await fetchData(userId);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setUploadMsg(""), 3000);
  }

  async function processNote(note: Note) {
    setProcessing(p => [...p, note.id]);

    const { data: { session } } = await supabase.auth.getSession();

    fetch("/api/ai/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session!.access_token}`,
      },
      body: JSON.stringify({ noteId: note.id, fileUrl: note.file_url, fileType: note.file_type }),
    });

    const poll = setInterval(async () => {
      const { data } = await supabase.from("notes").select("status").eq("id", note.id).single();
      if (data && (data.status === "done" || data.status === "error")) {
        clearInterval(poll);
        setProcessing(p => p.filter(i => i !== note.id));
        await fetchData(userId);
      }
    }, 2000);
  }

  async function deleteNote(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await supabase.from("notes").delete().eq("id", id);
    await fetchData(userId);
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { done: "✅ Selesai", processing: "⏳ Memproses...", pending: "📥 Belum diproses", error: "❌ Error" };
    return <span className={`badge badge-${s}`}>{map[s] || s}</span>;
  };

  return (
    <div className="app-container">
      <Sidebar courses={courses} activeCourseId={courseId} />

      <main className="main-content">
        <div className="page-header">
          <div className="page-header-main">
            <button onClick={() => router.push("/dashboard")} className="back-link-btn">
              ← Dashboard
            </button>
            <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 28 }}>{course?.emoji}</span>
              {course?.course_name}
            </h2>
            <p className="page-subtitle">{notes.length} catatan diunggah</p>
          </div>
          <div className="page-header-actions">
            <label style={{ cursor: "pointer", width: "100%", maxWidth: 280 }}>
              <input ref={fileRef} type="file" accept={ACCEPTED} onChange={handleUpload} style={{ display: "none" }} />
              <span className="btn btn-navy" style={{ pointerEvents: "none", width: "100%", justifyContent: "center" }}>
                {uploading ? "⏳ Mengunggah..." : "⬆️ Upload Catatan"}
              </span>
            </label>
          </div>
        </div>

        {uploadMsg && (
          <div className="panel-alert success">
            {uploadMsg}
          </div>
        )}

        {/* ✅ OPSI C — Peringatan format file */}
        <div className="panel-alert warn">
          <p>
            📋 FORMAT YANG DIDUKUNG: PDF · DOCX · TXT · PPTX
          </p>
          <p>
            ⚠️ PDF harus bisa di-select teksnya (bukan hasil scan/foto). Untuk hasil terbaik gunakan <strong>TXT</strong> atau <strong>DOCX</strong>.
            PDF scan? Convert dulu via{" "} <a href="https://smallpdf.com/pdf-ocr" target="_blank" style={{ color: "var(--amber)" }}>smallpdf.com</a> → OCR online gratis
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 48, marginBottom: 12 }}>📄</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Belum ada catatan</p>
            <p style={{ fontSize: 14 }}>Upload file catatan kuliah untuk memulai</p>
          </div>
        ) : (
          <div className="stack-list">
            {notes.map((note, i) => (
              <div key={note.id} className="card fade" style={{
                animationDelay: `${i * .05}s`, opacity: 0,
                }}>
                <div className="note-row">
                <div className="file-avatar" style={{ background: `${course?.color}18` }}>
                  {note.file_type === "pdf" ? "📕" : note.file_type === "docx" ? "📘" : note.file_type === "pptx" ? "📊" : "📝"}
                </div>

                <div className="note-meta">
                  <p className="note-title">{note.title}</p>
                  <div className="note-subline">
                    {statusBadge(note.status)}
                    <span className="note-file-info">{note.file_type?.toUpperCase()} · {note.file_name}</span>
                  </div>
                  {/* ✅ OPSI B — Pesan error spesifik */}
                  {note.status === "error" && (
                    <p style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>
                      ⚠️ Gagal diproses. PDF mungkin hasil scan atau terproteksi. Coba convert ke DOCX/TXT dulu.
                    </p>
                  )}
                </div>

                <div className="note-actions">
                  {(note.status === "pending" || note.status === "error") && (
                    <button className="btn btn-amber" onClick={() => processNote(note)}
                      disabled={processing.includes(note.id)}
                      style={{ padding: "8px 14px", fontSize: 12 }}>
                      {processing.includes(note.id) ? "⏳ Proses..." : "✨ Proses AI"}
                    </button>
                  )}
                  {note.status === "done" && (
                    <button className="btn btn-outline" onClick={() => router.push(`/notes/${note.id}`)}
                      style={{ padding: "8px 14px", fontSize: 12 }}>
                      📖 Lihat →
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={() => deleteNote(note.id)}
                    style={{ padding: "8px 12px", fontSize: 12 }}>✕</button>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}