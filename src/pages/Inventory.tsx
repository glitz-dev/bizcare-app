"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PencilLine,
  ShoppingBag,
  RefreshCw,
  ClipboardList,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  ArrowRightLeft,
  Truck,
  BarChart2,
  FileText,
  Factory,
  Wrench,
  LayoutGrid,
  ChevronDown,
  CirclePercent,
  WalletCards,
  ReceiptCent,
  Barcode,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
  href?: string;
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
  borderColor: string;
  dotColor: string;
  subSectionLabelColor: string;
  subSectionDivider: string;
  items?: MenuItem[];
  subSections?: SubSection[];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    id: "procurement",
    title: "Procurement",
    description: "Manage purchase orders, vendor bills & receipts",
    openBg: "bg-blue-50 border-blue-200",
    activeTile: "bg-blue-600 text-white border-transparent shadow-blue-200 shadow-lg",
    hoverTile: "hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-blue-200",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
    subSectionLabelColor: "text-blue-700",
    subSectionDivider: "border-blue-100",
    items: [
      { label: "Purchase Indent", icon: <PencilLine size={20} />, href: "/Inventory/indentdetail" },
      { label: "Create Purchase Order", icon: <ShoppingBag size={20} />, href: "/Inventory/purchase-order" },
      { label: "Process Order", icon: <ShoppingBag size={20} /> },
      { label: "Goods Receipt", icon: <ClipboardList size={20} /> },
      { label: "Purchase", icon: <ShoppingCart size={20} /> },
      { label: "Local Purchase", icon: <ShoppingCart size={20} /> },
      { label: "Purchase Return", icon: <RefreshCw size={20} /> },
      { label: "Service Bill", icon: <ShoppingCart size={20} /> },
      { label: "Service-Bill Return", icon: <RefreshCw size={20} /> },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    description: "Invoices, orders, deliveries & returns",
    openBg: "bg-emerald-50 border-emerald-200",
    activeTile: "bg-emerald-600 text-white border-transparent shadow-emerald-200 shadow-lg",
    hoverTile: "hover:bg-emerald-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-emerald-200",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    subSectionLabelColor: "text-emerald-700",
    subSectionDivider: "border-emerald-100",
    items: [
      { label: "Sales Quotation", icon: <CirclePercent size={20} /> },
      { label: "Sales Order", icon: <Receipt size={20} /> },
      { label: "Sales Invoice", icon: <FileText size={20} /> },
      { label: "Sales Return", icon: <RefreshCw size={20} /> },
      { label: "Delivery Note", icon: <Truck size={20} /> },
      { label: "Retail Invoice", icon: <WalletCards size={20} /> },
      { label: "Service Bill", icon: <ReceiptCent size={20} /> },
    ],
  },
  {
    id: "stock",
    title: "Stock Management",
    description: "Track inventory levels, transfers & adjustments",
    openBg: "bg-violet-50 border-violet-200",
    activeTile: "bg-violet-600 text-white border-transparent shadow-violet-200 shadow-lg",
    hoverTile: "hover:bg-violet-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-violet-200",
    borderColor: "border-violet-200",
    dotColor: "bg-violet-500",
    subSectionLabelColor: "text-violet-700",
    subSectionDivider: "border-violet-100",
    items: [
      { label: "Opening Stock", icon: <Package size={20} /> },
      { label: "Physical Stock", icon: <Boxes size={20} /> },
      { label: "Damage Stock", icon: <ArrowRightLeft size={20} /> },
      { label: "Material Issue", icon: <Wrench size={20} /> },
      { label: "Material Receive", icon: <Package size={20} /> },
      { label: "Barcode Print", icon: <Barcode size={20} /> },
    ],
  },
  {
    id: "production",
    title: "Production",
    description: "Work orders, BOMs & manufacturing planning",
    openBg: "bg-amber-50 border-amber-200",
    activeTile: "bg-amber-600 text-white border-transparent shadow-amber-200 shadow-lg",
    hoverTile: "hover:bg-amber-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-amber-200",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
    subSectionLabelColor: "text-amber-700",
    subSectionDivider: "border-amber-100",
    subSections: [
      {
        label: "General",
        items: [
          { label: "Process Order", icon: <ClipboardList size={20} /> },
          { label: "Production Order", icon: <Factory size={20} /> },
          { label: "Work Order", icon: <LayoutGrid size={20} /> },
          { label: "BOM", icon: <ClipboardList size={20} /> },
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
  {
    id: "reports",
    title: "Reports",
    description: "Analytics, insights & inventory summaries",
    openBg: "bg-rose-50 border-rose-200",
    activeTile: "bg-rose-600 text-white border-transparent shadow-rose-200 shadow-lg",
    hoverTile: "hover:bg-rose-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-rose-200",
    borderColor: "border-rose-200",
    dotColor: "bg-rose-500",
    subSectionLabelColor: "text-rose-700",
    subSectionDivider: "border-rose-100",
    subSections: [
      {
        label: "Procurement Reports",
        items: [
          { label: "General Report", icon: <FileText size={20} /> },
          { label: "Purchase Summary", icon: <BarChart2 size={20} /> },
          { label: "Vendor Analysis", icon: <ClipboardList size={20} /> },
        ],
      },
      {
        label: "Sales Reports",
        items: [
          { label: "General Report", icon: <FileText size={20} /> },
          { label: "Sales Summary", icon: <BarChart2 size={20} /> },
          { label: "Customer Analysis", icon: <Receipt size={20} /> },
        ],
      },
      {
        label: "Inventory Reports",
        items: [
          { label: "Stock Summary", icon: <Boxes size={20} /> },
          { label: "Stock Ledger", icon: <BarChart2 size={20} /> },
          { label: "Production Report", icon: <Factory size={20} /> },
        ],
      },
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
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => item.href && navigate(item.href)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
            "border text-center transition-all duration-150 shadow-sm min-w-0",
            item.href ? "cursor-pointer" : "cursor-default",
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
          <span className="text-[10px] font-medium leading-tight break-words w-full text-center">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Accordion Item ────────────────────────────────────────────────────────────

function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(section.id === "procurement");

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
          {section.items && (
            <TileGrid
              items={section.items}
              activeTile={section.activeTile}
              hoverTile={section.hoverTile}
            />
          )}

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

export default function Inventory() {
  return (
    <div className="w-full overflow-x-hidden bg-slate-50 font-sans">
      <div className="px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Bizcare ERP
          </p>
          <h1 className="text-3xl font-bold text-[#004687] tracking-tight">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your stock, procurement, sales and production
          </p>
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