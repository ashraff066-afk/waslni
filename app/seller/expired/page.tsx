"use client";

export default function ExpiredPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: "#ffffff10", borderRadius: 24, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", border: "1px solid #ef444433" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>انتهى اشتراكك!</h2>
        <p style={{ color: "#ffffff60", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
          للاستمرار في استخدام متجرك وصلني، يرجى تجديد اشتراكك.
        </p>
        <div style={{ background: "#ffffff08", borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#ffffff80", marginBottom: 8 }}>خطط الاشتراك</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: "#a855f722", border: "1px solid #a855f744", borderRadius: 12, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a855f7", marginBottom: 4 }}>شهري</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>35,000</div>
              <div style={{ fontSize: 11, color: "#ffffff60" }}>د.ع / شهر</div>
            </div>
            <div style={{ flex: 1, background: "#ec489922", border: "2px solid #ec4899", borderRadius: 12, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#ec4899", fontWeight: 700, marginBottom: 2 }}>⭐ الأفضل</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", marginBottom: 4 }}>سنوي</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>300,000</div>
              <div style={{ fontSize: 11, color: "#ffffff60" }}>د.ع / سنة</div>
            </div>
          </div>
        </div>
        <button onClick={() => window.open("https://wa.me/9647739863056?text=أريد تجديد اشتراكي في وصلني", "_blank")} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }}>
          💬 تواصل معنا على واتساب
        </button>
        <button onClick={() => window.location.href = "/seller"} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #ffffff20", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#ffffff60", fontFamily: "Tajawal,sans-serif" }}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}