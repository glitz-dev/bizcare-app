"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Landmark,
  FileText,
  Hash,
  Calendar,
  Scale,
  Wallet,
  ChevronsUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Building2,
  ReceiptText,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ────────────────────────────────────────────────────────────────────
type DrCr = "Dr" | "Cr";
type VoucherType = "Payment" | "Receipt";

type ReconLine = {
  id: number;
  slNo: number;
  voucherNo: string;
  voucherDate: string;
  head: string;
  narration: string;
  chequeNo: string;
  chequeDate: string;
  debit: number;
  credit: number;
  clearanceDate: string;
  selected: boolean;
};

// ─── Mock lookups (swap for live API data when wiring up) ──────────────────
const DOCUMENT_OPTIONS = ["Payment Voucher", "Receipt Voucher", "Journal Voucher", "Contra Voucher"];
const BANK_OPTIONS = ["HDFC Bank - Current A/C", "SBI - Current A/C", "ICICI Bank - OD A/C", "Federal Bank - Current A/C"];

const MOCK_ROWS: ReconLine[] = [
  { id: 1, slNo: 1, voucherNo: "PV-1042", voucherDate: "02-07-2026", head: "Office Rent", narration: "Rent for July 2026", chequeNo: "004521", chequeDate: "02-07-2026", debit: 45000, credit: 0, clearanceDate: "", selected: false },
  { id: 2, slNo: 2, voucherNo: "PV-1045", voucherDate: "05-07-2026", head: "Staff Salary", narration: "Salary advance - Sales team", chequeNo: "004522", chequeDate: "05-07-2026", debit: 128000, credit: 0, clearanceDate: "", selected: false },
  { id: 3, slNo: 3, voucherNo: "RV-2210", voucherDate: "07-07-2026", head: "Sundry Debtors", narration: "Payment received - Glitzit Traders", chequeNo: "NEFT8891", chequeDate: "07-07-2026", debit: 0, credit: 96500, clearanceDate: "09-07-2026", selected: false },
  { id: 4, slNo: 4, voucherNo: "PV-1051", voucherDate: "10-07-2026", head: "Electricity Charges", narration: "KSEB bill - July", chequeNo: "004530", chequeDate: "10-07-2026", debit: 18250, credit: 0, clearanceDate: "", selected: false },
  { id: 5, slNo: 5, voucherNo: "RV-2214", voucherDate: "12-07-2026", head: "Sundry Debtors", narration: "Advance received - Booking #A102", chequeNo: "NEFT8907", chequeDate: "12-07-2026", debit: 0, credit: 54000, clearanceDate: "", selected: false },
];

const round2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

// ─── AmountWithDrCr : amount input + Dr/Cr toggle pill, side by side ─────────
function AmountWithDrCr({
  icon,
  amountLabel,
  amount,
  onAmountChange,
  drCr,
  onDrCrChange,
  readOnlyAmount,
}: {
  icon: React.ReactNode;
  amountLabel: string;
  amount: string;
  onAmountChange?: (v: string) => void;
  drCr: DrCr;
  onDrCrChange?: (v: DrCr) => void;
  readOnlyAmount?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_84px] gap-2">
      <div>
        <FieldLabel icon={Scale} label={amountLabel} />
        <InputField icon={icon} placeholder="0" value={amount} onChange={onAmountChange} readOnly={readOnlyAmount} />
      </div>
      <div>
        <FieldLabel icon={Scale} label="Dr. / Cr." />
        <div
          className="flex items-center rounded-xl border overflow-hidden h-[42px]"
          style={{ borderColor: "#d1dff0" }}
        >
          {(["Dr", "Cr"] as DrCr[]).map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={!onDrCrChange}
              onClick={() => onDrCrChange?.(opt)}
              className="flex-1 h-full text-xs font-bold transition-colors"
              style={{
                background: drCr === opt ? BRAND : "white",
                color: drCr === opt ? "white" : "#9ca3af",
              }}
            >
              {opt}.
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SimpleSelect : generic searchable dropdown over a static string list ───
function SimpleSelect({
  value,
  placeholder,
  icon,
  items,
  onSelect,
  onClear,
}: {
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  items: string[];
  onSelect: (v: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium"
        style={{
          borderColor: open ? BRAND : "#d1dff0",
          boxShadow: open ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
          color: value ? "#374151" : "#9ca3af",
        }}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
          {icon}
        </span>
        <span className="flex-1 truncate">{value || placeholder}</span>
        {value && onClear ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600"
            style={{ color: "#93b8d8" }}
          >
            ×
          </span>
        ) : (
          <ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border bg-white shadow-lg overflow-hidden" style={{ borderColor: BRAND_MID }}>
          <div className="p-2 border-b" style={{ borderColor: BRAND_MID }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
              style={{ borderColor: "#d1dff0" }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">No results found</div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
                  style={{ color: value === item ? BRAND : "#374151" }}
                >
                  <Check size={12} className={cn("mr-2 shrink-0", value === item ? "opacity-100" : "opacity-0")} style={{ color: BRAND }} />
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TypeToggle : Payment / Receipt segmented control ────────────────────────
function TypeToggle({ value, onChange }: { value: VoucherType; onChange: (v: VoucherType) => void }) {
  return (
    <div className="flex items-center rounded-xl border overflow-hidden h-[42px]" style={{ borderColor: "#d1dff0" }}>
      {(["Payment", "Receipt"] as VoucherType[]).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex-1 h-full text-xs font-bold transition-colors"
          style={{
            background: value === opt ? BRAND : "white",
            color: value === opt ? "white" : "#9ca3af",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Checkbox (table header / row) ───────────────────────────────────────────
function Checkbox({ checked, onChange, indeterminate }: { checked: boolean; onChange: () => void; indeterminate?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0"
      style={{
        borderColor: checked || indeterminate ? BRAND : "#d1dff0",
        background: checked || indeterminate ? BRAND : "white",
      }}
    >
      {checked && <Check size={11} strokeWidth={3} color="white" />}
      {!checked && indeterminate && <div className="w-2 h-[2px] bg-white rounded" />}
    </button>
  );
}

// ─── CellInput (inline date editor for Clearance Date) ──────────────────────
function CellDateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="dd-mm-yyyy"
      className="h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white"
      style={{ borderColor: "#d1dff0" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = BRAND;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#d1dff0";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const BankReconciliationDetails = ({ onBack }: { onBack?: () => void }) => {
  // Filter card state
  const [document, setDocument] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [bank, setBank] = useState("");
  const [bankStatementDate, setBankStatementDate] = useState("2026-07-15");

  const [ledgerBalance, setLedgerBalance] = useState("");
  const [ledgerBalanceDrCr, setLedgerBalanceDrCr] = useState<DrCr>("Dr");
  const [bankStatementAmount, setBankStatementAmount] = useState("0");
  const [bankStatementAmountDrCr, setBankStatementAmountDrCr] = useState<DrCr>("Dr");

  const [fromDate, setFromDate] = useState("2020-04-01");
  const [toDate, setToDate] = useState("2026-07-15");
  const [type, setType] = useState<VoucherType>("Payment");

  // Table state
  const [rows, setRows] = useState<ReconLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const handleShowVouchers = () => {
    setLoading(true);
    // TODO: replace with live thunk call, e.g. dispatch(fetchBankReconVouchers({...}))
    setTimeout(() => {
      setRows(MOCK_ROWS.filter((r) => (type === "Payment" ? r.debit > 0 : r.credit > 0)));
      setPage(1);
      setLoading(false);
    }, 300);
  };

  const toggleRow = (id: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };

  const allSelected = rows.length > 0 && rows.every((r) => r.selected);
  const someSelected = rows.some((r) => r.selected);

  const toggleAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  const updateClearanceDate = (id: number, v: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, clearanceDate: v } : r)));
  };

  // Computed summary figures
  const selectedAmount = useMemo(
    () => round2(rows.filter((r) => r.selected).reduce((sum, r) => sum + r.debit + r.credit, 0)),
    [rows]
  );
  const totalVoucherAmount = useMemo(
    () => round2(rows.reduce((sum, r) => sum + r.debit + r.credit, 0)),
    [rows]
  );
  const difference = useMemo(
    () => round2(Number(bankStatementAmount || 0) - Number(ledgerBalance || 0)),
    [bankStatementAmount, ledgerBalance]
  );
  const differenceDrCr: DrCr = difference < 0 ? "Cr" : "Dr";
  const unreconciledAmount = round2(totalVoucherAmount - selectedAmount);
  const amountAfterReconciliation = round2(Number(ledgerBalance || 0) + selectedAmount);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = () => {
    // TODO: wire up save/reconcile thunk with selected row ids + clearance dates
  };

  const handleClear = () => {
    setDocument("");
    setDocumentNo("");
    setBank("");
    setLedgerBalance("");
    setBankStatementAmount("0");
    setRows([]);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0" style={{ background: BRAND }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Building2 size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">Bank Reconciliation</h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">Accounts · Bank Reconciliation</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <ArrowLeft size={13} />
          Back to List
        </button>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">
        {/* ── Filter Card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
              <Wallet size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Reconciliation Filters
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1 : Document | Document No. | Bank | Bank Statement Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <SimpleSelect
                value={document}
                placeholder="Select Document"
                icon={<FileText size={14} />}
                items={DOCUMENT_OPTIONS}
                onSelect={setDocument}
                onClear={() => setDocument("")}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Document No." />
              <InputField icon={<Hash size={14} />} placeholder="Enter Document No." value={documentNo} onChange={setDocumentNo} />
            </div>
            <div>
              <FieldLabel icon={Landmark} label="Bank" />
              <SimpleSelect
                value={bank}
                placeholder="Select Bank"
                icon={<Landmark size={14} />}
                items={BANK_OPTIONS}
                onSelect={setBank}
                onClear={() => setBank("")}
              />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Bank Statement Date" />
              <InputField icon={<Calendar size={14} />} placeholder="Bank Statement Date" value={bankStatementDate} onChange={setBankStatementDate} type="date" />
            </div>
          </div>

          {/* Row 2 : Ledger Balance (Dr/Cr) | Bank Statement Amount (Dr/Cr) | Difference (Dr/Cr) | Selected Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <AmountWithDrCr
              icon={<Scale size={14} />}
              amountLabel="Ledger Balance"
              amount={ledgerBalance}
              onAmountChange={setLedgerBalance}
              drCr={ledgerBalanceDrCr}
              onDrCrChange={setLedgerBalanceDrCr}
            />
            <AmountWithDrCr
              icon={<Scale size={14} />}
              amountLabel="Bank Statement Amount"
              amount={bankStatementAmount}
              onAmountChange={setBankStatementAmount}
              drCr={bankStatementAmountDrCr}
              onDrCrChange={setBankStatementAmountDrCr}
            />
            <AmountWithDrCr
              icon={<Scale size={14} />}
              amountLabel="Difference"
              amount={fmt(Math.abs(difference))}
              drCr={differenceDrCr}
              readOnlyAmount
            />
            <div>
              <FieldLabel icon={Scale} label="Selected Amount" />
              <InputField icon={<Scale size={14} />} placeholder="Selected Amount" value={fmt(selectedAmount)} readOnly />
            </div>
          </div>

          {/* Row 3 : From Date | To Date | Type | Show Vouchers | Unreconciled Amount | Amount After Reconciliation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 mt-5 items-end">
            <div>
              <FieldLabel icon={Calendar} label="From Date" />
              <InputField icon={<Calendar size={14} />} placeholder="From Date" value={fromDate} onChange={setFromDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="To Date" />
              <InputField icon={<Calendar size={14} />} placeholder="To Date" value={toDate} onChange={setToDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={ReceiptText} label="Type" />
              <TypeToggle value={type} onChange={setType} />
            </div>
            <div>
              <button
                type="button"
                onClick={handleShowVouchers}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-[42px] rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: BRAND }}
              >
                <Search size={14} />
                {loading ? "Loading..." : "Show Vouchers"}
              </button>
            </div>
            <div>
              <FieldLabel icon={Scale} label="Unreconciled Amount" />
              <InputField icon={<Scale size={14} />} placeholder="Unreconciled Amount" value={fmt(unreconciledAmount)} readOnly />
            </div>
            <div>
              <FieldLabel icon={Scale} label="Amount After Reconciliation" />
              <InputField icon={<Scale size={14} />} placeholder="Amount After Reconciliation" value={fmt(amountAfterReconciliation)} readOnly />
            </div>
          </div>
        </div>

        {/* ── Vouchers Table ────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
          {/* Table header bar */}
          <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: BRAND }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <ReceiptText size={14} strokeWidth={2.2} color="white" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">Vouchers</span>
              {someSelected && (
                <span className="ml-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white">
                  {rows.filter((r) => r.selected).length} selected
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
                  <th className="w-10 px-3 py-2.5 text-center">
                    <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
                  </th>
                  {[
                    { label: "Sl.No.", cls: "w-14 text-left" },
                    { label: "Voucher No.", cls: "min-w-[110px] text-left" },
                    { label: "Voucher Date", cls: "min-w-[110px] text-left" },
                    { label: "Head", cls: "min-w-[160px] text-left" },
                    { label: "Narration", cls: "min-w-[220px] text-left" },
                    { label: "Cheque No.", cls: "min-w-[110px] text-left" },
                    { label: "Cheque Date", cls: "min-w-[110px] text-left" },
                    { label: "Debit", cls: "min-w-[110px] text-right" },
                    { label: "Credit", cls: "min-w-[110px] text-right" },
                    { label: "Clearance Date", cls: "min-w-[130px] text-left" },
                  ].map(({ label, cls }) => (
                    <th key={label} className={cn("px-3 py-2.5 font-bold tracking-wide whitespace-nowrap", cls)} style={{ color: BRAND }}>
                      {label}
                    </th>
                  ))}
                  <th className="w-10 px-3 py-2.5 text-center">
                    <SlidersHorizontal size={13} style={{ color: BRAND }} className="inline-block" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-gray-400 text-xs">
                      {loading ? "Fetching vouchers..." : "No vouchers to display. Set your filters and click \"Show Vouchers\"."}
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-blue-50/30"
                      style={{ borderColor: BRAND_MID, background: row.selected ? BRAND_LIGHT : idx % 2 === 1 ? "#f5f9fd" : "white" }}
                    >
                      <td className="px-3 py-2 text-center">
                        <Checkbox checked={row.selected} onChange={() => toggleRow(row.id)} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-xs font-semibold text-slate-400">{row.slNo}</span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{row.voucherNo}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.voucherDate}</td>
                      <td className="px-3 py-2 text-gray-600">{row.head}</td>
                      <td className="px-3 py-2 text-gray-500">{row.narration}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.chequeNo}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.chequeDate}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                        {row.debit ? fmt(row.debit) : ""}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                        {row.credit ? fmt(row.credit) : ""}
                      </td>
                      <td className="px-2 py-2 min-w-[130px]">
                        <CellDateInput value={row.clearanceDate} onChange={(v) => updateClearanceDate(row.id, v)} />
                      </td>
                      <td />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination bar ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t bg-white" style={{ borderColor: BRAND_MID }}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 hover:bg-blue-50 transition-colors"
                style={{ borderColor: "#d1dff0", color: BRAND }}
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 hover:bg-blue-50 transition-colors"
                style={{ borderColor: "#d1dff0", color: BRAND }}
              >
                <ChevronLeft size={14} />
              </button>
              <div
                className="h-7 px-2.5 rounded-lg border flex items-center justify-center text-xs font-semibold"
                style={{ borderColor: "#d1dff0", color: "#374151" }}
              >
                {page}
              </div>
              <span className="text-xs text-gray-400">/ {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 hover:bg-blue-50 transition-colors"
                style={{ borderColor: "#d1dff0", color: BRAND }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 hover:bg-blue-50 transition-colors"
                style={{ borderColor: "#d1dff0", color: BRAND }}
              >
                <ChevronsRight size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 rounded-lg border text-xs font-semibold outline-none bg-white"
                style={{ borderColor: "#d1dff0", color: "#374151" }}
              >
                {[15, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>items per page</span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: "#f59e0b", color: "#f59e0b", background: "white" }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!someSelected}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankReconciliationDetails;
