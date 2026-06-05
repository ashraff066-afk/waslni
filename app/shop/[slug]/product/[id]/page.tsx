"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../supabase";

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (id && slug) loadData(); }, [id, slug]);

  const loadData = async () => {
    const { data: prodData } = await supabase.from("products").select("*").eq("id", id).single();
    if (!prodData) { setNotFound(true); setLoading(false); return; }
    setProduct(prodData);
    const { data: sellerData } = await supabase.from("sellers").select("*").eq("slug", slug).single();
    setSeller(sellerData);
    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontFamily: "Tajawal, sans-serif", textAlign: "center" }}>
      <div><div style={{ fontSize: 64, marginBottom: 16 }}>😕</div><h2>المنتج غير موجود</h2></div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 100 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* زر الرجوع */}
      <div style={{ padding: "16px", position: "sticky", top: 0, background: "#1a0a12cc", backdropFilter: "blur(10px)", zIndex: 50, borderBottom: "1px solid #ffffff10" }}>
        <button onClick={() => window.history.back()} style={{ background: "#ffffff15", border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>← رجوع</button>
      </div>

      {/* صورة المنتج */}
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} style={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: 280, background: "linear-gradient(135deg,#ec489922,#a855f722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🛍️</div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {/* تفاصيل المنتج */}
        <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid #ffffff15" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>{product.name}</h1>
          {product.description && <p style={{ fontSize: 14, color: "#ffffff70", lineHeight: 1.7, marginBottom: 16 }}>{product.description}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#ec4899" }}>{product.price?.toLocaleString()} د.ع</div>
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 700, background: product.in_stock ? "#00d4aa22" : "#ef444422", color: product.in_stock ? "#00d4aa" : "#ef4444", border: `1px solid ${product.in_stock ? "#00d4aa44" : "#ef444444"}` }}>
              {product.in_stock ? "✅ متاح" : "❌ نفذ"}
            </span>
          </div>
        </div>

        {/* معلومات المتجر */}
        {seller && (
          <div style={{ background: "#ffffff10", borderRadius: 20, padding: 16, marginBottom: 16, border: "1px solid #ffffff15", display: "flex", alignItems: "center", gap: 12 }}>
            {seller.image_url ? (
              <img src={seller.image_url} alt={seller.business_name} style={{ width: 50, height: 50, borderRadius: 14, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛍️</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{seller.business_name}</div>
              <div style={{ fontSize: 12, color: "#ffffff60" }}>📍 {seller.city}</div>
            </div>
            <button onClick={() => window.location.href = `/shop/${slug}/profile`} style={{ background: "#ffffff15", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>عرض المتجر</button>
          </div>
        )}
      </div>

      {/* زر إضافة للسلة */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "#0a0e1acc", backdropFilter: "blur(10px)", borderTop: "1px solid #ffffff15" }}>
        <button onClick={() => {
          if (!product.in_stock) return;
          const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || "[]");
          const existing = cart.find((i: any) => i.id === product.id);
          if (existing) { existing.qty += 1; } else { cart.push({ ...product, qty: 1 }); }
          localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
          setAdded(true);
          setTimeout(() => window.location.href = `/shop/${slug}?shop=1`, 1000);
        }} disabled={!product.in_stock} style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto", padding: "15px", background: product.in_stock ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#333", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: product.in_stock ? "pointer" : "not-allowed", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
          {added ? "✅ تمت الإضافة! جاري التحويل..." : product.in_stock ? "🛒 أضف للسلة" : "❌ نفذ المخزون"}
        </button>
      </div>
    </div>
  );
}