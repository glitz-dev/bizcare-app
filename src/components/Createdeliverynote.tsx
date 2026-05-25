"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  fetchDocumentMasters,
  fetchDefaultStore,
  fetchInvoiceTaxTypeDetails,
  fetchAllInvoiceTaxTypes,
  fetchAllCustomers,
  fetchSalesmen,
  fetchPendingSalesQuotations,
  fetchPendingSalesOrders,
  fetchItemDetailsForOpeningStock,
  fetchBatchDetails,
  clearItemDetailsForOpeningStock,
  clearPendingSalesQuotations,
  clearPendingSalesOrders,
  clearCustomers,
  clearSalesmen,
  clearBatchDetails,
  clearAllInvoiceTaxTypes,
  clearInvoiceTaxTypeDetails,
} from "../store/features/inventory/sales/deliveryNoteSlice";
import type { ItemDetailsForOpeningStock, BatchDetail } from "../store/features/inventory/sales/deliveryNoteSlice";
import type { RootState } from "@/store";
import {
  FileText,
  Hash,
  Calendar,
  Receipt,
  Tag,
  Store,
  Users,
  UserCheck,
  ShoppingCart,
  ClipboardList,
  ArrowLeft,
  Plus,
  Trash2,
  Settings2,
  Barcode,
  Package,
  AlignLeft,
  Layers,
  DollarSign,
  MapPin,
  MessageSquare,
  Percent,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  Save,
  RefreshCw,
  StickyNote,
  AlertCircle,
  Loader2,
  ChevronsUpDown,
  Image as ImageIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Stable selector fallbacks (must be module-level so reference is constant) ─
const EMPTY_ARRAY: never[] = [];
const EMPTY_NULL = null;

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";
interface ToastProps { message: string; type: ToastType; onClose: () => void }
function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", iconBg: "#dcfce7", iconColor: "#16a34a", titleColor: "#15803d", textColor: "#166534" },
    error: { bg: "#fef2f2", border: "#fecaca", iconBg: "#fee2e2", iconColor: "#dc2626", titleColor: "#b91c1c", textColor: "#991b1b" },
    warning: { bg: "#fffbeb", border: "#fde68a", iconBg: "#fef3c7", iconColor: "#d97706", titleColor: "#92400e", textColor: "#78350f" },
  }[type];

  const titles = { success: "Note Saved", error: "Save Failed", warning: "Action Required" };

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-sm"
      style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: colors.iconBg }}
      >
        {type === "success"
          ? <Check size={16} strokeWidth={2.5} style={{ color: colors.iconColor }} />
          : type === "warning"
            ? <AlertCircle size={16} strokeWidth={2.5} style={{ color: colors.iconColor }} />
            : <AlertCircle size={16} strokeWidth={2.5} style={{ color: colors.iconColor }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: colors.titleColor }}>{titles[type]}</p>
        <p className="text-xs mt-0.5 break-words" style={{ color: colors.textColor }}>{message}</p>
      </div>
      <button onClick={onClose} className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity">
        <X size={14} style={{ color: colors.iconColor }} />
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type LineItem = {
  id: number;
  itemId: number | null;
  barcode: string;
  itemCode: string;
  item: string;
  description: string;
  store: string;
  sqQty: string;
  quantity: string;
  sRate: string;
  discountPct: string;
  discount: string;
  taxPct: string;
  taxAmt: string;
  netAmount: string;
  vatPct: string;
  cessPct: string;
  vatAmt: string;
  cessAmt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}


// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label
      className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5"
      style={{ color: BRAND }}
    >
      <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
      {label}
    </label>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none placeholder:text-gray-300 text-gray-700 font-medium"
        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = BRAND;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d1dff0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
        }}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
        {icon}
      </span>
    </div>
  );
}

function SelectField({
  icon,
  placeholder,
  value,
  onChange,
  options = [],
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  options?: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-gray-700 font-medium"
        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = BRAND;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d1dff0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
        }}
      >
        <option value="" disabled style={{ color: "#aab8c8" }}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
        {icon}
      </span>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#93b8d8" }}
      />
    </div>
  );
}

// ─── Generic Searchable Combobox ──────────────────────────────────────────────
function SearchableCombobox({
  value,
  onChange,
  options,
  loading,
  onOpen,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  loading: boolean;
  onOpen: () => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    if (next) onOpen();
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium"
          style={{
            borderColor: open ? BRAND : "#d1dff0",
            boxShadow: open ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
          </span>
          <span className="flex-1 truncate">
            {loading ? "Loading…" : selectedLabel || placeholder}
          </span>
          <ChevronsUpDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#93b8d8" }}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        style={{ zIndex: 50 }}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : (
              <>
                <CommandEmpty className="py-4 text-center text-sm text-gray-400">
                  {emptyText}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Check
                        size={13}
                        className={cn(
                          "shrink-0 transition-opacity",
                          value === opt.value ? "opacity-100" : "opacity-0"
                        )}
                        style={{ color: BRAND }}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AccordionLabel({
  icon: Icon,
  title,
  extra,
}: {
  icon: React.ElementType;
  title: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: BRAND_LIGHT }}
      >
        <Icon size={15} strokeWidth={2.2} style={{ color: BRAND }} />
      </div>
      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
        {title}
      </span>
      <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
      {extra}
    </div>
  );
}

// ─── Item Combobox (for Order Items table) ───────────────────────────────────
function ItemCombobox({
  value,
  onSelect,
  items,
  loading,
  onOpen,
  taxType,
  onTaxTypeMissing,
}: {
  value: string;
  onSelect: (item: ItemDetailsForOpeningStock) => void;
  items: ItemDetailsForOpeningStock[];
  loading: boolean;
  onOpen: () => void;
  taxType: string;
  onTaxTypeMissing: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel =
    items.find((i) => String(i.ItemID) === value)?.ItemName ?? value;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      if (!taxType) {
        // Block the dropdown and fire the warning toast — do NOT open
        onTaxTypeMissing();
        return;
      }
      onOpen(); // fetch items list if not already loaded
    }
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="h-7 flex items-center gap-1 pl-2 pr-6 text-xs rounded-lg border bg-white transition-all outline-none text-left font-medium min-w-[150px] relative"
          style={{
            borderColor: open ? BRAND : "#d1dff0",
            boxShadow: open ? `0 0 0 2px ${BRAND}22` : undefined,
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          {loading ? (
            <Loader2 size={11} className="animate-spin shrink-0" style={{ color: BRAND }} />
          ) : (
            <Package size={11} className="shrink-0" style={{ color: "#93b8d8" }} />
          )}
          <span className="flex-1 truncate">
            {loading ? "Loading…" : selectedLabel || "Select Item"}
          </span>
          <ChevronsUpDown
            size={11}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#93b8d8" }}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-72"
        style={{ zIndex: 9999 }}
        align="start"
        side="bottom"
      >
        <Command>
          <CommandInput placeholder="Search item…" className="h-8 text-xs" />
          <CommandList className="max-h-56">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" style={{ color: BRAND }} />
                Loading items…
              </div>
            ) : (
              <>
                <CommandEmpty className="py-4 text-center text-xs text-gray-400">
                  No items found.
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.ItemID}
                      value={`${item.ItemName} ${item.ItemCode ?? ""}`}
                      onSelect={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start gap-0.5 text-xs cursor-pointer py-2"
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <Check
                          size={11}
                          className={cn(
                            "shrink-0 transition-opacity",
                            String(item.ItemID) === value ? "opacity-100" : "opacity-0"
                          )}
                          style={{ color: BRAND }}
                        />
                        <span className="font-semibold text-gray-800 truncate">
                          {item.ItemName}
                        </span>
                      </div>
                      {item.ItemCode && (
                        <span className="ml-5 text-[10px] text-gray-400 font-mono">
                          {item.ItemCode}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Line Items Table ─────────────────────────────────────────────────────────
function LineItemsTable({
  items,
  onAdd,
  onRemove,
  onUpdate,
  itemOptions,
  itemOptionsLoading,
  onItemFieldOpen,
  taxType,
  onItemSelect,
  onTaxTypeMissing,
}: {
  items: LineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof LineItem, value: string | number | null) => void;
  itemOptions: ItemDetailsForOpeningStock[];
  itemOptionsLoading: boolean;
  onItemFieldOpen: () => void;
  taxType: string;
  onItemSelect: (rowId: number, selected: ItemDetailsForOpeningStock) => void;
  onTaxTypeMissing: () => void;
}) {
  const [colSettingsOpen, setColSettingsOpen] = useState(false);

  const allCols = [
    { key: "barcode", label: "Barcode" },
    { key: "itemCode", label: "Item Code" },
    { key: "item", label: "Item" },
    { key: "description", label: "Description" },
    { key: "store", label: "Store" },
    { key: "sqQty", label: "SQ.Qty" },
    { key: "quantity", label: "Quantity" },
    { key: "sRate", label: "S.Rate" },
    { key: "discountPct", label: "Discount %" },
    { key: "discount", label: "Discount" },
    { key: "taxPct", label: "Tax %" },
    { key: "taxAmt", label: "Tax Amt" },
    { key: "netAmount", label: "Net Amount" },
    { key: "vatPct", label: "VAT %" },
    { key: "cessPct", label: "CESS %" },
    { key: "vatAmt", label: "VAT Amt" },
    { key: "cessAmt", label: "CESS Amt" },
  ];

  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(allCols.map((c) => c.key))
  );
  const [draftVisible, setDraftVisible] = useState<Set<string>>(new Set());

  const openColSettings = () => {
    setDraftVisible(new Set(visibleCols));
    setColSettingsOpen(true);
  };
  const applyColSettings = () => {
    setVisibleCols(new Set(draftVisible));
    setColSettingsOpen(false);
  };
  const toggleDraft = (key: string) => {
    setDraftVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_MID }}
    >
      {/* Table section header */}
      <div
        className="px-6 py-3.5 flex items-center justify-between"
        style={{ background: BRAND, borderBottom: `2px solid ${BRAND}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <Package size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-white">
            Order Items
          </span>
        </div>
        <button
          onClick={openColSettings}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer hover:opacity-90 active:scale-95"
          style={{ color: BRAND, background: BRAND_LIGHT }}
        >
          <Settings2 size={13} />
          Column Settings
        </button>
      </div>

      {/* Column Settings Modal */}
      {colSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setColSettingsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden"
            style={{ border: `1.5px solid ${BRAND_MID}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ background: BRAND }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Settings2 size={14} color="white" strokeWidth={2.2} />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase text-white">Column Settings</span>
              </div>
              <button
                onClick={() => setColSettingsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={14} color="white" />
              </button>
            </div>

            <div className="px-5 py-4 flex gap-2 border-b" style={{ borderColor: BRAND_MID }}>
              <button
                onClick={() => setDraftVisible(new Set(allCols.map(c => c.key)))}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: BRAND_LIGHT, color: BRAND }}
              >
                Select All
              </button>
              <button
                onClick={() => setDraftVisible(new Set())}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-gray-50"
                style={{ borderColor: "#d1dff0", color: "#6b7280" }}
              >
                Clear All
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {allCols.map((col) => (
                <label key={col.key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center border-2 transition-colors shrink-0"
                    style={{
                      borderColor: draftVisible.has(col.key) ? BRAND : "#d1dff0",
                      background: draftVisible.has(col.key) ? BRAND : "white",
                    }}
                    onClick={() => toggleDraft(col.key)}
                  >
                    {draftVisible.has(col.key) && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    {col.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: BRAND_MID }}>
              <button
                onClick={() => setColSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:shadow-sm"
                style={{ borderColor: "#d1dff0", color: "#6b7280" }}
              >
                Cancel
              </button>
              <button
                onClick={applyColSettings}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: BRAND }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr style={{ background: BRAND_LIGHT }}>
              <th className="px-3 py-2.5 text-left font-bold w-10" style={{ color: BRAND }}>#</th>
              <th className="px-2 py-2.5 text-left font-bold w-8" style={{ color: BRAND }}></th>
              {visibleCols.has("barcode") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Barcode</th>
              )}
              {visibleCols.has("itemCode") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Item Code</th>
              )}
              {visibleCols.has("item") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Item</th>
              )}
              {visibleCols.has("description") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Description</th>
              )}
              <th className="px-2 py-2.5 text-left font-bold w-8" style={{ color: BRAND }}></th>
              {visibleCols.has("store") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Store</th>
              )}
              {visibleCols.has("sqQty") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>SQ.Qty</th>
              )}
              {visibleCols.has("quantity") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Quantity</th>
              )}
              {visibleCols.has("sRate") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>S.Rate</th>
              )}
              {visibleCols.has("discountPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Discount %</th>
              )}
              {visibleCols.has("discount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Discount</th>
              )}
              {visibleCols.has("taxPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Tax %</th>
              )}
              {visibleCols.has("taxAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Tax Amt</th>
              )}
              {visibleCols.has("netAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Net Amount</th>
              )}
              {visibleCols.has("vatPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>VAT %</th>
              )}
              {visibleCols.has("cessPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS %</th>
              )}
              {visibleCols.has("vatAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>VAT Amt</th>
              )}
              {visibleCols.has("cessAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS Amt</th>
              )}
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b transition-colors hover:bg-blue-50/30",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                )}
                style={{ borderColor: BRAND_MID }}
              >
                <td className="px-3 py-1.5 text-gray-400 font-medium">{idx + 1}</td>
                <td className="px-2 py-1.5">
                  <button className="transition-colors" style={{ color: BRAND }}>
                    <Barcode size={13} />
                  </button>
                </td>
                {visibleCols.has("barcode") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.barcode}
                      onChange={(e) => onUpdate(row.id, "barcode", e.target.value)}
                      placeholder="Barcode"
                      className="h-7 text-xs border rounded-lg px-2 min-w-[90px] outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("itemCode") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.itemCode}
                      onChange={(e) => onUpdate(row.id, "itemCode", e.target.value)}
                      placeholder="Item Code"
                      className="h-7 text-xs border rounded-lg px-2 min-w-[80px] outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("item") && (
                  <td className="px-2 py-1.5">
                    <ItemCombobox
                      value={row.itemId !== null ? String(row.itemId) : ""}
                      items={itemOptions}
                      loading={itemOptionsLoading}
                      onOpen={onItemFieldOpen}
                      taxType={taxType}
                      onTaxTypeMissing={onTaxTypeMissing}
                      onSelect={(selected) => {
                        onItemSelect(row.id, selected);
                      }}
                    />
                  </td>
                )}
                {visibleCols.has("description") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.description}
                      onChange={(e) => onUpdate(row.id, "description", e.target.value)}
                      placeholder="Description"
                      className="h-7 text-xs border rounded-lg px-2 min-w-[130px] outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <button style={{ color: BRAND }}>
                    <Layers size={13} />
                  </button>
                </td>
                {visibleCols.has("store") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.store}
                      onChange={(e) => onUpdate(row.id, "store", e.target.value)}
                      placeholder="Store"
                      className="h-7 text-xs border rounded-lg px-2 min-w-[70px] outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("sqQty") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.sqQty}
                      onChange={(e) => onUpdate(row.id, "sqQty", e.target.value)}
                      placeholder="SQ.Qty"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("quantity") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.quantity}
                      onChange={(e) => onUpdate(row.id, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("sRate") && (
                  <td className="px-2 py-1.5">
                    <input
                      value={row.sRate}
                      onChange={(e) => onUpdate(row.id, "sRate", e.target.value)}
                      placeholder="Rate"
                      className="h-7 text-xs border rounded-lg px-2 w-20 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("discountPct") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.discountPct}
                      onChange={(e) => onUpdate(row.id, "discountPct", e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("discount") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.discount}
                      onChange={(e) => onUpdate(row.id, "discount", e.target.value)}
                      placeholder="0.000"
                      className="h-7 text-xs border rounded-lg px-2 w-20 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("taxPct") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.taxPct}
                      onChange={(e) => onUpdate(row.id, "taxPct", e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("taxAmt") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.taxAmt}
                      onChange={(e) => onUpdate(row.id, "taxAmt", e.target.value)}
                      placeholder="0.000"
                      className="h-7 text-xs border rounded-lg px-2 w-20 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("netAmount") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.netAmount}
                      onChange={(e) => onUpdate(row.id, "netAmount", e.target.value)}
                      placeholder="0.000"
                      className="h-7 text-xs border rounded-lg px-2 w-20 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("vatPct") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.vatPct}
                      onChange={(e) => onUpdate(row.id, "vatPct", e.target.value)}
                      placeholder="VAT"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("cessPct") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.cessPct}
                      onChange={(e) => onUpdate(row.id, "cessPct", e.target.value)}
                      placeholder="CESS"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("vatAmt") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.vatAmt}
                      onChange={(e) => onUpdate(row.id, "vatAmt", e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                {visibleCols.has("cessAmt") && (
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.cessAmt}
                      onChange={(e) => onUpdate(row.id, "cessAmt", e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs border rounded-lg px-2 w-16 outline-none transition-all bg-white"
                      style={{ borderColor: "#d1dff0" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={13} className="text-red-400 hover:text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      <div
        className="px-5 py-2.5 border-t"
        style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
      >
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-70"
          style={{ color: BRAND }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Row
        </button>
      </div>
    </div>
  );
}

// ─── Sales Quotation Table ────────────────────────────────────────────────────
type SalesQuotationRow = {
  id: number;
  quotationNo: string;
  quotationDate: string;
  customer: string;
  netAmount: number;
  addAll: boolean;
};

// ── Props now accept customerId driven from parent ──
function SalesQuotationTable({ customerId }: { customerId: number }) {
  const pendingSalesQuotations = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesQuotations ?? EMPTY_ARRAY
  );
  const loading = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesQuotationsLoading ?? false
  );
  const error = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesQuotationsError ?? EMPTY_NULL
  );

  // Local addAll toggle state keyed by SalesQuotationID
  const [addAllMap, setAddAllMap] = useState<Record<number, boolean>>({});

  // No self-dispatching useEffect — parent (handleCustomerChange) drives the fetch

  const rows: SalesQuotationRow[] = pendingSalesQuotations.map((q) => ({
    id: q.SalesQuotationID,
    quotationNo: q.QuotationNo,
    quotationDate: q.QuotationDate,
    customer: q.CustomerName ?? "",
    netAmount: q.NetAmount,
    addAll: addAllMap[q.SalesQuotationID] ?? false,
  }));

  const toggleAddAll = (id: number) => {
    setAddAllMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: BRAND_MID }}
    >
      {/* Table header bar */}
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ background: BRAND }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
          <ShoppingCart size={14} strokeWidth={2.2} color="white" />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-white">
          Pending Quotations
        </span>
        {loading && (
          <Loader2 size={14} className="ml-auto animate-spin text-white/70" />
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-5 py-3 text-xs font-medium text-red-600 bg-red-50">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && rows.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-gray-400">
          <Loader2 size={14} className="animate-spin" style={{ color: BRAND }} />
          Loading quotations…
        </div>
      )}

      {/* Empty state — show prompt when no customer selected yet */}
      {!loading && !error && rows.length === 0 && (
        <div className="flex items-center justify-center py-10 text-xs text-gray-400">
          {customerId === 0
            ? "Select a customer to load pending quotations."
            : "No pending quotations found."}
        </div>
      )}

      {/* Scrollable table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr style={{ background: BRAND_LIGHT }}>
                <th
                  className="px-4 py-2.5 text-left font-bold"
                  style={{ color: BRAND }}
                >
                  Sales Quotation No.
                </th>
                <th
                  className="px-4 py-2.5 text-left font-bold"
                  style={{ color: BRAND }}
                >
                  Sales Quotation Date
                </th>
                <th
                  className="px-4 py-2.5 text-left font-bold"
                  style={{ color: BRAND }}
                >
                  Customer
                </th>
                <th
                  className="px-4 py-2.5 text-right font-bold"
                  style={{ color: BRAND }}
                >
                  Net Amount
                </th>
                <th
                  className="px-4 py-2.5 text-center font-bold"
                  style={{ color: BRAND }}
                >
                  Add All
                </th>
                <th
                  className="px-4 py-2.5 text-center font-bold"
                  style={{ color: BRAND }}
                >
                  Select Items
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b transition-colors hover:bg-blue-50/30",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  )}
                  style={{ borderColor: BRAND_MID }}
                >
                  {/* Quotation No */}
                  <td
                    className="px-4 py-2.5 font-semibold"
                    style={{ color: BRAND }}
                  >
                    {row.quotationNo}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-2.5 text-gray-600">
                    {row.quotationDate}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-2.5 text-gray-700 font-medium">
                    {row.customer || (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </td>

                  {/* Net Amount */}
                  <td className="px-4 py-2.5 text-right text-gray-700 font-semibold tabular-nums">
                    {row.netAmount.toLocaleString()}
                  </td>

                  {/* Add All checkbox */}
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex justify-center">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        style={{
                          borderColor: row.addAll ? BRAND : "#d1dff0",
                          background: row.addAll ? BRAND : "white",
                        }}
                        onClick={() => toggleAddAll(row.id)}
                      >
                        {row.addAll && (
                          <Check size={10} color="white" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Select Items */}
                  <td className="px-4 py-2.5 text-center">
                    <button
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:opacity-80 active:scale-95"
                      style={{ background: BRAND_LIGHT, color: BRAND }}
                      title="Select items from this quotation"
                    >
                      <ShoppingCart size={13} strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div
        className="px-5 py-2.5 border-t flex items-center justify-between"
        style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
      >
        <span className="text-xs font-semibold" style={{ color: BRAND }}>
          {rows.length} quotation{rows.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-gray-400">
          Check &quot;Add All&quot; or click the cart icon to select items
        </span>
      </div>
    </div>
  );
}

// ─── Sales Orders Table ───────────────────────────────────────────────────────
type SalesOrderRow = {
  id: number;
  soNo: string;
  soDate: string;
  customer: string;
  netAmount: number;
  addToDelivery: boolean;
};

// ── Props now accept customerId driven from parent ──
function SalesOrdersTable({ customerId }: { customerId: number }) {
  const pendingSalesOrders = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesOrders ?? EMPTY_ARRAY
  );
  const loading = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesOrdersLoading ?? false
  );
  const error = useSelector(
    (state: RootState) => state.deliveryNote?.pendingSalesOrdersError ?? EMPTY_NULL
  );

  // Local addToDelivery toggle state keyed by SalesOrderID
  const [addToDeliveryMap, setAddToDeliveryMap] = useState<Record<number, boolean>>({});

  // No self-dispatching useEffect — parent (handleCustomerChange) drives the fetch

  const rows: SalesOrderRow[] = pendingSalesOrders.map((o) => ({
    id: o.SalesOrderID,
    soNo: o.SalesOrderNo,
    soDate: o.SalesOrderDate,
    customer: o.CustomerName ?? "",
    netAmount: o.NetAmount,
    addToDelivery: addToDeliveryMap[o.SalesOrderID] ?? false,
  }));

  const toggleAddToDelivery = (id: number) => {
    setAddToDeliveryMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = rows.filter((r) => r.addToDelivery).length;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: BRAND_MID }}
    >
      {/* Table header bar */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <ClipboardList size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-white">
            Pending Sales Orders
          </span>
          {loading && (
            <Loader2 size={14} className="animate-spin text-white/70" />
          )}
        </div>
        {selectedCount > 0 && (
          <span
            className="text-xs font-semibold px-3 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
          >
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-5 py-3 text-xs font-medium text-red-600 bg-red-50">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && rows.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-gray-400">
          <Loader2 size={14} className="animate-spin" style={{ color: BRAND }} />
          Loading orders…
        </div>
      )}

      {/* Empty state — show prompt when no customer selected yet */}
      {!loading && !error && rows.length === 0 && (
        <div className="flex items-center justify-center py-10 text-xs text-gray-400">
          {customerId === 0
            ? "Select a customer to load pending sales orders."
            : "No pending sales orders found."}
        </div>
      )}

      {/* Scrollable table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs">
            <thead>
              <tr style={{ background: BRAND_LIGHT }}>
                <th className="px-4 py-2.5 text-left font-bold" style={{ color: BRAND }}>
                  SO No
                </th>
                <th className="px-4 py-2.5 text-left font-bold" style={{ color: BRAND }}>
                  SO Date
                </th>
                <th className="px-4 py-2.5 text-left font-bold" style={{ color: BRAND }}>
                  Customer
                </th>
                <th className="px-4 py-2.5 text-right font-bold" style={{ color: BRAND }}>
                  Net Amount
                </th>
                <th className="px-4 py-2.5 text-center font-bold" style={{ color: BRAND }}>
                  Add To Delivery
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b transition-colors hover:bg-blue-50/30",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                    row.addToDelivery ? "ring-1 ring-inset" : ""
                  )}
                  style={{
                    borderColor: BRAND_MID,
                    ...(row.addToDelivery ? { ringColor: BRAND } : {}),
                  }}
                >
                  {/* SO No */}
                  <td className="px-4 py-2.5 font-semibold" style={{ color: BRAND }}>
                    {row.soNo}
                  </td>

                  {/* SO Date */}
                  <td className="px-4 py-2.5 text-gray-600">{row.soDate}</td>

                  {/* Customer */}
                  <td className="px-4 py-2.5 text-gray-700 font-medium">
                    {row.customer || <span className="text-gray-300 italic">—</span>}
                  </td>

                  {/* Net Amount */}
                  <td className="px-4 py-2.5 text-right text-gray-700 font-semibold tabular-nums">
                    {row.netAmount.toLocaleString(undefined, {
                      minimumFractionDigits: row.netAmount % 1 !== 0 ? 3 : 0,
                      maximumFractionDigits: 3,
                    })}
                  </td>

                  {/* Add To Delivery checkbox */}
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex justify-center">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 hover:scale-110"
                        style={{
                          borderColor: row.addToDelivery ? BRAND : "#d1dff0",
                          background: row.addToDelivery ? BRAND : "white",
                        }}
                        onClick={() => toggleAddToDelivery(row.id)}
                      >
                        {row.addToDelivery && (
                          <Check size={10} color="white" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        className="px-5 py-2.5 border-t flex items-center justify-between"
        style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
      >
        <span className="text-xs font-semibold" style={{ color: BRAND }}>
          {rows.length} order{rows.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-gray-400">
          Check &quot;Add To Delivery&quot; to include an order
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface CreateDeliveryNoteProps {
  onBack?: () => void;
}

const CreateDeliveryNote: React.FC<CreateDeliveryNoteProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux: document masters ──────────────────────────────────────────────────
  const documentMasters = useSelector((s: RootState) => s.deliveryNote?.documentMasters ?? EMPTY_ARRAY);
  const documentMastersLoading = useSelector((s: RootState) => s.deliveryNote?.documentMastersLoading ?? false);

  // ── Redux: default store ─────────────────────────────────────────────────────
  const defaultStore = useSelector((s: RootState) => s.deliveryNote?.defaultStore ?? EMPTY_NULL);
  const defaultStoreLoading = useSelector((s: RootState) => s.deliveryNote?.defaultStoreLoading ?? false);

  // ── Redux: tax types ─────────────────────────────────────────────────────────
  const invoiceTaxTypeDetails = useSelector((s: RootState) => s.deliveryNote?.invoiceTaxTypeDetails ?? EMPTY_NULL);
  const allInvoiceTaxTypes = useSelector((s: RootState) => s.deliveryNote?.allInvoiceTaxTypes ?? EMPTY_ARRAY);
  const allInvoiceTaxTypesLoading = useSelector((s: RootState) => s.deliveryNote?.allInvoiceTaxTypesLoading ?? false);

  // ── Redux: customers ─────────────────────────────────────────────────────────
  const customers = useSelector((s: RootState) => s.deliveryNote?.customers ?? EMPTY_ARRAY);
  const customersLoading = useSelector((s: RootState) => s.deliveryNote?.customersLoading ?? false);

  // ── Redux: salesmen ──────────────────────────────────────────────────────────
  const salesmen = useSelector((s: RootState) => s.deliveryNote?.salesmen ?? EMPTY_ARRAY);
  const salesmenLoading = useSelector((s: RootState) => s.deliveryNote?.salesmenLoading ?? false);

  // ── Redux: item details for opening stock ────────────────────────────────────
  const itemDetailsForOpeningStock = useSelector((s: RootState) => s.deliveryNote?.itemDetailsForOpeningStock ?? EMPTY_ARRAY);
  const itemDetailsForOpeningStockLoading = useSelector((s: RootState) => s.deliveryNote?.itemDetailsForOpeningStockLoading ?? false);

  // ── Redux: batch details ─────────────────────────────────────────────────────
  const batchDetailsLoading = useSelector((s: RootState) => s.deliveryNote?.batchDetailsLoading ?? false);

  // Pick the default document (SetDefault === true) or fall back to the first one
  const defaultDoc = documentMasters.find((d) => d.SetDefault) ?? documentMasters[0] ?? null;

  // Prefilled field values derived from the API response
  const documentName = defaultDoc ? defaultDoc.DocumentName : "";
  const dnNo = defaultDoc ? `${defaultDoc.Prefix}-${defaultDoc.StartingNo}` : "";

  // ── Fetch on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear all Redux state from any previous session before fetching fresh data
    dispatch(clearPendingSalesQuotations());
    dispatch(clearPendingSalesOrders());
    dispatch(clearCustomers());
    dispatch(clearSalesmen());
    dispatch(clearAllInvoiceTaxTypes());
    dispatch(clearInvoiceTaxTypeDetails());
    dispatch(clearItemDetailsForOpeningStock());
    dispatch(clearBatchDetails());
    dispatch(fetchDocumentMasters());
    dispatch(fetchDefaultStore());
  }, [dispatch]);

  const [dnDate] = useState(getTodayFormatted());
  const [taxType, setTaxType] = useState("");

  // Called when the Tax Type combobox is opened — fires both API calls.
  const handleTaxTypeOpen = useCallback(() => {
    if (defaultDoc) {
      dispatch(fetchInvoiceTaxTypeDetails({ documentID: defaultDoc.DocumentID }));
      dispatch(fetchAllInvoiceTaxTypes({ taxMasterId: defaultDoc.TaxMasterID }));
    }
  }, [dispatch, defaultDoc]);

  const [challanNo, setChallanNo] = useState("");
  const [store, setStore] = useState("");

  // Prefill store from API once defaultStore is loaded
  useEffect(() => {
    if (defaultStore?.StoreName) {
      setStore(defaultStore.StoreName);
    }
  }, [defaultStore]);

  const [customer, setCustomer] = useState("");
  const [salesman, setSalesman] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const handleCustomerOpen = useCallback(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  // ── Customer change: autofill billing address + fetch both pending tables ──
  const handleCustomerChange = useCallback((customerId: string) => {
    setCustomer(customerId);

    // Autofill billing address from the already-loaded customers list
    const selected = customers.find((c) => String(c.CustomerID) === customerId);
    setBillingAddress(selected?.CustomerAddress ?? "");

    // Fetch pending quotations and orders filtered by the selected customer
    const numericId = Number(customerId);
    dispatch(fetchPendingSalesQuotations({ customerId: numericId, deliveryNoteId: 0 }));
    dispatch(fetchPendingSalesOrders({ customerId: numericId, deliveryNoteId: 0 }));
  }, [dispatch, customers]);

  const handleSalesmanOpen = useCallback(() => {
    dispatch(fetchSalesmen());
  }, [dispatch]);

  const handleItemFieldOpen = useCallback(() => {
    if (itemDetailsForOpeningStock.length === 0) {
      dispatch(fetchItemDetailsForOpeningStock());
    }
  }, [dispatch, itemDetailsForOpeningStock.length]);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, itemId: null, barcode: "", itemCode: "", item: "", description: "", store: "", sqQty: "", quantity: "", sRate: "", discountPct: "", discount: "", taxPct: "", taxAmt: "", netAmount: "", vatPct: "", cessPct: "", vatAmt: "", cessAmt: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  const [remarks, setRemarks] = useState("");
  const [billwiseDiscountPct, setBillwiseDiscountPct] = useState("0");
  const [roundOff, setRoundOff] = useState("0.000");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleAddRow = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: nextId, itemId: null, barcode: "", itemCode: "", item: "", description: "", store: "", sqQty: "", quantity: "", sRate: "", discountPct: "", discount: "", taxPct: "", taxAmt: "", netAmount: "", vatPct: "", cessPct: "", vatAmt: "", cessAmt: "" },
    ]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const handleRemoveRow = useCallback((id: number) => {
    setLineItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleUpdateRow = useCallback((id: number, field: keyof LineItem, value: string | number | null) => {
    setLineItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  // Show a warning toast when user tries to open the item combobox without a tax type
  const handleTaxTypeMissing = useCallback(() => {
    if (!taxType) {
      setToast({ message: "Please select tax type before selecting item.", type: "warning" });
    }
  }, [taxType]);

  // Called when user picks an item from the combobox — guard, fetch batch details, prefill row
  const handleItemSelect = useCallback(async (rowId: number, selected: ItemDetailsForOpeningStock) => {
    if (!taxType) {
      setToast({ message: "Please select tax type before selecting item.", type: "warning" });
      return;
    }

    // Prefill basic identity fields from the item master immediately
    handleUpdateRow(rowId, "itemId", selected.ItemID);
    handleUpdateRow(rowId, "item", selected.ItemName);
    handleUpdateRow(rowId, "itemCode", selected.ItemCode ?? "");
    handleUpdateRow(rowId, "description", selected.Description ?? "");

    // Fetch batch details
    const storeId = defaultStore?.StoreID ?? 0;
    const result = await dispatch(
      fetchBatchDetails({
        itemId: selected.ItemID,
        itemCode: selected.ItemCode ?? "",
        invoiceTaxTypeId: Number(taxType),
        storeId,
      })
    );

    if (fetchBatchDetails.fulfilled.match(result)) {
      const batch: BatchDetail | undefined = result.payload.Table?.[0];
      const storeRow = result.payload.Table1?.[0];

      if (batch) {
        // ── Identity / descriptive fields ───────────────────────────────────
        if (batch.Barcode) handleUpdateRow(rowId, "barcode", batch.Barcode);
        if (batch.ItemCode) handleUpdateRow(rowId, "itemCode", batch.ItemCode);
        if (batch.ItemName) handleUpdateRow(rowId, "item", batch.ItemName);
        if (batch.Description) handleUpdateRow(rowId, "description", batch.Description);

        // ── Store from Table1 ────────────────────────────────────────────────
        if (storeRow?.StoreName) handleUpdateRow(rowId, "store", storeRow.StoreName);

        // ── Rates & tax percentages ──────────────────────────────────────────
        const sRate = batch.SalesRate ?? 0;
        const taxPct = batch.TaxValue ?? 0;
        const vatPct = batch.VAT ?? 0;
        const cessPct = batch.CESS ?? 0;

        handleUpdateRow(rowId, "sRate", String(sRate));
        handleUpdateRow(rowId, "taxPct", String(taxPct));
        handleUpdateRow(rowId, "vatPct", String(vatPct));
        handleUpdateRow(rowId, "cessPct", String(cessPct));

        // ── Available stock qty from Table1 ──────────────────────────────────
        if (storeRow?.CurrentQuantity != null)
          handleUpdateRow(rowId, "sqQty", String(storeRow.CurrentQuantity));

        // ── Derived amounts (based on qty = 1 until user edits quantity) ─────
        const qty = 1;
        const discPct = 0;
        const discount = parseFloat(((qty * sRate * discPct) / 100).toFixed(3));
        const taxAmt = parseFloat(((qty * sRate * taxPct) / 100).toFixed(3));
        const vatAmt = parseFloat(((qty * sRate * vatPct) / 100).toFixed(3));
        const cessAmt = parseFloat(((qty * sRate * cessPct) / 100).toFixed(3));
        const netAmt = parseFloat((qty * sRate - discount + taxAmt).toFixed(3));

        handleUpdateRow(rowId, "discount", String(discount));
        handleUpdateRow(rowId, "taxAmt", String(taxAmt));
        handleUpdateRow(rowId, "vatAmt", String(vatAmt));
        handleUpdateRow(rowId, "cessAmt", String(cessAmt));
        handleUpdateRow(rowId, "netAmount", String(netAmt));
      }
    }
  }, [taxType, defaultStore, dispatch, handleUpdateRow]);

  const subtotal = lineItems.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.sRate) || 0), 0);
  const discountAmt = subtotal * (parseFloat(billwiseDiscountPct) / 100 || 0);
  const netAmount = subtotal - discountAmt + (parseFloat(roundOff) || 0);

  const handleSubmit = () => {
    console.log("Submit delivery note", { dnNo, dnDate, taxType, challanNo, store, customer, salesman, lineItems, billingAddress, remarks, billwiseDiscountPct, roundOff, netAmount });
    setToast({ message: "Delivery note submitted successfully.", type: "success" });
  };

  const handleClear = () => {
    setTaxType("");
    setChallanNo("");
    setStore(defaultStore?.StoreName ?? "");
    setCustomer("");
    setSalesman("");
    setBillingAddress("");
    setLineItems([{ id: 1, itemId: null, barcode: "", itemCode: "", item: "", description: "", store: "", sqQty: "", quantity: "", sRate: "", discountPct: "", discount: "", taxPct: "", taxAmt: "", netAmount: "", vatPct: "", cessPct: "", vatAmt: "", cessAmt: "" }]);
    setNextId(2);
    setRemarks("");
    setBillwiseDiscountPct("0");
    setRoundOff("0.000");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 shadow-sm" style={{ background: BRAND }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                title="Back"
              >
                <ArrowLeft size={18} color="white" strokeWidth={2.2} />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ClipboardList size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold leading-none">
                Document
              </p>
              <h1 className="text-white text-base font-bold tracking-tight leading-tight">
                Delivery Note
              </h1>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hidden sm:block"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            {documentMastersLoading ? "Loading…" : dnNo || "—"} &nbsp;·&nbsp; Delivery Note Details ↗
          </span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        <Accordion
          type="multiple"
          defaultValue={["general", "sales-quotation", "sales-orders"]}
          className="space-y-4"
        >

          {/* ═══════════════ GENERAL ═══════════════ */}
          <AccordionItem
            value="general"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden">
              <AccordionLabel icon={FileText} title="General" />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-2">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                <div>
                  <FieldLabel icon={FileText} label="Document" />
                  <InputField
                    icon={documentMastersLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    placeholder={documentMastersLoading ? "Loading…" : "Document"}
                    value={documentName}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="DeliveryNote No." />
                  <InputField
                    icon={documentMastersLoading ? <Loader2 size={14} className="animate-spin" /> : <Hash size={14} />}
                    placeholder={documentMastersLoading ? "Loading…" : "DN No."}
                    value={dnNo}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="DeliveryNote Date" />
                  <InputField icon={<Calendar size={14} />} placeholder="DN Date" value={dnDate} readOnly />
                </div>
                <div>
                  <FieldLabel icon={Receipt} label="Tax Type" />
                  <SearchableCombobox
                    value={taxType}
                    onChange={setTaxType}
                    loading={allInvoiceTaxTypesLoading}
                    onOpen={handleTaxTypeOpen}
                    placeholder="Invoice Tax Type"
                    searchPlaceholder="Search tax type…"
                    emptyText="No tax type found."
                    icon={<Receipt size={14} />}
                    options={allInvoiceTaxTypes.map((t) => ({
                      label: t.InvoiceTaxType,
                      value: String(t.InvoiceTaxTypeID),
                    }))}
                  />
                </div>
                <div>
                  <FieldLabel icon={Tag} label="Challan No." />
                  <InputField
                    icon={<Tag size={14} />}
                    placeholder="Enter Challan No."
                    value={challanNo}
                    onChange={setChallanNo}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                <div>
                  <FieldLabel icon={Store} label="Store" />
                  <SelectField
                    icon={defaultStoreLoading ? <Loader2 size={14} className="animate-spin" /> : <Store size={14} />}
                    placeholder={defaultStoreLoading ? "Loading…" : "Select Store"}
                    value={store}
                    onChange={setStore}
                    options={
                      defaultStore
                        ? [{ label: defaultStore.StoreName, value: defaultStore.StoreName }]
                        : [
                          { label: "XXXX", value: "XXXX" },
                          { label: "Main Store", value: "MAIN" },
                          { label: "Secondary", value: "SEC" },
                        ]
                    }
                  />
                </div>
                <div>
                  <FieldLabel icon={Users} label="Customer" />
                  <SearchableCombobox
                    value={customer}
                    onChange={handleCustomerChange}
                    loading={customersLoading}
                    onOpen={handleCustomerOpen}
                    placeholder="Select Customer"
                    searchPlaceholder="Search customer…"
                    emptyText="No customer found."
                    icon={<Users size={14} />}
                    options={customers.map((c) => ({
                      label: c.CustomerName,
                      value: String(c.CustomerID),
                    }))}
                  />
                </div>
                <div>
                  <FieldLabel icon={UserCheck} label="Salesman" />
                  <SearchableCombobox
                    value={salesman}
                    onChange={setSalesman}
                    loading={salesmenLoading}
                    onOpen={handleSalesmanOpen}
                    placeholder="Select Salesman"
                    searchPlaceholder="Search salesman…"
                    emptyText="No salesman found."
                    icon={<UserCheck size={14} />}
                    options={salesmen.map((s) => ({
                      label: s.Name,
                      value: String(s.SalesAgentID),
                    }))}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════ SALES QUOTATION ═══════════════ */}
          <AccordionItem
            value="sales-quotation"
            className="bg-white rounded-2xl shadow-sm border"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden">
              <AccordionLabel icon={ShoppingCart} title="Sales Quotation" />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              {/* Pass the numeric customerId so the table knows its context */}
              <SalesQuotationTable customerId={customer ? Number(customer) : 0} />
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════ SALES ORDERS ═══════════════ */}
          <AccordionItem
            value="sales-orders"
            className="bg-white rounded-2xl shadow-sm border"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden">
              <AccordionLabel icon={ClipboardList} title="Sales Orders" />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              {/* Pass the numeric customerId so the table knows its context */}
              <SalesOrdersTable customerId={customer ? Number(customer) : 0} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ═══════════════ ORDER ITEMS (outside accordion) ═══════════════ */}
        <LineItemsTable
          items={lineItems}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          itemOptions={itemDetailsForOpeningStock}
          itemOptionsLoading={itemDetailsForOpeningStockLoading || batchDetailsLoading}
          onItemFieldOpen={handleItemFieldOpen}
          taxType={taxType}
          onItemSelect={handleItemSelect}
          onTaxTypeMissing={handleTaxTypeMissing}
        />

        {/* ── Footer Card ── */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — Billing Address & Remarks */}
            <div className="space-y-5">
              <div>
                <FieldLabel icon={MapPin} label="Billing Address" />
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Enter Billing Address"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                    style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; }}
                  />
                  <MapPin size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
                </div>
              </div>
              <div>
                <FieldLabel icon={StickyNote} label="Remarks" />
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Enter Remarks, If Any"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                    style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; }}
                  />
                  <StickyNote size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
                </div>
              </div>
            </div>

            {/* Right — Totals */}
            <div className="flex flex-col justify-end space-y-3">
              {/* Billwise Discount */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold min-w-[160px]" style={{ color: BRAND }}>
                  <Percent size={13} style={{ color: BRAND }} />
                  Billwise Discount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="number"
                    value={billwiseDiscountPct}
                    onChange={(e) => setBillwiseDiscountPct(e.target.value)}
                    className="h-8 w-16 text-sm border rounded-xl text-right tabular-nums px-2 outline-none transition-all"
                    style={{ borderColor: "#d1dff0" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <span className="text-sm text-gray-500 font-semibold">%</span>
                  <span className="text-sm text-gray-700 font-semibold tabular-nums w-24 text-right">
                    {discountAmt.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Round Off */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold min-w-[160px]" style={{ color: BRAND }}>
                  <RotateCcw size={13} style={{ color: BRAND }} />
                  RoundOff Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="ml-auto">
                  <input
                    type="number"
                    value={roundOff}
                    onChange={(e) => setRoundOff(e.target.value)}
                    className="h-8 w-28 text-sm border rounded-xl text-right tabular-nums px-2 outline-none transition-all"
                    style={{ borderColor: "#d1dff0" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div className="border-t" style={{ borderColor: BRAND_MID }} />

              {/* Net Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-base font-bold" style={{ color: BRAND }}>
                  <DollarSign size={15} style={{ color: BRAND }} />
                  NET AMOUNT
                </div>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">
                  {netAmount.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_LIGHT)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            Submit Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeliveryNote;
