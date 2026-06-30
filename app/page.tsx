import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />

      {/* ── Top Nav ────────────────────────────────── */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">
          EMB<span>EGE</span>
        </span>
        <Link href="/auth" className="btn btn-amber landing-nav-cta">
          Masuk / Daftar
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="landing-hero fade">
        {/* Left: Branding + CTA */}
        <div className="landing-hero-left">
          <span className="landing-kicker">✦ Platform Belajar Cerdas</span>
          <h1 className="landing-title">
            Catatan kuliah jadi materi belajar dalam{" "}
            <span className="landing-title-highlight">hitungan menit</span>
          </h1>
          <p className="landing-subtitle">
            Upload file PDF, DOCX, TXT, atau PPTX — dapatkan ringkasan
            berstruktur dan flashcard otomatis dari AI. Cocok untuk persiapan
            kuis, UTS, dan UAS.
          </p>

          <div className="landing-cta-group">
            <Link href="/auth" className="btn btn-navy landing-cta-primary">
              Mulai Gratis Sekarang →
            </Link>
            <p className="landing-cta-note">Gratis · Tidak perlu kartu kredit</p>
          </div>

          {/* Steps */}
          <div className="landing-steps">
            {[
              { num: "1", label: "Upload catatan kuliah" },
              { num: "2", label: "Proses dengan AI" },
              { num: "3", label: "Pelajari ringkasan & flashcard" },
            ].map((s) => (
              <div key={s.num} className="landing-step-item">
                <span className="landing-step-num">{s.num}</span>
                <span className="landing-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Features */}
        <div className="landing-hero-right">
          <div className="landing-features">
            {[
              {
                emoji: "🗂️",
                title: "Workspace Rapi",
                desc: "Kelola mata kuliah dan catatan dalam satu tempat yang terstruktur.",
              },
              {
                emoji: "🤖",
                title: "Ringkasan AI",
                desc: "Materi panjang diringkas menjadi poin-poin yang mudah dipahami.",
              },
              {
                emoji: "🃏",
                title: "Flashcard Otomatis",
                desc: "Bangun set pertanyaan-jawaban untuk latihan soal lebih efisien.",
              },
              {
                emoji: "📄",
                title: "Multi-Format",
                desc: "Dukung PDF, DOCX, TXT, dan PPTX untuk semua jenis materi.",
              },
            ].map((f) => (
              <div key={f.title} className="landing-feature-card">
                <span className="landing-feature-emoji">{f.emoji}</span>
                <div>
                  <p className="landing-feature-title">{f.title}</p>
                  <p className="landing-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────── */}
      <section className="landing-testimonials fade">
        <h2 className="landing-section-title">Dipakai oleh teman-teman</h2>

        <div className="landing-testi-grid">
          {/* Chat bubble testimoni */}
          <div className="landing-testi-card">
            <p className="landing-testi-label">💬 Ngobrol nyata</p>
            <div className="landing-chat">
              <div className="landing-chat-time">Hari ini 14:02</div>
              <div className="landing-chat-bubble landing-chat-right">
                Bro, lu nyatet materi kemaren ngga? Minta dong 😭
              </div>
              <div className="landing-chat-bubble landing-chat-left">
                Aman, gua pake{" "}
                <strong>EMBEGE</strong>. Udah di-summarize sama dibikinin
                flashcard juga. Nih link-nya tinggal lu pelajarin 🔥
              </div>
              <div className="landing-chat-bubble landing-chat-right">
                Gila mantep bener! Penyelamat UAS banget! 🚀
              </div>
            </div>
          </div>

          {/* Screenshot testimoni */}
          <div className="landing-testi-card">
            <p className="landing-testi-label">📸 Dipakai oleh Mas Bogor</p>
            <p className="landing-testi-sublabel">Rektor UNIGA 2011</p>
            <div className="landing-testi-img-wrap">
              <Image
                src="/testimonibogor.jpeg"
                alt="Testimoni WhatsApp dari Mas Bogor"
                className="landing-testi-img"
                width={800}
                height={1200}
                sizes="(max-width: 700px) 100vw, 50vw"
                quality={90}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────── */}
      <section className="landing-final-cta fade">
        <h2>Siap belajar lebih cepat?</h2>
        <p>
          Dirancang untuk mahasiswa yang ingin belajar lebih terarah setiap
          minggu.
        </p>
        <Link href="/auth" className="btn btn-navy landing-final-btn">
          Mulai Belajar Sekarang →
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="landing-footer">
        <p>© 2026 EMBEGE — Kelompok 17</p>
      </footer>
    </main>
  );
}