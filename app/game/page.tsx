"use client";
import { useState, useEffect, useCallback, useRef, type MouseEvent, type CSSProperties } from "react";

// ─────────────────── Types ───────────────────
interface BuildingDef {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseIncome: number;
  description: string;
}

interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  gemCost?: number;
  requires?: string;
}

interface SavedState {
  gold: number;
  gems: number;
  buildings: Record<string, number>;
  upgrades: Record<string, boolean>;
  lastAdTime: number;
  boostEndTime: number;
  totalGoldEarned: number;
  totalClicks: number;
  adsWatched: number;
  lastSaved: number;
}

// ─────────────────── Config ───────────────────
const BUILDING_DEFS: BuildingDef[] = [
  { id: "mine",    name: "فE�E�فE,  emoji: "⛏︁E,  baseCost: 50,    baseIncome: 0.5,  description: "يستخرج افE�فE� ببطء فE�E�EباستفE�ار" },
  { id: "farm",    name: "فE�رعة", emoji: "🌾",  baseCost: 200,   baseIncome: 2,    description: "تفE�ج ثروة أفE�ر فE�EافE�E�E�فE },
  { id: "market",  name: "سوفE,   emoji: "🏪",  baseCost: 800,   baseIncome: 8,    description: "افE�جارة فE�بحة جدافE },
  { id: "factory", name: "فE�فE�",  emoji: "🏭",  baseCost: 3000,  baseIncome: 30,   description: "إفE�اج صفE�عفEضخفE },
  { id: "bank",    name: "بفE�E,   emoji: "🏦",  baseCost: 12000, baseIncome: 100,  description: "اجعفEذفE�فEيوفE�د ذفE�افE },
];

const UPGRADE_DEFS: UpgradeDef[] = [
  { id: "pick2",        name: "فE�س فE�سّفE�",      description: "افE�E�ر يعطفE2ÁEذفE�",           cost: 100    },
  { id: "pick5",        name: "فE�س افE�بير",       description: "افE�E�ر يعطفE5ÁEذفE�",           cost: 500,  requires: "pick2"    },
  { id: "pick10",       name: "فE�س افE�سطورة",     description: "افE�E�ر يعطفE10ÁEذفE�",          cost: 50, gemCost: 30, requires: "pick5" },
  { id: "mine2",        name: "فE�فE�رات افE�E�E�فE,    description: "افE�E�E�فEيفE�ج 2ÁEأفE�ر",         cost: 200    },
  { id: "farm2",        name: "رفEفE�طور",          description: "افE�E�رعة تفE�ج 2ÁEأفE�ر",        cost: 600    },
  { id: "market2",      name: "طرفEتجارية",        description: "افE�وفEيفE�ج 2ÁEأفE�ر",          cost: 2000   },
  { id: "factory2",     name: "أتفE�ة افE�E�فE�",      description: "افE�E�فE� يفE�ج 2ÁEأفE�ر",         cost: 8000   },
  { id: "all2",         name: "افE�E�E�ة افE�فE�ية",    description: "جفE�ع افE�E�افE�EتفE�ج 2ÁEأفE�ر",   cost: 100, gemCost: 50 },
];

const AD_COOLDOWN_SEC = 30;
const BOOST_DURATION_SEC = 60;
const AD_WATCH_SEC = 5;

const AD_REWARDS = [
  { type: "gold",  label: "💰 500 ذفE�",       gold: 500,  gems: 0 },
  { type: "gold",  label: "💰 1000 ذفE�",      gold: 1000, gems: 0 },
  { type: "gems",  label: "💎 30 جوفE�ة",       gold: 0,    gems: 30 },
  { type: "gems",  label: "💎 60 جوفE�ة",       gold: 0,    gems: 60 },
  { type: "boost", label: "⚡ 2ÁEفE�E�ة دقيقة",  gold: 200,  gems: 0 },
  { type: "big",   label: "🎁 حزفE� فE�يرة",     gold: 800,  gems: 20 },
];

// ─────────────────── Helpers ───────────────────
function buildingCost(def: BuildingDef, owned: number) {
  return Math.floor(def.baseCost * Math.pow(1.15, owned));
}

function formatNum(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " فE�E�ار";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " فE�E�وفE;
  if (n >= 1e3) return (n / 1e3).toFixed(1) + " أفE�E;
  return Math.floor(n).toLocaleString("ar");
}

function computeClickPower(upgrades: Record<string, boolean>): number {
  if (upgrades["pick10"]) return 10;
  if (upgrades["pick5"]) return 5;
  if (upgrades["pick2"]) return 2;
  return 1;
}

function computeGPS(
  buildings: Record<string, number>,
  upgrades: Record<string, boolean>,
  boosted: boolean
): number {
  let total = 0;
  for (const def of BUILDING_DEFS) {
    let income = def.baseIncome * (buildings[def.id] || 0);
    if (upgrades[`${def.id}2`]) income *= 2;
    if (upgrades["all2"]) income *= 2;
    total += income;
  }
  if (boosted) total *= 2;
  return total;
}

const SAVE_KEY = "idle_game_v2";

function loadSave(): SavedState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as SavedState;
  } catch {}
  return {
    gold: 0, gems: 0,
    buildings: {}, upgrades: {},
    lastAdTime: 0, boostEndTime: 0,
    totalGoldEarned: 0, totalClicks: 0, adsWatched: 0,
    lastSaved: Date.now(),
  };
}

// ─────────────────── Component ───────────────────
export default function GamePage() {
  const [gold, setGold] = useState(0);
  const [gems, setGems] = useState(0);
  const [buildings, setBuildings] = useState<Record<string, number>>({});
  const [upgrades, setUpgrades] = useState<Record<string, boolean>>({});
  const [lastAdTime, setLastAdTime] = useState(0);
  const [boostEndTime, setBoostEndTime] = useState(0);
  const [totalGoldEarned, setTotalGoldEarned] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);

  const [tab, setTab] = useState<"game" | "buildings" | "upgrades" | "stats">("game");
  const [adPhase, setAdPhase] = useState<"idle" | "watching" | "reward">("idle");
  const [adProgress, setAdProgress] = useState(0);
  const [currentReward, setCurrentReward] = useState(AD_REWARDS[0]);
  const [adCooldown, setAdCooldown] = useState(0);
  const [boosted, setBoosted] = useState(false);
  const [boostLeft, setBoostLeft] = useState(0);
  const [clickAnim, setClickAnim] = useState(false);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  const stateRef = useRef({ gold, gems, buildings, upgrades, lastAdTime, boostEndTime, totalGoldEarned, totalClicks, adsWatched });
  stateRef.current = { gold, gems, buildings, upgrades, lastAdTime, boostEndTime, totalGoldEarned, totalClicks, adsWatched };

  const floatId = useRef(0);

  // ── Load save ──
  useEffect(() => {
    const save = loadSave();
    const elapsed = (Date.now() - save.lastSaved) / 1000;
    const offlineGPS = computeGPS(save.buildings, save.upgrades, false);
    const offlineGold = Math.min(offlineGPS * elapsed, offlineGPS * 3600); // max 1 hour offline

    setGold(save.gold + offlineGold);
    setGems(save.gems);
    setBuildings(save.buildings);
    setUpgrades(save.upgrades);
    setLastAdTime(save.lastAdTime);
    setBoostEndTime(save.boostEndTime);
    setTotalGoldEarned(save.totalGoldEarned + offlineGold);
    setTotalClicks(save.totalClicks);
    setAdsWatched(save.adsWatched);
    setLoaded(true);
  }, []);

  // ── Clock tick every second ──
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // ── Gold per second tick ──
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const isBoosted = Date.now() < stateRef.current.boostEndTime;
      const gps = computeGPS(stateRef.current.buildings, stateRef.current.upgrades, isBoosted);
      if (gps > 0) {
        setGold((g: number) => g + gps / 4); // runs every 250ms
        setTotalGoldEarned((t: number) => t + gps / 4);
      }
      setBoosted(isBoosted);
      const left = Math.max(0, Math.ceil((stateRef.current.boostEndTime - Date.now()) / 1000));
      setBoostLeft(left);
      const cd = Math.max(0, Math.ceil((stateRef.current.lastAdTime + AD_COOLDOWN_SEC * 1000 - Date.now()) / 1000));
      setAdCooldown(cd);
    }, 250);
    return () => clearInterval(id);
  }, [loaded]);

  // ── Auto-save every 10s ──
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const s = stateRef.current;
      const save: SavedState = { ...s, lastSaved: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }, 10000);
    return () => clearInterval(id);
  }, [loaded]);

  // ── Save on unmount ──
  useEffect(() => {
    if (!loaded) return;
    return () => {
      const s = stateRef.current;
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, lastSaved: Date.now() }));
    };
  }, [loaded]);

  const gps = computeGPS(buildings, upgrades, boosted);
  const clickPower = computeClickPower(upgrades);

  // ── Click handler ──
  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const earned = clickPower * (boosted ? 2 : 1);
    setGold((g: number) => g + earned);
    setTotalGoldEarned((t: number) => t + earned);
    setTotalClicks((c: number) => c + 1);
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 150);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = floatId.current++;
    setFloats((f: { id: number; x: number; y: number; text: string }[]) => [...f, { id, x, y, text: `+${earned} 💰` }]);
    setTimeout(() => setFloats((f: { id: number; x: number; y: number; text: string }[]) => f.filter(fl => fl.id !== id)), 1000);
  }, [clickPower, boosted]);

  // ── Buy building ──
  const buyBuilding = useCallback((defId: string) => {
    const def = BUILDING_DEFS.find(d => d.id === defId)!;
    const owned = buildings[defId] || 0;
    const cost = buildingCost(def, owned);
    if (gold < cost) return;
    setGold((g: number) => g - cost);
    setBuildings((b: Record<string, number>) => ({ ...b, [defId]: (b[defId] || 0) + 1 }));
  }, [gold, buildings]);

  // ── Buy upgrade ──
  const buyUpgrade = useCallback((def: UpgradeDef) => {
    if (upgrades[def.id]) return;
    if (def.requires && !upgrades[def.requires]) return;
    if (gold < def.cost) return;
    if (def.gemCost && gems < def.gemCost) return;
    setGold((g: number) => g - def.cost);
    if (def.gemCost) setGems((g: number) => g - def.gemCost!);
    setUpgrades((u: Record<string, boolean>) => ({ ...u, [def.id]: true }));
  }, [gold, gems, upgrades]);

  // ── Ad logic ──
  const startAd = useCallback(() => {
    if (adCooldown > 0 || adPhase !== "idle") return;
    const reward = AD_REWARDS[Math.floor(Math.random() * AD_REWARDS.length)];
    setCurrentReward(reward);
    setAdPhase("watching");
    setAdProgress(0);

    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 0.1;
      setAdProgress(Math.min(100, (elapsed / AD_WATCH_SEC) * 100));
      if (elapsed >= AD_WATCH_SEC) {
        clearInterval(id);
        setAdPhase("reward");
      }
    }, 100);
  }, [adCooldown, adPhase]);

  const claimReward = useCallback(() => {
    setGold((g: number) => g + currentReward.gold);
    setGems((g: number) => g + currentReward.gems);
    setTotalGoldEarned((t: number) => t + currentReward.gold);
    if (currentReward.type === "boost") {
      setBoostEndTime(Date.now() + BOOST_DURATION_SEC * 1000);
    }
    setLastAdTime(Date.now());
    setAdsWatched((a: number) => a + 1);
    setAdPhase("idle");
  }, [currentReward]);

  if (!loaded) {
    return (
      <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg,#1a0f0a,#0f0a05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#d4a853", fontSize: 28, fontWeight: 900, fontFamily: "Tajawal, Cairo, sans-serif" }}>جارفEافE�حفE�فE..</div>
      </div>
    );
  }

  const styles = {
    page: {
      minHeight: "100dvh",
      background: "linear-gradient(135deg,#1a0f0a 0%,#0f0a05 100%)",
      color: "#fff",
      fontFamily: "Tajawal, Cairo, sans-serif",
      direction: "rtl" as const,
      display: "flex",
      flexDirection: "column" as const,
      maxWidth: 480,
      margin: "0 auto",
      position: "relative" as const,
      overflow: "hidden",
    },
    header: {
      background: "rgba(0,0,0,0.4)",
      borderBottom: "1px solid rgba(236,72,153,0.3)",
      padding: "12px 16px",
      display: "flex",
      gap: 12,
      alignItems: "center",
      justifyContent: "space-between",
    },
    statBox: {
      background: "rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "6px 14px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      minWidth: 80,
    },
    statLabel: { fontSize: 10, color: "#f9a8d4", fontWeight: 700, marginBottom: 2 },
    statValue: { fontSize: 16, fontWeight: 900, color: "#fbbf24" },
    statGps: { fontSize: 11, color: "#6ee7b7" },
    mainArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: "20px 16px",
      position: "relative" as const,
    },
    coinBtn: {
      width: 160,
      height: 160,
      borderRadius: "50%",
      border: "4px solid #d4a853",
      background: "radial-gradient(circle at 35% 35%,#fbbf24,#f59e0b,#b45309)",
      fontSize: 70,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 40px rgba(251,191,36,0.5), inset 0 4px 8px rgba(255,255,255,0.3)",
      transform: clickAnim ? "scale(0.92)" : "scale(1)",
      transition: "transform 0.1s",
      position: "relative" as const,
      userSelect: "none" as const,
    },
    boostBadge: {
      background: "linear-gradient(90deg,#7c3aed,#d4a853)",
      borderRadius: 20,
      padding: "6px 16px",
      fontSize: 13,
      fontWeight: 700,
      color: "#fff",
    },
    adSection: {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 8,
    },
    adBtn: (disabled: boolean) => ({
      background: disabled
        ? "rgba(255,255,255,0.1)"
        : "linear-gradient(135deg,#7c3aed,#d4a853)",
      border: "none",
      borderRadius: 16,
      color: disabled ? "#888" : "#fff",
      fontSize: 15,
      fontWeight: 700,
      padding: "14px 28px",
      cursor: disabled ? "not-allowed" : "pointer",
      width: "100%",
      maxWidth: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      boxShadow: disabled ? "none" : "0 4px 20px rgba(124,58,237,0.5)",
      transition: "all 0.2s",
    }),
    tabBar: {
      display: "flex",
      borderTop: "1px solid rgba(236,72,153,0.2)",
      background: "rgba(0,0,0,0.5)",
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: "12px 4px 8px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 2,
      cursor: "pointer",
      borderTop: active ? "2px solid #d4a853" : "2px solid transparent",
      color: active ? "#d4a853" : "#888",
      fontSize: 10,
      fontWeight: 700,
      background: "none",
      border: "none",
    } as CSSProperties),
    tabEmoji: { fontSize: 22 },
    listArea: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 10,
    },
    card: (canAfford: boolean) => ({
      background: canAfford ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${canAfford ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: canAfford ? "pointer" : "default",
      transition: "all 0.2s",
    }),
    cardEmoji: { fontSize: 32, minWidth: 40, textAlign: "center" as const },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 2 },
    cardDesc: { fontSize: 11, color: "#aaa" },
    cardCost: (canAfford: boolean) => ({
      textAlign: "right" as const,
      color: canAfford ? "#fbbf24" : "#f87171",
      fontWeight: 700,
      fontSize: 14,
    }),
    cardCount: { fontSize: 11, color: "#f9a8d4", marginTop: 2 },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 24,
    },
    modal: {
      background: "linear-gradient(135deg,#1e0a2e,#2d1b4e)",
      border: "1px solid rgba(236,72,153,0.5)",
      borderRadius: 24,
      padding: 32,
      maxWidth: 340,
      width: "100%",
      textAlign: "center" as const,
      boxShadow: "0 0 60px rgba(124,58,237,0.4)",
    },
  };

  const tabs = [
    { id: "game" as const, emoji: "🏠", label: "افE�E�بة" },
    { id: "buildings" as const, emoji: "🏗�E�E, label: "افE�E�افE�E },
    { id: "upgrades" as const, emoji: "⬁E��E, label: "افE�رقيات" },
    { id: "stats" as const, emoji: "📊", label: "إحصائيات" },
  ];

  return (
    <div style={styles.page}>
      {/* Header stats */}
      <div style={styles.header}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>💰 افE�فE�</span>
          <span style={styles.statValue}>{formatNum(gold)}</span>
          <span style={styles.statGps}>{gps > 0 ? `+${formatNum(gps)}/ث` : " E}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#d4a853" }}>🏰 فE�E�E�E�فE/div>
          {boosted && <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>⚡ تعزيز فE�ط ({boostLeft}ث)</div>}
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>💎 جوافE�</span>
          <span style={{ ...styles.statValue, color: "#a78bfa" }}>{formatNum(gems)}</span>
          <span style={{ ...styles.statGps, color: "#f472b6" }}>فE�درة</span>
        </div>
      </div>

      {/* Tab content */}
      {tab === "game" && (
        <div style={styles.mainArea}>
          {/* Click button */}
          <div style={{ position: "relative" }}>
            <button onClick={handleClick} style={styles.coinBtn}>🪁E/button>
            {/* Floating numbers */}
            {floats.map(f => (
              <div key={f.id} style={{
                position: "absolute",
                left: f.x - 20,
                top: f.y - 30,
                color: "#fbbf24",
                fontWeight: 900,
                fontSize: 18,
                pointerEvents: "none",
                animation: "floatUp 1s ease-out forwards",
                zIndex: 10,
              }}>{f.text}</div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#f9a8d4", fontWeight: 700 }}>افE�ر فE�فE�ب افE�فE�</div>
            <div style={{ fontSize: 12, color: "#888" }}>+{clickPower * (boosted ? 2 : 1)} 💰 فE�E�EفE�رة</div>
          </div>

          {boosted && (
            <div style={styles.boostBadge}>
              ⚡ تعزيز 2ÁEفE�ط  E{boostLeft} ثافE�ة
            </div>
          )}

          {/* Ad section */}
          <div style={styles.adSection}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>شافE� إعفE�فE�فEواحصفEعفE�EفE�E�فE�ة فE�رية!</div>
            <button
              onClick={startAd}
              disabled={adCooldown > 0}
              style={styles.adBtn(adCooldown > 0)}
            >
              {adCooldown > 0 ? `⏳ افE�ظر ${adCooldown}ث` : "📺 شافE� إعفE�فEↁEفE�E�فE�ة"}
            </button>
            <div style={{ fontSize: 11, color: "#666" }}>
              افE�E�E�فE�ت: 💰 ذفE� · 💎 جوافE� · ⚡ تعزيز 2ÁE
            </div>
          </div>
        </div>
      )}

      {tab === "buildings" && (
        <div style={styles.listArea}>
          <div style={{ fontSize: 13, color: "#f9a8d4", fontWeight: 700, marginBottom: 4 }}>
            اشترفEفE�افE�فEفE�وفE�د افE�فE� تفE�ائيافE
          </div>
          {BUILDING_DEFS.map(def => {
            const owned = buildings[def.id] || 0;
            const cost = buildingCost(def, owned);
            const canAfford = gold >= cost;
            let income = def.baseIncome * (owned + 1);
            if (upgrades[`${def.id}2`]) income *= 2;
            if (upgrades["all2"]) income *= 2;
            return (
              <div key={def.id} onClick={() => buyBuilding(def.id)} style={styles.card(canAfford)}>
                <div style={styles.cardEmoji}>{def.emoji}</div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{def.name}</div>
                  <div style={styles.cardDesc}>{def.description}</div>
                  <div style={{ fontSize: 11, color: "#6ee7b7", marginTop: 2 }}>
                    إفE�اج: {def.baseIncome * owned > 0 ? `${formatNum(def.baseIncome * owned * (upgrades[`${def.id}2`] ? 2 : 1) * (upgrades["all2"] ? 2 : 1))}/ث` : " E}
                  </div>
                </div>
                <div>
                  <div style={styles.cardCost(canAfford)}>{formatNum(cost)} 💰</div>
                  <div style={styles.cardCount}>فE�E�E�فE {owned}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "upgrades" && (
        <div style={styles.listArea}>
          <div style={{ fontSize: 13, color: "#f9a8d4", fontWeight: 700, marginBottom: 4 }}>
            ترقيات دائفE� تحسّفEإفE�اجفE
          </div>
          {UPGRADE_DEFS.map(def => {
            const purchased = !!upgrades[def.id];
            const locked = !!(def.requires && !upgrades[def.requires]);
            const canAfford = !purchased && !locked && gold >= def.cost && (!def.gemCost || gems >= def.gemCost);
            return (
              <div
                key={def.id}
                onClick={() => !purchased && !locked && buyUpgrade(def)}
                style={{
                  ...styles.card(canAfford),
                  opacity: locked ? 0.4 : 1,
                  background: purchased
                    ? "rgba(124,58,237,0.2)"
                    : styles.card(canAfford).background,
                  border: purchased ? "1px solid rgba(124,58,237,0.6)" : styles.card(canAfford).border,
                }}
              >
                <div style={{ fontSize: 32, minWidth: 40, textAlign: "center" }}>
                  {purchased ? "✁E : locked ? "🔒" : "⬁E��E}
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{def.name}</div>
                  <div style={styles.cardDesc}>{def.description}</div>
                  {locked && <div style={{ fontSize: 11, color: "#f87171" }}>فE�فE�E EاشترفEافE�رقية افE�ابقة أوفE�فE/div>}
                </div>
                {!purchased && (
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.cardCost(canAfford)}>{formatNum(def.cost)} 💰</div>
                    {def.gemCost && (
                      <div style={{ ...styles.cardCost(gems >= def.gemCost), color: gems >= def.gemCost ? "#a78bfa" : "#f87171" }}>
                        {def.gemCost} 💎
                      </div>
                    )}
                  </div>
                )}
                {purchased && <div style={{ color: "#f9a8d4", fontWeight: 700, fontSize: 12 }}>فE�E�فE�E/div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === "stats" && (
        <div style={styles.listArea}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#d4a853", marginBottom: 8 }}>📊 إحصائياتفE/div>
          {[
            { label: "💰 إجفE�فE�EافE�فE� افE�E�E�سب", value: formatNum(totalGoldEarned) },
            { label: "👆 عدد افE�E�رات", value: totalClicks.toLocaleString("ar") },
            { label: "🏗�E�EافE�E�افE�EافE�E�E�E�فE�", value: Object.values(buildings).reduce((a: number, b: number) => a + b, 0).toString() },
            { label: "⬁E��EافE�رقيات افE�E�تراة", value: Object.values(upgrades).filter(Boolean).length.toString() },
            { label: "📺 افE�عفE�فE�ت افE�E�افE�ة", value: adsWatched.toString() },
            { label: "⚡ افE�فE�اج افE�افE�Eث", value: `${formatNum(gps)} ذفE�` },
            { label: "👆 قوة افE�E�رة", value: `+${clickPower * (boosted ? 2 : 1)} ذفE�` },
            { label: "💎 افE�وافE� افE�E�بقية", value: formatNum(gems) },
          ].map(row => (
            <div key={row.label} style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontSize: 13, color: "#ddd" }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#fbbf24" }}>{row.value}</span>
            </div>
          ))}
          <button
            onClick={() => {
              if (confirm("فE�EأفE� فE�أفE� فE�Eإعادة افE�بط؁EسيتفEحذفEفE�EتقدفE�E")) {
                localStorage.removeItem(SAVE_KEY);
                window.location.reload();
              }
            }}
            style={{
              marginTop: 16,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 12,
              color: "#f87171",
              fontSize: 14,
              fontWeight: 700,
              padding: "12px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            🔄 إعادة افE�بط
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={styles.tab(tab === t.id)}>
            <span style={styles.tabEmoji}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ad modal  Ewatching phase */}
      {adPhase === "watching" && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              جارفEتشغيفEافE�عفE�فE..
            </div>
            <div style={{ fontSize: 14, color: "#aaa", marginBottom: 24 }}>
              شافE� افE�عفE�فEفE�فE�E�فEفE�حصفEعفE�EفE�E�فE�تفE
            </div>
            {/* Progress bar */}
            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 999,
              height: 12,
              overflow: "hidden",
              marginBottom: 20,
            }}>
              <div style={{
                width: `${adProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg,#7c3aed,#d4a853)",
                borderRadius: 999,
                transition: "width 0.1s linear",
              }} />
            </div>
            {/* Fake ad content */}
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
                واصفE�E EافE�طبيفEافE�وفEفE�E�يع وافE�راء
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                آفE�فEافE�E�E�جات بيفEيديفE
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {Math.ceil(AD_WATCH_SEC - (adProgress / 100) * AD_WATCH_SEC)} ثافE�ة فE�بقية...
            </div>
          </div>
        </div>
      )}

      {/* Ad modal  Ereward phase */}
      {adPhase === "reward" && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24", marginBottom: 8 }}>
              فE�روفE
            </div>
            <div style={{ fontSize: 15, color: "#ddd", marginBottom: 24 }}>
              فE�د ربحت:
            </div>
            <div style={{
              background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(236,72,153,0.3))",
              border: "2px solid rgba(236,72,153,0.6)",
              borderRadius: 20,
              padding: "20px 32px",
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 24,
            }}>
              {currentReward.label}
            </div>
            {currentReward.gold > 0 && (
              <div style={{ fontSize: 14, color: "#fbbf24", marginBottom: 4 }}>
                💰 +{currentReward.gold} ذفE�
              </div>
            )}
            {currentReward.gems > 0 && (
              <div style={{ fontSize: 14, color: "#a78bfa", marginBottom: 4 }}>
                💎 +{currentReward.gems} جوفE�ة
              </div>
            )}
            {currentReward.type === "boost" && (
              <div style={{ fontSize: 14, color: "#6ee7b7", marginBottom: 4 }}>
                ⚡ تعزيز 2ÁEفE�E�ة {BOOST_DURATION_SEC} ثافE�ة
              </div>
            )}
            <button
              onClick={claimReward}
              style={{
                marginTop: 16,
                background: "linear-gradient(135deg,#7c3aed,#d4a853)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontSize: 16,
                fontWeight: 900,
                padding: "14px 40px",
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 4px 20px rgba(236,72,153,0.4)",
              }}
            >
              استفE�فEافE�E�E�فE�ة ✨
            </button>
          </div>
        </div>
      )}

      {/* Float animation */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.4); border-radius: 4px; }
      `}</style>
    </div>
  );
}

