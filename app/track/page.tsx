"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const trackOrder = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const { data } = await supabase.from("orders").select("*").ilike("id", `%${orderNumber.trim()}%`).limit(1);

    if (!data || data.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setOrder(data[0]);
    const { data: sellerData } = await supabase.from("sellers").select("*").eq("id", data[0].seller_id).single();
    setSeller(sellerData);
    setLoading(false);
  };

  const statusColor = (status: string) => {
    if (status === "confirmed") return "#00d4aa";
    if (status === "cancelled") return "#ef4444";
    return "#f59e0b";
  };

  const statusLabel = (status: string) => {
    if (status === "confirmed") return "✅ مؤكد";
    if (status === "cancelled") return "❌ ملغي";
    return "⏳ قيد الانتظار";
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", padding: "40px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>تتبع طلبك</h1>
          <p style={{ color: "#ffffff60", fontSize: 14 }}>أدخل رقم طلبك لمعرفة حالته</p>
        </div>

        {/* البحث */}
        <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 20, border: "1px solid #ffffff15" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" placeholder="مثال: WS-123456" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} onKeyDown={e => e.key === "Enter" && trackOrder()} style={{ flex: 1, padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
            <button onClick={trackOrder} disabled={loading || !orderNumber.trim()} style={{ padding: "13px 20px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
              {loading ? "..." : "🔍"}
            </button>
          </div>
        </div>

        {/* ما وجد */}
        {notFound && (
          <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 16, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
            <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 15 }}>ما وجدنا طلب بهذا الرقم</p>
            <p style={{ color: "#ffffff60", fontSize: 13, marginTop: 8 }}>تأكد من رقم الطلب وحاول مجدداً</p>
          </div>
        )}

        {/* نتيجة */}
        {order && (
          <div>
            {/* حالة الطلب */}
            <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 14, border: `2px solid ${statusColor(order.status)}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>حالة الطلب</h3>
                <span style={{ fontSize: 14, padding: "6px 16px", borderRadius: 20, fontWeight: 700, background: `${statusColor(order.status)}22`, color: statusColor(order.status), border: `1px solid ${statusColor(order.status)}44` }}>
                  {statusLabel(order.status)}
                </span>
              </div>

              {/* خطوات */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                {[
                  { label: "تم الطلب", icon: "📝", done: true },
                  { label: "قيد المراجعة", icon: "⏳", done: order.status !== "pending" },
                  { label: "تم التأكيد", icon: "✅", done: order.status === "confirmed" },
                ].map((step, i) => (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 24, marginBottom: 4, opacity: step.done ? 1 : 0.3 }}>{step.icon}</div>
                    <div style={{ fontSize: 10, color: step.done ? "#fff" : "#ffffff40", fontWeight: step.done ? 700 : 400 }}>{step.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* تفاصيل الطلب */}
            <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #ffffff15" }}>
              <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 14, fontSize: 15 }}>📋 تفاصيل الطلب</h3>
              <div style={{ fontSize: 13, color: "#ffffff80", lineHeight: 2 }}>
                <div>👤 {order.customer_name}</div>
                <div>📱 {order.customer_phone}</div>
                <div>📍 {order.customer_address}</div>
              </div>
              <div style={{ borderTop: "1px solid #ffffff10", marginTop: 12, paddingTop: 12 }}>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ffffff08" }}>
                    <span style={{ fontSize: 13, color: "#e2e8f0" }}>{item.name} x{item.qty}</span>
                    <span style={{ fontSize: 13, color: "#ec4899", fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} د.ع</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>المجموع</span>
                  <span style={{ fontWeight: 900, color: "#ec4899", fontSize: 16 }}>{order.total?.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>

            {/* المتجر */}
            {seller && (
              <div style={{ background: "#ffffff10", borderRadius: 20, padding: 16, border: "1px solid #ffffff15", display: "flex", alignItems: "center", gap: 12 }}>
                {seller.image_url ? (
                  <img src={seller.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛍️</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{seller.business_name}</div>
                  <div style={{ fontSize: 12, color: "#ffffff60" }}>📍 {seller.city}</div>
                </div>
                {seller.phone && (
                  <a href={`https://wa.me/${seller.phone?.replace(/^0/, "964")}`} target="_blank" rel="noreferrer" style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 10, padding: "8px 12px", color: "#25d366", fontSize: 13, textDecoration: "none", fontWeight: 700 }}>💬</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* رجوع */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => window.location.href = "/"} style={{ background: "transparent", border: "none", color: "#ffffff40", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>← رجوع للرئيسية</button>
        </div>
      </div>
    </div>
  );
}