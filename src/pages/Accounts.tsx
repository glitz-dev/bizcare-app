"use client";

import { useState } from "react";
import {
  FileText,
  RefreshCw,
  BarChart2,
  Receipt,
  ChevronDown,
  CreditCard,
  Landmark,
  BookOpen,
  HandCoins,
  Scale,
  ScrollText,
  ClipboardCheck,
  Wallet,
  Building2,
  FileBarChart,
  BookMarked,
  CalendarDays,
  Layers,
  StickyNote,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
}

interface SubSection {
  label: string;
  items: MenuItem[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  openBg: string;
  activeTile: string;
  hoverTile: string;
  dotColor: string;
  subSectionLabelColor: string;
  subSectionDivider: string;
  items?: MenuItem[];
  subSections?: SubSection[];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    id: "accounts",
    title: "Accounts",
    description: "Vouchers, payments, receipts & chart of accounts",
    openBg: "bg-blue-50 border-blue-200",
    activeTile: "bg-blue-600 text-white border-transparent shadow-blue-200 shadow-lg",
    hoverTile: "hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-blue-200",
    dotColor: "bg-blue-500",
    subSectionLabelColor: "text-blue-700",
    subSectionDivider: "border-blue-100",
    subSections: [
      {
        label: "General",
        items: [
          { label: "Journal Voucher", icon: <ScrollText size={20} /> },
          { label: "Contra Voucher", icon: <RefreshCw size={20} /> },
          { label: "Payment", icon: <Wallet size={20} /> },
          { label: "Receipt", icon: <Receipt size={20} /> },
          { label: "Chart Of Accounts", icon: <BarChart2 size={20} /> },
          { label: "TDS Payment Status", icon: <ClipboardCheck size={20} /> },
          { label: "Sales Journal", icon: <BookOpen size={20} /> },
          { label: "TCS Payment Status", icon: <ClipboardCheck size={20} /> },
        ],
      },
      {
        label: "Accounts Tools",
        items: [
          { label: "Bank Reconciliation", icon: <Landmark size={20} /> },
          { label: "Supplier Payment", icon: <HandCoins size={20} /> },
          { label: "Customer Receipt", icon: <CreditCard size={20} /> },
        ],
      },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    description: "Financial statements, ledgers & audit logs",
    openBg: "bg-violet-50 border-violet-200",
    activeTile: "bg-violet-600 text-white border-transparent shadow-violet-200 shadow-lg",
    hoverTile: "hover:bg-violet-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-violet-200",
    dotColor: "bg-violet-500",
    subSectionLabelColor: "text-violet-700",
    subSectionDivider: "border-violet-100",
    subSections: [
      {
        label: "General Reports",
        items: [
          { label: "General Reports", icon: <StickyNote size={20} />},
          { label: "Statement Of Accounts", icon: <FileText size={20} />},
          { label: "Voucher View", icon: <FileText size={20} /> },
          { label: "Account Ledger", icon: <BookMarked size={20} /> },
          { label: "Day Book", icon: <CalendarDays size={20} /> },
          { label: "Cash Book", icon: <Wallet size={20} /> },
          { label: "TDS", icon: <FileText size={20} /> },
          { label: "TCS", icon: <FileText size={20} /> },
          { label: "Bank Book", icon: <Landmark size={20} /> },
          { label: "Account Group Sum...", icon: <Layers size={20} /> },
          { label: "Account Group", icon: <Building2 size={20} /> },
          { label: "Groupwise Ledger", icon: <BookOpen size={20} /> },
          { label: "Trial Balance", icon: <Scale size={20} /> },
          { label: "Pending Payments", icon: <StickyNote size={20} /> },
          { label: "P&L Reports", icon: <TrendingUp size={20} /> },
          { label: "Balance Sheet", icon: <FileBarChart size={20} /> },
          { label: "Bank Reconciliation...", icon: <Landmark size={20} /> },
          { label: "Fixed Assets Schedu...", icon: <Building2 size={20} /> },
          { label: "Audit Log", icon: <ShieldCheck size={20} /> },
          { label: "P&L Report (FY Base...)", icon: <TrendingUp size={20} /> },
        ],
      },
    ],
  },
  {
    id: "gstr1",
    title: "GSTR1",
    description: "GST outward supply returns",
    openBg: "bg-emerald-50 border-emerald-200",
    activeTile: "bg-emerald-600 text-white border-transparent shadow-emerald-200 shadow-lg",
    hoverTile: "hover:bg-emerald-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-emerald-200",
    dotColor: "bg-emerald-500",
    subSectionLabelColor: "text-emerald-700",
    subSectionDivider: "border-emerald-100",
    items: [
      { label: "GSTR1-B2B Billwise", icon: <FileText size={20} /> },
      { label: "GSTR1-Hsn", icon: <FileText size={20} /> },
    ],
  },
  {
    id: "gstr2",
    title: "GSTR2",
    description: "GST inward supply returns",
    openBg: "bg-amber-50 border-amber-200",
    activeTile: "bg-amber-600 text-white border-transparent shadow-amber-200 shadow-lg",
    hoverTile: "hover:bg-amber-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-amber-200",
    dotColor: "bg-amber-500",
    subSectionLabelColor: "text-amber-700",
    subSectionDivider: "border-amber-100",
    items: [
      { label: "GSTR2-Purchase", icon: <FileText size={20} /> },
    ],
  },
];

// ─── Tile Grid ─────────────────────────────────────────────────────────────────

function TileGrid({
  items,
  activeTile,
  hoverTile,
}: {
  items: MenuItem[];
  activeTile: string;
  hoverTile: string;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <button
          key={item.label}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
            "border text-center cursor-pointer transition-all duration-150 shadow-sm",
            item.active
              ? activeTile
              : cn("bg-white border-slate-100 text-slate-600", hoverTile)
          )}
        >
          {item.badge && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {item.badge}
            </span>
          )}
          <span>{item.icon}</span>
          <span className="text-[11px] font-medium leading-tight">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Accordion Item ────────────────────────────────────────────────────────────

function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(section.id === "accounts");

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-200",
        open ? section.openBg : "bg-white border-slate-100"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              open ? section.dotColor : "bg-slate-300"
            )}
          />
          <div>
            <p className={cn("font-semibold text-sm tracking-wide", open ? "text-slate-800" : "text-slate-500")}>
              {section.title}
            </p>
            {open && (
              <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {open && (
        <div className="px-6 pb-6">
          {/* Flat items */}
          {section.items && (
            <TileGrid
              items={section.items}
              activeTile={section.activeTile}
              hoverTile={section.hoverTile}
            />
          )}

          {/* Sub-sections */}
          {section.subSections && (
            <div className="space-y-5">
              {section.subSections.map((sub, i) => (
                <div key={sub.label}>
                  {i > 0 && (
                    <div className={cn("border-t mb-5", section.subSectionDivider)} />
                  )}
                  <p className={cn("text-xs font-semibold uppercase tracking-widest mb-3", section.subSectionLabelColor)}>
                    {sub.label}
                  </p>
                  <TileGrid
                    items={sub.items}
                    activeTile={section.activeTile}
                    hoverTile={section.hoverTile}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Accounts() {
  return (
    <div className="w-full overflow-x-hidden bg-slate-50 font-sans">
      <div className="px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Bizcare ERP
            </p>
            <h1 className="text-3xl font-bold text-[#004687] tracking-tight">Accounts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your finances, vouchers, GST returns and reports
            </p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <SectionAccordion key={section.id} section={section} />
          ))}
        </div>

      </div>
    </div>
  );
}