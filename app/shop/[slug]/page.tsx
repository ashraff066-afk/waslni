"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../supabase";

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
useEffect(() => {
  if (typeof window !== "undefined" && !window.location.search.includes("shop=1")) {
    window.location.href = `/shop/${slug}/profile`;
  }
}, [slug]);
  useEffect(() => { if (slug) loadData(); }, [slug]);

  const loadData = async () => {
    const { data, error } = await supabase.from("sellers").select("*").eq("slug", slug).limit(1);
    if (error || !data || data.length === 0) { setNotFound(true); setLoading(false); return; }
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
    setOrdering(true);
    const oNumber = "WS-" + Date.now().toString().slice(-6);
    const { error } = await supabase.from("orders").insert([{
      seller_id: seller.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total,
      status: "pending",
    }]);
    setOrdering(false);
    if (!error) {
      const msg = `🛍️ طلب جديد!\nرقم الطلب: ${oNumber}\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\nالعنوان: ${customerAddress}\nالمنتجات:\n${cart.map(i => `• ${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString()} د.ع`).join("\n")}\n\nالمجموع: ${total.toLocaleString()} د.ع`;
      window.open(`https://wa.me/${seller.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
      setOrderNumber(oNumber);
      setOrderSuccess(true);
      setCart([]);
    } else { alert("حدث خطأ، حاول مجدداً"); }
  };

  const filteredProducts = activeCategoryId ? products.filter(p => p.category_id === activeCategoryId) : products;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontFamily: "Tajawal, sans-serif", textAlign: "center" }}>
      <div><div style={{ fontSize: 64, marginBottom: 16 }}>😕</div><h2>المتجر غير موجود</h2></div>
    </div>
  );

if (orderSuccess) return (
  <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
    <div style={{ background: "#ffffff10", borderRadius: 24, padding: 32, maxWidth: 420, width: "100%", textAlign: "center", border: "1px solid #ffffff15" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>تم الطلب بنجاح!</h2>
      <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 20 }}>سيتواصل معك المتجر على واتساب للتأكيد</p>
      <div style={{ background: "#ec489922", border: "2px solid #ec4899", borderRadius: 14, padding: "14px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#ffffff60", marginBottom: 4 }}>رقم طلبك</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#ec4899", letterSpacing: 2 }}>{orderNumber}</div>
      </div>
      <div style={{ background: "#ffffff10", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "right" }}>
        <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📋 تفاصيل طلبك</h4>
        {cart.length === 0 ? null : cart.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ffffff10" }}>
            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{item.name} x{item.qty}</span>
            <span style={{ fontSize: 13, color: "#ec4899", fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} د.ع</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>المجموع</span>
          <span style={{ fontWeight: 900, color: "#ec4899", fontSize: 16 }}>{total.toLocaleString()} د.ع</span>
        </div>
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

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 100 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "#ffffff10", backdropFilter: "blur(10px)", borderBottom: "1px solid #ffffff15", padding: "16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{seller.business_name}</h1>
            <p style={{ fontSize: 12, color: "#ffffff60" }}>📍 {seller.city}</p>
          </div>
          <button onClick={() => setShowCart(!showCart)} style={{ position: "relative", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
            🛒 السلة
            {cartCount > 0 && <span style={{ position: "absolute", top: -6, left: -6, background: "#f59e0b", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#000" }}>{cartCount}</span>}
          </button>
        </div>
      </div>

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
              const inCart = cart.find(c => c.id === p.id);
              return (
                <div key={i} style={{ background: "#ffffff10", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff15" }}>
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
                    {inCart ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff15", borderRadius: 10, padding: "6px 10px" }}>
                        <button onClick={() => updateQty(p.id, inCart.qty - 1)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 6, width: 28, height: 28, color: "#ef4444", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>-</button>
                        <span style={{ color: "#fff", fontWeight: 700 }}>{inCart.qty}</span>
                        <button onClick={() => updateQty(p.id, inCart.qty + 1)} style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 6, width: 28, height: 28, color: "#00d4aa", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} style={{ width: "100%", padding: "8px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>+ أضف للسلة</button>
                    )}
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
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📋 بيانات التوصيل</h4>
                  <input type="text" placeholder="اسمك الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }} />
                  <input type="tel" placeholder="رقم الهاتف (واتساب)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }} />
                  <textarea placeholder="عنوان التوصيل بالتفصيل..." value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none", marginBottom: 14 }} />
                  <button onClick={placeOrder} disabled={ordering} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
                    {ordering ? "جاري الطلب..." : "✅ تأكيد الطلب"}
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