"use client";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Course } from "@/types";

export default function Sidebar({ courses, activeCourseId }: { courses: Course[]; activeCourseId?: string }) {
  const router = useRouter();
  const path   = usePathname();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ paddingBottom:20, borderBottom:"1px solid rgba(255,255,255,.1)", marginBottom:12 }}>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:20, fontWeight:700, color:"#fff" }}>
          Note<span style={{ color:"var(--amber)" }}>Genius</span>
        </h1>
        <p style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginTop:2 }}>AI Lecture Notes</p>
      </div>

      {/* Nav */}
      <button className={`sidebar-item ${path==="/dashboard"?"active":""}`} onClick={()=>router.push("/dashboard")}>
        <span>🏠</span> Dashboard
      </button>

      {/* Courses */}
      <div style={{ marginTop:16, marginBottom:6 }}>
        <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.3)", letterSpacing:".1em", paddingLeft:12, marginBottom:8 }}>
          MATA KULIAH
        </p>
        {courses.map(c => (
          <button key={c.id}
            className={`sidebar-item ${activeCourseId===c.id?"active":""}`}
            onClick={()=>router.push(`/courses/${c.id}`)}>
            <span style={{ fontSize:16 }}>{c.emoji}</span>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.course_name}</span>
          </button>
        ))}
      </div>

      <div style={{ flex:1 }} />

      {/* Sign out */}
      <button className="sidebar-item" onClick={signOut} style={{ marginTop:"auto" }}>
        <span>↩</span> Keluar
      </button>
    </aside>
  );
}
