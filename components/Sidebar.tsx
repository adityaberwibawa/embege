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
      <div className="sidebar-header">
        <div>
          <h1 className="sidebar-brand-title">
            EMB<span style={{ color: "var(--yellow)" }}>EGE</span>
          </h1>
          <p className="sidebar-brand-subtitle">AI Lecture Notes</p>
        </div>
        {/* Toggle Button for Mobile Only */}
        <button 
          className="sidebar-mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)} 
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Nav contents */}
      <div className={`sidebar-content ${isOpen ? "" : "sidebar-collapsed"}`}>
      {/* Nav */}
      <button className={`sidebar-item ${path === "/dashboard" ? "active" : ""}`} onClick={() => router.push("/dashboard")}>
        <span>🏠</span> Dashboard
      </button>

      {/* Courses */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">
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
