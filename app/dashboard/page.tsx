"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Course } from "@/types";
import Sidebar from "@/components/Sidebar";

const COLORS  = ["#1a2744","#e8900a","#4a7c59","#7c3aed","#be185d","#0369a1"];
const EMOJIS  = ["📚","🧪","📐","💻","🗺️","🎨","🔬","📊","⚗️","🏛️","🎵","📖"];

export default function Dashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ course_name:"", color: COLORS[0], emoji: EMOJIS[0] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if (!data.session) { router.push("/auth"); return; }
      fetchData(data.session.user.id);
    });
  },[]);

  async function fetchData(uid: string) {
    setLoading(true);
    const [{data:prof},{data:crs}] = await Promise.all([
      supabase.from("profiles").select("*").eq("id",uid).single(),
      supabase.from("courses").select("*, notes(id, status)").eq("user_id",uid).order("created_at",{ascending:false}),
    ]);
    if (prof) setProfile(prof);
    if (crs)  setCourses(crs);
    setLoading(false);
  }

  async function addCourse() {
    if (!form.course_name.trim()) return;
    setSaving(true);
    const {data:{user}} = await supabase.auth.getUser();
    await supabase.from("courses").insert({ user_id:user!.id, ...form });
    setShowAdd(false);
    setForm({ course_name:"", color:COLORS[0], emoji:EMOJIS[0] });
    await fetchData(user!.id);
    setSaving(false);
  }

  async function deleteCourse(id: string) {
    if (!confirm("Hapus mata kuliah ini beserta semua catatan?")) return;
    await supabase.from("courses").delete().eq("id",id);
    const {data:{user}} = await supabase.auth.getUser();
    await fetchData(user!.id);
  }

  const totalNotes = courses.reduce((s,c)=> s + ((c.notes as any[])?.length||0), 0);
  const doneNotes  = courses.reduce((s,c)=> s + ((c.notes as any[])?.filter((n:any)=>n.status==="done").length||0), 0);

  return (
    <div className="app-container app-shell-glass">
      <Sidebar courses={courses} />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-main">
            <p className="page-kicker">DASHBOARD</p>
            <h2 className="page-title">
              Halo, <span style={{ color:"var(--yellow)" }}>{profile?.full_name || "Mahasiswa"}</span> 👋
            </h2>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-navy" onClick={()=>setShowAdd(true)} style={{ justifyContent:"center" }}>+ Tambah Mata Kuliah</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label:"Mata Kuliah", value: courses.length, icon:"🗂️" },
            { label:"Total Catatan", value: totalNotes, icon:"📄" },
            { label:"Sudah Diproses AI", value: doneNotes, icon:"✨" },
          ].map(s => (
            <div key={s.label} className="card fade stats-card">
              <span className="stats-icon">{s.icon}</span>
              <div>
                <p className="stats-value">{s.value}</p>
                <p className="stats-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses grid */}
        <h3 className="section-title">Mata Kuliahmu</h3>

        {loading ? (
          <div className="responsive-grid">
            {[1,2,3].map(i=><div key={i} className="shimmer" style={{ height:130 }} />)}
          </div>
        ) : courses.length===0 ? (
          <div className="empty-state">
            <p style={{ fontSize:48, marginBottom:12 }}>📚</p>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Belum ada mata kuliah</p>
            <p style={{ fontSize:14 }}>Tambahkan mata kuliah pertamamu!</p>
          </div>
        ) : (
          <div className="responsive-grid">
            {courses.map((c,i) => {
              const notes = (c.notes as any[]) || [];
              const done  = notes.filter(n=>n.status==="done").length;
              return (
                <div key={c.id} className="card fade course-card" style={{
                  animationDelay:`${i*.06}s`, opacity:0, cursor:"pointer",
                  borderTop:`4px solid ${c.color}`, position:"relative",
                }} onClick={()=>router.push(`/courses/${c.id}`)}>
                  <button onClick={e=>{e.stopPropagation();deleteCourse(c.id);}}
                    className="course-delete-btn">✕</button>
                  <div style={{ fontSize:32, marginBottom:10 }}>{c.emoji}</div>
                  <h4 style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:17, fontWeight:700, marginBottom:6, color:"var(--text-light)" }}>{c.course_name}</h4>
                  <p style={{ fontSize:13, color:"var(--muted)" }}>{notes.length} catatan · {done} diproses AI</p>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width:`${notes.length?done/notes.length*100:0}%`, background:c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add course modal */}
      {showAdd && (
        <div className="modal-overlay"
          onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div className="card fade modal-card">
            <h3 style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:20, fontWeight:700, marginBottom:20, color:"var(--text-light)" }}>Tambah Mata Kuliah</h3>

            <label className="form-label">NAMA MATA KULIAH</label>
            <input className="input" placeholder="Contoh: Algoritma dan Struktur Data" value={form.course_name}
              onChange={e=>setForm(p=>({...p,course_name:e.target.value}))} style={{ marginBottom:16 }} />

            <label className="form-label">EMOJI</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setForm(p=>({...p,emoji:e}))} className="emoji-option" style={{
                  background:form.emoji===e?"#1A1A1A":"transparent",
                  border:`2px solid ${form.emoji===e?"var(--yellow)":"var(--border-dark)"}`,
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                }}>{e}</button>
              ))}
            </div>

            <label className="form-label">WARNA</label>
            <div style={{ display:"flex", gap:10, marginBottom:22 }}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setForm(p=>({...p,color:c}))} className="color-option" style={{
                  background:c, outline:form.color===c?"3px solid var(--text)":"none", outlineOffset:2,
                }} />
              ))}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1, justifyContent:"center" }}>Batal</button>
              <button className="btn btn-navy" onClick={addCourse} disabled={saving} style={{ flex:2, justifyContent:"center" }}>
                {saving?"Menyimpan...":"Tambah →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
