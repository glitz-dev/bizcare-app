"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentStartWith,
  fetchCompanyCurrency,
  fetchCurrencyStartWith,
  fetchCurrencyExRate,
  fetchAllInvoiceTaxTypes,
  fetchAcHeadStartWith,
  fetchAccountBalance,
  fetchTaxRates,
  setSelectedDocument,
  saveJournalVoucher,
  clearSaveStatus,
  type AccJournalTItem,
  type SaveJournalVoucherPayload,
} from "../store/features/Accounts/accounts/journalVoucherSlice";
import { toast } from "sonner";
import {
  FileText,
  Hash,
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Coins,
  Percent,
  ReceiptText,
  StickyNote,
  Save,
  RefreshCw,
  Check,
  ChevronsUpDown,
  Scale,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types (UI-only placeholder shape) ──────────────────────────────────────────
type JournalLineItem = {
  id: number;
  accountHead: string;
  currentBalance: string;
  debitAmount: string;
  creditAmount: string;
  gstPercent: string;
  sgstPercent: string;
  sgstAmount: string;
  cgstPercent: string;
  cgstAmount: string;
  igstPercent: string;
  igstAmount: string;
  utgstPercent: string;
  utgstAmount: string;
  cessPercent: string;
  cessAmount: string;
  taxAmount: string;
  netAmount: string;
  narration: string;
};

const initialRows: JournalLineItem[] = [
  {
    id: 1,
    accountHead: "",
    currentBalance: "",
    debitAmount: "0",
    creditAmount: "0",
    gstPercent: "",
    sgstPercent: "",
    sgstAmount: "",
    cgstPercent: "",
    cgstAmount: "",
    igstPercent: "",
    igstAmount: "",
    utgstPercent: "",
    utgstAmount: "",
    cessPercent: "",
    cessAmount: "",
    taxAmount: "",
    netAmount: "0",
    narration: "",
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5" style={{ color: BRAND }}>
      <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
      {label}
    </label>
  );
}

// InputField Component
function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly,
  loading,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="relative h-[42px] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
        className={cn(
          "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all outline-none placeholder:text-gray-300 font-medium",
          readOnly ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none" : "bg-white text-gray-700"
        )}
        style={!readOnly ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" } : undefined}
        onFocus={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
          }
        }}
        onBlur={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = "#d1dff0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
          }
        }}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}>
        {icon}
      </span>
    </div>
  );
}

// SearchableCombobox Component
function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
  loading,
  onOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  loading?: boolean;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    if (next && onOpen) onOpen();
    setOpen(next);
  };

  if (loading) {
    return (
      <div className="relative h-[42px] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    );
  }

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
            boxShadow: open ? `0 0 0 2px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
            {icon}
          </span>
          <span className="flex-1 truncate">{selectedLabel || placeholder}</span>
          {value ? (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 transition-colors"
              style={{ color: "#93b8d8" }}
              onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }}
            >
              ×
            </span>
          ) : (
            <ChevronsUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#93b8d8" }}
            />
          )}
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

// ─── Voucher Items Table ─────────────────────────────────────────────────────────
function JournalItemsTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  onAccountHeadChange,
  acHeadOptions,
  acHeadLoading,
  onAcHeadOpen,
  loadingBalanceRowId,
  taxRateOptions,
  taxRatesLoading,
  onGstOpen,
}: {
  rows: JournalLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof JournalLineItem, value: string) => void;
  onAccountHeadChange: (rowId: number, headId: string) => void;
  acHeadOptions: { label: string; value: string }[];
  acHeadLoading: boolean;
  onAcHeadOpen: () => void;
  loadingBalanceRowId: number | null;
  taxRateOptions: { label: string; value: string }[];
  taxRatesLoading: boolean;
  onGstOpen: () => void;
}) {
  const cellInput = (
    row: JournalLineItem,
    field: keyof JournalLineItem,
    placeholder: string,
    align: "left" | "right" = "left"
  ) => (
    <input
      type="text"
      value={row[field]}
      onChange={(e) => onUpdate(row.id, field, e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white",
        align === "right" && "text-right"
      )}
      style={{ borderColor: "#d1dff0" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
      <div className="px-6 py-3.5 flex items-center gap-2.5" style={{ background: BRAND }}>
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
          <BookOpen size={14} strokeWidth={2.2} color="white" />
        </div>
        <span className="text-sm font-bold text-white tracking-wide">Voucher Entries</span>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide w-12" style={{ color: BRAND }}>Sl.No.</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide min-w-[200px]" style={{ color: BRAND }}>Account Head</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Current Balance</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Debit Amount</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Credit Amount</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide min-w-[160px]" style={{ color: BRAND }}>GST %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>SGST %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>SGST Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>CGST %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>CGST Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>IGST %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>IGST Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>UTGST %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>UTGST Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>CESS %</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>CESS Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Tax Amt</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide min-w-[110px]" style={{ color: BRAND }}>Net Amount</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide min-w-[180px]" style={{ color: BRAND }}>Narration</th>
              <th className="px-3 py-2.5 text-center font-bold tracking-wide w-14" style={{ color: BRAND }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-blue-50/30"
                style={{ borderColor: BRAND_MID, background: idx % 2 === 1 ? "#f5f9fd" : "white" }}
              >
                <td className="px-3 py-2 text-center">
                  <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
                </td>
                <td className="px-2 py-2 min-w-[200px]">
                  <SearchableCombobox
                    value={row.accountHead}
                    onChange={(v) => onAccountHeadChange(row.id, v)}
                    options={acHeadOptions}
                    placeholder="Select Account Head"
                    searchPlaceholder="Search account…"
                    emptyText="No accounts found."
                    icon={<Layers size={12} />}
                    loading={acHeadLoading}
                    onOpen={onAcHeadOpen}
                  />
                </td>
                <td className="px-2 py-2 min-w-[110px] text-right pr-4">
                  {loadingBalanceRowId === row.id ? (
                    <div className="relative h-5 rounded-md border border-gray-200 bg-gray-100 overflow-hidden w-full">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium text-xs">
                      {row.currentBalance || "—"}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 min-w-[110px]">{cellInput(row, "debitAmount", "0", "right")}</td>
                <td className="px-2 py-2 min-w-[110px]">{cellInput(row, "creditAmount", "0", "right")}</td>
                <td className="px-2 py-2 min-w-[160px]">
                  <SearchableCombobox
                    value={row.gstPercent}
                    onChange={(v) => onUpdate(row.id, "gstPercent", v)}
                    options={taxRateOptions}
                    placeholder="GST %"
                    searchPlaceholder="Search GST…"
                    emptyText="No GST rates found."
                    icon={<Percent size={12} />}
                    loading={taxRatesLoading}
                    onOpen={onGstOpen}
                  />
                </td>
                <td className="px-2 py-2 min-w-[80px]">{cellInput(row, "sgstPercent", "SGST", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "sgstAmount", "SGST Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[80px]">{cellInput(row, "cgstPercent", "CGST", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "cgstAmount", "CGST Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[80px]">{cellInput(row, "igstPercent", "IGST", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "igstAmount", "IGST Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[80px]">{cellInput(row, "utgstPercent", "UTGST", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "utgstAmount", "UTGST Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[80px]">{cellInput(row, "cessPercent", "CESS", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "cessAmount", "CESS Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[90px]">{cellInput(row, "taxAmount", "Tax Amt", "right")}</td>
                <td className="px-2 py-2 min-w-[110px] text-right pr-4">
                  <span className="text-slate-700 font-semibold text-xs tabular-nums">
                    {row.netAmount || "0"}
                  </span>
                </td>
                <td className="px-2 py-2 min-w-[180px]">{cellInput(row, "narration", "Enter Narration")}</td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={12} className="text-red-400 hover:text-red-600 transition-colors" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

// ─── Main Component ─────────────────────────────────────────────────────────────
interface JournalEntryProps {
  onBack?: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux selectors ───────────────────────────────────────────────────────────
  const {
    documentList,
    selectedDocument,
    documentLoading,
    companyCurrency,
    currencyLoading,
    currencyList,
    invoiceTaxTypes,
    taxTypesLoading,
    exchangeRateLoading,
    acHeadList,
    acHeadLoading,
    taxRates,
    taxRatesLoading,
    saveLoading,
  } = useSelector((s: RootState) => s.journalVoucher);

  // ── Header fields ─────────────────────────────────────────────────────────────
  const [document_, setDocument_] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState("2026-06-21");
  const [currency, setCurrency] = useState("");
  const [invoiceTaxType, setInvoiceTaxType] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [remarks, setRemarks] = useState("");

  // ── On mount: fetch document master + company currency + invoice tax types ─────
  useEffect(() => {
    dispatch(fetchDocumentStartWith());
    dispatch(fetchCompanyCurrency());
    dispatch(fetchAllInvoiceTaxTypes({ taxMasterId: 1 }));
  }, [dispatch]);

  // ── Prefill Document field from API response ───────────────────────────────────
  useEffect(() => {
    if (selectedDocument) {
      setDocument_(String(selectedDocument.DocumentID));
      const suffix = selectedDocument.Suffix ? `-${selectedDocument.Suffix}` : "";
      setVoucherNo(`${selectedDocument.Prefix}-${selectedDocument.StartingNo}${suffix}`);
    }
  }, [selectedDocument]);

  // ── Prefill Currency from company currency ─────────────────────────────────────
  useEffect(() => {
    if (companyCurrency) {
      setCurrency(String(companyCurrency.CurrencyID));
    }
  }, [companyCurrency]);

  // ── Voucher rows ───────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<JournalLineItem[]>(initialRows);

  // ── Lazy-fetch currency list on first open ─────────────────────────────────────
  const currencyFetchedRef = React.useRef(false);
  const handleCurrencyOpen = () => {
    if (!currencyFetchedRef.current) {
      currencyFetchedRef.current = true;
      dispatch(fetchCurrencyStartWith());
    }
  };

  // ── Fetch exchange rate when currency changes ──────────────────────────────────
  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    if (val) {
      dispatch(fetchCurrencyExRate({ currencyId: Number(val) }))
        .unwrap()
        .then((data) => setExchangeRate(String(data.ExchRate)))
        .catch(() => {});
    }
  };

  // ── Lazy-fetch account heads on first open ─────────────────────────────────────
  const acHeadFetchedRef = React.useRef(false);
  const handleAcHeadOpen = () => {
    if (!acHeadFetchedRef.current) {
      acHeadFetchedRef.current = true;
      dispatch(fetchAcHeadStartWith());
    }
  };

  // ── Account head selection → fetch balance and prefill row ────────────────────
  const [loadingBalanceRowId, setLoadingBalanceRowId] = useState<number | null>(null);

  const handleAccountHeadChange = (rowId: number, headId: string) => {
    // Always update accountHead; clear balance immediately if deselected
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, accountHead: headId, currentBalance: headId ? r.currentBalance : "" }
          : r
      )
    );

    if (!headId) return;

    setLoadingBalanceRowId(rowId);
    dispatch(fetchAccountBalance({ headId: Number(headId) }))
      .unwrap()
      .then((balance) => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, currentBalance: String(balance) } : r
          )
        );
      })
      .catch(() => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, currentBalance: "" } : r
          )
        );
      })
      .finally(() => {
        setLoadingBalanceRowId(null);
      });
  };

  const acHeadOptions = acHeadList.map((h) => ({
    label: h.HeadName,
    value: String(h.HeadID),
  }));

  // ── Lazy-fetch tax rates on first GST% open ────────────────────────────────────
  const taxRatesFetchedRef = React.useRef(false);
  const handleGstOpen = () => {
    if (!taxRatesFetchedRef.current) {
      taxRatesFetchedRef.current = true;
      // Resolve the tax master name from the selected invoice tax type (e.g. "GST")
      const taxMasterName =
        invoiceTaxTypes.find((t) => String(t.InvoiceTaxTypeID) === invoiceTaxType)
          ?.InvoiceTaxType ?? "VAT";
      dispatch(fetchTaxRates({ taxMasterName }));
    }
  };

  const taxRateOptions = taxRates.map((t) => ({
    label: `${t.TaxCategoryName} (${t.TaxValue}%)`,
    value: String(t.TaxCategoryId),
  }));

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        accountHead: "",
        currentBalance: "",
        debitAmount: "0",
        creditAmount: "0",
        gstPercent: "",
        sgstPercent: "",
        sgstAmount: "",
        cgstPercent: "",
        cgstAmount: "",
        igstPercent: "",
        igstAmount: "",
        utgstPercent: "",
        utgstAmount: "",
        cessPercent: "",
        cessAmount: "",
        taxAmount: "",
        netAmount: "0",
        narration: "",
      },
    ]);
  };

  const handleRemoveRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleUpdateRow = (id: number, field: keyof JournalLineItem, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleClear = () => {
    setRows(initialRows);
    setRemarks("");
  };

  // ── Computed totals from actual row data ────────────────────────────────────────
  const totalDrAmountNum = rows.reduce((sum, r) => sum + (parseFloat(r.debitAmount) || 0), 0);
  const totalCrAmountNum = rows.reduce((sum, r) => sum + (parseFloat(r.creditAmount) || 0), 0);
  const totalDrAmount = totalDrAmountNum.toFixed(2);
  const totalCrAmount = totalCrAmountNum.toFixed(2);
  // Tolerate tiny floating point drift (e.g. 0.1 + 0.2) when checking tally.
  const isTallied = Math.abs(totalDrAmountNum - totalCrAmountNum) < 0.01;

  // ── Submit: validate, build payload, save ───────────────────────────────────────
  const handleSubmit = () => {
    // 1. Must have at least one row with an account head selected.
    const validRows = rows.filter((r) => r.accountHead.trim() !== "");
    if (validRows.length === 0) {
      toast.error("Please select an Account Head for at least one row.");
      return;
    }

    // 2. Debit and Credit totals must tally before saving.
    if (!isTallied) {
      toast.error(
        `Total Dr. Amount (${totalDrAmount}) and Total Cr. Amount (${totalCrAmount}) do not match. Please correct the entries before submitting.`
      );
      return;
    }

    // 3. Totals must not both be zero (nothing entered).
    if (totalDrAmountNum === 0 && totalCrAmountNum === 0) {
      toast.error("Please enter Debit and Credit amounts before submitting.");
      return;
    }

    // 4. Required header fields.
    if (!document_) {
      toast.error("Please select a Document.");
      return;
    }
    if (!voucherNo.trim()) {
      toast.error("Voucher No. is required.");
      return;
    }
    if (!voucherDate) {
      toast.error("Please select a Voucher Date.");
      return;
    }
    if (!currency) {
      toast.error("Please select a Currency.");
      return;
    }

    const selectedDocMeta = documentList.find((d) => String(d.DocumentID) === document_) ?? null;
    const selectedCurrencyMeta =
      currencyList.find((c) => String(c.CurrencyID) === currency) ?? null;
    const selectedTaxType =
      invoiceTaxTypes.find((t) => String(t.InvoiceTaxTypeID) === invoiceTaxType) ?? null;

    const currencyName =
      selectedCurrencyMeta?.Currency ?? companyCurrency?.Currency ?? "";

    // The API expects date strings as "DD-MM-YYYY", not the <input type="date"> "YYYY-MM-DD" format.
    const toDDMMYYYY = (isoDate: string) => {
      const [y, m, d] = isoDate.split("-");
      if (!y || !m || !d) return isoDate;
      return `${d}-${m}-${y}`;
    };
    const voucherDateDDMMYYYY = toDDMMYYYY(voucherDate);

    // Formats a balance as "<amount> Dr. " / "<amount> Cr. ", matching the API's expected shape.
    const formatBalance = (balanceStr: string) => {
      const n = parseFloat(balanceStr) || 0;
      return `${Math.abs(n)} ${n < 0 ? "Cr." : "Dr."} `;
    };

    const taxMasterName = selectedTaxType?.InvoiceTaxType ?? "";

    // Build the journal line items the API expects from each valid row.
    const lstAccJournalT: AccJournalTItem[] = validRows.map((r) => ({
      HeadName:
        acHeadList.find((h) => String(h.HeadID) === r.accountHead)?.HeadName ?? "",
      HeadID: Number(r.accountHead) || 0,
      CurrentBal: formatBalance(r.currentBalance),
      DebitAmount: parseFloat(r.debitAmount) || 0,
      CreditAmount: parseFloat(r.creditAmount) || 0,
      CESSAmt: parseFloat(r.cessAmount) || 0,
      CGSTAmt: parseFloat(r.cgstAmount) || 0,
      IGSTAmt: parseFloat(r.igstAmount) || 0,
      SGSTAmt: parseFloat(r.sgstAmount) || 0,
      UTGSTAmt: parseFloat(r.utgstAmount) || 0,
      VATAmt: (parseFloat(r.taxAmount) || 0).toFixed(2),
      VATPer: parseFloat(r.gstPercent) || 0,
      TaxPercentage: parseFloat(r.gstPercent) || 0,
      TaxRate: (
        taxRates.find((t) => String(t.TaxCategoryId) === r.gstPercent)?.TaxValue ?? 0
      ).toFixed(2),
      NetAmt: (parseFloat(r.netAmount) || 0).toFixed(2),
    }));

    const payload: SaveJournalVoucherPayload = {
      VoucherDateStr: voucherDateDDMMYYYY,
      StartDateStr: voucherDateDDMMYYYY,
      EndDateStr: voucherDateDDMMYYYY,
      Currency: currencyName,
      CurrencyID: Number(currency) || 0,
      DocumentID: Number(document_) || 0,
      DocumentName: selectedDocMeta?.DocumentName ?? "",
      ExchRate: parseFloat(exchangeRate) || 1,
      GSTGroupID: null,
      GSTGroupName: null,
      InvoiceTaxType: selectedTaxType?.InvoiceTaxType ?? "",
      InvoiceTaxTypeID: Number(invoiceTaxType) || 0,
      IsCess: lstAccJournalT.some((i) => i.CESSAmt > 0),
      IsGST: lstAccJournalT.some(
        (i) => i.SGSTAmt > 0 || i.CGSTAmt > 0 || i.IGSTAmt > 0 || i.UTGSTAmt > 0
      ),
      IsJournalOrContra: true,
      IsVAT: taxMasterName.toUpperCase() === "VAT",
      LstAccJournalT: lstAccJournalT,
      LstSalesPurchaseDetail: [],
      Settled: true,
      SettledAmount: totalDrAmount,
      TaxAmountHead: "Tax Amt",
      TaxMasterID: selectedDocMeta?.TaxMasterID ?? 0,
      TaxMasterName: taxMasterName,
      TaxPercHead: "Tax %",
      Type: "Normal",
      TypeName: { name: "Normal", id: 1 },
      VoucherAmount: totalDrAmount,
      VoucherDate: new Date(voucherDate).toISOString(),
      VoucherNo: voucherNo,
      totalAmt: 0,
    };

    dispatch(saveJournalVoucher(payload))
      .unwrap()
      .then((messageId) => {
        toast.success(`Journal Voucher saved successfully${messageId ? ` (${messageId})` : ""}.`);
        dispatch(clearSaveStatus());
        handleClear();
      })
      .catch((errMessage: string) => {
        toast.error(errMessage || "Failed to save journal voucher. Please try again.");
      });
  };

  // ── Derived combobox options ───────────────────────────────────────────────────
  const documentOptions = documentList.map((d) => ({
    label: d.DocumentName,
    value: String(d.DocumentID),
  }));

  // Use full fetched list once available; fall back to the default company currency
  const currencyOptions = currencyList.length > 0
    ? currencyList.map((c) => ({ label: c.Currency, value: String(c.CurrencyID) }))
    : companyCurrency
    ? [{ label: companyCurrency.Currency, value: String(companyCurrency.CurrencyID) }]
    : [];

  const invoiceTaxTypeOptions = invoiceTaxTypes.map((t) => ({
    label: t.InvoiceTaxType,
    value: String(t.InvoiceTaxTypeID),
  }));

  // Keep selectedDocument in sync when the user manually changes the combobox
  const handleDocumentChange = (val: string) => {
    setDocument_(val);
    const doc = documentList.find((d) => String(d.DocumentID) === val) ?? null;
    dispatch(setSelectedDocument(doc));
    if (doc) {
      const suffix = doc.Suffix ? `-${doc.Suffix}` : "";
      setVoucherNo(`${doc.Prefix}-${doc.StartingNo}${suffix}`);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors shrink-0"
            >
              <ArrowLeft size={15} color="white" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Journal Entry
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Accounts · General Voucher
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Layers size={13} />
          Journal Details
        </button>
      </div>

      {/* ── Form body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">

        {/* ── Header Fields Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>

          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
              <FileText size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Voucher Details
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1: Document | Voucher No. | Voucher Date | Currency | Invoice Tax Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <SearchableCombobox
                value={document_}
                onChange={handleDocumentChange}
                options={documentOptions}
                placeholder="Select Document"
                searchPlaceholder="Search document…"
                emptyText="No documents found."
                icon={<FileText size={14} />}
                loading={documentLoading}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Voucher No." />
              <InputField
                icon={<Hash size={14} />}
                placeholder="Enter Voucher No."
                value={voucherNo}
                onChange={setVoucherNo}
                loading={documentLoading}
              />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Voucher Date" />
              <InputField
                icon={<Calendar size={14} />}
                placeholder="Voucher Date"
                value={voucherDate}
                onChange={setVoucherDate}
                type="date"
              />
            </div>
            <div>
              <FieldLabel icon={Coins} label="Currency" />
              <SearchableCombobox
                value={currency}
                onChange={handleCurrencyChange}
                options={currencyOptions}
                placeholder="Select Currency"
                searchPlaceholder="Search currency…"
                emptyText="No currencies found."
                icon={<Coins size={14} />}
                loading={currencyLoading}
                onOpen={handleCurrencyOpen}
              />
            </div>
            <div>
              <FieldLabel icon={ReceiptText} label="Invoice Tax Type" />
              <SearchableCombobox
                value={invoiceTaxType}
                onChange={setInvoiceTaxType}
                options={invoiceTaxTypeOptions}
                placeholder="Invoice Tax Type"
                searchPlaceholder="Search tax type…"
                emptyText="No tax types found."
                icon={<ReceiptText size={14} />}
                loading={taxTypesLoading}
              />
            </div>
          </div>

          {/* Row 2: Exchange Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-5">
            <div>
              <FieldLabel icon={Scale} label={`Exchange Rate [${currencyOptions.find((c) => c.value === currency)?.label ?? "Rupees"}]`} />
              <InputField
                icon={<Scale size={14} />}
                placeholder="1"
                value={exchangeRate}
                onChange={setExchangeRate}
                loading={exchangeRateLoading}
              />
            </div>
          </div>
        </div>

        {/* ── Voucher Items Table ────────────────────────────────────────────── */}
        <JournalItemsTable
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          onAccountHeadChange={handleAccountHeadChange}
          acHeadOptions={acHeadOptions}
          acHeadLoading={acHeadLoading}
          onAcHeadOpen={handleAcHeadOpen}
          loadingBalanceRowId={loadingBalanceRowId}
          taxRateOptions={taxRateOptions}
          taxRatesLoading={taxRatesLoading}
          onGstOpen={handleGstOpen}
        />

        {/* ── Footer Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FieldLabel icon={StickyNote} label="Remarks" />
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="Enter Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                  style={{
                    borderColor: "#d1dff0",
                    boxShadow: "0 1px 3px rgba(0,70,135,0.05)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = BRAND;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1dff0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
                  }}
                />
                <StickyNote
                  size={14}
                  className="absolute left-3 top-3.5 pointer-events-none"
                  style={{ color: "#93b8d8" }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-3">
              <div className="border-t pt-3" style={{ borderColor: BRAND_MID }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Total Dr. Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {totalDrAmount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Total Cr. Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {totalCrAmount}
                </span>
              </div>
              {!isTallied && (
                <p className="text-right text-xs font-semibold text-red-500">
                  Dr. and Cr. amounts do not tally
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────────── */}
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
            disabled={saveLoading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            {saveLoading ? "Saving…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default JournalEntry;
