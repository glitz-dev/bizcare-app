"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentMasters,
  fetchPaymentTypes,
  fetchCustomers,
  fetchBaseCurrencies,
  fetchCurrencyOptions,
  fetchCurrencyExRate,
  fetchInvoiceTaxTypeDetails,
  fetchAllInvoiceTaxTypes,
  fetchServiceItems,
  fetchItemDetailsWithTax,
  saveServiceBill,
  clearSaveServiceBill,
  SaveServiceBillPayload,
  ServiceBillDetailItem,
  DocumentMaster,
  PaymentType,
  Customer,
  BaseCurrency,
  CurrencyOption,
  CurrencyExRate,
  InvoiceTaxTypeDetail,
  AllInvoiceTaxType,
  ServiceItem,
  ItemDetailsWithTax,
} from "../store/features/inventory/sales/salesServiceBillSlice";
import {
  FileText,
  Hash,
  Calendar,
  Users,
  CreditCard,
  ArrowLeft,
  Plus,
  Trash2,
  Settings2,
  Package,
  StickyNote,
  DollarSign,
  Check,
  X,
  Save,
  RefreshCw,
  ChevronsUpDown,
  Globe,
  BadgeDollarSign,
  Tag,
  ReceiptText,
  ShoppingBag,
  Receipt,
  CalendarDays,
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
type ServiceBillLineItem = {
  id: number;
  item: string;
  hsn: string;
  crDr: string;
  sRate: string;
  gstPct: string;
  gstAmount: string;
  taxAmount: string;
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

function makeEmptyRow(id: number): ServiceBillLineItem {
  return {
    id,
    item: "",
    hsn: "",
    crDr: "",
    sRate: "",
    gstPct: "",
    gstAmount: "",
    taxAmount: "",
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

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_CR_DR = [
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
];


// ─── Shared sub-components ─────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5" style={{ color: BRAND }}>
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
  compact,
  onOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) onOpen?.();
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
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" style={{ zIndex: 50 }} align="start">
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

function AccordionLabel({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
        <Icon size={15} strokeWidth={2.2} style={{ color: BRAND }} />
      </div>
      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
        {title}
      </span>
      <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
    </div>
  );
}

// ─── Service Bill Items Table ──────────────────────────────────────────────────
function ServiceBillItemsTable({
  items,
  onAdd,
  onRemove,
  onUpdate,
  onItemSelect,
  serviceItems,
  serviceItemsLoading,
  onItemOpen,
}: {
  items: ServiceBillLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof ServiceBillLineItem, value: string) => void;
  onItemSelect: (rowId: number, itemId: string) => void;
  serviceItems: ServiceItem[];
  serviceItemsLoading: boolean;
  onItemOpen: () => void;
}) {
  const [colSettingsOpen, setColSettingsOpen] = useState(false);

  const allCols = [
    { key: "item", label: "Item" },
    { key: "hsn", label: "HSN" },
    { key: "crDr", label: "Cr / Dr" },
    { key: "sRate", label: "S.Rate" },
    { key: "gstPct", label: "GST %" },
    { key: "gstAmount", label: "GST Amt" },
    { key: "taxAmount", label: "Tax Amount" },
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
    row: ServiceBillLineItem,
    field: keyof ServiceBillLineItem,
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

  const serviceItemOptions = serviceItems.map((s) => ({
    label: `${s.ItemCode} - ${s.ItemName}`,
    value: String(s.ItemID),
  }));

  return (
    <div>
      <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: BRAND, borderBottom: `2px solid ${BRAND}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <Package size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Service Bill Items</span>
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

            {/* Column list */}
            <div className="p-5 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {allCols.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                  onClick={() => toggleDraft(col.key)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                      draftVisible.has(col.key) ? "border-transparent" : "border-gray-300 bg-white"
                    )}
                    style={draftVisible.has(col.key) ? { background: BRAND, borderColor: BRAND } : {}}
                  >
                    {draftVisible.has(col.key) && <Check size={9} color="white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{col.label}</span>
                </label>
              ))}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: BRAND_MID }}>
              <button
                onClick={() => setColSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{ borderColor: BRAND, color: BRAND }}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
              <th className="px-3 py-2.5 text-left font-bold w-8" style={{ color: BRAND }}>#</th>
              <th className="px-2 py-2.5 text-left font-bold w-8" style={{ color: BRAND }}></th>
              {visibleCols.has("item") && <th className="px-2 py-2.5 text-left font-bold min-w-[160px]" style={{ color: BRAND }}>Item</th>}
              {visibleCols.has("hsn") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>HSN</th>}
              {visibleCols.has("crDr") && <th className="px-2 py-2.5 text-left font-bold min-w-[120px]" style={{ color: BRAND }}>Cr / Dr</th>}
              {visibleCols.has("sRate") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>S.Rate</th>}
              {visibleCols.has("gstPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>GST %</th>}
              {visibleCols.has("gstAmount") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>GST Amt</th>}
              {visibleCols.has("taxAmount") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>Tax Amount</th>}
              {visibleCols.has("sgstPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>SGST %</th>}
              {visibleCols.has("cgstPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>CGST %</th>}
              {visibleCols.has("igstPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>IGST %</th>}
              {visibleCols.has("utgstPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>UTGST %</th>}
              {visibleCols.has("cessPct") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS %</th>}
              {visibleCols.has("sgstAmt") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>SGST Amt</th>}
              {visibleCols.has("cgstAmt") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>CGST Amt</th>}
              {visibleCols.has("igstAmt") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>IGST Amt</th>}
              {visibleCols.has("utgstAmt") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>UTGST Amt</th>}
              {visibleCols.has("cessAmt") && <th className="px-2 py-2.5 text-left font-bold" style={{ color: BRAND }}>CESS Amt</th>}
              <th className="px-2 py-2.5 w-8" style={{ color: BRAND }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-blue-50/20"
                style={{ borderColor: BRAND_MID }}
              >
                <td className="px-3 py-1.5 text-gray-400 font-medium">{idx + 1}</td>
                <td className="px-2 py-1.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center cursor-pointer" style={{ background: BRAND_LIGHT }}>
                    <Package size={10} style={{ color: BRAND }} />
                  </div>
                </td>
                {visibleCols.has("item") && (
                  <td className="px-2 py-1.5">
                    <SearchableCombobox
                      value={row.item}
                      onChange={(val) => onItemSelect(row.id, val)}
                      options={serviceItemOptions}
                      placeholder={serviceItemsLoading ? "Loading…" : "Select Item"}
                      searchPlaceholder="Search item…"
                      emptyText="No item found."
                      icon={<Package size={12} />}
                      compact
                      onOpen={onItemOpen}
                    />
                  </td>
                )}
                {visibleCols.has("hsn") && (
                  <td className="px-2 py-1.5">{cellInput(row, "hsn", "HSN", "w-20")}</td>
                )}
                {visibleCols.has("crDr") && (
                  <td className="px-2 py-1.5">
                    <SearchableCombobox
                      value={row.crDr}
                      onChange={(val) => onUpdate(row.id, "crDr", val)}
                      options={MOCK_CR_DR}
                      placeholder="Cr/Dr"
                      searchPlaceholder="Search…"
                      emptyText="No option."
                      icon={<CreditCard size={12} />}
                      compact
                    />
                  </td>
                )}
                {visibleCols.has("sRate") && (
                  <td className="px-2 py-1.5">{cellInput(row, "sRate", "S. Rate", "w-20", true)}</td>
                )}
                {visibleCols.has("gstPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "gstPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("gstAmount") && (
                  <td className="px-2 py-1.5">{cellInput(row, "gstAmount", "0.000", "w-20", true)}</td>
                )}
                {visibleCols.has("taxAmount") && (
                  <td className="px-2 py-1.5">{cellInput(row, "taxAmount", "Tax", "w-20", true)}</td>
                )}
                {visibleCols.has("sgstPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "sgstPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("cgstPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "cgstPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("igstPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "igstPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("utgstPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "utgstPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("cessPct") && (
                  <td className="px-2 py-1.5">{cellInput(row, "cessPct", "0", "w-14", true)}</td>
                )}
                {visibleCols.has("sgstAmt") && (
                  <td className="px-2 py-1.5">{cellInput(row, "sgstAmt", "0", "w-20", true)}</td>
                )}
                {visibleCols.has("cgstAmt") && (
                  <td className="px-2 py-1.5">{cellInput(row, "cgstAmt", "0", "w-20", true)}</td>
                )}
                {visibleCols.has("igstAmt") && (
                  <td className="px-2 py-1.5">{cellInput(row, "igstAmt", "0", "w-20", true)}</td>
                )}
                {visibleCols.has("utgstAmt") && (
                  <td className="px-2 py-1.5">{cellInput(row, "utgstAmt", "UTGST Amt", "w-24")}</td>
                )}
                {visibleCols.has("cessAmt") && (
                  <td className="px-2 py-1.5">{cellInput(row, "cessAmt", "0.0000", "w-20", true)}</td>
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
interface CreateSalesServiceBillProps {
  onBack?: () => void;
  onSaved?: () => void;
}

const CreateSalesServiceBill: React.FC<CreateSalesServiceBillProps> = ({ onBack, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    documentMasters,
    documentMastersLoading,
    paymentTypes,
    paymentTypesLoading,
    customers,
    customersLoading,
    baseCurrencies,
    currencyOptions,
    currencyOptionsLoading,
    currencyExRate,
    invoiceTaxTypeDetails,
    allInvoiceTaxTypes,
    allInvoiceTaxTypesLoading,
    serviceItems,
    serviceItemsLoading,
    itemDetailsWithTax,
    saveServiceBillLoading,
    saveServiceBillError,
    savedInvoiceNo,
  } = useSelector((state: RootState) => state.salesServiceBill);

  // ── Toast ──────────────────────────────────────────────────────────────────
  // Using sonner — call toast.success() / toast.error() directly

  // ── Header fields ──────────────────────────────────────────────────────────
  const [document_, setDocument_] = useState("");
  const [salesNo, setSalesNo] = useState("");
  const [salesDate] = useState(getTodayFormatted());
  const [invoiceTaxType, setInvoiceTaxType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [customer, setCustomer] = useState("");
  const [custRefDate, setCustRefDate] = useState("");
  const [custRefNo, setCustRefNo] = useState("");
  const [currency, setCurrency] = useState("");
  const [exRate, setExRate] = useState("1");
  const [selectedSales, setSelectedSales] = useState("");
  const [remarks, setRemarks] = useState("");
  const [generateRemarks, setGenerateRemarks] = useState(false);
  const [roundOff, setRoundOff] = useState(false);

  // Tracks whether the user has manually selected a currency (vs. mount prefill)
  const currencyUserSelected = useRef(false);

  // ── Line items ─────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<ServiceBillLineItem[]>([makeEmptyRow(1)]);
  const [nextId, setNextId] = useState(2);

  const handleAddRow = () => {
    setLineItems((prev) => [...prev, makeEmptyRow(nextId)]);
    setNextId((n) => n + 1);
  };
  const handleRemoveRow = (id: number) => {
    setLineItems((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);
  };
  const handleUpdateRow = (id: number, field: keyof ServiceBillLineItem, value: string) => {
    setLineItems((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDocumentMasters());
    dispatch(fetchPaymentTypes());
    dispatch(fetchCustomers());
    dispatch(fetchBaseCurrencies());
    dispatch(fetchCurrencyOptions());
  }, [dispatch]);

  // ── Prefill document + sales no. when document masters arrive ─────────────
  useEffect(() => {
    if (documentMasters.length === 0) return;
    const defaultDoc: DocumentMaster =
      documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
    setDocument_(String(defaultDoc.DocumentID));
    setSalesNo(`${defaultDoc.Prefix}-${defaultDoc.StartingNo}`);
  }, [documentMasters]);

  // ── Prefill currency + exchange rate when base currencies arrive ──────────
  useEffect(() => {
    if (baseCurrencies.length === 0) return;
    const defaultCurrency: BaseCurrency = baseCurrencies[0];
    setCurrency(String(defaultCurrency.CurrencyID));
    setExRate(String(defaultCurrency.ExchRate));
  }, [baseCurrencies]);

  // ── Fetch invoice tax type details when selected document changes ─────────
  useEffect(() => {
    if (!document_) return;
    dispatch(fetchInvoiceTaxTypeDetails({ documentID: Number(document_) }));
  }, [dispatch, document_]);

  // ── Prefill invoice tax type when invoiceTaxTypeDetails arrives ───────────
  //    This sets the default value; the dropdown options come from
  //    allInvoiceTaxTypes (fetched lazily on dropdown open).
  useEffect(() => {
    if (invoiceTaxTypeDetails.length === 0) return;
    setInvoiceTaxType(String(invoiceTaxTypeDetails[0].InvoiceTaxTypeID));
  }, [invoiceTaxTypeDetails]);

  // ── Prefill payment type when data arrives ────────────────────────────────
  useEffect(() => {
    if (paymentTypes.length === 0) return;
    setPaymentType(String(paymentTypes[0].PaymentTypeID));
  }, [paymentTypes]);

  // ── Update exchange rate when user picks a different currency ─────────────
  useEffect(() => {
    if (!currencyExRate || !currencyUserSelected.current) return;
    setExRate(String(currencyExRate.ExchRate));
  }, [currencyExRate]);

  // ── Derived options ────────────────────────────────────────────────────────

  const documentOptions = documentMasters.map((d) => ({
    label: d.DocumentName,
    value: String(d.DocumentID),
  }));

  // Invoice Tax Type dropdown uses allInvoiceTaxTypes (full list from
  // GetAllInvoiceTaxTypes), fetched lazily when the user opens the dropdown.
  // The selected value comes from invoiceTaxTypeDetails (the document default).
  // ── Derived options ────────────────────────────────────────────────────────
  const taxTypeOptions = (
    allInvoiceTaxTypes.length > 0 ? allInvoiceTaxTypes : invoiceTaxTypeDetails
  ).map((t) => ({
    label: t.InvoiceTaxType,
    value: String(t.InvoiceTaxTypeID),
  }));

  const paymentTypeOptions = paymentTypes.map((p: PaymentType) => ({
    label: p.PaymentTypeName,
    value: String(p.PaymentTypeID),
  }));

  const customerOptions = customers.map((c: Customer) => ({
    label: c.CustomerName,
    value: String(c.CustomerID),
  }));

  const currencyComboOptions = currencyOptions.map((c: CurrencyOption) => ({
    label: c.Currency,
    value: String(c.CurrencyID),
  }));

  // ── Generate Remarks ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!generateRemarks) return;
    const parts: string[] = [];
    if (custRefDate) parts.push(custRefDate);
    if (custRefNo) parts.push(custRefNo);
    setRemarks(parts.join(" / "));
  }, [generateRemarks, custRefDate, custRefNo]);

  // ── React to save result ───────────────────────────────────────────────────
  useEffect(() => {
    if (savedInvoiceNo) {
      toast.success("Service bill saved successfully",{
           style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },
        description: `Invoice No: ${savedInvoiceNo}`,
        });
      dispatch(clearSaveServiceBill());
      handleClear();
      onSaved?.();
    }
  }, [savedInvoiceNo]);

  useEffect(() => {
    if (saveServiceBillError) {
      toast.error("Failed to save service bill", {
        description: saveServiceBillError,
      });
      dispatch(clearSaveServiceBill());
    }
  }, [saveServiceBillError]);

  // ── Net Amount ─────────────────────────────────────────────────────────────
  const netAmount = React.useMemo(() => {
    const total = lineItems.reduce((sum, row) => sum + (parseFloat(row.sRate) || 0), 0);
    return total.toFixed(2);
  }, [lineItems]);

  // ── Handle tax type dropdown open ─────────────────────────────────────────
  // Derive taxMasterId from the currently selected document so the right set
  // of tax types is fetched. Falls back to 1 if document not yet resolved.
  const handleTaxTypeOpen = () => {
    const selectedDoc = documentMasters.find((d) => String(d.DocumentID) === document_);
    const taxMasterId = selectedDoc?.TaxMasterID ?? 1;
    dispatch(fetchAllInvoiceTaxTypes({ taxMasterId }));
  };

  const handleItemOpen = () => {
    dispatch(fetchServiceItems({ itemTypeID: 3, searchStr: "" }));
  };

  // Tracks which row is waiting for item tax details to come back
  const pendingItemRowId = useRef<number | null>(null);

  const handleItemSelect = (rowId: number, itemId: string) => {
    // Immediately set the item value on the row
    setLineItems((prev) =>
      prev.map((r) => r.id === rowId ? { ...r, item: itemId } : r)
    );
    // Store which row triggered the fetch so the effect below knows where to prefill
    pendingItemRowId.current = rowId;
    dispatch(
      fetchItemDetailsWithTax({
        invoiceTaxTypeId: Number(invoiceTaxType) || 1,
        itemID: Number(itemId),
      })
    );
  };

  // ── Prefill row fields when item tax details arrive ────────────────────────
  useEffect(() => {
    if (!itemDetailsWithTax || pendingItemRowId.current === null) return;
    const rowId = pendingItemRowId.current;
    const d = itemDetailsWithTax;

    setLineItems((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          hsn:      d.TaxCategoryCode ?? r.hsn,
          gstPct:   d.TaxValue    != null ? String(d.TaxValue)  : r.gstPct,
          sgstPct:  d.SGST        != null ? String(d.SGST)      : r.sgstPct,
          cgstPct:  d.CGST        != null ? String(d.CGST)      : r.cgstPct,
          igstPct:  d.IGST        != null ? String(d.IGST)      : r.igstPct,
          utgstPct: d.UTGST       != null ? String(d.UTGST)     : r.utgstPct,
          cessPct:  d.CESS        != null ? String(d.CESS)      : r.cessPct,
        };
      })
    );
    pendingItemRowId.current = null;
  }, [itemDetailsWithTax]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    // Basic validation
    if (!customer) { toast.error("Please select a customer."); return; }
    if (!document_) { toast.error("Please select a document."); return; }
    if (!paymentType) { toast.error("Please select a payment type."); return; }
    if (!invoiceTaxType) { toast.error("Please select an invoice tax type."); return; }
    if (lineItems.every((r) => !r.item)) { toast.error("Please add at least one item."); return; }

    const selectedDoc = documentMasters.find((d) => String(d.DocumentID) === document_);
    const selectedPaymentType = paymentTypes.find((p) => String(p.PaymentTypeID) === paymentType);
    const selectedCustomer = customers.find((c) => String(c.CustomerID) === customer);
    const selectedTaxType = (allInvoiceTaxTypes.length > 0 ? allInvoiceTaxTypes : invoiceTaxTypeDetails)
      .find((t) => String(t.InvoiceTaxTypeID) === invoiceTaxType);
    const selectedCurrency = baseCurrencies.find((c) => String(c.CurrencyID) === currency);

    const now = new Date().toISOString();
    const todayStr = getTodayFormatted(); // dd-mm-yyyy

    // Aggregate tax totals from line items
    const totalSGST = lineItems.reduce((s, r) => s + (parseFloat(r.sgstAmt) || 0), 0);
    const totalCGST = lineItems.reduce((s, r) => s + (parseFloat(r.cgstAmt) || 0), 0);
    const totalIGST = lineItems.reduce((s, r) => s + (parseFloat(r.igstAmt) || 0), 0);
    const totalUTGST = lineItems.reduce((s, r) => s + (parseFloat(r.utgstAmt) || 0), 0);
    const totalCESS = lineItems.reduce((s, r) => s + (parseFloat(r.cessAmt) || 0), 0);
    const totalTax = totalSGST + totalCGST + totalIGST + totalUTGST + totalCESS;
    const grossAmt = lineItems.reduce((s, r) => s + (parseFloat(r.sRate) || 0), 0);
    const netAmt = parseFloat(netAmount);

    const lstServiceBillDetails: ServiceBillDetailItem[] = lineItems
      .filter((r) => r.item)
      .map((r) => {
        const itemObj = serviceItems.find((si) => String(si.ItemID) === r.item);
        const sRate = parseFloat(r.sRate) || 0;
        const gstPct = parseFloat(r.gstPct) || 0;
        const taxAmt = parseFloat(r.taxAmount) || (sRate * gstPct) / 100;
        const grossAmount = sRate.toFixed(2);
        const amount = (sRate + taxAmt).toFixed(2);
        return {
          ItemID: Number(r.item),
          ItemCode: itemObj?.ItemCode ?? r.item,
          ItemName: itemObj?.ItemName ?? r.item,
          CreditOrDebit: r.crDr === "debit" ? 2 : 1,
          Name: r.crDr === "debit" ? "Debit" : "Credit",
          colDisabled: false,
          HeadID: itemObj?.HeadID ?? 0,
          StockTypeID: itemObj?.StockTypeID ?? 1,
          PurchaseUnitID: itemObj?.PurchaseUnitID ?? 4,
          SalesUnitID: itemObj?.SalesUnitID ?? 4,
          UnitMultiplier: itemObj?.UnitMultiplier ?? 1,
          Quantity: 1,
          OrderedQty: 0,
          SalesRate: sRate.toFixed(2),
          GrossAmount: grossAmount,
          DiscountPercentage: 0,
          DiscountAmount: "0.000",
          TaxPercentage: gstPct,
          TaxRate: taxAmt.toFixed(2),
          SGSTPer: parseFloat(r.sgstPct) || null,
          SGSTAmt: r.sgstAmt || "0.00",
          CGSTPer: parseFloat(r.cgstPct) || null,
          CGSTAmt: r.cgstAmt || "0.00",
          IGSTPer: parseFloat(r.igstPct) || null,
          IGSTAmt: parseFloat(r.igstAmt) || 0,
          UTGSTPer: parseFloat(r.utgstPct) || null,
          UTGSTAmt: parseFloat(r.utgstAmt) || 0,
          CESSPer: parseFloat(r.cessPct) || null,
          CESSAmt: parseFloat(r.cessAmt) || 0,
          VATAmt: 0,
          NetPRate: amount,
          Amount: amount,
          Label: `${now} # ${salesNo}`,
        };
      });

    const payload: SaveServiceBillPayload = {
      TaxPercHead: "GST %",
      TaxAmountHead: "GST Amt",
      ServiceBillShow: true,
      LocalPurchaseShow: false,
      Generate: generateRemarks,
      DocumentID: Number(document_),
      DocumentName: selectedDoc?.DocumentName ?? "SALES SERVICE BILL",
      InvoiceNo: salesNo,
      InvoiceDate: now,
      InvoiceDateStr: todayStr,
      InvoiceTypeID: 3,
      InvoiceTaxTypeID: Number(invoiceTaxType),
      InvoiceTaxType: selectedTaxType?.InvoiceTaxType ?? "",
      TaxMasterID: selectedDoc?.TaxMasterID ?? 1,
      IsGST: selectedDoc?.IsGST ?? true,
      GSTPayableHeadID: selectedCustomer?.PartyAcHeadID ?? 0,
      GstReverse: false,
      PaymentTypeID: Number(paymentType),
      PaymentTypeName: selectedPaymentType?.PaymentTypeName ?? "",
      CustomerID: Number(customer),
      CustomerName: selectedCustomer?.CustomerName ?? "",
      HeadName: selectedCustomer ? ` : ${selectedCustomer.CustomerName}` : "",
      CustRefNo: custRefNo,
      CustRefDate: custRefDate ? new Date(custRefDate).toISOString() : now,
      SupInvoiceDateStr: custRefDate || todayStr,
      CurrencyID: Number(currency),
      Currency: selectedCurrency?.Currency ?? "Rupees",
      CurrencyExchRate: parseFloat(exRate) || 1,
      ExchRate: parseFloat(exRate) || 1,
      GrossAmount: grossAmt.toFixed(3),
      GrossAmountBase: grossAmt,
      NetAmount: netAmt.toFixed(2),
      NetAmountBase: netAmt.toFixed(2),
      NetTotal: netAmt.toFixed(3),
      NetTotalBase: netAmt.toFixed(3),
      PreNetAmount: netAmt.toFixed(3),
      PreNetAmountBase: netAmt.toFixed(3),
      Amount: netAmt,
      TotalQuantity: String(lstServiceBillDetails.length.toFixed(3)),
      TotalDiscount: "0.000",
      TotalDiscountBase: 0,
      TotalTax: totalTax.toFixed(3),
      TotalTaxBase: totalTax.toFixed(3),
      TotalSGSTAmt: totalSGST,
      TotalCGSTAmt: totalCGST,
      TotalIGSTAmt: totalIGST,
      TotalUTGSTAmt: totalUTGST,
      TotalCESSAmt: totalCESS,
      TotalVATAmount: 0,
      TotalTDS: "0.000",
      TDSApplicableOn: "0.00",
      RoundOff: roundOff,
      RoundOffAmount: 0,
      Remarks: remarks,
      RemarksappendStr1: "",
      SalesPurchaseNo: selectedSales,
      SalesPurchaseRemarks: "",
      StartDateStr: todayStr,
      EndDateStr: todayStr,
      ChequeDate: "Invalid date",
      LstServiceBillDetails: lstServiceBillDetails,
      LstSalesPurchaseDetail: [],
    };

    dispatch(saveServiceBill({ payload }));
  };

  const handleClear = () => {
    const defaultDoc: DocumentMaster | undefined =
      documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
    setDocument_(defaultDoc ? String(defaultDoc.DocumentID) : "");
    setSalesNo(defaultDoc ? `${defaultDoc.Prefix}-${defaultDoc.StartingNo}` : "");
    setInvoiceTaxType(
      invoiceTaxTypeDetails.length > 0
        ? String(invoiceTaxTypeDetails[0].InvoiceTaxTypeID)
        : ""
    );
    setPaymentType(
      paymentTypes.length > 0 ? String(paymentTypes[0].PaymentTypeID) : ""
    );
    setCustomer("");
    setCustRefDate("");
    setCustRefNo("");
    setCurrency(
      baseCurrencies.length > 0 ? String(baseCurrencies[0].CurrencyID) : ""
    );
    setExRate(
      baseCurrencies.length > 0 ? String(baseCurrencies[0].ExchRate) : "1"
    );
    currencyUserSelected.current = false;
    setSelectedSales("");
    setRemarks("");
    setGenerateRemarks(false);
    setRoundOff(false);
    setLineItems([makeEmptyRow(1)]);
    setNextId(2);
  };

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
              <ShoppingBag size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Service Bill</h1>
              <p className="text-xs text-white/60 font-medium">Create new sales service bill</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all">
            <ReceiptText size={14} strokeWidth={2.2} />
            Service Bill Detail
          </button>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* ═══════════════ ACCORDION SECTIONS ═══════════════ */}
        <Accordion type="multiple" defaultValue={["general", "salesref"]} className="space-y-4">

          {/* ── GENERAL ── */}
          <AccordionItem
            value="general"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/30 transition-colors [&>svg]:text-[#004687]">
              <AccordionLabel icon={FileText} title="General" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">

              {/* Row 1: Document | Sales No. | Sales Date | Invoice Tax Type | Payment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                <div>
                  <FieldLabel icon={FileText} label="Document" />
                  <SearchableCombobox
                    value={document_}
                    onChange={(val) => {
                      setDocument_(val);
                      const selected = documentMasters.find((d) => String(d.DocumentID) === val);
                      if (selected) {
                        setSalesNo(`${selected.Prefix}-${selected.StartingNo}`);
                      }
                    }}
                    options={documentOptions}
                    placeholder={documentMastersLoading ? "Loading…" : "Select Document"}
                    searchPlaceholder="Search document…"
                    emptyText="No document found."
                    icon={<FileText size={14} />}
                  />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Sales No." />
                  <InputField
                    icon={<Hash size={14} />}
                    placeholder="Sales No."
                    value={salesNo}
                    onChange={setSalesNo}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Sales Date" />
                  <InputField
                    icon={<Calendar size={14} />}
                    placeholder="Sales Date"
                    value={salesDate}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel icon={Tag} label="Invoice Tax Type" />
                  <SearchableCombobox
                    value={invoiceTaxType}
                    onChange={setInvoiceTaxType}
                    options={taxTypeOptions}
                    placeholder={allInvoiceTaxTypesLoading ? "Loading…" : "Select Tax Type"}
                    searchPlaceholder="Search tax type…"
                    emptyText="No tax type found."
                    icon={<Tag size={14} />}
                    onOpen={handleTaxTypeOpen}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard} label="Payment Type" />
                  <SearchableCombobox
                    value={paymentType}
                    onChange={setPaymentType}
                    options={paymentTypeOptions}
                    placeholder={paymentTypesLoading ? "Loading…" : "Select Payment Type"}
                    searchPlaceholder="Search payment…"
                    emptyText="No payment type found."
                    icon={<CreditCard size={14} />}
                  />
                </div>
              </div>

              {/* Row 2: Customer | Cust. Ref Date | Cust. Ref No. | Currency | Ex. Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mt-5 items-end">
                <div className="xl:col-span-2">
                  <FieldLabel icon={Users} label="Customer" />
                  <SearchableCombobox
                    value={customer}
                    onChange={setCustomer}
                    options={customerOptions}
                    placeholder={customersLoading ? "Loading…" : "Select Customer"}
                    searchPlaceholder="Search customer…"
                    emptyText="No customer found."
                    icon={<Users size={14} />}
                  />
                </div>
                <div>
                  <FieldLabel icon={CalendarDays} label="Cust. Ref Date" />
                  <InputField
                    icon={<CalendarDays size={14} />}
                    placeholder="Cust. Ref Date"
                    value={custRefDate}
                    onChange={setCustRefDate}
                    type="date"
                  />
                </div>
                <div>
                  <FieldLabel icon={Receipt} label="Cust. Ref No." />
                  <InputField
                    icon={<Receipt size={14} />}
                    placeholder="Cust. Ref No."
                    value={custRefNo}
                    onChange={setCustRefNo}
                  />
                </div>
                <div>
                  <FieldLabel icon={BadgeDollarSign} label="Currency" />
                  <SearchableCombobox
                    value={currency}
                    onChange={(val) => {
                      currencyUserSelected.current = true;
                      setCurrency(val);
                      dispatch(fetchCurrencyExRate({
                        currencyID: Number(val),
                        date: new Date().toISOString(),
                      }));
                    }}
                    onOpen={() => dispatch(fetchCurrencyOptions())}
                    options={currencyComboOptions}
                    placeholder={currencyOptionsLoading ? "Loading…" : "Select Currency"}
                    searchPlaceholder="Search currency…"
                    emptyText="No currency found."
                    icon={<BadgeDollarSign size={14} />}
                  />
                </div>
                <div>
                  <FieldLabel icon={Globe} label="Exchange Rate" />
                  <InputField
                    icon={<Globe size={14} />}
                    placeholder="1"
                    value={exRate}
                    onChange={setExRate}
                    type="number"
                  />
                </div>
              </div>

              {/* Row 3: Round Off checkbox inline */}
              <div className="mt-4 flex items-center gap-2">
                <div
                  onClick={() => setRoundOff(!roundOff)}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                    roundOff ? "border-transparent" : "border-gray-300 bg-white"
                  )}
                  style={roundOff ? { background: BRAND, borderColor: BRAND } : {}}
                >
                  {roundOff && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-600 cursor-pointer select-none" onClick={() => setRoundOff(!roundOff)}>
                  Round Off
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SELECTED SALES / PURCHASE REF ── */}
          <AccordionItem
            value="salesref"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/30 transition-colors [&>svg]:text-[#004687]">
              <AccordionLabel icon={ShoppingBag} title="Selected Sales" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[260px]">
                  <FieldLabel icon={ShoppingBag} label="Selected Sales And Purchase" />
                  <InputField
                    icon={<ShoppingBag size={14} />}
                    placeholder="Selected Sales And Purchase"
                    value={selectedSales}
                    onChange={setSelectedSales}
                  />
                </div>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 shrink-0"
                  style={{ background: BRAND }}
                >
                  <ShoppingBag size={14} />
                  Sales
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* ═══════════════ SERVICE BILL ITEMS TABLE ═══════════════ */}
        <ServiceBillItemsTable
          items={lineItems}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          onItemSelect={handleItemSelect}
          serviceItems={serviceItems}
          serviceItemsLoading={serviceItemsLoading}
          onItemOpen={handleItemOpen}
        />

        {/* ═══════════════ FOOTER CARD ═══════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left — Remarks + Generate Remarks checkbox */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setGenerateRemarks(!generateRemarks)}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                    generateRemarks ? "border-transparent" : "border-gray-300 bg-white"
                  )}
                  style={generateRemarks ? { background: BRAND, borderColor: BRAND } : {}}
                >
                  {generateRemarks && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-600">Generate Remarks</span>
              </label>

              <div>
                <FieldLabel icon={StickyNote} label="Remarks" />
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Enter Remarks, If Any"
                    value={remarks}
                    readOnly={generateRemarks}
                    onChange={(e) => { if (!generateRemarks) setRemarks(e.target.value); }}
                    className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                    style={{
                      borderColor: "#d1dff0",
                      boxShadow: "0 1px 3px rgba(0,70,135,0.05)",
                      background: generateRemarks ? "#f5f8fd" : "white",
                      cursor: generateRemarks ? "default" : "text",
                    }}
                    onFocus={(e) => { if (!generateRemarks) { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; } }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; }}
                  />
                  <StickyNote size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
                </div>
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveServiceBillLoading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BRAND }}
          >
            {saveServiceBillLoading
              ? <RefreshCw size={15} className="animate-spin" />
              : <Save size={15} />
            }
            {saveServiceBillLoading ? "Saving…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateSalesServiceBill;
