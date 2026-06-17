"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
 
const STORE_SLUG = "store-677913";
const [adImages, setAdImages] = useState<string[]>([]);
 
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
 
  useEffect(() => {
    supabase.from("sellers").select("id").eq("slug", STORE_SLUG).single().then(({ data: seller }) => {
      if (!seller) return;
      supabase.from("products").select("*").eq("seller_id", seller.id).not("image_url", "is", null).order("created_at", { ascending: false }).limit(8)
        .then(({ data }) => setProducts(data || []));
      supabase.from("ads").select("image_url").eq("seller_id", seller.id).eq("is_active", true)
        .then(({ data }) => setAdImages((data || []).map((a: any) => a.image_url)));
    });
  }, []);
 
  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % products.length), 3000);
    return () => clearInterval(timer);
  }, [products]);
 
  const features = [
    { icon: "🎰", title: "فرارة الحظ", desc: "مع كل طلب فوق 10,000 د.ع اربح جائزة مجانية!", color: "#ec4899" },
    { icon: "🚚", title: "توصيل مجاني", desc: "للطلبات فوق 30,000 د.ع توصيل مجاني لبابك!", color: "#3b82f6" },
    { icon: "⭐", title: "نقاط الولاء", desc: "اجمع نقاط مع كل طلب واحصل على خصومات!", color: "#f59e0b" },
    { icon: "🎁", title: "هدية أول طلب", desc: "هدية مجانية مع أول طلب لك!", color: "#00d4aa" },
    { icon: "🎟️", title: "أكواد خصم", desc: "أكواد خصم حصرية لزبائننا المميزين!", color: "#a855f7" },
    { icon: "🎀", title: "تغليف هدايا", desc: "غلف هديتك برسالة شخصية بـ 2,000 د.ع فقط!", color: "#f43f5e" },
  ];
 
  const marqueeItems = [
    "🚚 توصيل مجاني فوق 30,000 د.ع",
    "🎰 فرارة الحظ مع كل طلب فوق 10,000 د.ع",
    "⭐ اجمع نقاط مع كل طلب",
    "🎁 هدية مجانية مع أول طلب",
    "🎟️ أكواد خصم حصرية",
    "🎀 خدمة تغليف الهدايا متوفرة",
  ];
 
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .feature-card:hover { transform: translateY(-4px); transition: all 0.3s; }
        .feature-card { transition: all 0.3s; }
      `}</style>
 
      {/* شريط إعلاني */}
      <div style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", padding: "9px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "marquee 18s linear infinite" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ fontSize: 13, color: "#fff", fontWeight: 700, padding: "0 28px" }}>{item}</span>
          ))}
        </div>
      </div>
 
      {/* هيدر */}
      <div style={{ background: "#ffffff08", backdropFilter: "blur(10px)", borderBottom: "1px solid #ffffff15", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💄</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>شوبلي كوزمتك</div>
            <div style={{ fontSize: 11, color: "#ffffff60" }}>متجرك للتجميل والعناية</div>
          </div>
        </div>
        <button onClick={() => window.location.href = `/shop/${STORE_SLUG}?shop=1`} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
          🛍️ تسوقي الان    
        </button>
      </div>
 {/* قسم الإعلانات */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontSize: 13, color: "#ffffff60", fontWeight: 700, marginBottom: 10 }}>🌟 عروضنا الحصرية</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
          {adImages.map((img, i) => (
            <div key={i} style={{ flexShrink: 0, width: "85vw", maxWidth: 360, borderRadius: 18, overflow: "hidden", scrollSnapAlign: "start", border: "1px solid #ffffff15" }}>
              <img src={img} alt={`إعلان ${i+1}`} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
      {/* هيرو */}
      <div style={{ position: "relative", overflow: "hidden", padding: "48px 20px 40px", textAlign: "center", background: "linear-gradient(135deg,#2d0a1e,#1a0a2e)" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "#ec489915", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "#a855f715", filter: "blur(40px)" }} />
        <div style={{ position: "relative", animation: "fadeIn 0.8s ease" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💄✨</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#f9a8d4,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12, lineHeight: 1.3 }}>
            مستحضرات تجميل أصلية
          </h1>
          <p style={{ color: "#ffffff80", fontSize: 15, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.8 }}>
            اكتشفي أجمل منتجات التجميل والعناية بأفضل الأسعار مع توصيل سريع لبابك 🌸
          </p>
          <button onClick={() => window.location.href = `/shop/${STORE_SLUG}?shop=1`} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 16, padding: "15px 36px", color: "#fff", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "Tajawal,sans-serif", boxShadow: "0 8px 32px #ec489944", animation: "pulse 2s infinite" }}>
            🛍️ تسوقي الان
          </button>
        </div>
      </div>
 
      {/* سلايدر المنتجات */}
      {products.length > 0 && (
        <div style={{ padding: "24px 0 8px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 14, padding: "0 20px" }}>✨ منتجاتنا المميزة</h2>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 12, padding: "0 20px", overflowX: "auto", scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
              {products.map((p, i) => (
                <div key={i} onClick={() => window.location.href = `/shop/${STORE_SLUG}/product/${p.id}`} style={{ flexShrink: 0, width: 160, background: "#ffffff10", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff15", cursor: "pointer", scrollSnapAlign: "start" }}>
                  <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 12, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: "#ec4899", fontWeight: 900, fontSize: 14 }}>{p.price?.toLocaleString()} د.ع</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* المميزات */}
      <div style={{ padding: "24px 20px 8px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16, textAlign: "center" }}>🎁 مميزات متجرنا</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: `${f.color}15`, border: `1px solid ${f.color}33`, borderRadius: 16, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#ffffff70", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* CTA */}
      <div style={{ padding: "24px 20px" }}>
        <div style={{ background: "linear-gradient(135deg,#2d0a1e,#1a0a2e)", borderRadius: 24, padding: "32px 20px", border: "1px solid #ec489933", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "#ec489915", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>جاهزة تتسوقين؟</h2>
            <p style={{ color: "#ffffff70", fontSize: 14, marginBottom: 24, lineHeight: 1.8 }}>
              اكتشفي أحدث منتجات التجميل مع عروض وخصومات حصرية لكل يوم!
            </p>
            <button onClick={() => window.location.href = `/shop/${STORE_SLUG}?shop=1`} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 16, fontSize: 17, fontWeight: 900, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", boxShadow: "0 8px 24px #ec489944" }}>
              🛍️ ابدأي التسوق الآن
            </button>
          </div>
        </div>
      </div>
 
      {/* فوتر */}
      <div style={{ textAlign: "center", padding: "20px 16px", color: "#ffffff30", fontSize: 12 }}>
        شوبلي كوزمتك 💄 — جميع الحقوق محفوظة
      </div>
    </div>
  );
}