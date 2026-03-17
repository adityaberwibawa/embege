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
    <div className="app-container">
      <Sidebar courses={courses} />

      <main className="main-content">
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div>
            <p style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:".08em" }}>DASHBOARD</p>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:700, marginTop:4 }}>
              Halo, <span style={{ color:"var(--amber)" }}>{profile?.full_name || "Mahasiswa"}</span> 👋
            </h2>
          </div>
          <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Tambah Mata Kuliah</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label:"Mata Kuliah", value: courses.length, icon:"🗂️" },
            { label:"Total Catatan", value: totalNotes, icon:"📄" },
            { label:"Sudah Diproses AI", value: doneNotes, icon:"✨" },
          ].map(s => (
            <div key={s.label} className="card fade" style={{ display:"flex", gap:16, alignItems:"center" }}>
              <span style={{ fontSize:30 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize:28, fontWeight:700, fontFamily:"var(--serif)" }}>{s.value}</p>
                <p style={{ fontSize:13, color:"var(--muted)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses grid */}
        <h3 style={{ fontFamily:"var(--serif)", fontSize:19, fontWeight:600, marginBottom:16 }}>Mata Kuliahmu</h3>

        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {[1,2,3].map(i=><div key={i} className="shimmer" style={{ height:130 }} />)}
          </div>
        ) : courses.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
            <p style={{ fontSize:48, marginBottom:12 }}>📚</p>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Belum ada mata kuliah</p>
            <p style={{ fontSize:14 }}>Tambahkan mata kuliah pertamamu!</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {courses.map((c,i) => {
              const notes = (c.notes as any[]) || [];
              const done  = notes.filter(n=>n.status==="done").length;
              return (
                <div key={c.id} className="card fade" style={{
                  animationDelay:`${i*.06}s`, opacity:0, cursor:"pointer",
                  borderTop:`4px solid ${c.color}`, position:"relative",
                }} onClick={()=>router.push(`/courses/${c.id}`)}>
                  <button onClick={e=>{e.stopPropagation();deleteCourse(c.id);}}
                    style={{ position:"absolute", top:12, right:12, background:"none", border:"none",
                      cursor:"pointer", fontSize:14, color:"var(--muted)", opacity:.5 }}>✕</button>
                  <div style={{ fontSize:32, marginBottom:10 }}>{c.emoji}</div>
                  <h4 style={{ fontFamily:"var(--serif)", fontSize:17, fontWeight:600, marginBottom:6 }}>{c.course_name}</h4>
                  <p style={{ fontSize:13, color:"var(--muted)" }}>{notes.length} catatan · {done} diproses AI</p>
                  <div style={{ height:3, background:"var(--surface2)", borderRadius:2, marginTop:12, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${notes.length?done/notes.length*100:0}%`, background:c.color, borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add course modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", backdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div className="card fade" style={{ width:"100%", maxWidth:420 }}>
            <h3 style={{ fontFamily:"var(--serif)", fontSize:20, fontWeight:700, marginBottom:20 }}>Tambah Mata Kuliah</h3>

            <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>NAMA MATA KULIAH</label>
            <input className="input" placeholder="Contoh: Algoritma dan Struktur Data" value={form.course_name}
              onChange={e=>setForm(p=>({...p,course_name:e.target.value}))} style={{ marginBottom:16 }} />

            <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:8 }}>EMOJI</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setForm(p=>({...p,emoji:e}))} style={{
                  fontSize:20, background:form.emoji===e?"var(--surface2)":"transparent",
                  border:`2px solid ${form.emoji===e?"var(--navy)":"var(--border)"}`,
                  borderRadius:8, width:38, height:38, cursor:"pointer",
                }}>{e}</button>
              ))}
            </div>

            <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:8 }}>WARNA</label>
            <div style={{ display:"flex", gap:10, marginBottom:22 }}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{
                  width:28, height:28, borderRadius:"50%", background:c, border:"none",
                  cursor:"pointer", outline:form.color===c?"3px solid var(--text)":"none", outlineOffset:2,
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
