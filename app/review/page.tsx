"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../supabase";

function ReviewContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const [seller, setSeller] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderNumber) loadOrder();
  }, [orderNumber]);

  const loadOrder = async () => {
    const { data } = await supabase.from("orders").select("*").eq("id", orderNumber).single();
    if (data) {
      setCustomerName(data.customer_name || "");
      const { data: sellerData } = await supabase.from("sellers").select("*").eq("id", data.seller_id).single();
      setSeller(sellerData);
    }
  };

  const submitReview = async () => {
    if (rating === 0) { setError("يرجى اختيار تقييم"); return; }
    if (!seller) { setError("حدث خطأ، حاول مجدداً"); return; }
    setLoading(true);
    await supabase.from("reviews").insert([{
      seller_id: seller.id,
      order_number: orderNumber,
      rating,
      comment,
      customer_name: customerName,
    }]);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: "#ffffff10", borderRadius: 24, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", border: "1px solid #00d4aa33" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>شكراً على تقييمك!</h2>
        <p style={{ color: "#ffffff60", fontSize: 14, marginBottom: 24 }}>رأيك يساعدنا على التحسين</p>
        <button onClick={() => window.location.href = "/"} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
          🛍️ تسوق مجدداً
        </button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", padding: "40px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>قيّم تجربتك</h1>
          {seller && <p style={{ color: "#ffffff60", fontSize: 14 }}>متجر {seller.business_name}</p>}
        </div>

        <div style={{ background: "#ffffff10", borderRadius: 20, padding: 24, border: "1px solid #ffffff15" }}>
          {/* اسم الزبون */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>اسمك</label>
            <input type="text" placeholder="اسمك الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
          </div>

          {/* النجوم */}
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 12, fontWeight: 600 }}>تقييمك</label>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ fontSize: 40, cursor: "pointer", filter: (hoverRating || rating) >= star ? "none" : "grayscale(1)", transition: "transform 0.1s", transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)" }}>⭐</span>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ color: "#f59e0b", fontSize: 13, marginTop: 10, fontWeight: 700 }}>
                {rating === 1 ? "سيء 😞" : rating === 2 ? "مقبول 😐" : rating === 3 ? "جيد 🙂" : rating === 4 ? "جيد جداً 😊" : "ممتاز! 🌟"}
              </p>
            )}
          </div>

          {/* التعليق */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>تعليقك (اختياري)</label>
            <textarea placeholder="شاركنا تجربتك..." value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none" }} />
          </div>

          {error && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>}

          <button onClick={submitReview} disabled={loading || rating === 0} style={{ width: "100%", padding: "14px", background: rating > 0 ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff15", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: rating > 0 ? "pointer" : "not-allowed", color: rating > 0 ? "#fff" : "#ffffff40", fontFamily: "Tajawal,sans-serif" }}>
            {loading ? "جاري الإرسال..." : "إرسال التقييم ⭐"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function ReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontFamily: "Tajawal,sans-serif" }}>جاري التحميل...</div>}>
      <ReviewContent />
    </Suspense>
  );
}