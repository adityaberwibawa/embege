"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Course } from "@/types";

export default function Sidebar({ courses, activeCourseId }: { courses: Course[]; activeCourseId?: string }) {
  const router = useRouter();
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <aside className="sidebar">
      {/* Header & Logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(64,138,113,.3)", marginBottom: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            EMB<span style={{ color: "#B0E4CC" }}>EGE</span>
          </h1>
          <p style={{ fontSize: 11, color: "rgba(176,228,204,.4)", marginTop: 2 }}>AI Lecture Notes</p>
        </div>
        {/* Toggle Button for Mobile Only */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ background: "none", border: "none", color: "var(--sage)", fontSize: 24, cursor: "pointer", display: "flex" }}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>

      {/* Nav contents */}
      <div className={`sidebar-content ${isOpen ? "" : "sidebar-collapsed"}`}>
      {/* Nav */}
      <button className={`sidebar-item ${path === "/dashboard" ? "active" : ""}`} onClick={() => router.push("/dashboard")}>
        <span>🏠</span> Dashboard
      </button>

      {/* Courses */}
      <div style={{ marginTop: 16, marginBottom: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(176,228,204,.3)", letterSpacing: ".1em", paddingLeft: 12, marginBottom: 8 }}>
          MATA KULIAH
        </p>
        {courses.map(c => (
          <button key={c.id}
            className={`sidebar-item ${activeCourseId === c.id ? "active" : ""}`}
            onClick={() => router.push(`/courses/${c.id}`)}>
            <span style={{ fontSize: 16 }}>{c.emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.course_name}</span>
          </button>
        ))}
      </div>

        <div style={{ flex: 1 }} />

        {/* Sign out */}
        <button className="sidebar-item" onClick={signOut} style={{ marginTop: "auto" }}>
          <span>↩</span> Keluar
        </button>
      </div>
    </aside>
  );
}
