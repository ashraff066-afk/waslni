"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
supabase.from("sellers").select("*").eq("is_active", true).gt("subscription_end", new Date().toISOString()).order("created_at", { ascending: false })
      .then(({ data }) => { setSellers(data || []); setLoading(false); });
    supabase.from("products").select("id", { count: "exact" })
      .then(({ count }) => setProductsCount(count || 0));
  }, []);

  const filtered = sellers.filter(s => s.business_name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; user-select: none; }
input, textarea { -webkit-user-select: text; user-select: text; }
        .shop-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px #ec489922; }
        .shop-card { transition: all 0.25s; }
      `}</style>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", padding: "60px 16px 48px", textAlign: "center", background: "linear-gradient(135deg,#2d0a1e,#1a0a2e)" }}>
        {/* خلفية زخرفية */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "#ec489915", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "#a855f715", filter: "blur(40px)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 90, height: 90, borderRadius: 28, background: "linear-gradient(135deg,#ec4899,#a855f7)", boxShadow: "0 16px 48px #ec489944", marginBottom: 20, fontSize: 48 }}>🛍️</div>
          <h1 style={{ fontSize: 44, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10, lineHeight: 1.2 }}>Shopli</h1>
          <p style={{ color: "#ffffff80", fontSize: 16, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>منصة التسوق والتوصيل — اكتشف أفضل المتاجر وتسوق بسهولة</p>

          {/* بحث */}
          <div style={{ maxWidth: 500, margin: "0 auto 28px", position: "relative" }}>
            <input type="text" placeholder="🔍 ابحث عن متجر أو مدينة..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "16px 20px", borderRadius: 16, background: "#ffffff15", border: "1px solid #ffffff25", color: "#fff", fontSize: 15, outline: "none", fontFamily: "Tajawal,sans-serif", backdropFilter: "blur(10px)" }} />
          </div>

          <button onClick={() => window.location.href = "/seller"} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 16, padding: "14px 32px", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Tajawal,sans-serif", boxShadow: "0 8px 24px #ec489944" }}>
           🚀 افتح متجرك الآن
          </button>
        </div>
      </div>

      {/* إحصاءات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, padding: "24px 16px 8px", maxWidth: 700, margin: "0 auto" }}>
        {[
          { icon: "🏪", value: sellers.length, label: "متجر نشط" },
          { icon: "🛍️", value: productsCount, label: "منتج متاح" },
          { icon: "🌍", value: [...new Set(sellers.map(s => s.city).filter(Boolean))].length, label: "مدينة" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#ffffff10", borderRadius: 16, padding: "18px 10px", textAlign: "center", border: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#ffffff60", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* كيف يشتغل */}
      <div style={{ maxWidth: 700, margin: "24px auto 0", padding: "0 16px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 16, textAlign: "center" }}>✨ كيف يشتغل Shopli؟</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { icon: "🔍", title: "اكتشف", desc: "تصفح المتاجر واختار اللي يعجبك" },
            { icon: "🛒", title: "تسوق", desc: "أضف المنتجات للسلة بضغطة واحدة" },
            { icon: "🚚", title: "استلم", desc: "أكمل طلبك وانتظر التوصيل" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#ffffff08", borderRadius: 16, padding: 16, textAlign: "center", border: "1px solid #ffffff10" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#ffffff50", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* المتاجر */}
      <div style={{ maxWidth: 700, margin: "24px auto 0", padding: "0 16px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16 }}>🏪 المتاجر ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div>ما في نتائج</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {filtered.map((s, i) => (
              <div key={i} className="shop-card" onClick={() => window.location.href = `/shop/${s.slug}`} style={{ background: "#ffffff10", borderRadius: 18, overflow: "hidden", border: "1px solid #ffffff15", cursor: "pointer" }}>
                {s.image_url ? (
                  <img src={s.image_url} alt={s.business_name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#ec489922,#a855f722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, marginBottom: 4 }}>{s.business_name}</div>
                  <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 6 }}>📍 {s.city}</div>
                  {s.description && <div style={{ fontSize: 11, color: "#ffffff50", marginBottom: 10, lineHeight: 1.5 }}>{s.description.slice(0, 50)}{s.description.length > 50 ? "..." : ""}</div>}
                  <div style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", borderRadius: 10, padding: "7px 12px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    تسوق الآن ←
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
{/* قسم البائعين */}
<div style={{ maxWidth: 700, margin: "32px auto 0", padding: "0 16px" }}>
  <div style={{ background: "linear-gradient(135deg,#2d0a1e,#1a0a2e)", borderRadius: 24, padding: "32px 24px", border: "1px solid #ec489933", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "#ec489915", filter: "blur(30px)" }} />
    <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "#a855f715", filter: "blur(30px)" }} />
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 10 }}>افتح متجرك اليوم!</h2>
      <p style={{ color: "#ffffff70", fontSize: 14, marginBottom: 24, lineHeight: 1.8 }}>انضم لمنصة Shopli وابدأ تبيع منتجاتك أونلاين بسهولة</p>

      {/* المميزات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 24, textAlign: "right" }}>
        {[
          { icon: "🛍️", text: "متجر احترافي بدقائق" },
          { icon: "📦", text: "إدارة منتجات سهلة" },
          { icon: "💬", text: "طلبات عبر واتساب" },
          { icon: "📊", text: "إحصائيات مبيعاتك" },
          { icon: "🔗", text: "رابط متجر خاص بك" },
          { icon: "📱", text: "يشتغل على الموبايل" },
        ].map((f, i) => (
          <div key={i} style={{ background: "#ffffff08", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontSize: 13, color: "#ffffffcc", fontWeight: 600 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* الأسعار */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        <div style={{ background: "#ffffff10", borderRadius: 16, padding: "14px 10px", textAlign: "center", border: "1px solid #ffffff20" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎁</div>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 4 }}>تجريبي</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#00d4aa" }}>مجاني</div>
          <div style={{ fontSize: 11, color: "#ffffff50", marginTop: 4 }}>أسبوعين</div>
        </div>
        <div style={{ background: "#a855f722", borderRadius: 16, padding: "14px 10px", textAlign: "center", border: "1px solid #a855f744" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
          <div style={{ fontWeight: 800, color: "#a855f7", fontSize: 13, marginBottom: 4 }}>شهري</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>35,000</div>
          <div style={{ fontSize: 11, color: "#ffffff50", marginTop: 4 }}>دينار / شهر</div>
        </div>
        <div style={{ background: "#ec489922", borderRadius: 16, padding: "14px 10px", textAlign: "center", border: "2px solid #ec489966", position: "relative" }}>
          <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#ec4899,#a855f7)", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>⭐ الأفضل</div>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🏆</div>
          <div style={{ fontWeight: 800, color: "#ec4899", fontSize: 13, marginBottom: 4 }}>سنوي</div>
       <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff40", textDecoration: "line-through", marginBottom: 2 }}>400,000</div>
<div style={{ fontSize: 18, fontWeight: 900, color: "#ec4899" }}>300,000</div>
<div style={{ fontSize: 11, color: "#ffffff50", marginTop: 4 }}>دينار / سنة</div>
        </div>
      </div>

      <button onClick={() => window.location.href = "/seller"} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 16, fontSize: 17, fontWeight: 900, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", boxShadow: "0 8px 24px #ec489944" }}>
        🚀 ابدأ تجربتك المجانية الآن
      </button>
    </div>
  </div>
</div>
      {/* فوتر */}
      <div style={{ textAlign: "center", padding: "40px 16px 20px", color: "#ffffff30", fontSize: 13 }}>
        Shopli — منصة التسوق والتوصيل 🛍️
      </div>
    </div>
  );
}