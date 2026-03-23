// src/components/Navbar.tsx   (or wherever you keep it)

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";

import {
    LayoutDashboard,
    Settings,
    Package,
    Wallet,
    Menu,
    Search,
    Bell,
    ChevronRight,
    X,
    TrendingUp,
    User2
} from "lucide-react";

const BRAND = "#004687";
const BRAND_DARK = "#003366";
const BRAND_GLOW = "rgba(0,102,204,0.18)";
const ACCENT = "#38bdf8";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Inventory", icon: Package, path: "/Inventory" },
    { label: "Accounts", icon: Wallet, path: "/Accounts" },
    { label: "Settings", icon: Settings, path: "/Settings" },
    { label: "User Management", icon: User2, path: "/user" },
];

export default function AppShell() {
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    // Sync active tab with current URL
    const active = navItems.find(item => item.path === location.pathname)?.label || "Dashboard";

    const handleNav = (path: string) => {
        navigate(path);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4fa", fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: expanded ? 220 : 68,
                minHeight: "100vh",
                background: `linear-gradient(180deg, ${BRAND_DARK} 0%, ${BRAND} 60%, #0066cc 100%)`,
                display: "flex",
                flexDirection: "column",
                transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
                position: "fixed",
                left: 0, top: 0, bottom: 0,
                zIndex: 100,
                boxShadow: `4px 0 32px ${BRAND_GLOW}`,
            }}>
                {/* Logo row */}
                <div style={{
                    height: 68,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    <button
                        onClick={() => setExpanded(v => !v)}
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
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                    >
                        {expanded ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <span style={{
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
                    }}>
                        BIZ<span style={{ color: ACCENT }}>CARE</span>
                    </span>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: "18px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {navItems.map(({ label, icon: Icon, path }) => {
                        const isActive = active === label;
                        return (
                            <button
                                key={label}
                                onClick={() => handleNav(path)}
                                title={!expanded ? label : undefined}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 13,
                                    padding: "11px 12px",
                                    borderRadius: 12,
                                    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                                    color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: 14,
                                    letterSpacing: "0.04em",
                                    transition: "background 0.18s, color 0.18s, border-color 0.18s",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    boxShadow: isActive ? `0 2px 16px ${BRAND_GLOW}` : "none",
                                    borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    width: "100%",
                                    textAlign: "left",
                                    fontFamily: "inherit",
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                                        (e.currentTarget as HTMLElement).style.color = "#fff";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                                    }
                                }}
                            >
                                <Icon size={20} style={{ flexShrink: 0, color: isActive ? ACCENT : "rgba(255,255,255,0.7)" }} />
                                <span style={{
                                    opacity: expanded ? 1 : 0,
                                    transform: expanded ? "translateX(0)" : "translateX(-8px)",
                                    transition: "opacity 0.2s, transform 0.2s",
                                    pointerEvents: "none",
                                }}>
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
                <div style={{
                    padding: "14px 10px",
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                }}>
                    <div style={{
                        width: 36, height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #38bdf8, #0066cc)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: 13,
                        flexShrink: 0,
                        border: "2px solid rgba(255,255,255,0.25)",
                        boxShadow: "0 0 10px rgba(56,189,248,0.3)",
                    }}>AD</div>
                    <div style={{
                        opacity: expanded ? 1 : 0,
                        transform: expanded ? "translateX(0)" : "translateX(-8px)",
                        transition: "opacity 0.2s, transform 0.2s",
                        whiteSpace: "nowrap",
                    }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Admin</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>bizcare.io</div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={{
                marginLeft: expanded ? 220 : 68,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
                minHeight: "100vh",
            }}>
                {/* Top navbar */}
                <header style={{
                    height: 68,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 28px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    boxShadow: "0 1px 0 #e2eaf4, 0 4px 24px rgba(0,70,135,0.06)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                        <span style={{ fontWeight: 700, fontSize: 15, color: BRAND }}>Demo Company Pvt. Ltd.</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Search */}
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Search size={15} style={{ position: "absolute", left: 12, color: "#94a3b8", pointerEvents: "none" }} />
                            <input
                                placeholder="Search..."
                                style={{
                                    paddingLeft: 36, paddingRight: 14,
                                    height: 38, width: 200,
                                    borderRadius: 10,
                                    border: "1.5px solid #dbe7f5",
                                    fontSize: 13, color: "#1e3a5f",
                                    background: "#f5f8fd",
                                    outline: "none",
                                    fontFamily: "inherit",
                                    transition: "border-color 0.18s",
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = BRAND)}
                                onBlur={e => (e.currentTarget.style.borderColor = "#dbe7f5")}
                            />
                        </div>

                        {/* Fiscal year */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "#eef4fb", border: "1.5px solid #cddcee",
                            borderRadius: 10, padding: "5px 12px",
                            fontSize: 12, fontWeight: 700, color: BRAND, letterSpacing: "0.05em",
                        }}>
                            <TrendingUp size={13} style={{ color: ACCENT }} />
                            2024–2025
                        </div>

                        {/* Bell */}
                        <button
                            style={{
                                position: "relative", width: 38, height: 38,
                                borderRadius: 10, background: "#f0f6ff",
                                border: "1.5px solid #dbe7f5",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: BRAND, transition: "background 0.18s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#dbeafe")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#f0f6ff")}
                        >
                            <Bell size={16} />
                            <span style={{
                                position: "absolute", top: 7, right: 7,
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#ef4444", border: "1.5px solid #fff",
                                boxShadow: "0 0 5px rgba(239,68,68,0.5)",
                            }} />
                        </button>

                        {/* Avatar */}
                        <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${BRAND}, #0066cc)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 800, fontSize: 13,
                            border: `2.5px solid ${BRAND}`, cursor: "pointer",
                            boxShadow: `0 2px 10px ${BRAND_GLOW}`,
                        }}>AD</div>
                    </div>
                </header>

                {/* Page content - Now uses React Router Outlet */}
                <main style={{ flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}