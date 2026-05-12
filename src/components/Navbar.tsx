// src/components/Navbar.tsx

import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Settings, Package, Wallet,
  Menu, Search, Bell, ChevronRight, X,
  TrendingUp, User2, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const BRAND = "#004687";
const BRAND_DARK = "#003366";
const BRAND_GLOW = "rgba(0,102,204,0.18)";
const ACCENT = "#38bdf8";

const navItems = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/dashboard" },
  { label: "Inventory",       icon: Package,         path: "/Inventory" },
  { label: "Accounts",        icon: Wallet,          path: "/Accounts" },
  { label: "Settings",        icon: Settings,        path: "/Settings" },
  { label: "User Management", icon: User2,           path: "/user" },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const { dark, toggle } = useTheme();

  const active =
    navItems.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        overflowX: "hidden",
        fontFamily: "'DM Sans', 'Outfit', sans-serif",
      }}
      className="bg-[#f0f4fa] dark:bg-[#0d1117]"
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: expanded ? 220 : 68,
          minHeight: "100vh",
          background: dark
            ? "linear-gradient(180deg, #0d1117 0%, #161b22 60%, #1c2432 100%)"
            : `linear-gradient(180deg, ${BRAND_DARK} 0%, ${BRAND} 60%, #0066cc 100%)`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
          overflow: "hidden",
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          boxShadow: dark
            ? "4px 0 32px rgba(0,0,0,0.5), 1px 0 0 #30363d"
            : `4px 0 32px ${BRAND_GLOW}`,
        }}
      >
        {/* Logo row */}
        <div
          style={{
            height: 68,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
            borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.10)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "none",
              borderRadius: 10,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              flexShrink: 0,
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
          >
            {expanded ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateX(0)" : "translateX(-10px)",
              transition: "opacity 0.22s, transform 0.22s",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "0.16em",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            BIZ<span style={{ color: ACCENT }}>CARE</span>
          </span>
        </div>

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: "18px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                title={!expanded ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "11px 12px",
                  borderRadius: 12,
                  background: isActive
                    ? dark ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.15)"
                    : "transparent",
                  color: isActive
                    ? dark ? "#58a6ff" : "#fff"
                    : dark ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.65)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  letterSpacing: "0.04em",
                  transition: "background 0.18s, color 0.18s, border-color 0.18s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxShadow: isActive ? `0 2px 16px ${BRAND_GLOW}` : "none",
                  borderLeft: isActive
                    ? dark ? "3px solid #58a6ff" : `3px solid ${ACCENT}`
                    : "3px solid transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = dark ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLElement).style.color = dark ? "#93c5fd" : "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0, color: isActive ? (dark ? "#58a6ff" : ACCENT) : dark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.7)" }} />
                <span
                  style={{
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 0.2s, transform 0.2s",
                    pointerEvents: "none",
                  }}
                >
                  {label}
                </span>
                {isActive && expanded && (
                  <ChevronRight size={14} style={{ marginLeft: "auto", color: ACCENT, opacity: 0.7 }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            padding: "14px 10px",
            borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8, #0066cc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 13,
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.25)",
              boxShadow: "0 0 10px rgba(56,189,248,0.3)",
            }}
          >
            AD
          </div>
          <div
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateX(0)" : "translateX(-8px)",
              transition: "opacity 0.2s, transform 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ color: dark ? "#93c5fd" : "#fff", fontWeight: 700, fontSize: 13 }}>Admin</div>
            <div style={{ color: dark ? "rgba(147,197,253,0.45)" : "rgba(255,255,255,0.5)", fontSize: 11 }}>bizcare.io</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div
        style={{
          marginLeft: expanded ? 220 : 68,
          flex: 1,
          minWidth: 0,
          width: 0,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* Top navbar */}
        <header
          style={{
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
          className="bg-white dark:bg-[#161b22] shadow-[0_1px_0_#e2eaf4,0_4px_24px_rgba(0,70,135,0.06)] dark:shadow-[0_1px_0_#30363d,0_4px_24px_rgba(0,0,0,0.3)]"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ACCENT,
                boxShadow: `0 0 8px ${ACCENT}`,
              }}
            />
            <span
              style={{ fontWeight: 700, fontSize: 15 }}
              className="text-[#004687] dark:text-[#58a6ff]"
            >
              Demo Company Pvt. Ltd.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search
                size={15}
                style={{ position: "absolute", left: 12, pointerEvents: "none" }}
                className="text-slate-400 dark:text-slate-500"
              />
              <input
                placeholder="Search..."
                style={{
                  paddingLeft: 36, paddingRight: 14,
                  height: 38, width: 200,
                  borderRadius: 10,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.18s",
                }}
                className="border border-[#dbe7f5] dark:border-[#30363d] bg-[#f5f8fd] dark:bg-[#0d1117] text-[#1e3a5f] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-[#004687] dark:focus:border-[#58a6ff]"
              />
            </div>

            {/* Fiscal year */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 10, padding: "5px 12px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
              }}
              className="bg-[#eef4fb] dark:bg-[#1c2432] border border-[#cddcee] dark:border-[#30363d] text-[#004687] dark:text-[#58a6ff]"
            >
              <TrendingUp size={13} style={{ color: ACCENT }} />
              2024–2025
            </div>

            {/* Bell */}
            <button
              style={{
                position: "relative", width: 38, height: 38,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.18s",
              }}
              className="bg-[#f0f6ff] dark:bg-[#1c2432] border border-[#dbe7f5] dark:border-[#30363d] text-[#004687] dark:text-[#58a6ff] hover:bg-[#dbeafe] dark:hover:bg-[#253147]"
            >
              <Bell size={16} />
              <span
                style={{
                  position: "absolute", top: 7, right: 7,
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#ef4444", border: "1.5px solid #fff",
                  boxShadow: "0 0 5px rgba(239,68,68,0.5)",
                }}
              />
            </button>

            {/* ── Dark Mode Toggle ── */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="relative flex items-center justify-center w-[72px] h-[38px] rounded-full transition-all duration-500 cursor-pointer border-0 p-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={{
                background: dark
                  ? "linear-gradient(135deg, #1e2d45 0%, #0d1b2e 100%)"
                  : "linear-gradient(135deg, #bae6fd 0%, #e0f2fe 100%)",
                boxShadow: dark
                  ? "0 0 0 1.5px #30363d, 0 2px 12px rgba(56,189,248,0.18), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "0 0 0 1.5px #bae6fd, 0 2px 12px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {/* Stars (dark mode) */}
              {dark && (
                <>
                  <span className="absolute top-[8px] left-[10px] w-[3px] h-[3px] rounded-full bg-white opacity-80" />
                  <span className="absolute top-[14px] left-[17px] w-[2px] h-[2px] rounded-full bg-white opacity-50" />
                  <span className="absolute top-[10px] left-[25px] w-[2px] h-[2px] rounded-full bg-white opacity-70" />
                </>
              )}
              {/* Sun rays (light mode) */}
              {!dark && (
                <span
                  className="absolute top-1/2"
                  style={{ left: dark ? 38 : 10 }}
                >
                  <Sun size={14} className="text-amber-500 opacity-60" />
                </span>
              )}

              {/* Sliding pill */}
              <span
                className="absolute top-[4px] w-[30px] h-[30px] rounded-full flex items-center justify-center shadow-md"
                style={{
                  left: dark ? "calc(100% - 34px)" : "4px",
                  background: dark
                    ? "linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)"
                    : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  boxShadow: dark
                    ? "0 2px 8px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.12)"
                    : "0 2px 8px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                {dark
                  ? <Moon size={14} className="text-sky-300" />
                  : <Sun size={14} className="text-white" />
                }
              </span>
            </button>

            {/* Avatar */}
            <div
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `linear-gradient(135deg, ${BRAND}, #0066cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 13,
                border: `2.5px solid ${BRAND}`, cursor: "pointer",
                boxShadow: `0 2px 10px ${BRAND_GLOW}`,
              }}
            >
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}