"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("sellers").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setSellers(data || []); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "#ffffff10", backdropFilter: "blur(10px)", borderBottom: "1px solid #ffffff15", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>وصلني</h1>
        <p style={{ color: "#ffffff60", fontSize: 14, marginTop: 4 }}>اكتشف أفضل المتاجر</p>
        <button onClick={() => window.location.href = "/seller"} style={{ marginTop: 16, background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>+ افتح متجرك</button>
      </div>

      {/* المتاجر */}
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16 }}>🏪 المتاجر المتاحة</h2>
        {sellers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <div>ما في متاجر بعد</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {sellers.map((s, i) => (
              <div key={i} onClick={() => window.location.href = `/shop/${s.slug}`} style={{ background: "#ffffff10", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff15", cursor: "pointer" }}>
                {s.image_url ? (
                  <img src={s.image_url} alt={s.business_name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: 120, background: "linear-gradient(135deg,#ec489922,#a855f722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛍️</div>
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, marginBottom: 4 }}>{s.business_name}</div>
                  <div style={{ fontSize: 12, color: "#ffffff60" }}>📍 {s.city}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}