"use client";
import { useState } from "react";
import { supabase } from "../supabase";

type Step = "form" | "plan" | "payment";
type Plan = "trial" | "monthly" | "yearly";
type PayMethod = "rafidain" | "whatsapp";

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
  const [step, setStep] = useState<Step>("form");
  const [plan, setPlan] = useState<Plan>("trial");
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);

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
      // انتقل لخطوة اختيار الخطة
      setLoading(false);
      setStep("plan");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError("بيانات خاطئة"); setLoading(false); return; }
    window.location.href = "/seller/dashboard";
    setLoading(false);
  };

  const handlePlanNext = () => {
    if (plan === "trial") {
      handleRegister();
    } else {
      setStep("payment");
    }
  };

const handleRegister = async () => {
  setLoading(true);
  const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
if (signUpError) {
  if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
    // سجل دخول وأنشئ sellers row
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError("البريد مسجل مسبقاً، حاول تسجيل الدخول"); setStep("form"); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("حدث خطأ، حاول مجدداً"); setStep("form"); setLoading(false); return; }
    const { data: existingSeller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
    if (existingSeller) { window.location.href = "/seller/dashboard"; setLoading(false); return; }
    const slug = "store-" + Date.now().toString().slice(-6);
    const now = new Date();
    let subscription_end: string | null = null;
    if (plan === "trial") { const d = new Date(now); d.setDate(d.getDate() + 14); subscription_end = d.toISOString(); }
    else if (plan === "monthly") { const d = new Date(now); d.setMonth(d.getMonth() + 1); subscription_end = d.toISOString(); }
    else if (plan === "yearly") { const d = new Date(now); d.setFullYear(d.getFullYear() + 1); subscription_end = d.toISOString(); }
    await supabase.from("sellers").insert([{ user_id: user.id, business_name: businessName, phone, city, slug, is_active: plan === "trial", payment_status: plan === "trial" ? "trial" : "pending", subscription_plan: plan, subscription_end }]);
    window.location.href = "/seller/dashboard";
    setLoading(false);
    return;
  }
  setError(signUpError.message); setStep("form"); setLoading(false); return;
}

  const userId = data.user?.id;
if (!userId) {
  // الإيميل مسجل بـ auth — نسجل دخول ونكمل
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) { setError("البريد مسجل مسبقاً، حاول تسجيل الدخول"); setStep("form"); setLoading(false); return; }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { setError("حدث خطأ، حاول مجدداً"); setStep("form"); setLoading(false); return; }
  // تحقق لو عنده sellers row
  const { data: existingSeller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
  if (existingSeller) { window.location.href = "/seller/dashboard"; setLoading(false); return; }
  // ما عنده — أنشئ له row جديد
  const slug = "store-" + Date.now().toString().slice(-6);
  const now = new Date();
  let subscription_end: string | null = null;
  if (plan === "trial") { const d = new Date(now); d.setDate(d.getDate() + 14); subscription_end = d.toISOString(); }
  else if (plan === "monthly") { const d = new Date(now); d.setMonth(d.getMonth() + 1); subscription_end = d.toISOString(); }
  else if (plan === "yearly") { const d = new Date(now); d.setFullYear(d.getFullYear() + 1); subscription_end = d.toISOString(); }
  await supabase.from("sellers").insert([{ user_id: user.id, business_name: businessName, phone, city, slug, is_active: plan === "trial", payment_status: plan === "trial" ? "trial" : "pending", subscription_plan: plan, subscription_end }]);
  window.location.href = "/seller/dashboard";
  setLoading(false);
  return;
}

  // تحقق لو عنده row بـ sellers
  const { data: existingSeller } = await supabase.from("sellers").select("id").eq("user_id", userId).single();
  if (existingSeller) { window.location.href = "/seller/dashboard"; setLoading(false); return; }

  const slug = "store-" + Date.now().toString().slice(-6);
  const now = new Date();
  let subscription_end: string | null = null;
  if (plan === "trial") {
    const d = new Date(now); d.setDate(d.getDate() + 14);
    subscription_end = d.toISOString();
  } else if (plan === "monthly") {
    const d = new Date(now); d.setMonth(d.getMonth() + 1);
    subscription_end = d.toISOString();
  } else if (plan === "yearly") {
    const d = new Date(now); d.setFullYear(d.getFullYear() + 1);
    subscription_end = d.toISOString();
  }

  await supabase.from("sellers").insert([{
    user_id: userId,
    business_name: businessName,
    phone,
    city,
    slug,
    is_active: plan === "trial",
    payment_status: plan === "trial" ? "trial" : "pending",
    subscription_plan: plan,
    subscription_end,
  }]);

  window.location.href = "/seller/dashboard";
  setLoading(false);
};

  const handleWhatsapp = () => {
    const planLabel = plan === "monthly" ? "الشهري (35,000 د.ع)" : "السنوي (350,000 د.ع)";
    const msg = encodeURIComponent(
      `مرحباً، أريد الاشتراك في Shopli\nالخطة: ${planLabel}\nاسم المتجر: ${businessName}\nالمدينة: ${city}`
    );
    window.open(`https://wa.me/9647739863056?text=${msg}`, "_blank");
    handleRegister();
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "#f9fafb", border: "2px solid #f3f4f6",
    color: "#111827", fontSize: 14, outline: "none",
    fontFamily: "Tajawal,sans-serif", transition: "border 0.2s",
  };

  const btnMain: React.CSSProperties = {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#ec4899,#a855f7)",
    border: "none", borderRadius: 14, fontSize: 16,
    fontWeight: 800, cursor: "pointer", color: "#fff",
    fontFamily: "Tajawal,sans-serif",
    boxShadow: "0 4px 20px #ec489933", transition: "all 0.2s",
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #ec4899 !important; box-shadow: 0 0 0 3px #ec489922; }
        .btn-main:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #ec489955 !important; }
        .plan-card { border: 2px solid #f3f4f6; border-radius: 16px; padding: 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
        .plan-card:hover { border-color: #ec4899; }
        .plan-card.selected { border-color: #ec4899; background: #fdf2f8; }
        .pay-card { border: 2px solid #f3f4f6; border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; }
        .pay-card:hover { border-color: #ec4899; }
        .pay-card.selected { border-color: #ec4899; background: #fdf2f8; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,#ec4899,#a855f7)", boxShadow: "0 12px 40px #ec489944", marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>🛍️</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, background: "linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Shopli</h1>
          <p style={{ color: "#9ca3af", fontSize: 15, marginTop: 6, fontWeight: 500 }}>منصة البيع والتوصيل</p>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 28, padding: 32, boxShadow: "0 20px 60px #00000015" }}>

          {/* ===== STEP: FORM ===== */}
          {step === "form" && (
            <>
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
                      <input type="email" placeholder="example@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inp} />
                    </div>
                    {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>}
                    <button className="btn-main" onClick={handleForgotPassword} disabled={loading} style={btnMain}>
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
                    <input type="text" placeholder="مثال: متجر نور للكوزمتك" value={businessName} onChange={e => setBusinessName(e.target.value)} style={inp} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>رقم الواتساب</label>
                    <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={inp} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>المدينة</label>
                    <input type="text" placeholder="مثال: البصرة" value={city} onChange={e => setCity(e.target.value)} style={inp} />
                  </div>
                </>
              )}

              {!forgotMode && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>البريد الإلكتروني</label>
                    <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>كلمة المرور</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
                      <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}>
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>}
                  <button className="btn-main" onClick={handleSubmit} disabled={loading} style={btnMain}>
                    {loading ? "جاري..." : isRegister ? "التالي ←" : "دخول ←"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button onClick={() => { setIsRegister(!isRegister); setError(""); }} style={{ background: "transparent", border: "none", color: "#ec4899", fontSize: 14, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>
                      {isRegister ? "عندي حساب — تسجيل الدخول" : "ما عندي حساب — إنشاء متجر ✨"}
                    </button>
                    {!isRegister && (
                      <button onClick={() => { setForgotMode(true); setError(""); }} style={{ display: "block", width: "100%", marginTop: 8, background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ===== STEP: PLAN ===== */}
          {step === "plan" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8, textAlign: "center" }}>💎 اختر خطتك</h2>
              <p style={{ color: "#6b7280", fontSize: 13, textAlign: "center", marginBottom: 24 }}>يمكنك الترقية في أي وقت</p>

              {/* Trial */}
              <div className={`plan-card${plan === "trial" ? " selected" : ""}`} onClick={() => setPlan("trial")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>🎁 تجربة مجانية</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>أسبوعين مجاناً — بدون دفع</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === "trial" ? "#ec4899" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {plan === "trial" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }} />}
                  </div>
                </div>
              </div>

              {/* Monthly */}
              <div className={`plan-card${plan === "monthly" ? " selected" : ""}`} onClick={() => setPlan("monthly")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>📅 شهري</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>35,000 دينار / شهر</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === "monthly" ? "#ec4899" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {plan === "monthly" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }} />}
                  </div>
                </div>
              </div>

              {/* Yearly */}
              <div className={`plan-card${plan === "yearly" ? " selected" : ""}`} onClick={() => setPlan("yearly")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>🏆 سنوي</span>
<span style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>عرض خاص</span>
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                     <span style={{ textDecoration: "line-through", marginLeft: 6 }}>350,000</span>
<span style={{ color: "#ec4899", fontWeight: 700 }}>300,000 دينار / سنة</span>
                    </div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === "yearly" ? "#ec4899" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {plan === "yearly" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }} />}
                  </div>
                </div>
              </div>

              <button className="btn-main" onClick={handlePlanNext} style={{ ...btnMain, marginTop: 8 }}>
                {plan === "trial" ? "🚀 ابدأ مجاناً" : "التالي — اختر طريقة الدفع ←"}
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button onClick={() => setStep("form")} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>← رجوع</button>
              </div>
            </>
          )}

          {/* ===== STEP: PAYMENT ===== */}
          {step === "payment" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8, textAlign: "center" }}>💳 طريقة الدفع</h2>
              <div style={{ background: "linear-gradient(135deg,#fdf2f8,#f5f3ff)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>المبلغ المطلوب: </span>
                <span style={{ color: "#ec4899", fontWeight: 800, fontSize: 16 }}>
               {plan === "monthly" ? "35,000" : "300,000"} دينار عراقي
                </span>
              </div>

              {/* Rafidain */}
              <div className={`pay-card${payMethod === "rafidain" ? " selected" : ""}`} onClick={() => setPayMethod("rafidain")}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#1e40af,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>مصرف الرافدين</div>
                  <div style={{ color: "#6b7280", fontSize: 12, marginTop: 3 }}>تحويل بنكي مباشر</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${payMethod === "rafidain" ? "#ec4899" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {payMethod === "rafidain" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }} />}
                </div>
              </div>

              

              {/* WhatsApp */}
              <div className={`pay-card${payMethod === "whatsapp" ? " selected" : ""}`} onClick={() => setPayMethod("whatsapp")}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>واتساب</div>
                  <div style={{ color: "#6b7280", fontSize: 12, marginTop: 3 }}>تواصل مباشر لإتمام الدفع</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${payMethod === "whatsapp" ? "#ec4899" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {payMethod === "whatsapp" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }} />}
                </div>
              </div>

              {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>}

              <button
                className="btn-main"
                disabled={!payMethod || loading}
                onClick={() => {
                  if (payMethod === "whatsapp") handleWhatsapp();
else if (payMethod === "rafidain") {
  const planLabel = plan === "monthly" ? "الشهري (35,000 د.ع)" : "السنوي (300,000 د.ع)";
  const msg = encodeURIComponent(`مرحباً، أريد الدفع الإلكتروني للاشتراك في Shopli\nالخطة: ${planLabel}\nاسم المتجر: ${businessName}\nالمدينة: ${city}`);
  window.open(`https://wa.me/9647739863056?text=${msg}`, "_blank");
  handleRegister();
}
                }}
                style={{ ...btnMain, marginTop: 8, opacity: !payMethod ? 0.5 : 1 }}
              >
                {loading ? "جاري..." : payMethod === "whatsapp" ? "💬 فتح واتساب" : payMethod === "rafidain" ? "✅ أكملت التحويل" : "اختر طريقة الدفع"}
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button onClick={() => setStep("plan")} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>← رجوع</button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}