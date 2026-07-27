"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentStartWith,
  fetchCompanyCurrency,
  fetchCurrencyStartWith,
  fetchCurrencyExRate,
  fetchBankStartWith,
  fetchContraAcHeadStartWith,
  fetchAccountBalance,
  saveContraVoucher,
  clearSaveState,
  type SaveContraVoucherPayload,
  type ContraJournalLineItem,
} from "../store/features/Accounts/accounts/contraEntrySlice";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Layers,
  FileText,
  Hash,
  Calendar,
  Coins,
  Scale,
  CreditCard,
  Landmark,
  CalendarDays,
  ReceiptText,
  BookOpen,
  StickyNote,
  Save,
  RefreshCw,
  Check,
  ChevronsUpDown,
  Trash2,
  Plus,
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
const BRAND       = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID   = "#ccdff2";

// ─── Types ────────────────────────────────────────────────────────────────────
type ContraLineItem = {
  id: number;
  accountHead: string;
  currentBalance: string;
  debitAmount: string;
  creditAmount: string;
  narration: string;
};

const makeRow = (id: number): ContraLineItem => ({
  id,
  accountHead: "",
  currentBalance: "",
  debitAmount: "0",
  creditAmount: "0",
  narration: "",
});

// ─── FieldLabel ───────────────────────────────────────────────────────────────
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

// ─── InputField ───────────────────────────────────────────────────────────────
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
        disabled={readOnly}
        className={cn(
          "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all outline-none placeholder:text-gray-300 font-medium",
          readOnly
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none"
            : "bg-white text-gray-700"
        )}
        style={
          !readOnly
            ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }
            : undefined
        }
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
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}
      >
        {icon}
      </span>
    </div>
  );
}

// ─── SearchableCombobox ───────────────────────────────────────────────────────
function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
  onOpen,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  onOpen?: () => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && onOpen) onOpen();
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
            boxShadow: open
              ? `0 0 0 2px ${BRAND}22`
              : "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#93b8d8" }}
          >
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
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        style={{ zIndex: 50 }}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm text-gray-400">
              {loading ? "Loading…" : emptyText}
            </CommandEmpty>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── CellInput ────────────────────────────────────────────────────────────────
function CellInput({
  value,
  onChange,
  placeholder,
  align = "left",
  textarea,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  align?: "left" | "right";
  textarea?: boolean;
}) {
  const baseStyle = {
    borderColor: "#d1dff0",
  };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = BRAND;
      e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "#d1dff0";
      e.currentTarget.style.boxShadow = "none";
    },
  };

  if (textarea) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="h-full min-h-[52px] text-xs border rounded-lg px-2 py-1.5 w-full outline-none transition-all bg-white resize-none"
        style={baseStyle}
        {...focusHandlers}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white",
        align === "right" && "text-right"
      )}
      style={baseStyle}
      {...focusHandlers}
    />
  );
}

// ─── ContraItemsTable ─────────────────────────────────────────────────────────
function ContraItemsTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  acHeadOptions,
  acHeadListLoading,
  onAccountHeadOpen,
  onAccountHeadSelect,
}: {
  rows: ContraLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof ContraLineItem, value: string) => void;
  acHeadOptions: { label: string; value: string }[];
  acHeadListLoading: boolean;
  onAccountHeadOpen: () => void;
  onAccountHeadSelect: (rowId: number, headId: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
      {/* Table header bar */}
      <div
        className="px-6 py-3.5 flex items-center justify-between"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <BookOpen size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Contra Entries
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
        >
          <Plus size={13} />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
              {[
                { label: "Sl.No.",          cls: "w-12 text-left" },
                { label: "Account Head",    cls: "min-w-[220px] text-left" },
                { label: "Current Balance", cls: "min-w-[130px] text-right" },
                { label: "Debit Amount",    cls: "min-w-[120px] text-right" },
                { label: "Credit Amount",   cls: "min-w-[120px] text-right" },
                { label: "Narration",       cls: "min-w-[200px] text-left" },
                { label: "Options",         cls: "w-16 text-center" },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={cn("px-3 py-2.5 font-bold tracking-wide", cls)}
                  style={{ color: BRAND }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-blue-50/30"
                style={{
                  borderColor: BRAND_MID,
                  background: idx % 2 === 1 ? "#f5f9fd" : "white",
                }}
              >
                {/* Sl.No. */}
                <td className="px-3 py-2 text-center">
                  <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
                </td>

                {/* Account Head */}
                <td className="px-2 py-2 min-w-[220px]">
                  <SearchableCombobox
                    value={row.accountHead}
                    onChange={(v) => {
                      onUpdate(row.id, "accountHead", v);
                      if (v) onAccountHeadSelect(row.id, v);
                    }}
                    options={acHeadOptions}
                    placeholder="Select Account Head"
                    searchPlaceholder="Search account…"
                    emptyText="No accounts found."
                    icon={<Layers size={12} />}
                    onOpen={onAccountHeadOpen}
                    loading={acHeadListLoading}
                  />
                </td>

                {/* Current Balance */}
                <td className="px-2 py-2 min-w-[130px] text-right pr-4">
                  <span className="text-slate-400 font-medium text-xs">
                    {row.currentBalance || "—"}
                  </span>
                </td>

                {/* Debit Amount */}
                <td className="px-2 py-2 min-w-[120px]">
                  <CellInput
                    value={row.debitAmount}
                    onChange={(v) => onUpdate(row.id, "debitAmount", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Credit Amount */}
                <td className="px-2 py-2 min-w-[120px]">
                  <CellInput
                    value={row.creditAmount}
                    onChange={(v) => onUpdate(row.id, "creditAmount", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Narration */}
                <td className="px-2 py-2 min-w-[200px]">
                  <CellInput
                    value={row.narration}
                    onChange={(v) => onUpdate(row.id, "narration", v)}
                    placeholder="Enter Narration"
                    textarea
                  />
                </td>

                {/* Options */}
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    disabled={rows.length === 1}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CreateContraEntry ────────────────────────────────────────────────────────
const CreateContraEntry: React.FC<{ onBack?: () => void; onSaved?: () => void }> = ({
  onBack,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const hasMounted = useRef(false);

  // ── Redux state ────────────────────────────────────────────────────────────
  const {
    documentList,
    documentLoading,
    companyCurrency,
    currencyList,
    currencyListLoading,
    exchangeRateData,
    exchangeRateLoading,
    bankList,
    bankListLoading,
    acHeadList,
    acHeadListLoading,
    accountBalance,
    accountBalanceLoading,
    saveLoading,
  } = useSelector((state: RootState) => state.contraEntry);

  // ── Header field state ─────────────────────────────────────────────────────
  const [document_,       setDocument_]       = useState("");
  const [voucherNo,       setVoucherNo]       = useState("");
  const [voucherType,     setVoucherType]     = useState("");
  const [voucherDate,     setVoucherDate]     = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currency,        setCurrency]        = useState("");
  const [exchangeRate,    setExchangeRate]    = useState("1");
  const [bankPaymentType, setBankPaymentType] = useState("");
  const [bank,            setBank]            = useState("");
  const [chequeDate,      setChequeDate]      = useState("");
  const [chequeNo,        setChequeNo]        = useState("");
  const [remarks,         setRemarks]         = useState("");

  // ── Mount: fetch Document, Company Currency & Banks ───────────────────────
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    dispatch(fetchDocumentStartWith());
    dispatch(fetchCompanyCurrency());
    dispatch(fetchBankStartWith());
  }, [dispatch]);

  // ── Prefill Document field when documentList arrives ──────────────────────
  useEffect(() => {
    if (documentList.length === 0) return;
    const defaultDoc = documentList.find((d) => d.SetDefault) ?? documentList[0];
    setDocument_(String(defaultDoc.DocumentID));
    setVoucherNo(`${defaultDoc.Prefix}${defaultDoc.StartingNo}`);
  }, [documentList]);

  // ── Prefill Currency when companyCurrency arrives ─────────────────────────
  useEffect(() => {
    if (!companyCurrency) return;
    setCurrency(String(companyCurrency.CurrencyID));
  }, [companyCurrency]);

  // ── When currency is selected, fetch its exchange rate ────────────────────
  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    if (val) {
      dispatch(fetchCurrencyExRate({ currencyId: Number(val) }));
    } else {
      setExchangeRate("1");
    }
  };

  // ── Prefill Exchange Rate when exchangeRateData arrives ───────────────────
  useEffect(() => {
    if (!exchangeRateData) return;
    setExchangeRate(String(exchangeRateData.ExchRate));
  }, [exchangeRateData]);

  // ── Line items state ───────────────────────────────────────────────────────
  const [rows, setRows] = useState<ContraLineItem[]>([makeRow(1)]);
  const nextId = React.useRef(2);

  const handleAddRow    = () => { setRows((p) => [...p, makeRow(nextId.current++)]); };
  const handleRemoveRow = (id: number) => { setRows((p) => p.filter((r) => r.id !== id)); };
  const handleUpdateRow = (id: number, field: keyof ContraLineItem, value: string) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // ── Track which row is awaiting a balance fetch ───────────────────────────
  const pendingBalanceRowId = useRef<number | null>(null);

  // Called when any Account Head combobox is opened (lazy-load the list once)
  const handleAccountHeadOpen = () => {
    dispatch(fetchContraAcHeadStartWith());
  };

  // Called when a specific account head is selected in a row
  const handleAccountHeadSelect = (rowId: number, headId: string) => {
    pendingBalanceRowId.current = rowId;
    dispatch(fetchAccountBalance({ headId: Number(headId) }));
  };

  // ── When accountBalance arrives, write it into the correct row ────────────
  useEffect(() => {
    if (accountBalance === null || accountBalanceLoading) return;
    const rowId = pendingBalanceRowId.current;
    if (rowId === null) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, currentBalance: String(accountBalance) }
          : r
      )
    );
    pendingBalanceRowId.current = null;
  }, [accountBalance, accountBalanceLoading]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalDr   = rows.reduce((s, r) => s + (parseFloat(r.debitAmount)  || 0), 0);
  const totalCr   = rows.reduce((s, r) => s + (parseFloat(r.creditAmount) || 0), 0);
  const fmt       = (n: number) => n.toFixed(2);
  const isTallied = Math.abs(totalDr - totalCr) < 0.001;

  const handleClear = () => {
    if (documentList.length > 0) {
      const defaultDoc = documentList.find((d) => d.SetDefault) ?? documentList[0];
      setDocument_(String(defaultDoc.DocumentID));
      setVoucherNo(`${defaultDoc.Prefix}${defaultDoc.StartingNo}`);
    } else {
      setDocument_(""); setVoucherNo("");
    }
    setVoucherType("");
    setVoucherDate(new Date().toISOString().slice(0, 10));
    const defaultCurrencyId = companyCurrency ? String(companyCurrency.CurrencyID) : "";
    setCurrency(defaultCurrencyId);
    setExchangeRate("1");
    setBankPaymentType(""); setBank("");
    setChequeDate(""); setChequeNo(""); setRemarks("");
    setRows([makeRow(1)]); nextId.current = 2;
  };

  // ── Submit: build payload, save, toast feedback ────────────────────────────
  const handleSubmit = async () => {
    // Guard: Dr/Cr must tally and be non-zero
    if (!isTallied) {
      toast.error("Dr. and Cr. amounts do not tally.");
      return;
    }
    if (totalDr <= 0 || totalCr <= 0) {
      toast.error("Total amount must be greater than zero.");
      return;
    }
    if (!document_ || !bank) {
      toast.error("Please select a Document and Bank before saving.");
      return;
    }

    const selectedDoc = documentList.find((d) => String(d.DocumentID) === document_);
    const selectedBank = bankList.find((b) => String(b.BankID) === bank);
    const currencyLabel =
      currencyList.find((c) => String(c.CurrencyID) === currency)?.Currency ??
      (companyCurrency && String(companyCurrency.CurrencyID) === currency
        ? companyCurrency.Currency
        : "Rupees");

    const lstAccJournalT: ContraJournalLineItem[] = rows
      .filter((r) => r.accountHead)
      .map((r) => {
        const head = acHeadList.find((h) => String(h.CvHeadID) === r.accountHead);
        return {
          HeadName: head?.CvHeadName ?? "",
          HeadID: Number(r.accountHead),
          CurrentBal: r.currentBalance,
          DebitAmount: parseFloat(r.debitAmount) || 0,
          CreditAmount: parseFloat(r.creditAmount) || 0,
        };
      });

    const now = new Date(voucherDate);
    const voucherDateISO = isNaN(now.getTime())
      ? new Date().toISOString()
      : now.toISOString();
    const voucherDateStr = voucherDate
      ? voucherDate.split("-").reverse().join("-") 
      : "";

    const payload: SaveContraVoucherPayload = {
      VoucherDateStr: voucherDateStr,
      VoucherDate: voucherDateISO,
      VoucherNo: voucherNo,
      DocumentID: Number(document_),
      DocumentName: selectedDoc?.DocumentName ?? "",
      CurrencyID: Number(currency),
      Currency: currencyLabel,
      ExchRate: parseFloat(exchangeRate) || 1,
      BankID: Number(bank),
      BankName: selectedBank?.BankName ?? "",
      BankPaymentType: {
        Id: 0,
        Title: bankPaymentType,
      },
      BankReceiptTypeID: 0,
      ChequeDate: chequeDate || null,
      Type: "Normal",
      TypeName: { id: 0, name: "Normal" },
      VoucherAmount: fmt(totalDr),
      SettledAmount: fmt(totalDr),
      Settled: true,
      IsJournalOrContra: false,
      LstAccJournalT: lstAccJournalT,
    };

    try {
      const result = await dispatch(saveContraVoucher({ payload })).unwrap();
      toast.success(
        result.MessageId
          ? `Contra voucher ${result.MessageId} saved successfully.`
          : result.Message || "Contra voucher saved successfully."
      );
      dispatch(clearSaveState());
      handleClear();
      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to save contra voucher.";
      toast.error(message);
    }
  };

  // ── Derived dropdown options ───────────────────────────────────────────────
  const documentOptions = documentList.map((d) => ({
    label: d.DocumentName,
    value: String(d.DocumentID),
  }));

  // currencyList is populated on-open; but we always keep the default visible
  // so we merge companyCurrency as a seed option so the label shows immediately
  const currencyOptions: { label: string; value: string }[] = currencyList.length > 0
    ? currencyList.map((c) => ({ label: c.Currency, value: String(c.CurrencyID) }))
    : companyCurrency
      ? [{ label: companyCurrency.Currency, value: String(companyCurrency.CurrencyID) }]
      : [];

  const acHeadOptions = acHeadList.map((h) => ({
    label: h.CvHeadName,
    value: String(h.CvHeadID),
  }));

  const bankPaymentTypeOptions: { label: string; value: string }[] = [
    { label: "Cheque/DD",    value: "Cheque/DD"    },
    { label: "NEFT/RTGS",   value: "NEFT/RTGS"   },
    { label: "Cash Deposit", value: "Cash Deposit" },
  ];
  const bankOptions = bankList.map((b) => ({
    label: b.BankName,
    value: String(b.BankID),
  }));

  // Selected currency label for Exchange Rate field label
  const selectedCurrencyLabel =
    currencyOptions.find((c) => c.value === currency)?.label ?? "Rupees";

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(200%); } }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Contra Entry
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Accounts · Cash &amp; Bank Transfers
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Layers size={13} />
          Contra Details
        </button>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">

        {/* ── Voucher Details Card ─────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: BRAND_LIGHT }}
            >
              <FileText size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Voucher Details
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1 : Document | Voucher No. | Type | Voucher Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <SearchableCombobox
                value={document_}
                onChange={setDocument_}
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
              />
            </div>
            <div>
              <FieldLabel icon={ReceiptText} label="Type" />
              <InputField
                icon={<ReceiptText size={14} />}
                placeholder=""
                value={"Normal"}
                onChange={setVoucherDate}
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
          </div>

          {/* Row 2 : Currency | Exchange Rate | Bank Payment Type | Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
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
                onOpen={() => dispatch(fetchCurrencyStartWith())}
                loading={currencyListLoading}
              />
            </div>
            <div>
              <FieldLabel icon={Scale} label={`Exchange Rate [${selectedCurrencyLabel}]`} />
              <InputField
                icon={<Scale size={14} />}
                placeholder="1"
                value={exchangeRate}
                onChange={setExchangeRate}
                readOnly={exchangeRateLoading}
              />
            </div>
            <div>
              <FieldLabel icon={CreditCard} label="Bank Payment Type" />
              <SearchableCombobox
                value={bankPaymentType}
                onChange={setBankPaymentType}
                options={bankPaymentTypeOptions}
                placeholder="Select Payment Type"
                searchPlaceholder="Search type…"
                emptyText="No types found."
                icon={<CreditCard size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={Landmark} label="Bank" />
              <SearchableCombobox
                value={bank}
                onChange={setBank}
                options={bankOptions}
                placeholder="Select Bank"
                searchPlaceholder="Search bank…"
                emptyText="No banks found."
                icon={<Landmark size={14} />}
                loading={bankListLoading}
              />
            </div>
          </div>

          {/* Row 3 : Cheque Date | Cheque No. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <FieldLabel icon={CalendarDays} label="Cheque Date" />
              <InputField
                icon={<CalendarDays size={14} />}
                placeholder="Select Cheque Date"
                value={chequeDate}
                onChange={setChequeDate}
                type="date"
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Cheque No." />
              <InputField
                icon={<Hash size={14} />}
                placeholder="Enter Cheque No."
                value={chequeNo}
                onChange={setChequeNo}
              />
            </div>
          </div>
        </div>

        {/* ── Contra Entries Table ──────────────────────────────────────────────── */}
        <ContraItemsTable
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          acHeadOptions={acHeadOptions}
          acHeadListLoading={acHeadListLoading}
          onAccountHeadOpen={handleAccountHeadOpen}
          onAccountHeadSelect={handleAccountHeadSelect}
        />

        {/* ── Footer Card ───────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Remarks */}
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

            {/* Totals */}
            <div className="flex flex-col justify-end space-y-3">
              <div className="border-t pt-3" style={{ borderColor: BRAND_MID }} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Total Dr. Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {fmt(totalDr)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Total Cr. Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {fmt(totalCr)}
                </span>
              </div>

              {!isTallied && totalDr > 0 && totalCr > 0 && (
                <p className="text-right text-xs font-semibold text-red-500">
                  Dr. and Cr. amounts do not tally
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────────── */}
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
            disabled={saveLoading || !isTallied}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
            style={{ background: BRAND }}
          >
            {saveLoading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saveLoading ? "Saving…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateContraEntry;
