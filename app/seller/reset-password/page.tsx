"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError("");
    if (!password || !confirm) { setError("يرجى إدخال كلمة المرور"); return; }
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    if (password !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setTimeout(() => window.location.href = "/seller/dashboard", 2000);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>تعيين كلمة مرور جديدة</h1>
        </div>

        {success ? (
          <div style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#00d4aa", fontWeight: 700, fontSize: 16 }}>تم تغيير كلمة المرور!</p>
            <p style={{ color: "#ffffff60", fontSize: 13, marginTop: 8 }}>جاري تحويلك...</p>
          </div>
        ) : (
          <div style={{ background: "#ffffff10", borderRadius: 20, padding: 24, border: "1px solid #ffffff15" }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>كلمة المرور الجديدة</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#ffffff60" }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>تأكيد كلمة المرور</label>
              <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
            </div>
            {error && (
              <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>
            )}
            <button onClick={handleReset} disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
              {loading ? "جاري الحفظ..." : "✅ تغيير كلمة المرور"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}