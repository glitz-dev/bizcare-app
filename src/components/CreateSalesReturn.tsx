"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentMasters,
  fetchPaymentTypes,
  fetchCustomersForReturn,
  fetchDefaultStores,
  fetchSalesDetailsForReturn,
  fetchSelectedSalesForReturn,
  fetchAccountHeads,
  fetchAllAccountHeads,
  fetchStoresStartWith,
  clearSalesDetails,
  clearStoresStartWith,
  clearSelectedSalesForReturn,
  saveSalesReturn,
  clearSaveSalesReturnStatus,
} from "../store/features/inventory/sales/salesReturnSlice";
import {
  FileText,
  Hash,
  Calendar,
  Store,
  Users,
  CreditCard,
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  Settings2,
  Package,
  StickyNote,
  DollarSign,
  Percent,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  Save,
  RefreshCw,
  Loader2,
  ChevronsUpDown,
  Receipt,
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

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone, type = "success" }: { message: string; onDone: () => void; type?: "success" | "error" }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ background: type === "error" ? "#7f1d1d" : "#1e3a5f", minWidth: 280 }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        {type === "error" ? <X size={13} strokeWidth={2.5} /> : <Check size={13} strokeWidth={2.5} />}
      </span>
      {message}
    </div>
  );
}

function getTodayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ReturnLineItem = {
  id: number;
  itemCode: string;
  item: string;
  salesQty: string;
  returnQty: string;
  sRate: string;
  discountPct: string;
  discount: string;
  taxPct: string;
  taxAmount: string;
  netAmount: string;
  sgstPct: string;
  cgstPct: string;
  igstPct: string;
  utgstPct: string;
  sgstAmount: string;
  cgstAmount: string;
  igstAmount: string;
  utgstAmount: string;
};

function makeEmptyRow(id: number): ReturnLineItem {
  return {
    id,
    itemCode: "",
    item: "",
    salesQty: "",
    returnQty: "",
    sRate: "",
    discountPct: "",
    discount: "",
    taxPct: "",
    taxAmount: "",
    netAmount: "",
    sgstPct: "",
    cgstPct: "",
    igstPct: "",
    utgstPct: "",
    sgstAmount: "",
    cgstAmount: "",
    igstAmount: "",
    utgstAmount: "",
  };
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
  loading = false,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
  onOpenAttempt,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  loading?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  onOpenAttempt?: () => boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    if (next && onOpenAttempt) {
      const allowed = onOpenAttempt();
      if (!allowed) return;
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
        <Command key={loading ? "loading" : "ready"}>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 size={15} className="animate-spin" style={{ color: BRAND }} />
                Loading…
              </div>
            ) : (
              <>
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

// ─── Return Items Table ───────────────────────────────────────────────────────
function ReturnItemsTable({
  items,
  onAdd,
  onRemove,
  onUpdate,
}: {
  items: ReturnLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof ReturnLineItem, value: string) => void;
}) {
  const [colSettingsOpen, setColSettingsOpen] = useState(false);

  const allCols = [
    { key: "itemCode",    label: "Item Code" },
    { key: "item",        label: "Item" },
    { key: "salesQty",   label: "Sales Qty" },
    { key: "returnQty",  label: "Ret. Qty" },
    { key: "sRate",       label: "S.Rate" },
    { key: "discountPct", label: "Discount %" },
    { key: "discount",    label: "Discount" },
    { key: "taxPct",      label: "Tax %" },
    { key: "taxAmount",   label: "Tax Amount" },
    { key: "netAmount",   label: "Net Amount" },
    { key: "sgstPct",     label: "SGST %" },
    { key: "cgstPct",     label: "CGST %" },
    { key: "igstPct",     label: "IGST %" },
    { key: "utgstPct",    label: "UTGST %" },
    { key: "sgstAmount",  label: "SGST Amount" },
    { key: "cgstAmount",  label: "CGST Amount" },
    { key: "igstAmount",  label: "IGST Amount" },
    { key: "utgstAmount", label: "UTGST Amount" },
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
    row: ReturnLineItem,
    field: keyof ReturnLineItem,
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
          <span className="text-sm font-bold tracking-widest uppercase text-white">
            Return Items
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
              {visibleCols.has("itemCode") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Item Code</th>
              )}
              {visibleCols.has("item") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Item</th>
              )}
              {visibleCols.has("salesQty") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Sales Qty</th>
              )}
              {visibleCols.has("returnQty") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Ret. Qty</th>
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
              {visibleCols.has("taxAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Tax Amount</th>
              )}
              {visibleCols.has("netAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>Net Amount</th>
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
              {visibleCols.has("sgstAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>SGST Amount</th>
              )}
              {visibleCols.has("cgstAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>CGST Amount</th>
              )}
              {visibleCols.has("igstAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>IGST Amount</th>
              )}
              {visibleCols.has("utgstAmount") && (
                <th className="px-3 py-2.5 text-left font-bold" style={{ color: BRAND }}>UTGST Amount</th>
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
                {visibleCols.has("itemCode") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "itemCode", "Item Code", "w-24")}
                  </td>
                )}
                {visibleCols.has("item") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "item", "Item Name", "min-w-[140px]")}
                  </td>
                )}
                {visibleCols.has("salesQty") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "salesQty", "0", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("returnQty") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "returnQty", "0", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("sRate") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sRate", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("discountPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "discountPct", "0", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("discount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "discount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("taxPct") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "taxPct", "0", "w-16", true)}
                  </td>
                )}
                {visibleCols.has("taxAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "taxAmount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("netAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "netAmount", "0.000", "w-20", true)}
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
                {visibleCols.has("sgstAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "sgstAmount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("cgstAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "cgstAmount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("igstAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "igstAmount", "0.000", "w-20", true)}
                  </td>
                )}
                {visibleCols.has("utgstAmount") && (
                  <td className="px-2 py-1.5">
                    {cellInput(row, "utgstAmount", "0.000", "w-20", true)}
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

// ─── Main Component ───────────────────────────────────────────────────────────
interface CreateSalesReturnProps {
  onBack?: () => void;
}

const CreateSalesReturn: React.FC<CreateSalesReturnProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state ──────────────────────────────────────────────────────────
  const {
    documentMasters,
    documentMastersLoading,
    paymentTypes,
    paymentTypesLoading,
    customers,
    customersLoading,
    defaultStores,
    defaultStoresLoading,
    storesStartWith,
    storesStartWithLoading,
    salesDetails,
    salesDetailsLoading,
    accountHeads,
    accountHeadsLoading,
    selectedSalesForReturn,
    selectedSalesForReturnLoading,
    saveSalesReturnLoading,
  } = useSelector((state: RootState) => state.salesReturn);

  // ── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDocumentMasters());
    dispatch(fetchPaymentTypes());
    dispatch(fetchCustomersForReturn());
    dispatch(fetchDefaultStores());
    dispatch(fetchAccountHeads());
  }, [dispatch]);

  // ── Header fields ────────────────────────────────────────────────────────
  const [document_, setDocument_] = useState("");
  const [returnNo, setReturnNo] = useState("");
  const [returnDate] = useState(getTodayFormatted());
  const [customer, setCustomer] = useState("");
  const [salesNo, setSalesNo] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [storeId, setStoreId] = useState("");
  const [accountHead, setAccountHead] = useState("");

  // ── Prefill Document + Return No. when documentMasters loads ─────────────
  useEffect(() => {
    if (documentMasters.length > 0) {
      const defaultDoc = documentMasters.find((d: any) => d.SetDefault) ?? documentMasters[0];
      setDocument_(String(defaultDoc.DocumentID));
      setReturnNo(
        defaultDoc.Suffix
          ? `${defaultDoc.Prefix}-${defaultDoc.StartingNo}-${defaultDoc.Suffix}`
          : `${defaultDoc.Prefix}-${defaultDoc.StartingNo}`
      );
    }
  }, [documentMasters]);

  // ── Derived combobox options ─────────────────────────────────────────────
  const documentOptions = documentMasters.map((d: any) => ({
    label: d.DocumentName,
    value: String(d.DocumentID),
  }));

  const paymentTypeOptions = paymentTypes.map((p: any) => ({
    label: p.PaymentTypeName,
    value: String(p.PaymentTypeID),
  }));

  const customerOptions = customers.map((c: any) => ({
    label: c.CustomerName,
    value: String(c.CustomerID),
  }));

  const storeOptions = (storesStartWith.length > 0 ? storesStartWith : defaultStores).map((s: any) => ({
    label: s.StoreName,
    value: String(s.StoreID),
  }));

  // ── Track whether stores have been fetched ───────────────────────────────
  const storesFetched = React.useRef(false);

  // ── Store open attempt: fetch on first open ──────────────────────────────
  const handleStoreOpenAttempt = (): boolean => {
    if (!storesFetched.current) {
      storesFetched.current = true;
      dispatch(fetchStoresStartWith());
    }
    return true;
  };

  const salesNoOptions = salesDetails.map((s: any) => ({
    label: `${s.SalesNo} — ${s.firstDescr}`,
    value: String(s.SalesID),
  }));

  const accountHeadOptions = accountHeads.map((h: any) => ({
    label: h.HeadName,
    value: String(h.HeadID),
  }));

  // ── Track whether full account heads list has been fetched ───────────────
  const allAccountHeadsFetched = React.useRef(false);

  // ── Prefill Account Head from fetchAccountHeads() response on mount ──────
  useEffect(() => {
    if (accountHeads.length > 0 && !allAccountHeadsFetched.current && !accountHead) {
      setAccountHead(String(accountHeads[0].HeadID));
    }
  }, [accountHeads]);

  // ── Account Head open attempt: fetch full list on first open ─────────────
  const handleAccountHeadOpenAttempt = (): boolean => {
    if (!allAccountHeadsFetched.current) {
      allAccountHeadsFetched.current = true;
      dispatch(fetchAllAccountHeads());
    }
    return true;
  };

  // ── Toast state ──────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToastType(type);
    setToastMsg(message);
  };

  // ── Customer change: clear sales details & selection ────────────────────
  const handleCustomerChange = (val: string) => {
    setCustomer(val);
    setSalesNo("");
    dispatch(clearSalesDetails());
    dispatch(clearSelectedSalesForReturn());
    setLineItems([makeEmptyRow(1)]);
    setNextId(2);
  };

  // ── Sales No. change: set value + fetch full sales detail ────────────────
  const handleSalesNoChange = (val: string) => {
    setSalesNo(val);
    if (val) {
      dispatch(fetchSelectedSalesForReturn({ salesInvoiceID: Number(val) }));
    } else {
      dispatch(clearSelectedSalesForReturn());
      setLineItems([makeEmptyRow(1)]);
      setNextId(2);
    }
  };

  // ── Populate line items when selectedSalesForReturn loads ────────────────
  useEffect(() => {
    if (!selectedSalesForReturn) return;
    const rows: ReturnLineItem[] = selectedSalesForReturn.LstSalesDetails.map((item, idx) => ({
      id: idx + 1,
      itemCode: item.ItemCode ?? "",
      item: item.ItemName ?? "",
      salesQty: item.Quantity != null ? String(item.Quantity) : "",
      returnQty: "",
      sRate: item.SalesRate != null ? String(item.SalesRate) : "",
      discountPct: item.DiscountPercentage != null ? String(item.DiscountPercentage) : "",
      discount: item.DiscountAmount != null ? String(item.DiscountAmount) : "",
      taxPct: item.TaxPercentage != null ? String(item.TaxPercentage) : "",
      taxAmount: item.TaxAmount != null ? String(item.TaxAmount) : "",
      netAmount: item.Amount != null ? String(item.Amount) : "",
      sgstPct: item.SGSTPer != null ? String(item.SGSTPer) : "",
      cgstPct: item.CGSTPer != null ? String(item.CGSTPer) : "",
      igstPct: item.IGSTPer != null ? String(item.IGSTPer) : "",
      utgstPct: item.UTGSTPer != null ? String(item.UTGSTPer) : "",
      sgstAmount: item.SGSTAmt != null ? String(item.SGSTAmt) : "",
      cgstAmount: item.CGSTAmt != null ? String(item.CGSTAmt) : "",
      igstAmount: item.IGSTAmt != null ? String(item.IGSTAmt) : "",
      utgstAmount: item.UTGSTAmt != null ? String(item.UTGSTAmt) : "",
    }));
    setLineItems(rows.length > 0 ? rows : [makeEmptyRow(1)]);
    setNextId(rows.length + 1);
  }, [selectedSalesForReturn]);

  // ── Sales No. open attempt: guard + fetch ────────────────────────────────
  const handleSalesNoOpenAttempt = (): boolean => {
    if (!customer) {
      showNotification("Please select customer before selecting Sales No.", "error");
      return false;
    }
    dispatch(fetchSalesDetailsForReturn({ customerID: Number(customer) }));
    return true;
  };

  // ── Prefill Store when defaultStores loads ───────────────────────────────
  useEffect(() => {
    if (defaultStores.length > 0 && !storeId) {
      setStoreId(String(defaultStores[0].StoreID));
    }
  }, [defaultStores]);

  // ── When user manually changes Document, sync Return No. ────────────────
  const handleDocumentChange = (val: string) => {
    setDocument_(val);
    const doc = documentMasters.find((d: any) => String(d.DocumentID) === val);
    if (doc) {
      setReturnNo(
        doc.Suffix
          ? `${doc.Prefix}-${doc.StartingNo}-${doc.Suffix}`
          : `${doc.Prefix}-${doc.StartingNo}`
      );
    }
  };

  // ── Line items ────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<ReturnLineItem[]>([makeEmptyRow(1)]);
  const [nextId, setNextId] = useState(2);

  const handleAddRow = () => {
    setLineItems((prev) => [...prev, makeEmptyRow(nextId)]);
    setNextId((n) => n + 1);
  };

  const handleRemoveRow = (id: number) => {
    setLineItems((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: number, field: keyof ReturnLineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ── Footer ────────────────────────────────────────────────────────────────
  const [remarks, setRemarks] = useState("");

  const handleClear = () => {
    if (documentMasters.length > 0) {
      const defaultDoc = documentMasters.find((d: any) => d.SetDefault) ?? documentMasters[0];
      setDocument_(String(defaultDoc.DocumentID));
      setReturnNo(
        defaultDoc.Suffix
          ? `${defaultDoc.Prefix}-${defaultDoc.StartingNo}-${defaultDoc.Suffix}`
          : `${defaultDoc.Prefix}-${defaultDoc.StartingNo}`
      );
    } else {
      setDocument_("");
      setReturnNo("");
    }
    setCustomer("");
    setSalesNo("");
    setPaymentType("");
    setStoreId("");
    storesFetched.current = false;
    dispatch(clearStoresStartWith());
    dispatch(clearSelectedSalesForReturn());
    setAccountHead("");
    allAccountHeadsFetched.current = false;
    setRemarks("");
    setLineItems([makeEmptyRow(1)]);
    setNextId(2);
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const fmt = (n: number) => n.toFixed(2);

  const totals = React.useMemo(() => {
    if (!salesNo || selectedSalesForReturnLoading || !selectedSalesForReturn) return null;

    const hasReturnQty = lineItems.some((r) => parseFloat(r.returnQty) > 0);

    if (hasReturnQty) {
      let gross = 0;
      let tax = 0;
      for (const row of lineItems) {
        const qty    = parseFloat(row.returnQty)   || 0;
        const rate   = parseFloat(row.sRate)        || 0;
        const discPct = parseFloat(row.discountPct) || 0;
        const taxPct  = parseFloat(row.taxPct)      || 0;

        const lineGross = qty * rate;
        const discAmt   = lineGross * (discPct / 100);
        const preTax    = lineGross - discAmt;
        const lineTax   = preTax * (taxPct / 100);

        gross += lineGross;
        tax   += lineTax;
      }
      const preNet = gross - lineItems.reduce((sum, r) => sum + (parseFloat(r.discount) || 0), 0);
      const net    = preNet + tax;
      return { gross: fmt(gross), tax: fmt(tax), preNet: fmt(preNet), net: fmt(net) };
    }

    const s    = selectedSalesForReturn;
    const gross = s.GrossAmount  != null ? s.GrossAmount  : s.NetAmount;
    const tax   = s.TotalTax     != null ? s.TotalTax     : 0;
    const net   = s.NetAmount;
    const preNet = net - tax;
    return {
      gross:  fmt(gross),
      tax:    fmt(tax),
      preNet: fmt(preNet),
      net:    fmt(net),
    };
  }, [salesNo, selectedSalesForReturn, selectedSalesForReturnLoading, lineItems]);

  const grossAmount  = totals ? totals.gross  : "—";
  const totalTax     = totals ? totals.tax     : "—";
  const preNetAmount = totals ? totals.preNet  : "—";
  const netAmount    = totals ? totals.net     : "—";

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const selectedDocObj = documentMasters.find((d: any) => String(d.DocumentID) === document_);
    const selectedCustObj = customers.find((c: any) => String(c.CustomerID) === customer);
    const selectedPayObj = paymentTypes.find((p: any) => String(p.PaymentTypeID) === paymentType);
    const selectedStoreObj = (storesStartWith.length > 0 ? storesStartWith : defaultStores).find((s: any) => String(s.StoreID) === storeId);
    const selectedHeadObj = accountHeads.find((h: any) => String(h.HeadID) === accountHead);

    if (!selectedDocObj) {
      showNotification("Please select a valid Document.", "error");
      return;
    }
    if (!selectedCustObj) {
      showNotification("Please select a Customer.", "error");
      return;
    }
    if (!salesNo) {
      showNotification("Please select a Sales Invoice No.", "error");
      return;
    }
    
    const validItems = lineItems.filter(item => (parseFloat(item.returnQty) || 0) > 0);
    if (validItems.length === 0) {
      showNotification("Please specify a return quantity greater than 0 on at least one line item.", "error");
      return;
    }

    const payload = {
      SalesReturnDateStr: returnDate,
      SalesReturnDate: returnDate,
      ReturnNo: returnNo || "",
      DocumentID: selectedDocObj.DocumentID,
      DocumentName: selectedDocObj.DocumentName,
      CustomerID: selectedCustObj.CustomerID,
      CustomerName: selectedCustObj.CustomerName,
      SupplierID: 0,
      TaxPercHead: "Tax %",
      TaxAmountHead: "Tax Amt",
      BillwiseDiscountAmt: "0.000",
      BillwiseDiscountPer: 0,
      ChequeDate: null,
      InvoiceTypeID: 3,
      IsGST: selectedDocObj.IsGST || false,
      TaxMasterID: selectedDocObj.TaxMasterID || 0,
      OtherAdditionalAmount: "0.000",
      OtherDeductionAmount: "0.000",

      SalesMID: selectedSalesForReturn?.SalesID || 0,
      SalesNo: selectedSalesForReturn?.SalesNo || "",
      SalesInvoiceNo: selectedSalesForReturn?.SalesNo || "",
      StoreID: selectedStoreObj?.StoreID || 1,
      StoreName: selectedStoreObj?.StoreName || "",
      PaymentTypeID: selectedPayObj?.PaymentTypeID || 1,
      PaymentTypeName: selectedPayObj?.PaymentTypeName || "",
      InvoiceTaxTypeID: selectedSalesForReturn?.InvoiceTaxTypeID || 0,
      InvoiceTaxType: "", 
      DebitHeadName: selectedHeadObj?.HeadName || "",
      SalesAcHeadID: selectedHeadObj?.HeadID || 0,

      GrossAmount: String(grossAmount),
      TotalDiscount: String(lineItems.reduce((acc, item) => acc + (parseFloat(item.discount) || 0), 0)),
      TotalTax: String(totalTax),
      NetAmount: String(netAmount),
      NetTotal: String(netAmount),
      PreNetAmount: String(preNetAmount),
      TotalQuantity: String(validItems.reduce((acc, item) => acc + (parseFloat(item.returnQty) || 0), 0)),

      TotalCGSTAmt: validItems.reduce((acc, item) => acc + (parseFloat(item.cgstAmount) || 0), 0),
      TotalSGSTAmt: validItems.reduce((acc, item) => acc + (parseFloat(item.sgstAmount) || 0), 0),
      TotalIGSTAmt: validItems.reduce((acc, item) => acc + (parseFloat(item.igstAmount) || 0), 0),
      TotalUTGSTAmt: validItems.reduce((acc, item) => acc + (parseFloat(item.utgstAmount) || 0), 0),
      TotalCESSAmt: 0,
      TotalVATAmount: 0,
      TotalVATAmt: 0,

      LstsalesReturnDetails: validItems.map((item, idx) => {
        const originalDetail = selectedSalesForReturn?.LstSalesDetails[idx];
        return {
          SalesTID: originalDetail?.SalesTID || 0,
          SalesMID: originalDetail?.SalesMID || 0,
          ItemID: originalDetail?.ItemID || 0,
          ItemCode: item.itemCode,
          ItemName: item.item,
          ItemDescription: originalDetail?.ItemDescription || null,
          BatchID: originalDetail?.BatchID || null,
          BatchNo: originalDetail?.BatchNo || null,
          Quantity: parseFloat(item.returnQty) || 0,
          SalesRate: parseFloat(item.sRate) || 0,
          UnitMultiplier: originalDetail?.UnitMultiplier || 1,
          DiscountPercentage: parseFloat(item.discountPct) || 0,
          DiscountAmount: parseFloat(item.discount) || 0,
          TaxID: originalDetail?.TaxID || null,
          TaxPercentage: parseFloat(item.taxPct) || 0,
          TaxAmount: parseFloat(item.taxAmount) || 0,
          Amount: parseFloat(item.netAmount) || 0,
          GrossAmount: (parseFloat(item.returnQty) || 0) * (parseFloat(item.sRate) || 0),
          TotalAmount: parseFloat(item.netAmount) || 0,
          SalesUnitID: originalDetail?.SalesUnitID || 0,
          ItemUnitName: originalDetail?.ItemUnitName || null,
          SGSTPer: parseFloat(item.sgstPct) || 0,
          CGSTPer: parseFloat(item.cgstPct) || 0,
          IGSTPer: parseFloat(item.igstPct) || 0,
          UTGSTPer: parseFloat(item.utgstPct) || 0,
          CESSPer: 0,
          VATPer: 0,
          SGSTAmt: parseFloat(item.sgstAmount) || 0,
          CGSTAmt: parseFloat(item.cgstAmount) || 0,
          IGSTAmt: parseFloat(item.igstAmount) || 0,
          UTGSTAmt: parseFloat(item.utgstAmount) || 0,
          CESSAmt: 0,
          VATAmt: 0,
          ReturnedQty: originalDetail?.ReturnedQty || 0,
          Returned: originalDetail?.Returned || false,
          StoreID: selectedStoreObj?.StoreID || null,
          Remarks: remarks || null,
        };
      }),
    };

    const resultAction = await dispatch(saveSalesReturn(payload));

    if (saveSalesReturn.fulfilled.match(resultAction)) {
      showNotification("Sales return saved successfully", "success");
      handleClear();
    } else {
      showNotification(resultAction.payload || "Failed to save sales return changes.", "error");
    }
    dispatch(clearSaveSalesReturnStatus());
  };

  return (
    <div className="min-h-screen" style={{ background: "#f0f5fb", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sticky header bar ── */}
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
              <ReceiptText size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold leading-none">
                Document
              </p>
              <h1 className="text-white text-base font-bold tracking-tight leading-tight">
                Sales Return
              </h1>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hidden sm:block"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            {returnNo || "—"}&nbsp;·&nbsp;Sales Return Details ↗
          </span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        <Accordion
          type="multiple"
          defaultValue={["general"]}
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

            <AccordionContent className="px-6 pb-6 pt-2 h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <FieldLabel icon={FileText} label="Document" />
                  <SearchableCombobox
                    value={document_}
                    onChange={handleDocumentChange}
                    placeholder="Select Document"
                    searchPlaceholder="Search document…"
                    emptyText="No document found."
                    icon={<FileText size={14} />}
                    loading={documentMastersLoading}
                    options={documentOptions}
                  />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Sales Return No." />
                  <InputField
                    icon={<Hash size={14} />}
                    placeholder="Enter Return No."
                    value={returnNo}
                    onChange={setReturnNo}
                  />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Sales Return Date" />
                  <InputField
                    icon={<Calendar size={14} />}
                    placeholder="Return Date"
                    value={returnDate}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Users} label="Customer" />
                  <SearchableCombobox
                    value={customer}
                    onChange={handleCustomerChange}
                    placeholder="Select Customer"
                    searchPlaceholder="Search customer…"
                    emptyText="No customer found."
                    icon={<Users size={14} />}
                    loading={customersLoading}
                    options={customerOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                <div>
                  <FieldLabel icon={Receipt} label="Sales No." />
                  <SearchableCombobox
                    value={salesNo}
                    onChange={handleSalesNoChange}
                    placeholder="Select Sales Invoice No."
                    searchPlaceholder="Search invoice…"
                    emptyText="No invoice found."
                    icon={<Receipt size={14} />}
                    loading={salesDetailsLoading || selectedSalesForReturnLoading}
                    options={salesNoOptions}
                    onOpenAttempt={handleSalesNoOpenAttempt}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard} label="Payment Type" />
                  <SearchableCombobox
                    value={paymentType}
                    onChange={setPaymentType}
                    placeholder="Select Payment Type"
                    searchPlaceholder="Search payment type…"
                    emptyText="No payment type found."
                    icon={<CreditCard size={14} />}
                    loading={paymentTypesLoading}
                    options={paymentTypeOptions}
                  />
                </div>
                <div>
                  <FieldLabel icon={Store} label="Store" />
                  <SearchableCombobox
                    value={storeId}
                    onChange={setStoreId}
                    placeholder="Select Store"
                    searchPlaceholder="Search store…"
                    emptyText="No store found."
                    icon={<Store size={14} />}
                    loading={defaultStoresLoading || storesStartWithLoading}
                    options={storeOptions}
                    onOpenAttempt={handleStoreOpenAttempt}
                  />
                </div>
                <div>
                  <FieldLabel icon={BookOpen} label="Account Head" />
                  <SearchableCombobox
                    value={accountHead}
                    onChange={setAccountHead}
                    placeholder="Select Dr. Head"
                    searchPlaceholder="Search account…"
                    emptyText="No account found."
                    icon={<BookOpen size={14} />}
                    loading={accountHeadsLoading}
                    options={accountHeadOptions}
                    onOpenAttempt={handleAccountHeadOpenAttempt}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* ═══════════════ RETURN ITEMS TABLE ═══════════════ */}
        <ReturnItemsTable
          items={lineItems}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
        />

        {/* ═══════════════ FOOTER CARD ═══════════════ */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left — Remarks */}
            <div>
              <FieldLabel icon={StickyNote} label="Remarks" />
              <div className="relative">
                <textarea
                  rows={4}
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

            {/* Right — Totals */}
            <div className="flex flex-col justify-end space-y-3">

              {/* Gross Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND }}>
                  <DollarSign size={13} style={{ color: BRAND }} />
                  Gross Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums w-32 text-right">
                  {selectedSalesForReturnLoading ? (
                    <span className="flex justify-end"><Loader2 size={14} className="animate-spin" style={{ color: BRAND }} /></span>
                  ) : grossAmount}
                </span>
              </div>

              {/* Total Tax */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND }}>
                  <Percent size={13} style={{ color: BRAND }} />
                  Total Tax
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums w-32 text-right">
                  {selectedSalesForReturnLoading ? (
                    <span className="flex justify-end"><Loader2 size={14} className="animate-spin" style={{ color: BRAND }} /></span>
                  ) : totalTax}
                </span>
              </div>

              {/* Pre Net Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND }}>
                  <RotateCcw size={13} style={{ color: BRAND }} />
                  Pre Net Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums w-32 text-right">
                  {selectedSalesForReturnLoading ? (
                    <span className="flex justify-end"><Loader2 size={14} className="animate-spin" style={{ color: BRAND }} /></span>
                  ) : preNetAmount}
                </span>
              </div>

              <div className="border-t" style={{ borderColor: BRAND_MID }} />

              {/* Net Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-base font-bold" style={{ color: BRAND }}>
                  <DollarSign size={15} style={{ color: BRAND }} />
                  Net Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">
                  {selectedSalesForReturnLoading ? (
                    <Loader2 size={18} className="animate-spin" style={{ color: BRAND }} />
                  ) : netAmount}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleClear}
            disabled={saveSalesReturnLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => { if(!saveSalesReturnLoading) e.currentTarget.style.background = BRAND_LIGHT; }}
            onMouseLeave={(e) => { if(!saveSalesReturnLoading) e.currentTarget.style.background = "white"; }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveSalesReturnLoading}
            className={cn(
              "flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90",
              saveSalesReturnLoading && "opacity-50 cursor-not-allowed"
            )}
            style={{ background: BRAND }}
          >
            {saveSalesReturnLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
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

      {/* ── Toast ── */}
      {toastMsg && (
        <Toast message={toastMsg} type={toastType} onDone={() => setToastMsg(null)} />
      )}
    </div>
  );
};

export default CreateSalesReturn;
