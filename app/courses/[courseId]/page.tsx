"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Course, Note } from "@/types";
import Sidebar from "@/components/Sidebar";

const ACCEPTED = ".pdf,.docx,.txt,.pptx";

export default function CoursePage() {
  const router   = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [courses, setCourses]   = useState<Course[]>([]);
  const [course, setCourse]     = useState<Course | null>(null);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [processing, setProcessing] = useState<string[]>([]);
  const [userId, setUserId]     = useState("");

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if (!data.session) { router.push("/auth"); return; }
      setUserId(data.session.user.id);
      fetchData(data.session.user.id);
    });
  },[courseId]);

  async function fetchData(uid: string) {
    const [{data:allCourses},{data:c},{data:n}] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
      supabase.from("courses").select("*").eq("id",courseId).single(),
      supabase.from("notes").select("*").eq("course_id",courseId).order("created_at",{ascending:false}),
    ]);
    if (allCourses) setCourses(allCourses);
    if (c) setCourse(c);
    if (n) setNotes(n);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg("Mengunggah file...");

    const ext  = file.name.split(".").pop()?.toLowerCase() || "txt";
    const path = `${userId}/${courseId}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { error: storageErr } = await supabase.storage.from("notes").upload(path, file);
    if (storageErr) { setUploadMsg("Gagal upload: " + storageErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("notes").getPublicUrl(path);

    // Create note record
    const { data: note, error: noteErr } = await supabase.from("notes").insert({
      course_id: courseId,
      user_id:   userId,
      title:     file.name.replace(/\.[^.]+$/, ""),
      file_url:  urlData.publicUrl,
      file_name: file.name,
      file_type: ext,
      status:    "pending",
    }).select().single();

    if (noteErr || !note) { setUploadMsg("Gagal menyimpan catatan."); setUploading(false); return; }

    setUploadMsg("File berhasil diunggah! ✅");
    await fetchData(userId);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(()=>setUploadMsg(""), 3000);
  }

  async function processNote(note: Note) {
    setProcessing(p=>[...p, note.id]);

    // Update status to processing
    await supabase.from("notes").update({ status:"processing" }).eq("id", note.id);
    await fetchData(userId);

    // Get session token for API call
    const {data:{session}} = await supabase.auth.getSession();

    const res = await fetch("/api/ai/process", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization":`Bearer ${session!.access_token}`,
      },
      body: JSON.stringify({ noteId: note.id, fileUrl: note.file_url, fileType: note.file_type }),
    });

    if (!res.ok) {
      await supabase.from("notes").update({ status:"error" }).eq("id", note.id);
    }

    setProcessing(p=>p.filter(i=>i!==note.id));
    await fetchData(userId);
  }

  async function deleteNote(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await supabase.from("notes").delete().eq("id", id);
    await fetchData(userId);
  }

  const statusBadge = (s: string) => {
    const map: Record<string,string> = { done:"✅ Selesai", processing:"⏳ Memproses...", pending:"📥 Belum diproses", error:"❌ Error" };
    return <span className={`badge badge-${s}`}>{map[s]||s}</span>;
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar courses={courses} activeCourseId={courseId} />

      <main style={{ flex:1, padding:"32px 36px", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <button onClick={()=>router.push("/dashboard")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:13, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
              ← Dashboard
            </button>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:26, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:28 }}>{course?.emoji}</span>
              {course?.course_name}
            </h2>
            <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>{notes.length} catatan diunggah</p>
          </div>
          <label style={{ cursor:"pointer" }}>
            <input ref={fileRef} type="file" accept={ACCEPTED} onChange={handleUpload} style={{ display:"none" }} />
            <span className="btn btn-navy" style={{ pointerEvents:"none" }}>
              {uploading ? "⏳ Mengunggah..." : "⬆️ Upload Catatan"}
            </span>
          </label>
        </div>

        {uploadMsg && (
          <div style={{ padding:"10px 16px", borderRadius:8, marginBottom:20, fontSize:13,
            background:"rgba(74,124,89,.1)", color:"var(--sage)", border:"1px solid rgba(74,124,89,.2)" }}>
            {uploadMsg}
          </div>
        )}

        <p style={{ fontSize:11, color:"var(--muted)", marginBottom:16, letterSpacing:".06em", fontWeight:600 }}>
          SUPPORT FORMAT: PDF · DOCX · TXT · PPTX
        </p>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
            <p style={{ fontSize:48, marginBottom:12 }}>📄</p>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Belum ada catatan</p>
            <p style={{ fontSize:14 }}>Upload file catatan kuliah untuk memulai</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {notes.map((note, i) => (
              <div key={note.id} className="card fade" style={{
                animationDelay:`${i*.05}s`, opacity:0,
                display:"flex", alignItems:"center", gap:16,
              }}>
                {/* Icon */}
                <div style={{
                  width:44, height:44, borderRadius:10, flexShrink:0,
                  background:`${course?.color}18`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                }}>
                  {note.file_type==="pdf"?"📕" : note.file_type==="docx"?"📘" : note.file_type==="pptx"?"📊":"📝"}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{note.title}</p>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    {statusBadge(note.status)}
                    <span style={{ fontSize:11, color:"var(--muted)" }}>{note.file_type?.toUpperCase()} · {note.file_name}</span>
                  </div>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  {(note.status === "pending" || note.status === "error") && (
                    <button className="btn btn-amber" onClick={()=>processNote(note)}
                      disabled={processing.includes(note.id)}
                      style={{ padding:"8px 14px", fontSize:12 }}>
                      {processing.includes(note.id) ? "⏳ Proses..." : "✨ Proses AI"}
                    </button>
                  )}
                  {note.status === "done" && (
                    <button className="btn btn-outline" onClick={()=>router.push(`/notes/${note.id}`)}
                      style={{ padding:"8px 14px", fontSize:12 }}>
                      📖 Lihat →
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={()=>deleteNote(note.id)}
                    style={{ padding:"8px 12px", fontSize:12 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
