"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, Building2, CalendarRange,
  Wallet, DollarSign, Landmark as BankIcon, Globe2, Percent,
  User, FileText, SlidersHorizontal, UserCog, HandCoins,
  CreditCard, Flag, Monitor,
  BookUser, Users, UserSquare2,
  Package, Tag, Apple, BadgeCheck, ArrowDownUp,
  ArrowLeftRight, Layers3, MapPin, Store as StoreIcon,
  Building, Filter, ListTree, PencilRuler, FileBadge2, IndianRupee,
  ShoppingBasket, Route, FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data & Types ─────────────────────────────────────────────────────────────
interface MenuItem { label: string; icon: React.ReactNode; active?: boolean; badge?: string; href?: string; }
interface Section {
  id: string; title: string; description: string;
  openBg: string; activeTile: string; hoverTile: string;
  borderColor: string; dotColor: string; dotDark: string;
  items: MenuItem[];
}

const sections: Section[] = [
  {
    id: "organisation",
    title: "Organisation",
    description: "Company profile, branches & financial years",
    openBg: "bg-blue-50/50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50",
    activeTile: "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-transparent shadow-md shadow-blue-200 dark:shadow-blue-900/50",
    hoverTile: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm dark:hover:bg-blue-950/50 dark:hover:text-blue-300 dark:hover:border-blue-800",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
    dotDark: "dark:bg-blue-400",
    items: [
      { label: "Organisation",   icon: <Landmark size={20} />,      href: "/settings/organisation" },
      { label: "Branch",         icon: <Building2 size={20} />,     href: "/settings/branch" },
      { label: "Financial Year", icon: <CalendarRange size={20} />, href: "/settings/financial-year" },
    ],
  },
  {
    id: "system-setup",
    title: "System Setup",
    description: "Core master data & general system preferences",
    openBg: "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
    activeTile: "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-transparent shadow-md shadow-emerald-200 dark:shadow-emerald-900/50",
    hoverTile: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 hover:shadow-sm dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 dark:hover:border-emerald-800",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    dotDark: "dark:bg-emerald-400",
    items: [
      { label: "Counter Cash",               icon: <Wallet size={20} />,             href: "/settings/counter-cash" },
      { label: "Currency",                   icon: <DollarSign size={20} />,         href: "/settings/currency" },
      { label: "Bank",                       icon: <BankIcon size={20} />,           href: "/settings/bank" },
      { label: "State",                      icon: <Globe2 size={20} />,             href: "/settings/state" },
      { label: "Tax Category",               icon: <Percent size={20} />,            href: "/settings/tax-category" },
      { label: "Party",                      icon: <User size={20} />,               href: "/settings/party" },
      { label: "Document",                   icon: <FileText size={20} />,           href: "/settings/document" },
      { label: "Configure General Preferences", icon: <SlidersHorizontal size={20} />, href: "/settings/general-preferences" },
      { label: "Employee",                   icon: <UserCog size={20} />,            href: "/settings/employee" },
      { label: "GST Category",               icon: <HandCoins size={20} />,          href: "/settings/gst-category" },
      { label: "Payment Terms",               icon: <CreditCard size={20} />,        href: "/settings/payment-terms" },
      { label: "Country",                    icon: <Flag size={20} />,               href: "/settings/country" },
      { label: "Machine Registration",       icon: <Monitor size={20} />,            href: "/settings/machine-registration" },
    ],
  },
  {
    id: "financial-setup",
    title: "Financial Setup",
    description: "Chart of accounts master configuration",
    openBg: "bg-violet-50/50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/50",
    activeTile: "bg-gradient-to-br from-violet-600 to-violet-700 text-white border-transparent shadow-md shadow-violet-200 dark:shadow-violet-900/50",
    hoverTile: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 hover:shadow-sm dark:hover:bg-violet-950/50 dark:hover:text-violet-300 dark:hover:border-violet-800",
    borderColor: "border-violet-200 dark:border-violet-800",
    dotColor: "bg-violet-500",
    dotDark: "dark:bg-violet-400",
    items: [
      { label: "Account Major Group", icon: <BookUser size={20} />,      href: "/settings/account-major-group" },
      { label: "Account Group",       icon: <Users size={20} />,         href: "/settings/account-group" },
      { label: "Account Head",        icon: <UserSquare2 size={20} />,   href: "/settings/account-head" },
    ],
  },
  {
    id: "inventory-setup",
    title: "Inventory Setup",
    description: "Item masters, categorisation & pricing controls",
    openBg: "bg-amber-50/50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50",
    activeTile: "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-transparent shadow-md shadow-amber-200 dark:shadow-amber-900/50",
    hoverTile: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 hover:shadow-sm dark:hover:bg-amber-950/50 dark:hover:text-amber-300 dark:hover:border-amber-800",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    dotDark: "dark:bg-amber-400",
    items: [
      { label: "Item",                icon: <Package size={20} />,        href: "/settings/item" },
      { label: "Type",                icon: <Tag size={20} />,            href: "/settings/type" },
      { label: "Brand Company",       icon: <Apple size={20} />,          href: "/settings/brand-company" },
      { label: "Brand",               icon: <BadgeCheck size={20} />,     href: "/settings/brand" },
      { label: "Unit",                icon: <ArrowDownUp size={20} />,    href: "/settings/unit" },
      { label: "Unit Converter",      icon: <ArrowLeftRight size={20} />, href: "/settings/unit-converter" },
      { label: "Stock Type",          icon: <Layers3 size={20} />,        href: "/settings/stock-type" },
      { label: "Location",            icon: <MapPin size={20} />,         href: "/settings/location" },
      { label: "Store",               icon: <StoreIcon size={20} />,      href: "/settings/store" },
      { label: "Department",          icon: <Building size={20} />,       href: "/settings/department" },
      { label: "Sub Department",      icon: <Filter size={20} />,         href: "/settings/sub-department" },
      { label: "Category",            icon: <ListTree size={20} />,       href: "/settings/category" },
      { label: "Sub Category",        icon: <ListTree size={20} />,       href: "/settings/sub-category" },
      { label: "Item Group",          icon: <PencilRuler size={20} />,    href: "/settings/item-group" },
      { label: "Item Specifications", icon: <FileBadge2 size={20} />,     href: "/settings/item-specifications" },
      { label: "Price Editor",        icon: <IndianRupee size={20} />,    href: "/settings/price-editor" },
    ],
  },
  {
    id: "production",
    title: "Production",
    description: "Process, routing & manufacturing configuration",
    openBg: "bg-rose-50/50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50",
    activeTile: "bg-gradient-to-br from-rose-600 to-rose-700 text-white border-transparent shadow-md shadow-rose-200 dark:shadow-rose-900/50",
    hoverTile: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 hover:shadow-sm dark:hover:bg-rose-950/50 dark:hover:text-rose-300 dark:hover:border-rose-800",
    borderColor: "border-rose-200 dark:border-rose-800",
    dotColor: "bg-rose-500",
    dotDark: "dark:bg-rose-400",
    items: [
      { label: "Process",      icon: <ShoppingBasket size={20} />,     href: "/settings/process" },
      { label: "Route",        icon: <Route size={20} />,              href: "/settings/route" },
      { label: "Item Routing", icon: <FileSpreadsheet size={20} />,    href: "/settings/item-routing" },
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
          type="button"
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
  const [open, setOpen] = useState(section.id === "organisation");

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
        type="button"
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
          <TileGrid
            items={section.items}
            activeTile={section.activeTile}
            hoverTile={section.hoverTile}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
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
              Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Configure organisation, system, financial & inventory masters.
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
