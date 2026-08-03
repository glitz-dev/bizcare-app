"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDocumentMasters, fetchInvoiceTaxTypes, fetchAllInvoiceTaxTypes, fetchPaymentTypes, fetchDefaultStores, fetchGSTTypes, fetchCustomers, fetchStores, fetchDefaultStates, fetchStateStartWith, fetchProductDetails, fetchProductionItemDetails, saveRetailInvoice, clearSaveRetailInvoice, fetchCurrencies, clearCurrencies, fetchCurrencyExRate, clearCurrencyExRate } from "../store/features/inventory/sales/retailInvoiceSlice";
import type { SaveRetailInvoicePayload, RetailInvoiceSalesDetail, RetailInvoiceListItem } from "../store/features/inventory/sales/retailInvoiceSlice";
import { toast } from "sonner";
import {
  FileText,
  Hash,
  Calendar,
  Store,
  Users,
  CreditCard,
  MapPin,
  ArrowLeft,
  Plus,
  Trash2,
  Settings2,
  Package,
  StickyNote,
  DollarSign,
  Percent,
  Check,
  X,
  Save,
  Loader2,
  RefreshCw,
  ChevronsUpDown,
  ShoppingCart,
  Globe,
  BadgeDollarSign,
  Tag,
  ReceiptText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ─────────────────────────────────────────────────────────────────────
type InvoiceLineItem = {
  id: number;
  item: string;
  specification: string;
  currentStock: string;
  quantity: string;
  sUnit: string;
  sRate: string;
  gstPct: string;
  gstAmount: string;
  amount: string;
  sgstPct: string;
  cgstPct: string;
  igstPct: string;
  utgstPct: string;
  cessPct: string;
  sgstAmt: string;
  cgstAmt: string;
  igstAmt: string;
  utgstAmt: string;
  cessAmt: string;
};

function makeEmptyRow(id: number): InvoiceLineItem {
  return {
    id,
    item: "",
    specification: "",
    currentStock: "",
    quantity: "",
    sUnit: "",
    sRate: "",
    gstPct: "",
    gstAmount: "",
    amount: "",
    sgstPct: "",
    cgstPct: "",
    igstPct: "",
    utgstPct: "",
    cessPct: "",
    sgstAmt: "",
    cgstAmt: "",
    igstAmt: "",
    utgstAmt: "",
    cessAmt: "",
  };
}

function getTodayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ─── Shared sub-components ─────────────────────────────────────────────────────
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
          if (!readOnly) {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
          }
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

function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
  onOpen,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  onOpen?: () => boolean | void;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    if (next && onOpen) {
      const allowed = onOpen();
      if (!allowed) return; // blocked — don't open
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
          className={cn(
            "relative w-full flex items-center pl-9 pr-8 border bg-white transition-all outline-none text-left font-medium",
            compact
              ? "h-7 py-0 text-xs rounded-lg min-w-[160px]"
              : "py-2.5 text-sm rounded-xl"
          )}
          style={{
            borderColor: open ? BRAND : "#d1dff0",
            boxShadow: open ? `0 0 0 2px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
            {icon}
          </span>
          <span className="flex-1 truncate">{selectedLabel || placeholder}</span>
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
            <CommandEmpty className="py-4 text-center text-sm text-gray-400">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => { onChange(opt.value); setOpen(false); }}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Check
                    size={13}
                    className={cn("shrink-0 transition-opacity", value === opt.value ? "opacity-100" : "opacity-0")}
                    style={{ color: BRAND }}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AccordionLabel({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
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
    </div>
  );
}

// ─── Invoice Items Table ───────────────────────────────────────────────────────
function InvoiceItemsTable({
  items,
  onAdd,
  onRemove,
  onUpdate,
  productOptions,
  productDetailsLoading,
  onItemOpen,
  onItemSelect,
  loadingRowId,
}: {
  items: InvoiceLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof InvoiceLineItem, value: string) => void;
  productOptions: { label: string; value: string }[];
  productDetailsLoading: boolean;
  onItemOpen: () => boolean;
  onItemSelect: (rowId: number, itemId: string) => void;
  loadingRowId: number | null;
}) {
  const [colSettingsOpen, setColSettingsOpen] = useState(false);

  const allCols = [
    { key: "item", label: "Item" },
    { key: "specification", label: "Specification" },
    { key: "currentStock", label: "Current Stock" },
    { key: "quantity", label: "Quantity" },
    { key: "sUnit", label: "S.Unit" },
    { key: "sRate", label: "S.Rate" },
    { key: "gstPct", label: "GST %" },
    { key: "gstAmount", label: "GST Amt" },
    { key: "amount", label: "Amount" },
    { key: "sgstPct", label: "SGST %" },
    { key: "cgstPct", label: "CGST %" },
    { key: "igstPct", label: "IGST %" },
    { key: "utgstPct", label: "UTGST %" },
    { key: "cessPct", label: "CESS %" },
    { key: "sgstAmt", label: "SGST Amt" },
    { key: "cgstAmt", label: "CGST Amt" },
    { key: "igstAmt", label: "IGST Amt" },
    { key: "utgstAmt", label: "UTGST Amt" },
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

  const cellInput = (
    row: InvoiceLineItem,
    field: keyof InvoiceLineItem,
    placeholder: string,
    width = "w-20",
    numeric = false
  ) => (
    <input
      type={numeric ? "number" : "text"}
      value={row[field]}
      onChange={(e) => onUpdate(row.id, field, e.target.value)}
      placeholder={placeholder}
      className={`h-7 text-xs border rounded-lg px-2 ${width} outline-none transition-all bg-white`}
      style={{ borderColor: "#d1dff0" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_MID }}
    >
      {/* Header */}
      <div
        className="px-6 py-3.5 flex items-center justify-between"
        style={{ background: BRAND, borderBottom: `2px solid ${BRAND}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <Package size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Invoice Items</span>
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
            {/* Modal header */}
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

            {/* Select All / Clear All */}
            <div className="px-5 py-4 flex gap-2 border-b" style={{ borderColor: BRAND_MID }}>
              <button
                onClick={() => setDraftVisible(new Set(allCols.map((c) => c.key)))}
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

            {/* 2-column checkbox grid */}
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

            {/* Footer */}
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
              <th className="px-3 py-2.5 text-left font-bold w-8" style={{ color: BRAND }}>...</th>
              {visibleCols.has("item") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Item</th>
              )}
              {visibleCols.has("specification") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Specification</th>
              )}
              {visibleCols.has("currentStock") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Current Stock</th>
              )}
              {visibleCols.has("quantity") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Quantity</th>
              )}
              {visibleCols.has("sUnit") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>S.Unit</th>
              )}
              {visibleCols.has("sRate") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>S.Rate</th>
              )}
              {visibleCols.has("gstPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>GST %</th>
              )}
              {visibleCols.has("gstAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>GST Amt</th>
              )}
              {visibleCols.has("amount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Amount</th>
              )}
              {visibleCols.has("sgstPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>SGST %</th>
              )}
              {visibleCols.has("cgstPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CGST %</th>
              )}
              {visibleCols.has("igstPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>IGST %</th>
              )}
              {visibleCols.has("utgstPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>UTGST %</th>
              )}
              {visibleCols.has("cessPct") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS %</th>
              )}
              {visibleCols.has("sgstAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>SGST Amt</th>
              )}
              {visibleCols.has("cgstAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CGST Amt</th>
              )}
              {visibleCols.has("igstAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>IGST Amt</th>
              )}
              {visibleCols.has("utgstAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>UTGST Amt</th>
              )}
              {visibleCols.has("cessAmt") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS Amt</th>
              )}
              <th className="px-3 py-2.5 w-10" />
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
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center cursor-pointer"
                    style={{ background: BRAND_LIGHT }}
                  >
                    <Package size={10} style={{ color: BRAND }} />
                  </div>
                </td>
                {visibleCols.has("item") && (
                  <td className="px-2 py-1.5">
                    <div className="relative">
                      <SearchableCombobox
                        value={row.item}
                        onChange={(val) => {
                          onUpdate(row.id, "item", val);
                          onItemSelect(row.id, val);
                        }}
                        options={productOptions}
                        placeholder={productDetailsLoading ? "Loading…" : "Select Item"}
                        searchPlaceholder="Search item…"
                        emptyText="No item found."
                        icon={<Package size={12} />}
                        onOpen={() => onItemOpen()}
                        compact
                      />
                      {loadingRowId === row.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 pointer-events-none">
                          <svg className="animate-spin w-3.5 h-3.5" style={{ color: BRAND }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                )}
                {visibleCols.has("specification") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "specification", "Specifiction", "w-24")}
                  </td>
                )}
                {visibleCols.has("currentStock") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "currentStock", "Stock", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("quantity") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "quantity", "0", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("sUnit") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sUnit", "Unit", "w-16")}
                  </td>
                )}
                {visibleCols.has("sRate") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sRate", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("gstPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "gstPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("gstAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "gstAmount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("amount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "amount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("sgstPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sgstPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("cgstPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "cgstPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("igstPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "igstPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("utgstPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "utgstPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("cessPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "cessPct", "0", "w-14", true)}
                  </td>
                )}
                {visibleCols.has("sgstAmt") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sgstAmt", "0", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("cgstAmt") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "cgstAmt", "0", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("igstAmt") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "igstAmt", "0.0000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("utgstAmt") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "utgstAmt", "UTGST Amt", "w-24")}
                  </td>
                )}
                {visibleCols.has("cessAmt") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "cessAmt", "0.0000", "w-20", true)}
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={12} className="text-red-400 hover:text-red-600 transition-colors" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      <div className="px-5 py-3.5 border-t flex items-center" style={{ borderColor: BRAND_MID }}>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm active:scale-95"
          style={{ background: BRAND_LIGHT, color: BRAND }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Row
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface CreateRetailInvoiceProps {
  onBack?: () => void;
  onSaveSuccess?: (newInvoice: RetailInvoiceListItem) => void;
}

const CreateRetailInvoice: React.FC<CreateRetailInvoiceProps> = ({ onBack, onSaveSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { documentMasters, documentMastersLoading, invoiceTaxTypes, invoiceTaxTypesLoading, paymentTypes, paymentTypesLoading, defaultStores, gstTypes, gstTypesLoading, customers, customersLoading, stores, storesLoading, defaultStates, states, statesLoading, productDetails, productDetailsLoading, saveRetailInvoiceLoading, currencies, currenciesLoading, currencyExRateLoading } = useSelector(
    (state: RootState) => state.retailInvoice
  );

  // ── Header fields ──────────────────────────────────────────────────────────
  const [document_, setDocument_] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate] = useState(getTodayFormatted());
  const [invoiceTaxType, setInvoiceTaxType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [store, setStore] = useState("");
  const [customer, setCustomer] = useState("");
  const [gstType, setGstType] = useState("");
  const [state_, setState_] = useState("");
  const [currency, setCurrency] = useState("");
  const [exRate, setExRate] = useState("1");
  const [remarks, setRemarks] = useState("");

  // ── Address fields ─────────────────────────────────────────────────────────
  const [shippingGstNo, setShippingGstNo] = useState("");
  const [shippingPhoneNo, setShippingPhoneNo] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [billingGstNo, setBillingGstNo] = useState("");
  const [billingPhoneNo, setBillingPhoneNo] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // ── Fetch document masters on mount ───────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDocumentMasters());
    dispatch(fetchPaymentTypes());
    dispatch(fetchDefaultStores());
    dispatch(fetchGSTTypes());
    dispatch(fetchCustomers());
    dispatch(fetchDefaultStates());
  }, [dispatch]);

  // ── Prefill Document and Invoice No. from first result ────────────────────
  useEffect(() => {
    if (documentMasters.length > 0) {
      const first = documentMasters[0];
      setDocument_(first.DocumentName);
      setInvoiceNo(`${first.Prefix}-${first.StartingNo}`);
      setCurrency(String(first.CurrencyID));
      setExRate(String(first.ExchRate));
      dispatch(fetchInvoiceTaxTypes({ documentID: first.DocumentID }));
    }
  }, [documentMasters]);

  // ── Prefill Invoice Tax Type from first result ────────────────────────────
  useEffect(() => {
    if (invoiceTaxTypes.length > 0) {
      setInvoiceTaxType(String(invoiceTaxTypes[0].InvoiceTaxTypeID));
    }
  }, [invoiceTaxTypes]);

  // ── Prefill Store from first result ──────────────────────────────────────
  useEffect(() => {
    if (defaultStores.length > 0) {
      setStore(String(defaultStores[0].StoreID));
    }
  }, [defaultStores]);

  // ── Prefill State from defaultStates ──────────────────────────────────────
  useEffect(() => {
    if (defaultStates.length > 0) {
      setState_(String(defaultStates[0].StateID));
    }
  }, [defaultStates]);

  // ── Line items ─────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([makeEmptyRow(1)]);
  const [nextId, setNextId] = useState(2);
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);

  const handleAddRow = () => {
    setLineItems((prev) => [...prev, makeEmptyRow(nextId)]);
    setNextId((n) => n + 1);
  };
  const handleRemoveRow = (id: number) => {
    setLineItems((prev) => prev.filter((r) => r.id !== id));
  };
  const handleUpdateRow = (id: number, field: keyof InvoiceLineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const handleBulkUpdateRow = (id: number, patch: Partial<InvoiceLineItem>) => {
    setLineItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  // ── Item select: fetch production details and prefill row ─────────────────
  const handleItemSelect = async (rowId: number, itemId: string) => {
    if (!itemId) return;

    // Find the selected product to get its ItemCode
    const selectedProduct = productDetails.find((p) => String(p.ItemID) === itemId);
    if (!selectedProduct) return;

    // Find the selected customer to get CustomerCode
    const selectedCustomer = customers.find((c) => String(c.CustomerID) === customer);

    setLoadingRowId(rowId);
    try {
      const result = await dispatch(
        fetchProductionItemDetails({
          customerId: Number(customer),
          customerCode: selectedCustomer?.CustomerCode ?? "",
          invoiceTaxTypeId: Number(invoiceTaxType),
          itemCode: selectedProduct.ItemCode ?? "",
          itemId: selectedProduct.ItemID,
        })
      ).unwrap();

      if (result.length > 0) {
        const d = result[0];
        handleBulkUpdateRow(rowId, {
          specification: d.Description ?? "",
          currentStock: String(d.CurrentQuantity ?? ""),
          sUnit: d.SalesUnit ?? "",
          sRate: d.SalesRate != null ? String(d.SalesRate) : "",
          gstPct: d.TaxValue != null ? String(d.TaxValue) : "",
          sgstPct: d.SGST != null ? String(d.SGST) : "",
          cgstPct: d.CGST != null ? String(d.CGST) : "",
          igstPct: d.IGST != null ? String(d.IGST) : "",
          utgstPct: d.UTGST != null ? String(d.UTGST) : "",
          cessPct: d.CESS != null ? String(d.CESS) : "",
        });
      }
    } catch {
      toast.error("Failed to fetch item details. Please try again.");
    } finally {
      setLoadingRowId(null);
    }
  };

  // ── Checkboxes ─────────────────────────────────────────────────────────────
  const [registered, setRegistered] = useState(false);
  const [directPurchase, setDirectPurchase] = useState(false);

  // ── Static options (replace with real Redux data) ─────────────────────────
  const documentOptions = documentMasters.map((d) => ({
    label: d.DocumentName,
    value: d.DocumentName,
  }));
  const taxTypeOptions = invoiceTaxTypes.map((t) => ({
    label: t.InvoiceTaxType,
    value: String(t.InvoiceTaxTypeID),
  }));
  const paymentTypeOptions = paymentTypes.map((p) => ({
    label: p.PaymentTypeName,
    value: String(p.PaymentTypeID),
  }));
  const storeOptions = (stores.length > 0 ? stores : defaultStores).map((s) => ({
    label: s.StoreName,
    value: String(s.StoreID),
  }));
  const customerOptions = customers.map((c) => ({
    label: c.CustomerName,
    value: String(c.CustomerID),
  }));
  const gstTypeOptions = gstTypes.map((g) => ({
    label: g.GSTType,
    value: String(g.GSTTypeID),
  }));
  const stateOptions = (states.length > 0 ? states : defaultStates).map((s) => ({
    label: s.StateName,
    value: String(s.StateID),
  }));
  const currencyOptions = currencies.map((c) => ({
    label: `${c.Currency}${c.CurrencyCode ? ` (${c.CurrencyCode})` : ""}`,
    value: String(c.CurrencyID),
  }));

  const productOptions = productDetails.map((p) => ({
    label: p.ItemName,
    value: String(p.ItemID),
  }));

  // Returns true if the dropdown is allowed to open; false if blocked (no customer)
  const handleItemOpen = (): boolean => {
    if (!customer) {
      toast.warning("Please select a customer before adding items.", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
      });
      return false;
    }
    dispatch(fetchProductDetails());
    return true;
  };

  const handleClear = () => {
    const first = documentMasters[0];
    setDocument_(first ? first.DocumentName : "");
    setInvoiceNo(first ? `${first.Prefix}-${first.StartingNo}` : "");
    setCurrency(first ? String(first.CurrencyID) : "");
    setExRate(first ? String(first.ExchRate) : "1");
    setInvoiceTaxType("");
    setPaymentType("");
    setStore("");
    setCustomer("");
    setGstType("");
    setState_("");
    setRemarks("");
    setShippingGstNo("");
    setShippingPhoneNo("");
    setShippingAddress("");
    setBillingGstNo("");
    setBillingPhoneNo("");
    setBillingAddress("");
    setLineItems([makeEmptyRow(1)]);
    setNextId(2);
    setRegistered(false);
    setDirectPurchase(false);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // ── Basic validation ───────────────────────────────────────────────────
    if (!customer) {
      toast.error("Please select a customer.");
      return;
    }
    if (!store) {
      toast.error("Please select a store.");
      return;
    }
    if (!paymentType) {
      toast.error("Please select a payment type.");
      return;
    }

    // ── Lookup display values from selected IDs ────────────────────────────
    const selectedCustomer = customers.find((c) => String(c.CustomerID) === customer);
    const selectedStore = (stores.length > 0 ? stores : defaultStores).find((s) => String(s.StoreID) === store);
    const selectedPayType = paymentTypes.find((p) => String(p.PaymentTypeID) === paymentType);
    const selectedGstType = gstTypes.find((g) => String(g.GSTTypeID) === gstType);
    const selectedState = (states.length > 0 ? states : defaultStates).find((s) => String(s.StateID) === state_);
    const selectedDoc = documentMasters.find((d) => d.DocumentName === document_);
    const selectedTaxType = invoiceTaxTypes.find((t) => String(t.InvoiceTaxTypeID) === invoiceTaxType);
    const selectedCurrency = currencies.find((c) => String(c.CurrencyID) === currency);

    // ── Build LstSalesDetails from lineItems ──────────────────────────────
    const lstSalesDetails: RetailInvoiceSalesDetail[] = lineItems
      .filter((row) => row.item)
      .map((row) => {
        const product = productDetails.find((p) => String(p.ItemID) === row.item);
        return {
          ItemID: Number(row.item),
          ItemCode: product?.ItemCode ?? null,
          ItemName: product?.ItemName ?? "",
          Description: row.specification || null,
          Quantity: parseFloat(row.quantity) || 0,
          SalesUnitID: product?.SalesUnitID ?? 0,
          SalesUnit: row.sUnit || product?.SalesUnit || "",
          SalesRate: parseFloat(row.sRate) || 0,
          TaxValue: parseFloat(row.gstPct) || 0,
          TaxAmount: parseFloat(row.gstAmount) || 0,
          Amount: parseFloat(row.amount) || 0,
          SGST: parseFloat(row.sgstPct) || null,
          CGST: parseFloat(row.cgstPct) || null,
          IGST: parseFloat(row.igstPct) || null,
          UTGST: parseFloat(row.utgstPct) || null,
          CESS: parseFloat(row.cessPct) || null,
          SGSTAmount: parseFloat(row.sgstAmt) || null,
          CGSTAmount: parseFloat(row.cgstAmt) || null,
          IGSTAmount: parseFloat(row.igstAmt) || null,
          UTGSTAmount: parseFloat(row.utgstAmt) || null,
          CESSAmount: parseFloat(row.cessAmt) || null,
        };
      });

    // ── Compute totals from lineItems ──────────────────────────────────────
    const totalQty = lstSalesDetails.reduce((s, r) => s + r.Quantity, 0);
    const grossAmt = lstSalesDetails.reduce((s, r) => s + r.Amount, 0);
    const totalTax = lstSalesDetails.reduce((s, r) => s + r.TaxAmount, 0);
    const netAmt = grossAmt + totalTax;
    const totalSGST = lstSalesDetails.reduce((s, r) => s + (r.SGSTAmount ?? 0), 0);
    const totalCGST = lstSalesDetails.reduce((s, r) => s + (r.CGSTAmount ?? 0), 0);
    const totalIGST = lstSalesDetails.reduce((s, r) => s + (r.IGSTAmount ?? 0), 0);
    const totalUTGST = lstSalesDetails.reduce((s, r) => s + (r.UTGSTAmount ?? 0), 0);
    const totalCESS = lstSalesDetails.reduce((s, r) => s + (r.CESSAmount ?? 0), 0);

    const now = new Date().toISOString();

    const payload: SaveRetailInvoicePayload = {
      RetInvDateStr: invoiceDate,
      TaxPercHead: "GST %",
      TaxAmountHead: "GST Amt",
      Intercompany: false,
      BillingAddress: billingAddress || null,
      BillingPhNo: billingPhoneNo || null,
      ChequeDate: null,
      Currency: selectedCurrency?.Currency ?? "",
      CurrencyID: Number(currency),
      CustRefDate: null,
      CustomerCode: selectedCustomer?.CustomerCode ?? null,
      CustomerID: Number(customer),
      CustomerName: selectedCustomer?.CustomerName ?? "",
      DateTypeList: { Id: 0, Name: "Proforma Date" },
      DeliveryWeek: null,
      DirectPurchase: directPurchase,
      DocumentID: selectedDoc?.DocumentID ?? 0,
      DocumentName: document_,
      ExRate: parseFloat(exRate) || 1,
      ExpIncSalesOrderDocID: 0,
      GSTType: selectedGstType?.GSTType ?? "",
      GSTTypeID: Number(gstType),
      GrossAmount: grossAmt.toFixed(4),
      GrossAmountBase: grossAmt,
      IsGST: selectedDoc?.IsGST ?? true,
      IsLocalOrder: false,
      LstSalesDetails: lstSalesDetails,
      NetAmount: netAmt.toFixed(4),
      OtherAdditionalAmount: "0.0000",
      OtherAdditionalAmountBase: "0.000",
      OtherDeductionAmount: "0.0000",
      OtherDeductionAmountBase: "0.000",
      PaymentTypeID: Number(paymentType),
      PaymentTypeName: selectedPayType?.PaymentTypeName ?? "",
      PreNetAmount: netAmt.toFixed(3),
      PreNetAmountBase: netAmt.toFixed(3),
      ProbableAdvDate: null,
      ProdCompletionDate: null,
      ProjectedArrivalDate: null,
      Registered: registered,
      ReviewDate: now,
      ReviewDateStr: invoiceDate,
      ReviewedOn: now,
      SalesDate: now,
      SalesNo: invoiceNo,
      SalesRefDate: null,
      SameShippingAddress: false,
      ShipmentDate: null,
      ShippingAddress: shippingAddress || null,
      StateID: Number(state_),
      StateName: selectedState?.StateName ?? "",
      StoreID: Number(store),
      StoreName: selectedStore?.StoreName ?? "",
      TaxInvoice: true,
      TaxMasterID: selectedDoc?.TaxMasterID ?? 1,
      TotalCESSAmt: totalCESS,
      TotalCGSTAmt: totalCGST,
      TotalDiscount: "0.0000",
      TotalDiscountBase: 0,
      TotalIGSTAmt: totalIGST,
      TotalNetAmountWithOutRounding: netAmt.toFixed(4),
      TotalNetAmountWithOutTax: grossAmt.toFixed(4),
      TotalQuantity: totalQty.toFixed(4),
      TotalSGSTAmt: totalSGST,
      TotalTax: totalTax,
      TotalTaxBase: totalTax.toFixed(3),
      TotalUTGSTAmt: totalUTGST,
      TotalVATAmount: 0,
      InvoiceTaxType: selectedTaxType?.InvoiceTaxType ?? "",
      InvoiceTaxTypeID: Number(invoiceTaxType),
    };

    try {
      const result = await dispatch(saveRetailInvoice(payload)).unwrap();
      if (result.Success) {
        dispatch(clearSaveRetailInvoice());
        toast.success(`Invoice ${invoiceNo} saved successfully!`,{
           style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        }
        });
        onSaveSuccess?.({
          SalesID: result.Id,
          SalesNo: invoiceNo,
          SalesDate: invoiceDate,
          CustomerName: selectedCustomer?.CustomerName ?? "",
          NetAmount: netAmt,
          CreatedBy: "Admin",
          Approve: "Pending",
          ApprovedBY: "",
          CustomerCode: selectedCustomer?.CustomerCode ?? null,
          Document: document_,
          FaClass: selectedCustomer?.FaClass ?? "fas fa-rupee-sign",
          TotalRowCount: 0,
        });
        onBack?.();
      } else {
        toast.error(result.Message || "Failed to save invoice. Please try again.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save invoice. Please try again.");
    }
  };

  // ── Net Amount ─────────────────────────────────────────────────────────────
  const netAmount = React.useMemo(() => {
    const total = lineItems.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    return total.toFixed(2);
  }, [lineItems]);

  return (
    <div className="min-h-screen" style={{ background: "#f0f5fb", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══════════════ PAGE HEADER ═══════════════ */}
      <div className="sticky top-0 z-30 shadow-sm" style={{ background: BRAND }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={16} color="white" strokeWidth={2.5} />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
              <ShoppingCart size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Retail Invoice</h1>
              <p className="text-xs text-white/60 font-medium">Create new retail sales invoice</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
          >
            <ReceiptText size={14} strokeWidth={2.2} />
            Retail Invoice Details
          </button>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* ═══════════════ ACCORDION SECTIONS ═══════════════ */}
        <Accordion type="multiple" defaultValue={["general", "address"]} className="space-y-4">

          {/* ── GENERAL ── */}
          <AccordionItem
            value="general"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/30 transition-colors [&>svg]:text-[#004687]">
              <AccordionLabel icon={FileText} title="General" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 h-full">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                <div>
                  <FieldLabel icon={FileText} label="Document" />
                  <SearchableCombobox
                    value={document_}
                    onChange={(val) => {
                      setDocument_(val);
                      const selected = documentMasters.find((d) => d.DocumentName === val);
                      if (selected) setInvoiceNo(`${selected.Prefix}-${selected.StartingNo}`);
                    }}
                    placeholder={documentMastersLoading ? "Loading…" : "Select Document"}
                    searchPlaceholder="Search document…"
                    emptyText="No document found."
                    icon={<FileText size={14} />}
                    options={documentOptions}
                  />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Invoice No." />
                  <InputField
                    icon={<Hash size={14} />}
                    placeholder="Invoice No."
                    value={invoiceNo}
                    onChange={setInvoiceNo}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Invoice Date" />
                  <InputField
                    icon={<Calendar size={14} />}
                    placeholder="Invoice Date"
                    value={invoiceDate}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Tag} label="Invoice Tax Type" />
                  <SearchableCombobox
                    value={invoiceTaxType}
                    onChange={setInvoiceTaxType}
                    placeholder={invoiceTaxTypesLoading ? "Loading…" : "Select Tax Type"}
                    searchPlaceholder="Search tax type…"
                    emptyText="No tax type found."
                    icon={<Tag size={14} />}
                    options={taxTypeOptions}
                    onOpen={() => {
                      const selectedDoc = documentMasters.find((d) => d.DocumentName === document_);
                      dispatch(fetchAllInvoiceTaxTypes({ taxMasterId: selectedDoc?.TaxMasterID ?? 1 }));
                      return true;
                    }}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard} label="Payment Type" />
                  <SearchableCombobox
                    value={paymentType}
                    onChange={setPaymentType}
                    placeholder={paymentTypesLoading ? "Loading…" : "Select Payment Type"}
                    searchPlaceholder="Search payment…"
                    emptyText="No payment type found."
                    icon={<CreditCard size={14} />}
                    options={paymentTypeOptions}
                  />
                </div>
                <div>
                  <FieldLabel icon={Store} label="Store" />
                  <SearchableCombobox
                    value={store}
                    onChange={setStore}
                    placeholder={storesLoading ? "Loading…" : "Select Store"}
                    searchPlaceholder="Search store…"
                    emptyText="No store found."
                    icon={<Store size={14} />}
                    options={storeOptions}
                    onOpen={() => {
                      dispatch(fetchStores());
                      return true;
                    }}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mt-5">
                <div className="xl:col-span-2">
                  <FieldLabel icon={Users} label="Customer" />
                  <SearchableCombobox
                    value={customer}
                    onChange={(val) => {
                      setCustomer(val);
                      const selected = customers.find((c) => String(c.CustomerID) === val);
                      setBillingAddress(selected?.CustomerAddress ?? "");
                    }}
                    placeholder={customersLoading ? "Loading…" : "Select Customer"}
                    searchPlaceholder="Search customer…"
                    emptyText="No customer found."
                    icon={<Users size={14} />}
                    options={customerOptions}
                  />
                </div>
                <div>
                  <FieldLabel icon={Percent} label="GST Type" />
                  <SearchableCombobox
                    value={gstType}
                    onChange={setGstType}
                    placeholder={gstTypesLoading ? "Loading…" : "Select GST Type"}
                    searchPlaceholder="Search GST type…"
                    emptyText="No GST type found."
                    icon={<Percent size={14} />}
                    options={gstTypeOptions}
                    onOpen={() => { dispatch(fetchGSTTypes()); return true; }}
                  />
                </div>
                <div>
                  <FieldLabel icon={MapPin} label="State" />
                  <SearchableCombobox
                    value={state_}
                    onChange={setState_}
                    placeholder={statesLoading ? "Loading…" : "Select State"}
                    searchPlaceholder="Search state…"
                    emptyText="No state found."
                    icon={<MapPin size={14} />}
                    options={stateOptions}
                    onOpen={() => { dispatch(fetchStateStartWith()); return true; }}
                  />
                </div>
                <div>
                  <FieldLabel icon={BadgeDollarSign} label="Currency" />
                  <SearchableCombobox
                    value={currency}
                    onChange={async (val) => {
                      setCurrency(val);
                      dispatch(clearCurrencies());
                      dispatch(clearCurrencyExRate());
                      setExRate("1");
                      if (val) {
                        try {
                          const result = await dispatch(
                            fetchCurrencyExRate({
                              currencyID: Number(val),
                              date: new Date().toISOString(),
                            })
                          ).unwrap();
                          setExRate(String(result.ExchRate ?? "1"));
                        } catch {
                          // leave exRate as "1" if no rate found
                        }
                      }
                    }}
                    placeholder={currenciesLoading ? "Loading…" : "Select Currency"}
                    searchPlaceholder="Search currency…"
                    emptyText="No currency found."
                    icon={<BadgeDollarSign size={14} />}
                    options={currencyOptions}
                    onOpen={() => {
                      dispatch(fetchCurrencies());
                      return true;
                    }}
                  />
                </div>
                <div>
                  <FieldLabel icon={Globe} label="Ex. Rate" />
                  <div className="relative">
                    <InputField
                      icon={currencyExRateLoading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                      placeholder="1"
                      value={exRate}
                      onChange={setExRate}
                      type="number"
                      readOnly={currencyExRateLoading}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── ADDRESS ── */}
          <AccordionItem
            value="address"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/30 transition-colors [&>svg]:text-[#004687]">
              <AccordionLabel icon={MapPin} title="Address" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Row 1 — GST No. + Phone No. (Shipping left, Billing right) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <FieldLabel icon={Hash} label="Shipping GST No." />
                  <InputField
                    icon={<Hash size={14} />}
                    placeholder="Enter Shipping GST No"
                    value={shippingGstNo}
                    onChange={setShippingGstNo}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard} label="Shipping Phone No." />
                  <InputField
                    icon={<CreditCard size={14} />}
                    placeholder="Enter Shipping Phone No."
                    value={shippingPhoneNo}
                    onChange={setShippingPhoneNo}
                    type="tel"
                  />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Billing GST No." />
                  <InputField
                    icon={<Hash size={14} />}
                    placeholder="Enter Billing GST No."
                    value={billingGstNo}
                    onChange={setBillingGstNo}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard} label="Billing Phone No." />
                  <InputField
                    icon={<CreditCard size={14} />}
                    placeholder="Enter Billing Phone No."
                    value={billingPhoneNo}
                    onChange={setBillingPhoneNo}
                    type="tel"
                  />
                </div>
              </div>

              {/* Row 2 — Address textareas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div>
                  <FieldLabel icon={MapPin} label="Shipping Address" />
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder="Enter Shipping Address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                      style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; }}
                    />
                    <MapPin size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
                  </div>
                </div>
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
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* ═══════════════ INVOICE ITEMS TABLE ═══════════════ */}
        <InvoiceItemsTable
          items={lineItems}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          productOptions={productOptions}
          productDetailsLoading={productDetailsLoading}
          onItemOpen={handleItemOpen}
          onItemSelect={handleItemSelect}
          loadingRowId={loadingRowId}
        />

        {/* ═══════════════ FOOTER CARD ═══════════════ */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left — Remarks + Checkboxes */}
            <div className="space-y-4">
              <div>
                <FieldLabel icon={StickyNote} label="Remarks" />
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Enter Remarks"
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

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setRegistered(!registered)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                      registered ? "border-transparent" : "border-gray-300 bg-white"
                    )}
                    style={registered ? { background: BRAND, borderColor: BRAND } : {}}
                  >
                    {registered && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-gray-600">Registered</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setDirectPurchase(!directPurchase)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                      directPurchase ? "border-transparent" : "border-gray-300 bg-white"
                    )}
                    style={directPurchase ? { background: BRAND, borderColor: BRAND } : {}}
                  >
                    {directPurchase && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-gray-600">Direct Purchase</span>
                </label>
              </div>
            </div>

            {/* Right — Net Amount */}
            <div className="flex flex-col justify-end space-y-3">
              <div className="border-t pt-3" style={{ borderColor: BRAND_MID }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-base font-bold" style={{ color: BRAND }}>
                  <DollarSign size={15} style={{ color: BRAND }} />
                  Net Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">
                  {netAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleClear}
            disabled={saveRetailInvoiceLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => { if (!saveRetailInvoiceLoading) e.currentTarget.style.background = BRAND_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveRetailInvoiceLoading}
            className={cn(
              "flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90",
              saveRetailInvoiceLoading && "opacity-70 cursor-not-allowed"
            )}
            style={{ background: BRAND }}
          >
            {saveRetailInvoiceLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={15} />
                Submit
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default CreateRetailInvoice;
  