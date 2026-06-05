"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function SellerDashboard() {
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [thisMonth, setThisMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productDesc, setProductDesc] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productCategoryId, setProductCategoryId] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [settingsName, setSettingsName] = useState("");
const [settingsPhone, setSettingsPhone] = useState("");
const [settingsCity, setSettingsCity] = useState("");
const [settingsImage, setSettingsImage] = useState<File | null>(null);
const [settingsDescription, setSettingsDescription] = useState("");
const [savingSettings, setSavingSettings] = useState(false);
const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/seller"; return; }
    const { data: sellerData } = await supabase.from("sellers").select("*").eq("user_id", user.id).single();
    if (!sellerData) { window.location.href = "/seller"; return; }
    if (sellerData.payment_status === "pending") {
  setSeller(sellerData);
  setLoading(false);
  return;
}
    if (sellerData.payment_status === "pending") {
  setLoading(false);
  setSeller(sellerData);
  return;
}
    const daysLeft = sellerData.subscription_end ? Math.ceil((new Date(sellerData.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
if (daysLeft <= 0) { window.location.href = "/seller/expired"; return; }
    setSeller(sellerData);
    setSettingsName(sellerData.business_name || "");
setSettingsPhone(sellerData.phone || "");
setSettingsCity(sellerData.city || "");
setSettingsDescription(sellerData.description || "");

    const { data: catsData } = await supabase.from("categories").select("*").eq("seller_id", sellerData.id).order("created_at", { ascending: true });
    setCategories(catsData || []);

    const { data: productsData } = await supabase.from("products").select("*").eq("seller_id", sellerData.id).order("created_at", { ascending: false });
    setProducts(productsData || []);

    const { data: ordersData } = await supabase.from("orders").select("*").eq("seller_id", sellerData.id).order("created_at", { ascending: false });
    setOrders(ordersData || []);
    const now = new Date();
setThisMonth((ordersData || []).filter((o: any) => {
  const d = new Date(o.created_at);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}));
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !seller) return;
    setAddingCategory(true);
    await supabase.from("categories").insert([{ seller_id: seller.id, name: newCategoryName.trim() }]);
    setNewCategoryName("");
    setAddingCategory(false);
    checkUser();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    checkUser();
  };

  const addProduct = async () => {
    if (!productName.trim() || !seller) return;
    setAddingProduct(true);
    let imageUrl = "";
    if (productImage) {
      const ext = productImage.name.split(".").pop();
      const path = `${seller.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, productImage, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
    }
    await supabase.from("products").insert([{ seller_id: seller.id, name: productName, description: productDesc, price: productPrice, image_url: imageUrl, category_id: productCategoryId || null }]);
    setProductName(""); setProductDesc(""); setProductPrice(0); setProductImage(null); setProductCategoryId("");
    setAddingProduct(false);
    checkUser();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    checkUser();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    checkUser();
  };
const saveSettings = async () => {
  if (!seller) return;
  setSavingSettings(true);
  let imageUrl = seller.image_url || "";
  if (settingsImage) {
    const ext = settingsImage.name.split(".").pop();
    const path = `${seller.id}.${ext}`;
    const { error } = await supabase.storage.from("seller-images").upload(path, settingsImage, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("seller-images").getPublicUrl(path);
      imageUrl = data.publicUrl;
    }
  }
await supabase.from("sellers").update({ business_name: settingsName, phone: settingsPhone, city: settingsCity, image_url: imageUrl, description: settingsDescription }).eq("id", seller.id);
  setSavingSettings(false);
  setSettingsSaved(true);
  setTimeout(() => setSettingsSaved(false), 3000);
  checkUser();
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/seller";
  };
if (seller?.payment_status === "pending") return (
  <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Tajawal, sans-serif" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');`}</style>
    <div style={{ background: "#ffffff10", borderRadius: 24, padding: 32, maxWidth: 380, width: "100%", textAlign: "center", border: "1px solid #ffffff15" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
      <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>حسابك قيد المراجعة</h2>
      <p style={{ color: "#ffffff80", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
        تم استلام طلبك بنجاح!<br />
        سيتم تفعيل متجرك بعد تأكيد الدفع
      </p>
      <div style={{ background: "#ffffff08", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
        <p style={{ color: "#ffffff60", fontSize: 12, marginBottom: 6 }}>الخطة المختارة</p>
        <p style={{ color: "#a855f7", fontWeight: 800, fontSize: 15 }}>
          {seller?.subscription_plan === "monthly" ? "شهري — 50,000 د.ع" : "سنوي — 300,000 د.ع"}
        </p>
      </div>
      <button
        onClick={() => window.open("https://wa.me/9647739863056?text=أريد تأكيد دفعي واشتراكي في وصلني", "_blank")}
        style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#25d366,#128C7E)", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif", marginBottom: 12 }}
      >
        💬 تواصل معنا عبر واتساب
      </button>
      <button
        onClick={async () => { await supabase.auth.signOut(); window.location.href = "/seller"; }}
        style={{ background: "transparent", border: "none", color: "#ffffff40", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}
      >
        خروج
      </button>
    </div>
  </div>
);
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  const filteredProducts = activeCategoryId ? products.filter(p => p.category_id === activeCategoryId) : products;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a0a12,#150a1e)", color: "#e2e8f0", fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 80 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "#ffffff10", backdropFilter: "blur(10px)", borderBottom: "1px solid #ffffff15", padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛍️</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{seller?.business_name}</h1>
              <p style={{ fontSize: 11, color: "#ffffff60" }}>{seller?.city}</p>
            </div>
          </div>
          <button onClick={() => {
  navigator.clipboard.writeText(`${window.location.origin}/shop/${seller?.slug}`);
  alert("تم نسخ رابط متجرك! 🎉");
}} style={{ background: "#a855f722", border: "1px solid #a855f7", borderRadius: 8, padding: "7px 14px", color: "#a855f7", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12, marginLeft: 8 }}>🔗 رابط المتجر</button>
          <button onClick={handleLogout} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "7px 14px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12 }}>خروج</button>
        </div>
      </div>
{/* تنبيه الاشتراك */}
{(() => {
  const daysLeft = seller?.subscription_end ? Math.ceil((new Date(seller.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  if (daysLeft > 7) return null;
  return (
    <div style={{ background: daysLeft <= 3 ? "#ef444422" : "#f59e0b22", border: `1px solid ${daysLeft <= 3 ? "#ef4444" : "#f59e0b"}`, margin: "12px 16px 0", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 22 }}>{daysLeft <= 3 ? "🚨" : "⚠️"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: daysLeft <= 3 ? "#ef4444" : "#f59e0b", fontSize: 13 }}>
          {daysLeft <= 0 ? "انتهى اشتراكك!" : `ينتهي اشتراكك خلال ${daysLeft} أيام`}
        </div>
      </div>
      <button onClick={() => window.open("https://wa.me/9647739863056?text=أريد تجديد اشتراكي في وصلني", "_blank")} style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", whiteSpace: "nowrap" }}>تجديد</button>
    </div>
  );
})()}
      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: "16px" }}>
        {[
          { label: "الطلبات", value: orders.length, icon: "📦", color: "#ec4899" },
          { label: "المنتجات", value: products.length, icon: "🛍️", color: "#a855f7" },
          { label: "الفئات", value: categories.length, icon: "📂", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#ffffff10", borderRadius: 16, padding: "16px 10px", textAlign: "center", border: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#ffffff60", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px", overflowX: "auto" }}>
        {[
          { id: "orders", label: "📦 الطلبات" },
          { id: "catalog", label: "🗂️ الكاتالوج" },
          { id: "add", label: "➕ إضافة" },
          { id: "stats", label: "📊 الإحصاء" },
          { id: "settings", label: "⚙️ الإعدادات" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "9px 18px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === t.id ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff10", color: activeTab === t.id ? "#fff" : "#ffffff80", border: "none", whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div>ما في طلبات بعد</div>
              </div>
            ) : orders.map((o, i) => (
              <div key={i} style={{ background: "#ffffff10", borderRadius: 16, padding: 16, marginBottom: 12, border: "1px solid #ffffff15" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: "#ffffff60", marginTop: 2 }}>📱 {o.customer_phone}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 700, background: o.status === "confirmed" ? "#00d4aa22" : o.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: o.status === "confirmed" ? "#00d4aa" : o.status === "cancelled" ? "#ef4444" : "#f59e0b", border: `1px solid ${o.status === "confirmed" ? "#00d4aa44" : o.status === "cancelled" ? "#ef444444" : "#f59e0b44"}` }}>
                    {o.status === "confirmed" ? "مؤكد" : o.status === "cancelled" ? "ملغي" : "انتظار"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#ffffff80", marginBottom: 8 }}>📍 {o.customer_address}</div>
                <div style={{ fontSize: 13, color: "#ec4899", fontWeight: 700, marginBottom: 10 }}>💰 {o.total?.toLocaleString()} د.ع</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {o.status === "pending" && (
                    <button onClick={() => updateOrderStatus(o.id, "confirmed")} style={{ flex: 1, background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 10, padding: "8px", color: "#00d4aa", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>✅ تأكيد</button>
                  )}
                  {o.status !== "cancelled" && (
                    <button onClick={() => updateOrderStatus(o.id, "cancelled")} style={{ flex: 1, background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "8px", color: "#ef4444", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>❌ إلغاء</button>
                  )}
                  <button onClick={() => {
                    const items = o.items?.map((item: any) => `${item.name} x${item.qty}`).join("، ");
                    const msg = `🛍️ طلب جديد!\nالاسم: ${o.customer_name}\nالهاتف: ${o.customer_phone}\nالعنوان: ${o.customer_address}\nالمنتجات: ${items}\nالمجموع: ${o.total?.toLocaleString()} د.ع`;
                    window.open(`https://wa.me/${o.customer_phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
                  }} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 10, padding: "8px 14px", color: "#25d366", fontSize: 14, cursor: "pointer" }}>📱</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CATALOG */}
        {activeTab === "catalog" && (
          <div>
            {/* فلتر الفئات */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
              <button onClick={() => setActiveCategoryId(null)} style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12, fontWeight: 700, background: !activeCategoryId ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff15", color: !activeCategoryId ? "#fff" : "#ffffff80", whiteSpace: "nowrap", flexShrink: 0 }}>
                🛍️ الكل ({products.length})
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12, fontWeight: 700, background: activeCategoryId === cat.id ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#ffffff15", color: activeCategoryId === cat.id ? "#fff" : "#ffffff80", whiteSpace: "nowrap", flexShrink: 0 }}>
                  📂 {cat.name} ({products.filter(p => p.category_id === cat.id).length})
                </button>
              ))}
            </div>

            {/* المنتجات */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#ffffff40" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
                <div>ما في منتجات في هذه الفئة</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {filteredProducts.map((p, i) => (
                  <div key={i} style={{ background: "#ffffff10", borderRadius: 16, overflow: "hidden", border: "1px solid #ffffff15" }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: 130, background: "#ffffff10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛍️</div>
                    )}
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 700, marginBottom: 4 }}>
                        {categories.find(c => c.id === p.category_id)?.name || "بدون فئة"}
                      </div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ color: "#ec4899", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{p.price?.toLocaleString()} د.ع</div>
<div style={{ display: "flex", gap: 6 }}>
  <button onClick={async () => {
    await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    checkUser();
  }} style={{ flex: 1, background: p.in_stock ? "#f59e0b22" : "#00d4aa22", border: `1px solid ${p.in_stock ? "#f59e0b" : "#00d4aa"}`, borderRadius: 8, padding: "6px", color: p.in_stock ? "#f59e0b" : "#00d4aa", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>
    {p.in_stock ? "نفذ" : "✅ متاح"}
  </button>
  <button onClick={() => deleteProduct(p.id)} style={{ flex: 1, background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "6px", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>🗑️ حذف</button>
</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* STATS */}
{activeTab === "stats" && (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
      {[
        { icon: "📦", label: "إجمالي الطلبات", value: orders.length, color: "#ec4899" },
        { icon: "📅", label: "هذا الشهر", value: thisMonth.length, color: "#a855f7" },
        { icon: "✅", label: "مؤكدة", value: orders.filter(o => o.status === "confirmed").length, color: "#00d4aa" },
        { icon: "⏳", label: "انتظار", value: orders.filter(o => o.status === "pending").length, color: "#f59e0b" },
        { icon: "🛍️", label: "المنتجات", value: products.length, color: "#ec4899" },
        { icon: "📂", label: "الفئات", value: categories.length, color: "#a855f7" },
      ].map((s, i) => (
        <div key={i} style={{ background: "#ffffff10", borderRadius: 16, padding: 16, border: "1px solid #ffffff15" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 12, color: "#ffffff60", marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* آخر الطلبات */}
    <div style={{ background: "#ffffff10", borderRadius: 16, padding: 16, border: "1px solid #ffffff15" }}>
      <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 14, fontSize: 14 }}>📋 آخر الطلبات</h3>
      {thisMonth.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: "#ffffff40", fontSize: 13 }}>ما في طلبات هذا الشهر</div>
      ) : (
        thisMonth.slice(0, 5).map((o, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(thisMonth.length, 5) - 1 ? "1px solid #ffffff10" : "none" }}>
            <div>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{o.customer_name}</div>
              <div style={{ fontSize: 11, color: "#ffffff60" }}>{o.customer_phone}</div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, color: "#ec4899", fontWeight: 700 }}>{o.total?.toLocaleString()} د.ع</div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: o.status === "confirmed" ? "#00d4aa22" : o.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: o.status === "confirmed" ? "#00d4aa" : o.status === "cancelled" ? "#ef4444" : "#f59e0b" }}>
                {o.status === "confirmed" ? "مؤكد" : o.status === "cancelled" ? "ملغي" : "انتظار"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
{/* SETTINGS */}
{activeTab === "settings" && (
  <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, border: "1px solid #ffffff15" }}>
    <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 20, fontSize: 16 }}>⚙️ إعدادات المتجر</h3>

    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>اسم المتجر</label>
      <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
    </div>

    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>رقم الواتساب</label>
      <input type="tel" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
    </div>

    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>المدينة</label>
      <input type="text" value={settingsCity} onChange={e => setSettingsCity(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
    </div>
<div style={{ marginBottom: 14 }}>
  <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>📝 وصف المتجر</label>
  <textarea placeholder="اكتب وصفاً قصيراً عن متجرك..." value={settingsDescription} onChange={e => setSettingsDescription(e.target.value)} rows={3} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none" }} />
</div>
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>📸 صورة المتجر</label>
      {seller?.image_url && (
        <img src={seller.image_url} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 12, marginBottom: 10, border: "1px solid #ffffff20" }} />
      )}
      <input type="file" accept="image/*" onChange={e => setSettingsImage(e.target.files?.[0] || null)} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "#ffffff15", border: "1px dashed #ec489966", color: "#fff", fontSize: 13, fontFamily: "Tajawal,sans-serif", cursor: "pointer" }} />
    </div>

    <button onClick={saveSettings} disabled={savingSettings} style={{ width: "100%", padding: "14px", background: settingsSaved ? "#00d4aa" : "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
      {savingSettings ? "جاري الحفظ..." : settingsSaved ? "✅ تم الحفظ!" : "💾 حفظ الإعدادات"}
    </button>
  </div>
)}
        {/* ADD */}
        {activeTab === "add" && (
          <div>
            {/* إضافة فئة */}
            <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, border: "1px solid #ffffff15", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 16, fontSize: 15 }}>📂 إضافة فئة جديدة</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="مثال: شامبو، كريمات، عطور..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                <button onClick={addCategory} disabled={addingCategory || !newCategoryName.trim()} style={{ padding: "12px 20px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>+ إضافة</button>
              </div>
              {categories.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {categories.map(cat => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff15", borderRadius: 20, padding: "6px 12px" }}>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>📂 {cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* إضافة منتج */}
            <div style={{ background: "#ffffff10", borderRadius: 20, padding: 20, border: "1px solid #ffffff15" }}>
              <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 16, fontSize: 15 }}>🛍️ إضافة منتج جديد</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>الفئة</label>
                <select value={productCategoryId} onChange={e => setProductCategoryId(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                  <option value="">بدون فئة</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>اسم المنتج</label>
                <input type="text" placeholder="مثال: شامبو بانتين" value={productName} onChange={e => setProductName(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>الوصف (اختياري)</label>
                <textarea placeholder="وصف المنتج..." value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={2} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>السعر (د.ع)</label>
<input type="number" placeholder="0" min="0" value={productPrice || ""} onChange={e => setProductPrice(Math.abs(Number(e.target.value)))} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#ffffff15", border: "1px solid #ffffff20", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "#ffffff80", marginBottom: 6, fontWeight: 600 }}>صورة المنتج</label>
                <input type="file" accept="image/*" onChange={e => setProductImage(e.target.files?.[0] || null)} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "#ffffff15", border: "1px dashed #ec489966", color: "#fff", fontSize: 13, fontFamily: "Tajawal,sans-serif", cursor: "pointer" }} />
              </div>
              <button onClick={addProduct} disabled={addingProduct || !productName.trim()} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ec4899,#a855f7)", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", color: "#fff", fontFamily: "Tajawal,sans-serif" }}>
                {addingProduct ? "جاري الإضافة..." : "🚀 إضافة المنتج"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}