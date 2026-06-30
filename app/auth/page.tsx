"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
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
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
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
    <main className="auth-standalone-page">
      <div className="auth-standalone-glow auth-standalone-glow-1" />
      <div className="auth-standalone-glow auth-standalone-glow-2" />

      {/* Back to landing */}
      <div className="auth-standalone-topbar">
        <Link href="/" className="auth-standalone-back">
          ← Kembali ke Beranda
        </Link>
        <span className="auth-standalone-logo">
          EMB<span>EGE</span>
        </span>
      </div>

      {/* Auth Card */}
      <div className="auth-standalone-center fade">
        <div className="auth-standalone-card">
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
                <input
                  className="input auth-input"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label>EMAIL</label>
              <input
                className="input auth-input"
                type="email"
                placeholder="email@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
            <div
              className={`auth-message ${
                msg.includes("berhasil") || msg.includes("Cek email")
                  ? "success"
                  : "error"
              }`}
            >
              {msg}
            </div>
          )}

          <button
            className="btn auth-submit-btn"
            onClick={handle}
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : isLogin
              ? "Masuk ke Dashboard"
              : "Daftar Sekarang"}
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
      </div>
    </main>
  );
}
