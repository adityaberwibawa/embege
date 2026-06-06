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
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  async function handle() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setMsg("Email dan password wajib diisi.");
      return;
    }
    if (!isLogin && !cleanName) {
      setMsg("Nama lengkap wajib diisi untuk pendaftaran.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { data: { full_name: cleanName } },
        });
        if (error) throw error;
        setMsg("Pendaftaran berhasil. Cek email untuk konfirmasi akun.");
      }
    } catch (e: any) {
      setMsg(e.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className={`auth-shell ${showForm ? "show-form" : ""}`}>
        <section className="auth-hero fade">
          <div className="auth-glow" />
          <div className="auth-branding">
            <h1 className="auth-logo">
              EMB<span>EGE</span>
            </h1>
            <p className="auth-tagline">
              Platform pembelajaran cerdas untuk mengubah catatan kuliah mentah menjadi materi belajar terstruktur dalam hitungan menit.
            </p>
          </div>

          <div className="auth-feature-list">
            {[
              { emoji: "🗂️", text: "Kelola mata kuliah dan catatan dalam workspace yang rapi serta mudah ditelusuri." },
              { emoji: "🤖", text: "Dapatkan ringkasan AI terstruktur agar materi panjang lebih cepat dipahami." },
              { emoji: "🃏", text: "Bangun flashcard otomatis untuk persiapan kuis, UTS, dan UAS lebih efisien." },
              { emoji: "📄", text: "Dukung file PDF, DOCX, TXT, dan PPTX untuk berbagai jenis materi kuliah." },
            ].map((feature) => (
              <div key={feature.text} className="auth-feature-item">
                <span>{feature.emoji}</span>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="auth-feature-list">
            {[
              "1. Upload catatan kuliah",
              "2. Proses dengan AI",
              "3. Pelajari ringkasan dan flashcard",
            ].map((step) => (
              <div key={step} className="auth-feature-item">
                <span>✅</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <div className="auth-hero-footer" style={{ marginBottom: "16px" }}>
            <p>Dirancang untuk mahasiswa yang ingin belajar lebih cepat dan lebih terarah setiap minggu.</p>
            <button className="btn btn-amber auth-hero-cta" onClick={() => setShowForm(true)}>
              Mulai Belajar
            </button>
          </div>

          <div className="auth-chat-testimonial" style={{
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "16px",
            position: "relative",
            zIndex: 1,
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>
              Hari ini 14:02
            </div>

            <div style={{ alignSelf: "flex-end", background: "var(--yellow)", color: "#000", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", fontSize: "13px", maxWidth: "85%", boxShadow: "0 2px 8px rgba(255,214,0,0.15)", fontWeight: 600 }}>
              Bro, lu nyatet materi kemaren ngga? Minta dong 😭
            </div>

            <div style={{ alignSelf: "flex-start", background: "#1A1A1A", color: "var(--text-light)", padding: "10px 14px", borderRadius: "14px 14px 14px 2px", fontSize: "13px", maxWidth: "85%", border: "1px solid var(--border-dark)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              Aman, gua pake <strong>EMBEGE</strong>. Udah di-summarize sama dibikinin flashcard juga. Nih link-nya tinggal lu pelajarin 🔥
            </div>

            <div style={{ alignSelf: "flex-end", background: "var(--yellow)", color: "#000", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", fontSize: "13px", maxWidth: "85%", boxShadow: "0 2px 8px rgba(255,214,0,0.15)", fontWeight: 600 }}>
              Gila mantep bener! Penyelamat UAS banget! 🚀
            </div>
          </div>

          <div className="auth-chat-screenshot-frame" style={{
            marginTop: "12px",
            marginBottom: "16px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "16px",
            position: "relative",
            zIndex: 1,
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <h2 style={{ fontSize: "20px", textAlign: "center", position: "relative", zIndex: 1 }}>Dipakai oleh Mas Bogor dan Teman</h2>
            <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-dark)", background: "#0a0a0a" }}>
              <img src="/testimonibogor.jpeg" alt="Testimoni WhatsApp" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>© 2026 EMBEGE Kelompok 17</p>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card fade">
            <button className="auth-back-btn" onClick={() => setShowForm(false)}>
              ← Kembali ke Info
            </button>

            <div className="auth-heading">
              <h2>{isLogin ? "Selamat datang kembali" : "Buat akun baru"}</h2>
              <p>
                {isLogin
                  ? "Masuk untuk melanjutkan belajar dan mengelola catatanmu."
                  : "Daftar gratis untuk mulai membuat ringkasan dan flashcard otomatis."}
              </p>
            </div>

            <div className="auth-form-fields">
              {!isLogin && (
                <div>
                  <label>NAMA LENGKAP</label>
                  <input className="input auth-input" placeholder="Nama kamu" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div>
                <label>EMAIL</label>
                <input className="input auth-input" type="email" placeholder="email@kampus.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label>PASSWORD</label>
                <input
                  className="input auth-input"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handle()}
                />
              </div>
            </div>

            {msg && (
              <div className={`auth-message ${msg.includes("berhasil") || msg.includes("Cek email") ? "success" : "error"}`}>{msg}</div>
            )}

            <button className="btn auth-submit-btn" onClick={handle} disabled={loading}>
              {loading ? "Memproses..." : isLogin ? "Masuk ke Dashboard" : "Daftar Sekarang"}
            </button>

            <p className="auth-switch-copy">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMsg("");
                }}
              >
                {isLogin ? "Daftar gratis" : "Masuk"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
