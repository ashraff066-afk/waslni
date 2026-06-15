"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../supabase";
 
// ===== فرارة الحظ =====
const PRIZES = [
  { label: "خصم 5%",       color: "#ec4899", emoji: "🎁", type: "discount_5" },
  { label: "حظاً أوفر",    color: "#6b7280", emoji: "😅", type: "none" },
  { label: "خصم 10%",      color: "#a855f7", emoji: "💜", type: "discount_10" },
  { label: "شحن مجاني",    color: "#3b82f6", emoji: "🚚", type: "free_shipping" },
  { label: "منتج مجاني",   color: "#f59e0b", emoji: "🎀", type: "free_product" },
  { label: "حظاً أوفر",    color: "#6b7280", emoji: "😅", type: "none" },
  { label: "خصم 5%",       color: "#ec4899", emoji: "🎁", type: "discount_5" },
  { label: "خصم 10%",      color: "#a855f7", emoji: "💜", type: "discount_10" },
];
 
function LuckySpinner({ onDone }: { onDone: (prize: typeof PRIZES[0]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
 
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const slice = (2 * Math.PI) / PRIZES.length;
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    // ظل خارجي
    ctx.save();
    ctx.shadowColor = "#ec489966";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#1a0a12";
    ctx.fill();
    ctx.restore();
 
    PRIZES.forEach((prize, i) => {
      const start = angle + i * slice;
      const end = start + slice;
 
      // قطعة
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = prize.color + "cc";
      ctx.fill();
      ctx.strokeStyle = "#ffffff22";
      ctx.lineWidth = 1.5;
      ctx.stroke();
 
      // نص
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Tajawal, sans-serif";
      ctx.fillText(prize.emoji + " " + prize.label, r - 10, 4);
      ctx.restore();
    });
 
    // دائرة وسط
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#1a0a12";
    ctx.fill();
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 3;
    ctx.stroke();
 
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Tajawal";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎰", cx, cy);
  };
 
  useEffect(() => {
    drawWheel(0);
  }, []);
 
  const spin = () => {
    if (spinning || spun) return;
    setSpinning(true);
 
    // اختار جائزة عشوائية (مع تحيز بعيد عن "حظاً أوفر")
    const weights = PRIZES.map(p => p.type === "none" ? 1 : 3);
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let prizeIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { prizeIdx = i; break; }
    }
 
    const slice = (2 * Math.PI) / PRIZES.length;
    // زاوية نهائية: السهم فوق (−π/2)، نريد القطعة prizeIdx تكون هناك
    const targetAngle = -Math.PI / 2 - (prizeIdx * slice + slice / 2);
    const totalRotation = Math.PI * 2 * (6 + Math.random() * 3) + targetAngle;
 
    const duration = 4000;
    const start = performance.now();
    const startAngle = angleRef.current;
 
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
 
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const current = startAngle + totalRotation * easeOut(t);
      angleRef.current = current;
      drawWheel(current);
 
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setSpun(true);
        setTimeout(() => onDone(PRIZES[prizeIdx]), 600);
      }
    };
 
    rafRef.current = requestAnimationFrame(animate);
  };
 
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* السهم */}
      <div style={{ position: "relative", width: 260, height: 260 }}>
        <div style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "22px solid #f59e0b",
          zIndex: 10,
          filter: "drop-shadow(0 2px 4px #00000088)"
        }} />
        <canvas ref={canvasRef} width={260} height={260} style={{ borderRadius: "50%", display: "block" }} />
      </div>
 
      <button
        onClick={spin}
        disabled={spinning || spun}
        style={{
          padding: "14px 40px",
          background: spinning || spun
            ? "#ffffff22"
            : "linear-gradient(135deg,#f59e0b,#ec4899)",
          border: "none", borderRadius: 16,
          color: "#fff", fontSize: 16, fontWeight: 800,
          cursor: spinning || spun ? "default" : "pointer",
          fontFamily: "Tajawal,sans-serif",
          transition: "all 0.3s",
          boxShadow: spinning || spun ? "none" : "0 4px 20px #f59e0b44"
        }}
      >
        {spun ? "✅ تم!" : spinning ? "🎰 تدور..." : "🎰 افرّها!"}
      </button>
    </div>
  );
}
 
// ===== الصفحة الرئيسية =====
export default function ShopPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [seller, setSeller] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
 
  // === فرارة الحظ ===
  const [showSpinner, setShowSpinner] = useState(false);
  const [wonPrize, setWonPrize] = useState<typeof PRIZES[0] | null>(null);
  const [savedOrderData, setSavedOrderData] = useState<any>(null); // لحفظ بيانات الطلب قبل الفرارة
 
 const SPINNER_THRESHOLD = 10;// 10,000 دينار
 
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.search.includes("shop=1")) {
      window.location.href = `/shop/${slug}/profile`;
    }
  }, [slug]);
 
  useEffect(() => {
    if (slug) {
      loadData();
      const saved = localStorage.getItem(`cart_${slug}`);
      if (saved) setCart(JSON.parse(saved));
    }
  }, [slug]);
 
  useEffect(() => {
    if (slug) localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);
 
  const loadData = async () => {
    const { data, error } = await supabase.from("sellers").select("*").eq("slug", slug).limit(1);
    if (error || !data || data.length === 0) { setNotFound(true); setLoading(false); return; }
    if (!data[0].is_active) { setNotFound(true); setLoading(false); return; }
    setSeller(data[0]);
    const { data: catsData } = await supabase.from("categories").select("*").eq("seller_id", data[0].id).order("created_at", { ascending: true });
    setCategories(catsData || []);
    const { data: prodsData } = await supabase.from("products").select("*").eq("seller_id", data[0].id).order("created_at", { ascending: false });
    setProducts(prodsData || []);
    setLoading(false);
  };
 
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };
 
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
 
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);
 
  const placeOrder = async () => {
    if (!customerName || !customerPhone || !customerAddress) { alert("يرجى إدخال جميع البيانات"); return; }
    if (customerPhone.replace(/\s/g, '').length !== 11) { alert("رقم الهاتف يجب أن يكون 11 رقم"); return; }
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase.from("orders").select("id").eq("seller_id", seller.id).eq("customer_phone", customerPhone).gte("created_at", today).limit(1);
    if (existing && existing.length > 0) { alert("عندك طلب مسجل بهذا الرقم اليوم!"); return; }
 
    // إذا المجموع يتجاوز الحد → أظهر الفرارة أولاً
    if (total >= SPINNER_THRESHOLD) {
      setSavedOrderData({ customerName, customerPhone, customerAddress, cart: [...cart], total });
      setShowCart(false);
      setShowSpinner(true);
      return;
    }
 
    await submitOrder(null);
  };
 
  const submitOrder = async (prize: typeof PRIZES[0] | null) => {
    setOrdering(true);
    const oNumber = "WS-" + Date.now().toString().slice(-6);
 
    // احسب المجموع النهائي بعد الجائزة
    let finalTotal = savedOrderData?.total ?? total;
    let prizeNote = "";
    if (prize && prize.type !== "none") {
      if (prize.type === "discount_5") {
        finalTotal = Math.round(finalTotal * 0.95);
        prizeNote = `\n🎁 جائزة فرارة الحظ: خصم 5% (وفّرت ${((savedOrderData?.total ?? total) - finalTotal).toLocaleString()} د.ع)`;
      } else if (prize.type === "discount_10") {
        finalTotal = Math.round(finalTotal * 0.90);
        prizeNote = `\n🎁 جائزة فرارة الحظ: خصم 10% (وفّرت ${((savedOrderData?.total ?? total) - finalTotal).toLocaleString()} د.ع)`;
      } else if (prize.type === "free_shipping") {
        prizeNote = "\n🚚 جائزة فرارة الحظ: شحن مجاني!";
      } else if (prize.type === "free_product") {
        prizeNote = "\n🎀 جائزة فرارة الحظ: منتج مجاني! (سيتواصل معك المتجر)";
      }
    }
 
    const orderCart = savedOrderData?.cart ?? cart;
    const orderName = savedOrderData?.customerName ?? customerName;
    const orderPhone = savedOrderData?.customerPhone ?? customerPhone;
    const orderAddress = savedOrderData?.customerAddress ?? customerAddress;
 
    const { error } = await supabase.from("orders").insert([{
      order_number: oNumber,
      seller_id: seller.id,
      customer_name: orderName,
      customer_phone: orderPhone,
      customer_address: orderAddress,
      items: orderCart.map((i: any) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: finalTotal,
      status: "pending",
    }]);
 
    setOrdering(false);
    if (!error) {
      const msg = `🛍️ طلب جديد!\nرقم الطلب: ${oNumber}\nالاسم: ${orderName}\nالهاتف: ${orderPhone}\nالعنوان: ${orderAddress}\nالمنتجات:\n${orderCart.map((i: any) => `• ${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString()} د.ع`).join("\n")}${prizeNote}\n\nالمجموع: ${finalTotal.toLocaleString()} د.ع`;
      window.open(`https://wa.me/${seller.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
      setOrderNumber(oNumber);
      setOrderSuccess(true);
      setCart([]);
      localStorage.removeItem(`cart_${slug}`);
    } else {
      alert("حدث خطأ، حاول مجدداً");
    }
  };
 
  const handleSpinDone = (prize: typeof PRIZES[0]) => {
    setWonPrize(prize);
  };
 
  const handleClaimPrize = async () => {
    await submitOrder(wonPrize);
  };
 
  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategoryId ? p.category_id === activeCategoryId : true;
    const matchSearch = searchProduct ? p.name?.toLowerCase().includes(searchProduct.toLowerCase()) : true;
    return matchCategory && matchSearch;
  });
 
  // ===== شاشات =====
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );
 
  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontFamily: "Tajawal, sans-serif", textAlign: "center", padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');`}</style>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>هذا المتجر غير متاح حالياً</h2>
        <p style={{ color: "#ffffff60", fontSize: 14 }}>يرجى المحاولة لاحقاً</p>
      </div>
    </div>
  );
 
  // ===== شاشة الفرارة =====
  if (showSpinner) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
 
        {!wonPrize ? (
          <>
            <div style={{ marginBottom: 8, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>🎉 طلبك تجاوز {SPINNER_THRESHOLD.toLocaleString()} د.ع</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>فرارة الحظ!</h2>
            <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 24 }}>فرّها واربح جائزة مجانية مع طلبك 🎰</p>
            <LuckySpinner onDone={handleSpinDone} />
          </>
        ) : (
          // شاشة الجائزة
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
 
            {wonPrize.type === "none" ? (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>😅</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>حظاً أوفر المرة الجاية!</h2>
                <p style={{ color: "#ffffff60", fontSize: 14, marginBottom: 28 }}>ما ضاع شي — طلبك وصل وسيتم التواصل معك قريباً</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 72, marginBottom: 12, animation: "pulse 1s infinite" }}>{wonPrize.emoji}</div>
                <div style={{ background: `${wonPrize.color}22`, border: `2px solid ${wonPrize.color}`, borderRadius: 20, padding: "20px 24px", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#ffffff80", marginBottom: 6 }}>🎊 مبروك! ربحت</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: wonPrize.color }}>{wonPrize.label}</div>
                </div>
                <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 24 }}>
                  {wonPrize.type === "discount_5" && `وفّرت ${Math.round((savedOrderData?.total ?? total) * 0.05).toLocaleString()} د.ع على طلبك!`}
                  {wonPrize.type === "discount_10" && `وفّرت ${Math.round((savedOrderData?.total ?? total) * 0.10).toLocaleString()} د.ع على طلبك!`}
                  {wonPrize.type === "free_shipping" && "سيتم التوصيل مجاناً لطلبك!"}
                  {wonPrize.type === "free_product" && "سيتواصل معك المتجر لاختيار هديتك!"}
                </p>
              </>
            )}
 
            <button
              onClick={handleClaimPrize}
              disabled={ordering}
              style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", boxShadow: "0 4px 20px #ec489944" }}
            >
              {ordering ? "جاري تأكيد الطلب..." : wonPrize.type === "none" ? "✅ تأكيد الطلب" : "✅ تأكيد الطلب مع الجائزة"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
 
  // ===== شاشة النجاح =====
  if (orderSuccess) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;-webkit-user-select:none;user-select:none;} input,textarea{-webkit-user-select:text;user-select:text;}`}</style>
      <div style={{ background: "#ffffff10", borderRadius: 24, padding: 32, maxWidth: 420, width: "100%", textAlign: "center", border: "1px solid #ffffff15" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>تم الطلب بنجاح!</h2>
        <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 20 }}>سيتواصل معك المتجر على واتساب للتأكيد</p>
 
        {wonPrize && wonPrize.type !== "none" && (
          <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>
            🎁 جائزتك: {wonPrize.label} مضافة للطلب!
          </div>
        )}
 
        <div style={{ background: "#ec489922", border: "2px solid #ec4899", borderRadius: 14, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#ffffff60", marginBottom: 4 }}>رقم طلبك</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#ec4899", letterSpacing: 2 }}>{orderNumber}</div>
        </div>
 
        <button onClick={() => {
          const msg = `🛍️ طلب جديد!\nرقم الطلب: ${orderNumber}\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\nالعنوان: ${customerAddress}\nالمجموع: ${total.toLocaleString()} د.ع`;
          window.open(`https://wa.me/${seller.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
        }} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }}>
          💬 تواصل عبر واتساب
        </button>
        <button onClick={() => window.location.href = `/shop/${slug}?shop=1`} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
          🛍️ تسوق مجدداً
        </button>
      </div>
    </div>
  );
 
  // ===== الصفحة الرئيسية =====
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 100 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;-webkit-user-select:none;user-select:none;} input,textarea{-webkit-user-select:text;user-select:text;}`}</style>
 
      {/* HEADER */}
      <div style={{ background: "#ffffff10", backdropFilter: "blur(10px)", borderBottom: "1px solid #ffffff15", padding: "16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{seller.business_name}</h1>
            <p style={{ fontSize: 12, color: "#ffffff60" }}>📍 {seller.city}</p>
            <button onClick={() => window.location.href = "/track"} style={{ background: "transparent", border: "none", color: "#a855f7", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700, padding: 0, marginTop: 2 }}>📦 تتبع طلبك</button>
          </div>
          <button onClick={() => setShowCart(!showCart)} style={{ position: "relative", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
            🛒 السلة
            {cartCount > 0 && <span style={{ position: "absolute", top: -6, left: -6, background: "#f59e0b", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#000" }}>{cartCount}</span>}
          </button>
        </div>
      </div>
 
      {/* بحث */}
      <div style={{ padding: "16px 16px 0" }}>
        <input type="text" placeholder="🔍 ابحث عن منتج..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 14, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
      </div>
 
      {/* شريط تلميح الفرارة */}
      {total > 0 && total < SPINNER_THRESHOLD && (
        <div style={{ margin: "12px 16px 0", background: "#f59e0b15", border: "1px solid #f59e0b44", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#f59e0b", fontWeight: 700, textAlign: "center" }}>
          🎰 أضف {(SPINNER_THRESHOLD - total).toLocaleString()} د.ع للطلب وربح جائزة من فرارة الحظ!
        </div>
      )}
      {total >= SPINNER_THRESHOLD && (
        <div style={{ margin: "12px 16px 0", background: "#ec489915", border: "1px solid #ec489944", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#ec4899", fontWeight: 700, textAlign: "center" }}>
          🎰 مبروك! طلبك يؤهلك لفرارة الحظ عند التأكيد!
        </div>
      )}
 
      {/* فلتر الفئات */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 16px 8px", scrollbarWidth: "none" }}>
        <button onClick={() => setActiveCategoryId(null)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 13, fontWeight: 700, background: !activeCategoryId ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff15", color: !activeCategoryId ? "#fff" : "#ffffff80", whiteSpace: "nowrap", flexShrink: 0 }}>الكل</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 13, fontWeight: 700, background: activeCategoryId === cat.id ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff15", color: activeCategoryId === cat.id ? "#fff" : "#ffffff80", whiteSpace: "nowrap", flexShrink: 0 }}>{cat.name}</button>
        ))}
      </div>
 
      {/* المنتجات */}
      <div style={{ padding: "8px 16px" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <div>ما في منتجات بعد</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {filteredProducts.map((p, i) => {
              return (
                <div key={i} onClick={() => window.location.href = `/shop/${slug}/product/${p.id}`} style={{ background: "#ffffff10", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff15", cursor: "pointer" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: 140, background: "#ffffff08", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
                  )}
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 700, marginBottom: 4 }}>
                      {categories.find(c => c.id === p.category_id)?.name || ""}
                    </div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: "#ffffff60", marginBottom: 6, lineHeight: 1.5 }}>{p.description}</div>}
                    <div style={{ color: "#ec4899", fontWeight: 900, fontSize: 15, marginBottom: 10 }}>{p.price?.toLocaleString()} د.ع</div>
                    <button onClick={() => window.location.href = `/shop/${slug}/product/${p.id}`} style={{ width: "100%", padding: "8px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>عرض المنتج ←</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
 
      {/* السلة */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "#000000aa", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowCart(false)}>
          <div dir="rtl" style={{ width: "100%", background: "linear-gradient(135deg,#1a0a12,#150a1e)", borderRadius: "24px 24px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto", border: "1px solid #ffffff15" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 16, fontSize: 17 }}>🛒 سلة التسوق</h3>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#ffffff40" }}>السلة فاضية</div>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #ffffff10" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#ec4899", fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} د.ع</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 6, width: 28, height: 28, color: "#ef4444", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>-</button>
                      <span style={{ color: "#fff", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 6, width: 28, height: 28, color: "#00d4aa", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "2px solid #ffffff20", marginTop: 8 }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>المجموع</span>
                  <span style={{ fontWeight: 900, color: "#ec4899", fontSize: 18 }}>{total.toLocaleString()} د.ع</span>
                </div>
 
                {/* تلميح الفرارة داخل السلة */}
                {total >= SPINNER_THRESHOLD && (
                  <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b44", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#f59e0b", fontWeight: 700, textAlign: "center" }}>
                    🎰 ستحصل على فرارة الحظ مع هذا الطلب!
                  </div>
                )}
 
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📋 بيانات التوصيل</h4>
                  <input type="text" placeholder="اسمك الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }} />
                  <input type="tel" placeholder="رقم الهاتف (واتساب)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }} />
                  <textarea placeholder="عنوان التوصيل بالتفصيل..." value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none", marginBottom: 14 }} />
                  <button onClick={placeOrder} disabled={ordering} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
                    {ordering ? "جاري الطلب..." : total >= SPINNER_THRESHOLD ? "🎰 تأكيد الطلب وافرّ الفرارة!" : "✅ تأكيد الطلب"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
 
      {/* زر السلة الثابت */}
      {cartCount > 0 && !showCart && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "#0a0e1acc", backdropFilter: "blur(10px)", borderTop: "1px solid #ffffff15" }}>
          <button onClick={() => setShowCart(true)} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🛒 عرض السلة ({cartCount})</span>
            <span>{total.toLocaleString()} د.ع</span>
          </button>
        </div>
      )}
    </div>
  );
}
 