"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handle() {
    if (!email || !password) return;
    setLoading(true); setMsg("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        setMsg("Cek email untuk konfirmasi akun! 📩");
      }
    } catch (e: any) { setMsg(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main style={{
      minHeight:"100vh", background:"var(--bg)",
      display:"flex", alignItems:"stretch",
    }}>
      {/* Left panel - decorative */}
      <div style={{
        flex:1, background:"var(--navy)", padding:"60px 48px",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        position:"relative", overflow:"hidden",
      }} className="hidden md:flex">
        <div style={{
          position:"absolute", bottom:-120, right:-120,
          width:400, height:400, borderRadius:"50%",
          background:"rgba(232,144,10,.12)", pointerEvents:"none",
        }} />
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:32, fontWeight:700, color:"#fff", marginBottom:8 }}>
            EMB<span style={{ color:"var(--amber)" }}>EGE</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.5)", fontSize:14 }}>AI Lecture Notes Organizer</p>
        </div>
        <div>
          {[
            { emoji:"🗂️", text:"Kelola catatan per mata kuliah" },
            { emoji:"🤖", text:"Ringkasan otomatis dengan AI" },
            { emoji:"🃏", text:"Flashcard untuk belajar lebih efektif" },
            { emoji:"📄", text:"Support PDF, DOCX, TXT, PPTX" },
          ].map(f => (
            <div key={f.text} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:18 }}>
              <span style={{ fontSize:22 }}>{f.emoji}</span>
              <p style={{ color:"rgba(255,255,255,.75)", fontSize:15 }}>{f.text}</p>
            </div>
          ))}
        </div>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:12 }}>© 2025 EMBEGE</p>
      </div>

      {/* Right panel - form */}
      <div style={{
        width:"100%", maxWidth:480,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 32px",
      }}>
        <div className="fade" style={{ width:"100%" }}>
          <div style={{ marginBottom:36 }}>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:700, marginBottom:6 }}>
              {isLogin ? "Selamat datang kembali" : "Mulai belajar lebih cerdas"}
            </h2>
            <p style={{ color:"var(--muted)", fontSize:14 }}>
              {isLogin ? "Masuk ke akun EMBEGE kamu" : "Buat akun gratis sekarang"}
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>NAMA LENGKAP</label>
                <input className="input" placeholder="Nama kamu" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>EMAIL</label>
              <input className="input" type="email" placeholder="email@kampus.ac.id" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>PASSWORD</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} />
            </div>
          </div>

          {msg && (
            <div style={{
              padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16,
              background: msg.includes("Cek") ? "rgba(74,124,89,.1)" : "rgba(192,57,43,.08)",
              color: msg.includes("Cek") ? "var(--sage)" : "var(--red)",
              border:`1px solid ${msg.includes("Cek") ? "rgba(74,124,89,.2)" : "rgba(192,57,43,.2)"}`,
            }}>{msg}</div>
          )}

          <button className="btn btn-navy" onClick={handle} disabled={loading}
            style={{ width:"100%", justifyContent:"center", padding:"14px", fontSize:15, marginBottom:20 }}>
            {loading ? "Loading..." : isLogin ? "Masuk →" : "Daftar Gratis →"}
          </button>

          <p style={{ textAlign:"center", fontSize:13, color:"var(--muted)" }}>
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button onClick={()=>{setIsLogin(!isLogin);setMsg("");}}
              style={{ color:"var(--amber)", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>
              {isLogin ? "Daftar gratis" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
