"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("sellers").select("*, products(count)").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setSellers(data || []); setLoading(false); });
  }, []);

  const filtered = sellers.filter(s => s.business_name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HERO */}
      <div style={{ background: "#ffffff08", borderBottom: "1px solid #ffffff10", padding: "40px 16px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🛍️</div>
        <h1 style={{ fontSize: 38, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>وصلني</h1>
        <p style={{ color: "#ffffff60", fontSize: 15, marginBottom: 24 }}>اكتشف أفضل المتاجر وتسوق بسهولة</p>

        {/* بحث */}
        <div style={{ maxWidth: 500, margin: "0 auto 20px" }}>
          <input type="text" placeholder="🔍 ابحث عن متجر أو مدينة..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "14px 18px", borderRadius: 14, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
        </div>

        <button onClick={() => window.location.href = "/seller"} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, padding: "12px 28px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", boxShadow: "0 8px 24px #ec489933" }}>
          🚀 افتح متجرك مجاناً
        </button>
      </div>

      {/* المتاجر */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>🏪 المتاجر ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div>ما في نتائج</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {filtered.map((s, i) => (
              <div key={i} onClick={() => window.location.href = `/shop/${s.slug}`} style={{ background: "#ffffff10", borderRadius: 18, overflow: "hidden", border: "1px solid #ffffff15", cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                {s.image_url ? (
                  <img src={s.image_url} alt={s.business_name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#ec489933,#a855f733)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, marginBottom: 4 }}>{s.business_name}</div>
                  <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 8 }}>📍 {s.city}</div>
                  <div style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", borderRadius: 8, padding: "6px 12px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    تسوق الآن ←
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}