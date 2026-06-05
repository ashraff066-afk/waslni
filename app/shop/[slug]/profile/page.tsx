"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../supabase";

export default function ShopProfile() {
  const params = useParams();
  const slug = params?.slug as string;
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { if (slug) loadData(); }, [slug]);

  const loadData = async () => {
    const { data, error } = await supabase.from("sellers").select("*").eq("slug", slug).limit(1);
    if (error || !data || data.length === 0) { setNotFound(true); setLoading(false); return; }
    setSeller(data[0]);
    const { data: prodsData } = await supabase.from("products").select("*").eq("seller_id", data[0].id);
    setProducts(prodsData || []);
    const { data: catsData } = await supabase.from("categories").select("*").eq("seller_id", data[0].id);
    setCategories(catsData || []);
    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontFamily: "Tajawal, sans-serif", textAlign: "center" }}>
      <div><div style={{ fontSize: 64, marginBottom: 16 }}>😕</div><h2>المتجر غير موجود</h2></div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 100 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HERO */}
      <div style={{ textAlign: "center", overflow: "hidden" }}>
        {seller?.image_url ? (
          <img src={seller.image_url} alt={seller.business_name} style={{ width: "100%", height: 220, objectFit: "cover" }} />
        ) : (
          <div style={{ height: 220, background: "linear-gradient(135deg,#ec489933,#a855f733)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🛍️</div>
        )}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {/* معلومات المتجر */}
        <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid #ffffff15", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{seller.business_name}</h1>
          <p style={{ fontSize: 14, color: "#ffffff60", marginBottom: 16 }}>📍 {seller.city}</p>
          {seller.description && (
  <p style={{ fontSize: 14, color: "#ffffff80", lineHeight: 1.7, marginBottom: 16 }}>{seller.description}</p>
)}
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#ec4899" }}>{products.length}</div>
              <div style={{ fontSize: 12, color: "#ffffff60" }}>منتج</div>
            </div>
            <div style={{ width: 1, background: "#ffffff20" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7" }}>{categories.length}</div>
              <div style={{ fontSize: 12, color: "#ffffff60" }}>فئة</div>
            </div>
          </div>
        </div>

        {/* الفئات */}
        {categories.length > 0 && (
          <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid #ffffff15" }}>
            <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 14, fontSize: 15 }}>📂 الفئات</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat, i) => (
                <span key={i} style={{ background: "#a855f722", border: "1px solid #a855f744", borderRadius: 20, padding: "6px 14px", fontSize: 13, color: "#a855f7", fontWeight: 700 }}>
                  {cat.name} ({products.filter(p => p.category_id === cat.id).length})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* عرض بعض المنتجات */}
        {products.length > 0 && (
          <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid #ffffff15" }}>
            <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 14, fontSize: 15 }}>🛍️ من منتجاتنا</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {products.slice(0, 6).map((p, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff15" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 80, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: 80, background: "#ffffff10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🛍️</div>
                  )}
                  <div style={{ padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#ec4899", fontWeight: 800 }}>{p.price?.toLocaleString()} د.ع</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* زر التسوق */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "#0a0e1acc", backdropFilter: "blur(10px)", borderTop: "1px solid #ffffff15" }}>
        <button onClick={() => window.location.href = `/shop/${slug}`} style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto", padding: "15px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
          🛍️ تسوق الآن
        </button>
      </div>
    </div>
  );
}