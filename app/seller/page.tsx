"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [forgotSent, setForgotSent] = useState(false);
const handleForgotPassword = async () => {
  if (!forgotEmail) { setError("يرجى إدخال البريد الإلكتروني"); return; }
  setLoading(true);
  const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
    redirectTo: `${window.location.origin}/seller/reset-password`,
  });
  setLoading(false);
  if (error) { setError(error.message); return; }
  setForgotSent(true);
};
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    if (!email || !password) { setError("يرجى إدخال البريد وكلمة المرور"); setLoading(false); return; }
if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); setLoading(false); return; }
if (isRegister && !businessName.trim()) { setError("يرجى إدخال اسم المتجر"); setLoading(false); return; }
if (isRegister && !phone.trim()) { setError("يرجى إدخال رقم الواتساب"); setLoading(false); return; }
if (isRegister && !city.trim()) { setError("يرجى إدخال المدينة"); setLoading(false); return; }
    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      if (data.user) {
const slug = "store-" + Date.now().toString().slice(-6);
        await supabase.from("sellers").insert([{ user_id: data.user.id, business_name: businessName, phone, city, slug, is_active: true }]);
        window.location.href = "/seller/dashboard";
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError("بيانات خاطئة"); setLoading(false); return; }
      window.location.href = "/seller/dashboard";
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh",background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #ec4899 !important; box-shadow: 0 0 0 3px #ec489922; }
        .btn-main:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #ec489955; }
        .btn-main { transition: all 0.2s; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,#ec4899,#a855f7)", boxShadow: "0 12px 40px #ec489944", marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>🛍️</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>وصلني</h1>
          <p style={{ color: "#9ca3af", fontSize: 15, marginTop: 6, fontWeight: 500 }}>منصة البيع والتوصيل</p>
        </div>

        {/* CARD */}
        <div style={{ background: "#ffffff", borderRadius: 28, padding: 32, boxShadow: "0 20px 60px #00000015" }}>
         <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 24, textAlign: "center" }}>
  {forgotMode ? "🔑 استعادة كلمة المرور" : isRegister ? "✨ إنشاء متجر جديد" : "👋 أهلاً بك"}
</h2>

{forgotMode && (
  forgotSent ? (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
      <p style={{ color: "#111827", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>تم الإرسال!</p>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>راجع بريدك الإلكتروني واضغط على الرابط</p>
      <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, padding: "11px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>رجوع لتسجيل الدخول</button>
    </div>
  ) : (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>البريد الإلكتروني</label>
        <input type="email" placeholder="example@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
      </div>
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>}
      <button className="btn-main" onClick={handleForgotPassword} disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
        {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
      </button>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={() => { setForgotMode(false); setError(""); }} style={{ background: "transparent", border: "none", color: "#ec4899", fontSize: 14, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>← رجوع</button>
      </div>
    </>
  )
)}

         {!forgotMode && isRegister && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>اسم المتجر</label>
                <input type="text" placeholder="مثال: متجر نور للكوزمتك" value={businessName} onChange={e => setBusinessName(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", transition: "border 0.2s" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>رقم الواتساب</label>
                <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>المدينة</label>
                <input type="text" placeholder="مثال: البصرة" value={city} onChange={e => setCity(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
            </>
          )}

         {!forgotMode && (
<>
<div style={{ marginBottom: 14 }}>
  <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>البريد الإلكتروني</label>
  <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
</div>
<div style={{ marginBottom: 24 }}>
  <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>كلمة المرور</label>
  <div style={{ position: "relative" }}>
    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#f9fafb", border: "2px solid #f3f4f6", color: "#111827", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
    <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}>
      {showPassword ? "🙈" : "👁️"}
    </button>
  </div>
</div>
{error && (
  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>
)}
<button className="btn-main" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", boxShadow: "0 4px 20px #ec489933" }}>
  {loading ? "جاري..." : isRegister ? "🚀 إنشاء المتجر" : "دخول ←"}
</button>
<div style={{ textAlign: "center", marginTop: 16 }}>
  <button onClick={() => setIsRegister(!isRegister)} style={{ background: "transparent", border: "none", color: "#ec4899", fontSize: 14, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>
    {isRegister ? "عندي حساب — تسجيل الدخول" : "ما عندي حساب — إنشاء متجر ✨"}
  </button>
  {!isRegister && !forgotMode && (
    <button onClick={() => { setForgotMode(true); setError(""); }} style={{ display: "block", width: "100%", marginTop: 8, background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
      نسيت كلمة المرور؟
    </button>
  )}
</div>
</>
)}


        </div>
      </div>
    </div>
  );
}