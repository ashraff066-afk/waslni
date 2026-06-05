"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── GAME DATA ──────────────────────────────────────────────────────────────

const BUILDINGS = [
  { id: "laser",   name: "Mining Laser",     emoji: "🔦", baseCost: 15,        baseCps: 0.1,   desc: "Chips away at asteroids automatically." },
  { id: "drone",   name: "Mining Drone",     emoji: "🤖", baseCost: 100,       baseCps: 0.5,   desc: "Autonomous bot that never sleeps." },
  { id: "ship",    name: "Mining Ship",      emoji: "🚀", baseCost: 1100,      baseCps: 4,     desc: "Deep-space vessel with a massive cargo hold." },
  { id: "station", name: "Space Station",    emoji: "🛸", baseCost: 12000,     baseCps: 20,    desc: "Orbital platform processing raw ore." },
  { id: "quantum", name: "Quantum Drill",    emoji: "⚡", baseCost: 130000,    baseCps: 100,   desc: "Vibrates asteroids apart at quantum frequency." },
  { id: "dyson",   name: "Dyson Sphere",     emoji: "☀️", baseCost: 1400000,   baseCps: 500,   desc: "Captures an entire star's energy output." },
  { id: "galaxy",  name: "Galaxy Harvester", emoji: "🌌", baseCost: 20000000,  baseCps: 2500,  desc: "Collects ore across whole galaxies." },
  { id: "big",     name: "Big Bang Engine",  emoji: "💥", baseCost: 500000000, baseCps: 15000, desc: "Harnesses the energy of creation itself." },
] as const;

const UPGRADES = [
  { id: "u_pick1",    name: "Titanium Pick",     cost: 100,       clickMult: 2,  buildingMult: 0, buildingId: "",        emoji: "⛏️", desc: "2× click power." },
  { id: "u_laser1",   name: "Laser Cooling",      cost: 500,       clickMult: 0,  buildingMult: 2, buildingId: "laser",   emoji: "🔦", desc: "2× laser output." },
  { id: "u_pick2",    name: "Diamond Tips",       cost: 5000,      clickMult: 5,  buildingMult: 0, buildingId: "",        emoji: "💎", desc: "5× click power." },
  { id: "u_drone1",   name: "AI Upgrade",         cost: 10000,     clickMult: 0,  buildingMult: 2, buildingId: "drone",   emoji: "🤖", desc: "2× drone output." },
  { id: "u_ship1",    name: "Warp Drive",         cost: 50000,     clickMult: 0,  buildingMult: 2, buildingId: "ship",    emoji: "🚀", desc: "2× ship output." },
  { id: "u_pick3",    name: "Quantum Gloves",     cost: 100000,    clickMult: 10, buildingMult: 0, buildingId: "",        emoji: "🧤", desc: "10× click power." },
  { id: "u_station1", name: "Solar Panels",       cost: 500000,    clickMult: 0,  buildingMult: 2, buildingId: "station", emoji: "🛸", desc: "2× station output." },
  { id: "u_laser2",   name: "Photon Amplifier",   cost: 1000000,   clickMult: 0,  buildingMult: 3, buildingId: "laser",   emoji: "🔦", desc: "3× laser output." },
  { id: "u_quantum1", name: "Phase Shift",        cost: 2000000,   clickMult: 0,  buildingMult: 2, buildingId: "quantum", emoji: "⚡", desc: "2× quantum output." },
  { id: "u_pick4",    name: "Neutrino Drill",     cost: 5000000,   clickMult: 20, buildingMult: 0, buildingId: "",        emoji: "🌀", desc: "20× click power." },
  { id: "u_all1",     name: "Universal Boost",    cost: 10000000,  clickMult: 2,  buildingMult: 2, buildingId: "all",     emoji: "🌟", desc: "2× everything." },
  { id: "u_dyson1",   name: "Dark Matter Tap",    cost: 50000000,  clickMult: 0,  buildingMult: 2, buildingId: "dyson",   emoji: "☀️", desc: "2× Dyson output." },
  { id: "u_all2",     name: "Cosmic Harmony",     cost: 500000000, clickMult: 3,  buildingMult: 3, buildingId: "all",     emoji: "✨", desc: "3× everything." },
] as const;

type BuildingId = typeof BUILDINGS[number]["id"];
type UpgradeId  = typeof UPGRADES[number]["id"];

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface GameState {
  stardust: number;
  totalEarned: number;
  buildings: Partial<Record<BuildingId, number>>;
  upgrades: UpgradeId[];
  lastTick: number;
  prestigeCount: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: string;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1e18) return (n / 1e18).toFixed(2) + " Qi";
  if (n >= 1e15) return (n / 1e15).toFixed(2) + " Qa";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + " M";
  if (n >= 1e3)  return (n / 1e3).toFixed(2) + " K";
  return Math.floor(n).toLocaleString();
}

function buildingCost(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned));
}

function prestigeMult(count: number): number {
  return count === 0 ? 1 : Math.pow(1.5, count);
}

function calcCps(
  buildings: Partial<Record<BuildingId, number>>,
  upgrades: UpgradeId[],
  pMult: number
): number {
  let total = 0;
  for (const b of BUILDINGS) {
    const count = buildings[b.id] ?? 0;
    if (!count) continue;
    let bMult = 1;
    for (const u of UPGRADES) {
      if (!upgrades.includes(u.id)) continue;
      if ((u.buildingId === b.id || u.buildingId === "all") && u.buildingMult > 0) {
        bMult *= u.buildingMult;
      }
    }
    total += b.baseCps * count * bMult;
  }
  return total * pMult;
}

function calcClick(upgrades: UpgradeId[], pMult: number): number {
  let power = 1;
  for (const u of UPGRADES) {
    if (upgrades.includes(u.id) && u.clickMult > 1) power *= u.clickMult;
  }
  return power * pMult;
}

// ─── PERSISTENCE ────────────────────────────────────────────────────────────

const SAVE_KEY = "galaxy_miner_v2";

function blank(): GameState {
  return { stardust: 0, totalEarned: 0, buildings: {}, upgrades: [], lastTick: Date.now(), prestigeCount: 0 };
}

function load(): GameState {
  if (typeof window === "undefined") return blank();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch { return blank(); }
}

function persist(s: GameState) {
  if (typeof window !== "undefined") localStorage.setItem(SAVE_KEY, JSON.stringify(s));
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function GalaxyMiner() {
  const [gs, setGs] = useState<GameState>(blank);
  const [tab, setTab] = useState<"mine" | "builds" | "upgrades" | "stats">("mine");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ready, setReady] = useState(false);
  const [offlineGain, setOfflineGain] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [asteroidShake, setAsteroidShake] = useState(false);

  const gsRef    = useRef(gs);
  const pidRef   = useRef(0);
  gsRef.current  = gs;

  // ── Load + offline earnings ──────────────────────────────────────────────
  useEffect(() => {
    const saved  = load();
    const now    = Date.now();
    const secs   = Math.max(0, (now - saved.lastTick) / 1000);
    const pMult  = prestigeMult(saved.prestigeCount);
    const cps    = calcCps(saved.buildings, saved.upgrades, pMult);
    const gained = Math.min(secs * cps, cps * 3600 * 8); // cap at 8h

    if (gained > 1) {
      saved.stardust   += gained;
      saved.totalEarned += gained;
      setOfflineGain(gained);
      setShowOffline(true);
      setTimeout(() => setShowOffline(false), 4000);
    }
    saved.lastTick = now;
    setGs(saved);
    setReady(true);
  }, []);

  // ── Tick (every 100ms) ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      setGs(prev => {
        const now    = Date.now();
        const secs   = (now - prev.lastTick) / 1000;
        const pMult  = prestigeMult(prev.prestigeCount);
        const earned = calcCps(prev.buildings, prev.upgrades, pMult) * secs;
        return {
          ...prev,
          stardust:    prev.stardust + earned,
          totalEarned: prev.totalEarned + earned,
          lastTick:    now,
        };
      });
    }, 100);
    return () => clearInterval(id);
  }, [ready]);

  // ── Auto-save every 30s ──────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => persist(gsRef.current), 30000);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => () => persist(gsRef.current), []);

  // ── Derived values ───────────────────────────────────────────────────────
  const pMult  = prestigeMult(gs.prestigeCount);
  const cps    = calcCps(gs.buildings, gs.upgrades, pMult);
  const cpClick = calcClick(gs.upgrades, pMult);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const id   = pidRef.current++;
    const cur  = gsRef.current;
    const power = calcClick(cur.upgrades, prestigeMult(cur.prestigeCount));
    setParticles(p => [...p, { id, x, y, value: "+" + fmt(power) }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 900);
    setAsteroidShake(true);
    setTimeout(() => setAsteroidShake(false), 120);
    setGs(prev => ({
      ...prev,
      stardust:    prev.stardust + power,
      totalEarned: prev.totalEarned + power,
    }));
  }, []);

  const buyBuilding = useCallback((bid: BuildingId) => {
    setGs(prev => {
      const b    = BUILDINGS.find(x => x.id === bid)!;
      const owned = prev.buildings[bid] ?? 0;
      const cost  = buildingCost(b.baseCost, owned);
      if (prev.stardust < cost) return prev;
      return {
        ...prev,
        stardust:  prev.stardust - cost,
        buildings: { ...prev.buildings, [bid]: owned + 1 },
      };
    });
  }, []);

  const buyUpgrade = useCallback((uid: UpgradeId) => {
    setGs(prev => {
      const u = UPGRADES.find(x => x.id === uid)!;
      if (prev.upgrades.includes(uid) || prev.stardust < u.cost) return prev;
      return {
        ...prev,
        stardust: prev.stardust - u.cost,
        upgrades: [...prev.upgrades, uid],
      };
    });
  }, []);

  const doPrestige = useCallback(() => {
    if (gs.totalEarned < 1_000_000) return;
    const next: GameState = { ...blank(), prestigeCount: gs.prestigeCount + 1, lastTick: Date.now() };
    setGs(next);
    persist(next);
  }, [gs.totalEarned, gs.prestigeCount]);

  // ─── UI ──────────────────────────────────────────────────────────────────

  const totalOwned = Object.values(gs.buildings).reduce((a, b) => a + (b ?? 0), 0);
  const availUpgrades = UPGRADES.filter(u => !gs.upgrades.includes(u.id));
  const canPrestige   = gs.totalEarned >= 1_000_000;

  if (!ready) {
    return (
      <div style={{ minHeight: "100svh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "#60a5fa", fontFamily: "system-ui,sans-serif" }}>
        <div style={{ fontSize: 48 }}>🌌</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Loading Universe…</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100svh", maxWidth: 480, margin: "0 auto",
      background: "linear-gradient(180deg,#05050f 0%,#0a0520 60%,#050510 100%)",
      color: "#e2e8f0", fontFamily: "'Segoe UI',system-ui,sans-serif",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
    }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes float-up {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-70px) scale(1.3); }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow:0 0 28px #3b82f666,0 0 60px #7c3aed33; }
          50%      { box-shadow:0 0 50px #3b82f6aa,0 0 100px #7c3aed66; }
        }
        @keyframes spin-orbit {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .asteroid {
          transition: transform .08s;
          animation: pulse-ring 3s ease-in-out infinite;
        }
        .asteroid:active { transform: scale(0.92) !important; }
        .card { transition: opacity .15s, transform .1s; }
        .card:active { transform: scale(0.97); }
        .tab-btn { transition: all .2s; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#ffffff08; }
        ::-webkit-scrollbar-thumb { background:#3b82f640; border-radius:4px; }
      `}</style>

      {/* ── Stars (decorative) ── */}
      {[...Array(24)].map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${(i * 37 + 11) % 100}%`,
          top:  `${(i * 53 + 7)  % 100}%`,
          width: i % 3 === 0 ? 2 : 1,
          height: i % 3 === 0 ? 2 : 1,
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.3 + (i % 4) * 0.15,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Offline toast ── */}
      {showOffline && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#1e3a5f,#1e1b4b)",
          border: "1px solid #3b82f660", borderRadius: 14, padding: "12px 20px",
          zIndex: 100, textAlign: "center", animation: "slide-up .3s ease-out",
          boxShadow: "0 8px 32px #00000060",
        }}>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Welcome back! You earned</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#60a5fa" }}>+{fmt(offlineGain)} ⭐</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>while away</div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        padding: "14px 16px 10px",
        background: "#00000050",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ffffff12",
        position: "sticky", top: 0, zIndex: 20,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Stardust</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#60a5fa", lineHeight: 1, letterSpacing: -1 }}>{fmt(gs.stardust)} ⭐</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Per Second</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa" }}>{fmt(cps)}/s</div>
          </div>
        </div>
        {gs.prestigeCount > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4 }}>
            <span>✨</span>
            <span>Prestige ×{gs.prestigeCount} — {fmt(pMult)}× global multiplier</span>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", flexShrink: 0,
        background: "#00000030", borderBottom: "1px solid #ffffff12",
      }}>
        {(["mine", "builds", "upgrades", "stats"] as const).map(t => (
          <button
            key={t}
            className="tab-btn"
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 700, border: "none",
              background: tab === t ? "#1e3a5f50" : "transparent",
              color: tab === t ? "#60a5fa" : "#475569",
              borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {t === "mine"     ? "⛏️ Mine"      :
             t === "builds"   ? "🏗️ Build"     :
             t === "upgrades" ? "⬆️ Upgrade"   : "📊 Stats"}
            {t === "upgrades" && availUpgrades.filter(u => gs.stardust >= u.cost).length > 0 && (
              <span style={{
                position: "absolute", top: 6, right: "50%", transform: "translateX(16px)",
                background: "#ef4444", color: "#fff", borderRadius: "50%",
                width: 14, height: 14, fontSize: 9, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {availUpgrades.filter(u => gs.stardust >= u.cost).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ── MINE TAB ── */}
        {tab === "mine" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px 24px", gap: 20 }}>

            {/* Asteroid click zone */}
            <div
              style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", minHeight: 260 }}
              onClick={handleClick}
            >
              {/* Orbit rings */}
              <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", border: "1px dashed #3b82f618", animation: "spin-orbit 25s linear infinite", pointerEvents: "none" }} />
              <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", border: "1px dashed #7c3aed18", animation: "spin-orbit 18s linear infinite reverse", pointerEvents: "none" }} />
              <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: "1px dashed #60a5fa18", animation: "spin-orbit 12s linear infinite", pointerEvents: "none" }} />

              {/* Satellites (shown when buildings owned) */}
              {totalOwned >= 5 && (
                <div style={{ position: "absolute", width: 190, height: 190, animation: "spin-orbit 8s linear infinite", pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>🤖</div>
                </div>
              )}
              {totalOwned >= 15 && (
                <div style={{ position: "absolute", width: 240, height: 240, animation: "spin-orbit 15s linear infinite reverse", pointerEvents: "none" }}>
                  <div style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>🚀</div>
                </div>
              )}

              {/* Main asteroid */}
              <div
                className="asteroid"
                style={{
                  width: 160, height: 160,
                  borderRadius: "42% 58% 55% 45% / 40% 44% 56% 60%",
                  background: "radial-gradient(circle at 30% 30%, #78716c, #44403c 50%, #1c1917)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 72,
                  transform: asteroidShake ? "scale(0.91)" : "scale(1)",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                ☄️
              </div>

              {/* Click particles */}
              {particles.map(p => (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#fbbf24",
                    animation: "float-up .9s ease-out forwards",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    transform: "translateX(-50%)",
                    textShadow: "0 2px 8px #00000080",
                  }}
                >
                  {p.value} ⭐
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div style={{ width: "100%", display: "flex", gap: 8 }}>
              {[
                { label: "Click Power", value: fmt(cpClick) + " ⭐" },
                { label: "Per Second", value: fmt(cps) + "/s" },
                { label: "Buildings", value: totalOwned.toString() },
              ].map(item => (
                <div key={item.label} style={{
                  flex: 1, background: "#ffffff08", borderRadius: 12, padding: "10px 8px",
                  textAlign: "center", border: "1px solid #ffffff10",
                }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Prestige teaser */}
            {gs.totalEarned >= 500_000 && (
              <div
                onClick={doPrestige}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, cursor: canPrestige ? "pointer" : "default",
                  background: canPrestige
                    ? "linear-gradient(135deg,#92400e,#78350f)"
                    : "#ffffff08",
                  border: `1px solid ${canPrestige ? "#f59e0b60" : "#ffffff15"}`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: canPrestige ? "#fbbf24" : "#64748b" }}>
                  {canPrestige ? "✨ PRESTIGE — Reset for +" + fmt(prestigeMult(gs.prestigeCount + 1)) + "× multiplier" : `⏳ ${fmt(1_000_000 - gs.totalEarned)} ⭐ more to unlock Prestige`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BUILDINGS TAB ── */}
        {tab === "builds" && (
          <div style={{ padding: "10px 12px 20px" }}>
            {BUILDINGS.map(b => {
              const owned   = gs.buildings[b.id] ?? 0;
              const cost    = buildingCost(b.baseCost, owned);
              const afford  = gs.stardust >= cost;
              let bMult = 1;
              for (const u of UPGRADES) {
                if (!gs.upgrades.includes(u.id)) continue;
                if ((u.buildingId === b.id || u.buildingId === "all") && u.buildingMult > 0) bMult *= u.buildingMult;
              }
              const bldgCps = owned > 0 ? b.baseCps * owned * bMult * pMult : 0;

              return (
                <button
                  key={b.id}
                  className="card"
                  onClick={() => buyBuilding(b.id)}
                  disabled={!afford}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: afford
                      ? "linear-gradient(135deg,#1e3a5f30,#1e1b4b30)"
                      : "#ffffff06",
                    border: `1px solid ${afford ? "#3b82f635" : "#ffffff0c"}`,
                    borderRadius: 14, padding: "13px 14px", marginBottom: 8,
                    cursor: afford ? "pointer" : "not-allowed",
                    opacity: afford ? 1 : 0.55,
                    color: "#e2e8f0", textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 38, width: 46, textAlign: "center", flexShrink: 0 }}>{b.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {owned > 0 && (
                          <span style={{ background: "#3b82f625", color: "#93c5fd", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>
                            {owned}
                          </span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 800, color: afford ? "#60a5fa" : "#475569" }}>
                          {fmt(cost)} ⭐
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{b.desc}</div>
                    {owned > 0 && (
                      <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 3 }}>
                        Producing {fmt(bldgCps)}/s
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── UPGRADES TAB ── */}
        {tab === "upgrades" && (
          <div style={{ padding: "10px 12px 20px" }}>
            {/* Available upgrades */}
            {availUpgrades.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#4ade80" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>All upgrades purchased!</div>
              </div>
            )}
            {availUpgrades.map(u => {
              const afford = gs.stardust >= u.cost;
              return (
                <button
                  key={u.id}
                  className="card"
                  onClick={() => buyUpgrade(u.id)}
                  disabled={!afford}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: afford
                      ? "linear-gradient(135deg,#4c1d9530,#1e3a5f30)"
                      : "#ffffff06",
                    border: `1px solid ${afford ? "#7c3aed40" : "#ffffff0c"}`,
                    borderRadius: 14, padding: "13px 14px", marginBottom: 8,
                    cursor: afford ? "pointer" : "not-allowed",
                    opacity: afford ? 1 : 0.5,
                    color: "#e2e8f0", textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 36, width: 46, textAlign: "center", flexShrink: 0 }}>{u.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: afford ? "#a78bfa" : "#475569", flexShrink: 0 }}>
                        {fmt(u.cost)} ⭐
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{u.desc}</div>
                  </div>
                </button>
              );
            })}
            {/* Purchased upgrades (collapsed list) */}
            {gs.upgrades.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  Purchased ({gs.upgrades.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {gs.upgrades.map(uid => {
                    const u = UPGRADES.find(x => x.id === uid)!;
                    return (
                      <div key={uid} style={{
                        background: "#16a34a20", border: "1px solid #16a34a30",
                        borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#4ade80",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {u.emoji} {u.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div style={{ padding: "10px 12px 20px" }}>

            {/* Stats card */}
            <div style={{ background: "#ffffff08", borderRadius: 16, padding: 16, marginBottom: 12, border: "1px solid #ffffff10" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", marginBottom: 12 }}>📊 Statistics</div>
              {[
                ["Total Stardust Mined", fmt(gs.totalEarned) + " ⭐"],
                ["Current Stardust",     fmt(gs.stardust) + " ⭐"],
                ["Per Second",           fmt(cps) + "/s"],
                ["Click Power",          fmt(cpClick) + " ⭐"],
                ["Buildings Owned",      totalOwned.toString()],
                ["Upgrades Owned",       `${gs.upgrades.length} / ${UPGRADES.length}`],
                ["Prestige Count",       gs.prestigeCount.toString()],
                ["Prestige Multiplier",  fmt(pMult) + "×"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #ffffff0c", fontSize: 13 }}>
                  <span style={{ color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#e2e8f0" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Buildings breakdown */}
            {totalOwned > 0 && (
              <div style={{ background: "#ffffff08", borderRadius: 16, padding: 16, marginBottom: 12, border: "1px solid #ffffff10" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", marginBottom: 12 }}>🏗️ Buildings</div>
                {BUILDINGS.filter(b => (gs.buildings[b.id] ?? 0) > 0).map(b => {
                  const owned = gs.buildings[b.id] ?? 0;
                  let bMult = 1;
                  for (const u of UPGRADES) {
                    if (!gs.upgrades.includes(u.id)) continue;
                    if ((u.buildingId === b.id || u.buildingId === "all") && u.buildingMult > 0) bMult *= u.buildingMult;
                  }
                  const bCps = b.baseCps * owned * bMult * pMult;
                  const pct  = cps > 0 ? ((bCps / cps) * 100).toFixed(1) : "0";
                  return (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ffffff0c", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>{b.emoji} {b.name} ×{owned}</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 700, color: "#a78bfa" }}>{fmt(bCps)}/s</span>
                        <span style={{ color: "#475569", marginLeft: 6, fontSize: 11 }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prestige panel */}
            <div style={{
              background: canPrestige ? "linear-gradient(135deg,#92400e25,#78350f25)" : "#ffffff08",
              border: `1px solid ${canPrestige ? "#f59e0b40" : "#ffffff10"}`,
              borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>✨ Prestige</div>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 }}>
                Reset everything (except prestige level) for a permanent <strong style={{ color: "#fbbf24" }}>{fmt(prestigeMult(gs.prestigeCount + 1))}×</strong> global multiplier.
                {" "}Requires 1M total stardust mined.
              </p>
              {/* progress bar */}
              {!canPrestige && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    <span>{fmt(gs.totalEarned)} ⭐</span>
                    <span>1M ⭐</span>
                  </div>
                  <div style={{ background: "#ffffff15", borderRadius: 6, height: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 6,
                      width: `${Math.min(100, (gs.totalEarned / 1_000_000) * 100).toFixed(1)}%`,
                      background: "linear-gradient(90deg,#f59e0b,#d97706)",
                      transition: "width .5s",
                    }} />
                  </div>
                </div>
              )}
              <button
                onClick={doPrestige}
                disabled={!canPrestige}
                style={{
                  width: "100%", padding: "13px", borderRadius: 12, border: "none",
                  background: canPrestige ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#ffffff12",
                  color: canPrestige ? "#fff" : "#475569",
                  fontSize: 15, fontWeight: 800, cursor: canPrestige ? "pointer" : "not-allowed",
                  transition: "transform .1s",
                }}
              >
                {canPrestige ? "⚡ Prestige Now!" : `Need ${fmt(Math.max(0, 1_000_000 - gs.totalEarned))} more ⭐`}
              </button>
            </div>

            {/* Reset button */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={() => {
                  if (confirm("Hard reset? All progress will be lost!")) {
                    localStorage.removeItem(SAVE_KEY);
                    setGs(blank());
                  }
                }}
                style={{
                  background: "transparent", border: "1px solid #ef444430",
                  color: "#ef4444", borderRadius: 8, padding: "8px 16px",
                  fontSize: 12, cursor: "pointer",
                }}
              >
                🗑️ Hard Reset
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0, padding: "8px 16px",
        background: "#00000030", borderTop: "1px solid #ffffff0c",
        textAlign: "center", fontSize: 11, color: "#334155",
      }}>
        Galaxy Miner — tap the asteroid, build an empire 🌌
      </div>
    </div>
  );
}
