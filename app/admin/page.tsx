"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const ADMIN_PASSWORD = "waslni@admin2026";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sellers");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else alert("كلمة المرور خاطئة");
  };

  useEffect(() => { if (authed) loadData(); }, [authed]);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from("sellers").select("*").order("created_at", { ascending: false });
    setSellers(data || []);
    setLoading(false);
  };

  const updateSubscription = async (id: string, plan: string, months: number) => {
    const end = new Date();
    if (plan === "trial") end.setDate(end.getDate() + 14);
    else end.setMonth(end.getMonth() + months);
    await supabase.from("sellers").update({ subscription_plan: plan, subscription_end: end.toISOString() }).eq("id", id);
    loadData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("sellers").update({ is_active: !current }).eq("id", id);
    loadData();
  };

  const getDaysLeft = (end: string) => {
    if (!end) return 0;
    return Math.ceil((new Date(end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!authed) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: "#ffffff10", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", textAlign: "center", border: "1px solid #ffffff15" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <h2 style={{ color: "#fff", fontWeight: 800, marginBottom: 20, fontSize: 20 }}>لوحة الأدمن</h2>
        <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 14 }} />
        <button onClick={handleLogin} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>دخول</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "#ffffff10", borderBottom: "1px solid #ffffff15", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 28 }}>🔐</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>لوحة الأدمن — وصلني</h1>
        </div>
        <button onClick={() => setAuthed(false)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "7px 14px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12 }}>خروج</button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: "16px" }}>
        {[
          { label: "كل المتاجر", value: sellers.length, icon: "🏪", color: "#ec4899" },
          { label: "نشط", value: sellers.filter(s => s.is_active).length, icon: "✅", color: "#00d4aa" },
          { label: "منتهي", value: sellers.filter(s => getDaysLeft(s.subscription_end) <= 0).length, icon: "⚠️", color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#ffffff10", borderRadius: 14, padding: "14px 10px", textAlign: "center", border: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#ffffff60", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        {[
          { id: "sellers", label: "🏪 المتاجر" },
          { id: "expired", label: "⚠️ المنتهية" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "9px 18px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === t.id ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff10", color: activeTab === t.id ? "#fff" : "#ffffff80", border: "none" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#ec4899" }}>جاري التحميل...</div>
        ) : (
          (activeTab === "sellers" ? sellers : sellers.filter(s => getDaysLeft(s.subscription_end) <= 0)).map((s, i) => {
            const daysLeft = getDaysLeft(s.subscription_end);
            return (
              <div key={i} style={{ background: "#ffffff10", borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${daysLeft <= 0 ? "#ef444433" : daysLeft <= 7 ? "#f59e0b33" : "#ffffff15"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>{s.business_name}</div>
                    <div style={{ fontSize: 12, color: "#ffffff60", marginTop: 2 }}>📍 {s.city} · {s.phone}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 700, background: s.is_active ? "#00d4aa22" : "#ef444422", color: s.is_active ? "#00d4aa" : "#ef4444", border: `1px solid ${s.is_active ? "#00d4aa44" : "#ef444444"}` }}>
                    {s.is_active ? "نشط" : "معطل"}
                  </span>
                </div>

                {/* الاشتراك */}
                <div style={{ background: "#ffffff08", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#ffffff80" }}>
                      الخطة: <span style={{ color: "#a855f7", fontWeight: 700 }}>{s.subscription_plan === "trial" ? "تجريبي" : s.subscription_plan === "monthly" ? "شهري" : "سنوي"}</span>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: daysLeft <= 0 ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#00d4aa" }}>
                      {daysLeft <= 0 ? "منتهي" : `${daysLeft} يوم متبقي`}
                    </span>
                  </div>
                </div>

                {/* أزرار الاشتراك */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
                  <button onClick={() => updateSubscription(s.id, "trial", 0)} style={{ padding: "7px 4px", background: "#ffffff15", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>🔄 تجريبي</button>
                  <button onClick={() => updateSubscription(s.id, "monthly", 1)} style={{ padding: "7px 4px", background: "#a855f722", border: "1px solid #a855f744", borderRadius: 8, color: "#a855f7", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>📅 شهري</button>
                  <button onClick={() => updateSubscription(s.id, "yearly", 12)} style={{ padding: "7px 4px", background: "#ec489922", border: "1px solid #ec489944", borderRadius: 8, color: "#ec4899", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>⭐ سنوي</button>
                </div>

                {/* تفعيل/تعطيل */}
                <button onClick={() => toggleActive(s.id, s.is_active)} style={{ width: "100%", padding: "8px", background: s.is_active ? "#ef444422" : "#00d4aa22", border: `1px solid ${s.is_active ? "#ef4444" : "#00d4aa"}`, borderRadius: 10, color: s.is_active ? "#ef4444" : "#00d4aa", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>
                  {s.is_active ? "🚫 تعطيل المتجر" : "✅ تفعيل المتجر"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}