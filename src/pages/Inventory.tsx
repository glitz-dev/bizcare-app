"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PencilLine, ShoppingBag, RefreshCw, ClipboardList, ShoppingCart,
  Receipt, Package, Boxes, ArrowRightLeft, Truck, BarChart2,
  FileText, Factory, Wrench, LayoutGrid, ChevronDown,
  CirclePercent, WalletCards, ReceiptCent, Barcode,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data & Types ─────────────────────────────────────────────────────────────
interface MenuItem { label: string; icon: React.ReactNode; active?: boolean; badge?: string; href?: string; }
interface SubSection { label: string; items: MenuItem[]; }
interface Section {
  id: string; title: string; description: string;
  openBg: string; activeTile: string; hoverTile: string;
  borderColor: string; dotColor: string; dotDark: string;
  subSectionLabelColor: string; subSectionDivider: string;
  items?: MenuItem[]; subSections?: SubSection[];
}

const sections: Section[] = [
  {
    id: "procurement",
    title: "Procurement",
    description: "Manage purchase orders, vendor bills & receipts",
    openBg: "bg-blue-50/50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50",
    activeTile: "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-transparent shadow-md shadow-blue-200 dark:shadow-blue-900/50",
    hoverTile: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm dark:hover:bg-blue-950/50 dark:hover:text-blue-300 dark:hover:border-blue-800",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
    dotDark: "dark:bg-blue-400",
    subSectionLabelColor: "text-blue-700 dark:text-blue-400",
    subSectionDivider: "border-blue-100 dark:border-blue-900",
    items: [
      { label: "Purchase Indent",       icon: <PencilLine size={20} />,    href: "/Inventory/indentdetail" },
      { label: "Create Purchase Order", icon: <ShoppingBag size={20} />,   href: "/Inventory/purchase-order" },
      { label: "Process Order",         icon: <ShoppingBag size={20} />,   href: "/Inventory/process-order" },
      { label: "Goods Receipt",         icon: <ClipboardList size={20} /> },
      { label: "Purchase",              icon: <ShoppingCart size={20} />,  href: "/Inventory/purchase" },
      { label: "Local Purchase",        icon: <ShoppingCart size={20} /> },
      { label: "Purchase Return",       icon: <RefreshCw size={20} />,     href: "/Inventory/purchase-return" },
      { label: "Service Bill",          icon: <ShoppingCart size={20} />, href: "/Inventory/service-bill" },
      { label: "Service-Bill Return",   icon: <RefreshCw size={20} /> },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    description: "Invoices, orders, deliveries & returns",
    openBg: "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
    activeTile: "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-transparent shadow-md shadow-emerald-200 dark:shadow-emerald-900/50",
    hoverTile: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 hover:shadow-sm dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 dark:hover:border-emerald-800",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    dotDark: "dark:bg-emerald-400",
    subSectionLabelColor: "text-emerald-700 dark:text-emerald-400",
    subSectionDivider: "border-emerald-100 dark:border-emerald-900",
    items: [
      { label: "Sales Quotation", icon: <CirclePercent size={20} />, href: "/inventory/salesquotationdetail" },
      { label: "Sales Order",     icon: <Receipt size={20} />, href: "/inventory/sales-order" },
      { label: "Sales Invoice",   icon: <FileText size={20} />, href: "/inventory/sales-invoice" },
      { label: "Sales Return",    icon: <RefreshCw size={20} />, href: "/inventory/salesreturndetail" },
      { label: "Delivery Note",   icon: <Truck size={20} />, href: "/inventory/delivery-note" },
      { label: "Retail Invoice",  icon: <WalletCards size={20} />, href: "/inventory/retailinvoicedetail" },
      { label: "Service Bill",    icon: <ReceiptCent size={20} />, href: "/inventory/sales-service-bill" },
    ],
  },
  {
    id: "stock",
    title: "Stock Management",
    description: "Track inventory levels, transfers & adjustments",
    openBg: "bg-violet-50/50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/50",
    activeTile: "bg-gradient-to-br from-violet-600 to-violet-700 text-white border-transparent shadow-md shadow-violet-200 dark:shadow-violet-900/50",
    hoverTile: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 hover:shadow-sm dark:hover:bg-violet-950/50 dark:hover:text-violet-300 dark:hover:border-violet-800",
    borderColor: "border-violet-200 dark:border-violet-800",
    dotColor: "bg-violet-500",
    dotDark: "dark:bg-violet-400",
    subSectionLabelColor: "text-violet-700 dark:text-violet-400",
    subSectionDivider: "border-violet-100 dark:border-violet-900",
    items: [
      { label: "Opening Stock",  icon: <Package size={20} /> },
      { label: "Physical Stock", icon: <Boxes size={20} /> },
      { label: "Damage Stock",   icon: <ArrowRightLeft size={20} /> },
      { label: "Material Issue", icon: <Wrench size={20} /> },
      { label: "Material Receive", icon: <Package size={20} /> },
      { label: "Barcode Print",  icon: <Barcode size={20} /> },
    ],
  },
  {
    id: "production",
    title: "Production",
    description: "Work orders, BOMs & manufacturing planning",
    openBg: "bg-amber-50/50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50",
    activeTile: "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-transparent shadow-md shadow-amber-200 dark:shadow-amber-900/50",
    hoverTile: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 hover:shadow-sm dark:hover:bg-amber-950/50 dark:hover:text-amber-300 dark:hover:border-amber-800",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    dotDark: "dark:bg-amber-400",
    subSectionLabelColor: "text-amber-700 dark:text-amber-400",
    subSectionDivider: "border-amber-100 dark:border-amber-900",
    subSections: [
      {
        label: "General",
        items: [
          { label: "Process Order",    icon: <ClipboardList size={20} /> },
          { label: "Production Order", icon: <Factory size={20} /> },
          { label: "Work Order",       icon: <LayoutGrid size={20} /> },
          { label: "BOM",              icon: <ClipboardList size={20} /> },
        ],
      },
      {
        label: "Outpass Entries",
        items: [
          { label: "Outpass", icon: <ArrowRightLeft size={20} /> },
        ],
      },
    ],
  },
];

// ─── Tile Grid ────────────────────────────────────────────────────────────────
function TileGrid({ items, activeTile, hoverTile }: {
  items: MenuItem[];
  activeTile: string;
  hoverTile: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => item.href && navigate(item.href)}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl",
            "border transition-all duration-300 min-w-0",
            item.href ? "cursor-pointer" : "cursor-default",
            item.active
              ? activeTile
              : cn(
                  "bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 shadow-sm hover:-translate-y-1",
                  hoverTile
                )
          )}
        >
          {item.badge && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {item.badge}
            </span>
          )}
          <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
          <span className="text-[10px] font-semibold uppercase tracking-tight leading-tight w-full text-center">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(section.id === "procurement");

  return (
    <div
      className={cn(
        "rounded-3xl border transition-all duration-500 ease-in-out overflow-hidden",
        open
          ? `${section.openBg} shadow-xl shadow-slate-200/50 dark:shadow-black/30`
          : "bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 shadow-sm"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              open ? `${section.dotColor} ${section.dotDark}` : "bg-slate-200 dark:bg-slate-600"
            )}
          />
          <div>
            <p
              className={cn(
                "font-bold text-base tracking-tight",
                open
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {section.title}
            </p>
            {open && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium opacity-80">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div
          className={cn(
            "p-2 rounded-full transition-all",
            open
              ? "bg-white dark:bg-slate-700 shadow-inner"
              : "bg-slate-50 dark:bg-slate-700/50"
          )}
        >
          <ChevronDown
            size={18}
            className={cn(
              "text-slate-400 dark:text-slate-500 transition-transform duration-500",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {section.items && (
            <TileGrid
              items={section.items}
              activeTile={section.activeTile}
              hoverTile={section.hoverTile}
            />
          )}
          {section.subSections && (
            <div className="space-y-8">
              {section.subSections.map((sub) => (
                <div key={sub.label}>
                  <div className="flex items-center gap-4 mb-4">
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap",
                        sub.label === "General"
                          ? section.subSectionLabelColor
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {sub.label}
                    </p>
                    <div className={cn("h-[1px] w-full", section.subSectionDivider)} />
                  </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Inventory() {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0d1117] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-blue-600 dark:bg-blue-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600/60 dark:text-blue-400/70">
                Bizcare Platform
              </p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Inventory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Centralized hub for stock, procurement, and production control.
            </p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="grid gap-5">
          {sections.map((section) => (
            <SectionAccordion key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
