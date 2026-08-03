"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CreditCard,
  Layers,
  Scale,
  FileText,
  Hash,
  Calendar,
  Coins,
  ReceiptText,
  User,
  StickyNote,
  Save,
  RefreshCw,
  Check,
  ChevronsUpDown,
  Trash2,
  Plus,
  Landmark,
  Receipt,
  Building2,
  Tag,
  BarcodeIcon,
  CalendarDays,
  X,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchAccountHeadsHeader,
  fetchAccountHeadsAll,
  fetchAccountHeadsDetail,
  fetchDocumentStartWithActive,
  fetchAccountBalance,
  fetchCurrencyStartWith,
  fetchCurrencyExRate,
  fetchBanks,
  checkChequeNumberDuplication,
  saveChanges,
  clearExchangeRateData,
  clearCurrencyStartWithList,
  type AccountHeadHeader,
  type DocumentStartWith,
  type CurrencyStartWith,
  type BankDetail,
  type SaveChangesPayload,
  type SaveChangesDetailLine,
  type SaveChangesFundCreditLine,
} from "../store/features/Accounts/accounts/paymentVoucherSlice";
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

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentLineItem = {
  id: number;
  debitHead: string;
  debitHeadId: number | null;
  amount: string;
  ledgerBalance: string;
  ledgerBalanceLoading: boolean;
  narration: string;
  gstin: string;
  party: string;
  sacCode: string;
  invoiceNo: string;
  invoiceDate: string;
};

const makeRow = (id: number): PaymentLineItem => ({
  id,
  debitHead: "",
  debitHeadId: null,
  amount: "0",
  ledgerBalance: "",
  ledgerBalanceLoading: false,
  narration: "",
  gstin: "",
  party: "",
  sacCode: "",
  invoiceNo: "",
  invoiceDate: "",
});

// ─── BankChargeRow ───────────────────────────────────────────────
type BankChargeRow = {
  id: number;
  currentAccount: string;
  currentAccountId: number | null;
  credit: string;
  creditId: number | null;
  currency: string;
  currencyId: number | null;
  amount: string;
  exRate: string;
  exRateLoading: boolean;
  baseAmt: string;
  gst: boolean;
  sgst: string;
  cgst: string;
  netAmt: string;
  bankPaymentType: string;
  bankPaymentTypeId: number | null;
  bankName: string;
  bankId: number | null;
  chequeDate: string;
  chequeNo: string;
  neftNo: string;
  branch: string;
};

const makeBankRow = (id: number): BankChargeRow => ({
  id,
  currentAccount: "",
  currentAccountId: null,
  credit: "",
  creditId: null,
  currency: "",
  currencyId: null,
  amount: "0",
  exRate: "0",
  exRateLoading: false,
  baseAmt: "0",
  gst: false,
  sgst: "0",
  cgst: "0",
  netAmt: "0",
  bankPaymentType: "",
  bankPaymentTypeId: null,
  bankName: "",
  bankId: null,
  chequeDate: "",
  chequeNo: "",
  neftNo: "",
  branch: "",
});

// ─── Bank Charge calculation constants/helpers ─────────────────────────────
// Mirrors the legacy `scope.GstTaxPer` company setting from bizcare-base.txt
// (fetched there from a company options API). Until that endpoint is wired
// into this slice, 18% (standard GST) is used as the default rate.
const GST_TAX_PERCENT = 18;

// Matches the Angular `round(value, 2)` helper used throughout
// fundCreditAmountChange / TaxEnabledChange.
const round2 = (value: number) => Math.round(value * 100) / 100;

// Converts an HTML <input type="date"> value ("YYYY-MM-DD") into the
// "DD-MM-YYYY" string format the SaveChanges API expects (VoucherDateStr,
// ChequeDateStr, etc.). Returns null for empty/invalid input so optional
// date fields can be sent as null instead of an empty string.
const toDDMMYYYY = (isoDate: string | null | undefined): string | null => {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return null;
  return `${day}-${month}-${year}`;
};

// ─── Bank Payment Type options (static lookup) ─────────────────────────────
const BANK_PAYMENT_TYPES: ComboboxItem[] = [
  { key: "NEFT", label: "NEFT" },
  { key: "RTGS", label: "RTGS" },
  { key: "Cash Deposit", label: "Cash Deposit" },
  { key: "CHEQUE", label: "Cheque" },
  { key: "DD", label: "Demand Draft" },
];

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
  suffixClear,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  suffixClear?: boolean;
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
          suffixClear && "pr-8",
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
      {suffixClear && value && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 transition-colors"
          style={{ color: "#93b8d8" }}
        >
          ×
        </span>
      )}
    </div>
  );
}

// ─── SearchableCombobox ─────────────────────────────────────────────────────────
// Generic shadcn Popover + Command driven combobox. When `items` is omitted it
// falls back to the original display-only look (used by table cells that are
// not yet wired to live data).
type ComboboxItem = {
  key: string;
  label: string;
};

function SearchableCombobox({
  value,
  placeholder,
  icon,
  items,
  loading,
  onSelect,
  onClear,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  onOpenChange,
}: {
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  items?: ComboboxItem[];
  loading?: boolean;
  onSelect?: (item: ComboboxItem) => void;
  onClear?: () => void;
  searchPlaceholder?: string;
  emptyText?: string;
  // Called right before the popover opens/closes. Return `false` from this
  // (or call the guard logic inside) to gate what happens on open — e.g.
  // block the popover and show a toast instead of opening it.
  onOpenChange?: (nextOpen: boolean) => boolean | void;
}) {
  const [open, setOpen] = useState(false);

  // Display-only fallback for cells that don't pass `items`/`onSelect`.
  if (!items && !onSelect) {
    return (
      <button
        type="button"
        className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium cursor-default"
        style={{
          borderColor: "#d1dff0",
          boxShadow: "0 1px 3px rgba(0,70,135,0.05)",
          color: value ? "#374151" : "#9ca3af",
        }}
      >
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{value || placeholder}</span>
        {value ? (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "#93b8d8" }}
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
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        // Let the parent decide whether this open/close is allowed to
        // proceed (e.g. block opening + show a toast when a prerequisite
        // field hasn't been selected yet).
        const result = onOpenChange?.(nextOpen);
        if (result === false) return;
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium"
          style={{
            borderColor: "#d1dff0",
            boxShadow: "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#93b8d8" }}
          >
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
            <ChevronsUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#93b8d8" }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {(items ?? []).map((item) => (
                    <CommandItem
                      key={item.key}
                      value={item.label}
                      onSelect={() => {
                        onSelect?.(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        size={14}
                        className={cn(
                          "mr-2",
                          value === item.label ? "opacity-100" : "opacity-0"
                        )}
                        style={{ color: BRAND }}
                      />
                      {item.label}
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

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0",
          checked ? "border-transparent" : "bg-white"
        )}
        style={{
          borderColor: checked ? BRAND : "#d1dff0",
          background: checked ? BRAND : "white",
        }}
      >
        {checked && <Check size={11} strokeWidth={3} color="white" />}
      </button>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </label>
  );
}

// ─── CellInput ────────────────────────────────────────────────────────────────
function CellInput({
  value,
  onChange,
  onBlur,
  placeholder,
  align = "left",
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  align?: "left" | "right";
  type?: "text" | "date";
}) {
  const baseStyle = { borderColor: "#d1dff0" };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = BRAND;
      e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = "#d1dff0";
      e.currentTarget.style.boxShadow = "none";
      onBlur?.();
    },
  };

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white",
        type === "date" && "leading-none",
        align === "right" && "text-right"
      )}
      style={baseStyle}
      {...focusHandlers}
    />
  );
}

// ─── PaymentItemsTable ─────────────────────────────────────────────────────────
function PaymentItemsTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  debitHeadOptions,
  debitHeadLoading,
  onDebitHeadOpen,
  onDebitHeadSelect,
  onDebitHeadClear,
}: {
  rows: PaymentLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof PaymentLineItem, value: string) => void;
  debitHeadOptions: AccountHeadHeader[];
  debitHeadLoading: boolean;
  onDebitHeadOpen: (nextOpen: boolean) => boolean | void;
  onDebitHeadSelect: (rowId: number, selected: AccountHeadHeader) => void;
  onDebitHeadClear: (rowId: number) => void;
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
            <Receipt size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Payment Details
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
                { label: "Sl.No.", cls: "w-12 text-left" },
                { label: "Debit Head", cls: "min-w-[180px] text-left" },
                { label: "Amount", cls: "min-w-[110px] text-right" },
                { label: "Ledger Balance", cls: "min-w-[120px] text-right" },
                { label: "Narration", cls: "min-w-[170px] text-left" },
                { label: "GSTIN", cls: "min-w-[120px] text-left" },
                { label: "Party", cls: "min-w-[140px] text-left" },
                { label: "SAC Code", cls: "min-w-[110px] text-left" },
                { label: "Invoice No.", cls: "min-w-[110px] text-left" },
                { label: "Invoice Date", cls: "min-w-[130px] text-left" },
                { label: "Options", cls: "w-16 text-center" },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={cn("px-3 py-2.5 font-bold tracking-wide whitespace-nowrap", cls)}
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

                {/* Debit Head */}
                <td className="px-2 py-2 min-w-[180px]">
                  <SearchableCombobox
                    value={row.debitHead}
                    placeholder="Select Account Head"
                    icon={<Layers size={12} />}
                    items={debitHeadOptions.map((h) => ({
                      key: String(h.HeadID),
                      label: h.HeadName,
                    }))}
                    loading={debitHeadLoading}
                    searchPlaceholder="Search account head..."
                    emptyText="No account heads found."
                    onOpenChange={onDebitHeadOpen}
                    onSelect={(item) => {
                      const selected = debitHeadOptions.find(
                        (h) => String(h.HeadID) === item.key
                      );
                      if (selected) onDebitHeadSelect(row.id, selected);
                    }}
                    onClear={() => onDebitHeadClear(row.id)}
                  />
                </td>

                {/* Amount */}
                <td className="px-2 py-2 min-w-[110px]">
                  <CellInput
                    value={row.amount}
                    onChange={(v) => onUpdate(row.id, "amount", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Ledger Balance */}
                <td className="px-2 py-2 min-w-[120px] text-right pr-4">
                  <span className="text-slate-400 font-medium text-xs">
                    {row.ledgerBalanceLoading
                      ? "Loading..."
                      : row.ledgerBalance || "Balance"}
                  </span>
                </td>

                {/* Narration */}
                <td className="px-2 py-2 min-w-[170px]">
                  <CellInput
                    value={row.narration}
                    onChange={(v) => onUpdate(row.id, "narration", v)}
                    placeholder="Enter Narration"
                  />
                </td>

                {/* GSTIN */}
                <td className="px-2 py-2 min-w-[120px]">
                  <CellInput
                    value={row.gstin}
                    onChange={(v) => onUpdate(row.id, "gstin", v)}
                    placeholder="Enter GSTIN"
                  />
                </td>

                {/* Party */}
                <td className="px-2 py-2 min-w-[140px]">
                  <CellInput
                    value={row.party}
                    onChange={(v) => onUpdate(row.id, "party", v)}
                    placeholder="Enter Party Name"
                  />
                </td>

                {/* SAC Code */}
                <td className="px-2 py-2 min-w-[110px]">
                  <CellInput
                    value={row.sacCode}
                    onChange={(v) => onUpdate(row.id, "sacCode", v)}
                    placeholder="Enter SAC Code"
                  />
                </td>

                {/* Invoice No. */}
                <td className="px-2 py-2 min-w-[110px]">
                  <CellInput
                    value={row.invoiceNo}
                    onChange={(v) => onUpdate(row.id, "invoiceNo", v)}
                    placeholder="Inv. No."
                  />
                </td>

                {/* Invoice Date */}
                <td className="px-2 py-2 min-w-[130px]">
                  <CellInput
                    type="date"
                    value={row.invoiceDate}
                    onChange={(v) => onUpdate(row.id, "invoiceDate", v)}
                    placeholder="Select Invoice Date"
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

// ─── BankChargeTable ──────────────────────────────────────────────────
function BankChargeTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  onCalculate,
  onToggleGst,
  creditOptions,
  creditLoading,
  onCreditOpen,
  onCreditSelect,
  onCreditClear,
  currencyOptions,
  currencyLoading,
  onCurrencyOpen,
  onCurrencySelect,
  onCurrencyClear,
}: {
  rows: BankChargeRow[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof BankChargeRow, value: string | boolean) => void;
  onCalculate: (rowId: number) => void;
  onToggleGst: (rowId: number) => void;
  creditOptions: AccountHeadHeader[];
  creditLoading: boolean;
  onCreditOpen: (nextOpen: boolean) => boolean | void;
  onCreditSelect: (rowId: number, item: { key: string; label: string }) => void;
  onCreditClear: (rowId: number) => void;
  currencyOptions: CurrencyStartWith[];
  currencyLoading: boolean;
  onCurrencyOpen: (nextOpen: boolean) => boolean | void;
  onCurrencySelect: (rowId: number, item: { key: string; label: string }) => void;
  onCurrencyClear: (rowId: number) => void;
}) {
  const COLS = [
    { label: "SNo.", cls: "w-10 text-center" },
    { label: "Credit", cls: "min-w-[160px] text-left" },
    { label: "Currency", cls: "min-w-[130px] text-left" },
    { label: "Amount", cls: "min-w-[100px] text-right" },
    { label: "Ex/Rate", cls: "min-w-[90px]  text-right" },
    { label: "Base Amt", cls: "min-w-[100px] text-right" },
    { label: "GST", cls: "w-12         text-center" },
    { label: "SGST", cls: "min-w-[90px]  text-right" },
    { label: "CGST", cls: "min-w-[90px]  text-right" },
    { label: "Net Amt", cls: "min-w-[100px] text-right" },
    { label: "Add", cls: "w-10         text-center" },
    { label: "Delete", cls: "w-10         text-center" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
      {/* Header bar */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Landmark size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Bank Charge Details</span>
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
              {COLS.map(({ label, cls }) => (
                <th
                  key={label}
                  className={cn("px-3 py-2.5 font-bold tracking-wide whitespace-nowrap", cls)}
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
                {/* SNo. */}
                <td className="px-3 py-2 text-center">
                  <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
                </td>
                {/* Credit */}
                <td className="px-2 py-2 min-w-[160px]">
                  <SearchableCombobox
                    value={row.credit}
                    placeholder="Select Credit To"
                    icon={<Layers size={12} />}
                    items={creditOptions.map((h) => ({
                      key: String(h.HeadID),
                      label: h.HeadName,
                    }))}
                    loading={creditLoading}
                    searchPlaceholder="Search account head..."
                    emptyText="No account heads found."
                    onOpenChange={onCreditOpen}
                    onSelect={(item) => onCreditSelect(row.id, item)}
                    onClear={() => onCreditClear(row.id)}
                  />
                </td>

                {/* Currency */}
                <td className="px-2 py-2 min-w-[130px]">
                  <SearchableCombobox
                    value={row.currency}
                    placeholder="Select Currency"
                    icon={<Coins size={12} />}
                    items={currencyOptions.map((c) => ({
                      key: String(c.CurrencyID),
                      label: c.Currency,
                    }))}
                    loading={currencyLoading}
                    searchPlaceholder="Search currency..."
                    emptyText="No currencies found."
                    onOpenChange={onCurrencyOpen}
                    onSelect={(item) => onCurrencySelect(row.id, item)}
                    onClear={() => onCurrencyClear(row.id)}
                  />
                </td>

                {/* Amount */}
                <td className="px-2 py-2 min-w-[100px]">
                  <CellInput
                    value={row.amount}
                    onChange={(v) => onUpdate(row.id, "amount", v)}
                    onBlur={() => onCalculate(row.id)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Ex/Rate */}
                <td className="px-2 py-2 min-w-[90px]">
                  {row.exRateLoading ? (
                    <div className="h-7 flex items-center justify-end pr-1">
                      <span className="text-[11px] text-slate-400 font-medium">Loading...</span>
                    </div>
                  ) : (
                    <CellInput
                      value={row.exRate}
                      onChange={(v) => onUpdate(row.id, "exRate", v)}
                      placeholder="0"
                      align="right"
                    />
                  )}
                </td>

                {/* Base Amt */}
                <td className="px-2 py-2 min-w-[100px]">
                  <CellInput
                    value={row.baseAmt}
                    onChange={(v) => onUpdate(row.id, "baseAmt", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* GST checkbox */}
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleGst(row.id)}
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center mx-auto transition-colors"
                    )}
                    style={{
                      borderColor: row.gst ? BRAND : "#d1dff0",
                      background: row.gst ? BRAND : "white",
                    }}
                  >
                    {row.gst && <Check size={10} strokeWidth={3} color="white" />}
                  </button>
                </td>

                {/* SGST */}
                <td className="px-2 py-2 min-w-[90px]">
                  <CellInput
                    value={row.sgst}
                    onChange={(v) => onUpdate(row.id, "sgst", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* CGST */}
                <td className="px-2 py-2 min-w-[90px]">
                  <CellInput
                    value={row.cgst}
                    onChange={(v) => onUpdate(row.id, "cgst", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Net Amt */}
                <td className="px-2 py-2 min-w-[100px]">
                  <CellInput
                    value={row.netAmt}
                    onChange={(v) => onUpdate(row.id, "netAmt", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* Add */}
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={onAdd}
                    className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Plus size={13} style={{ color: BRAND }} />
                  </button>
                </td>

                {/* Delete */}
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

// ─── BankDetailsModal ───────────────────────────────────────────────────────────
// A focused popup for capturing how a single bank-charge row was actually
// paid (NEFT / RTGS / Cheque / etc. + which bank). Opened from the "Add"
// button in the Bank Details card, scoped to one BankChargeRow at a time.
function BankDetailsModal({
  open,
  onClose,
  voucherNo,
  amount,
  row,
  bankOptions,
  bankLoading,
  onBankOpen,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  voucherNo: string;
  amount: number;
  row: BankChargeRow | null;
  bankOptions: BankDetail[];
  bankLoading: boolean;
  onBankOpen: (nextOpen: boolean) => boolean | void;
  onSave: (data: {
    bankPaymentType: ComboboxItem;
    bank: BankDetail;
    chequeDate?: string;
    chequeNo?: string;
    neftNo?: string;
    branch?: string;
  }) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [paymentType, setPaymentType] = useState<ComboboxItem | null>(null);
  const [bank, setBank] = useState<BankDetail | null>(null);
  const [chequeDate, setChequeDate] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [neftNo, setNeftNo] = useState("");
  const [branch, setBranch] = useState("");

  // Reset local draft state whenever the modal is opened for a (possibly
  // different) row, prefilling from anything already saved on that row.
  useEffect(() => {
    if (!open || !row) return;
    setPaymentType(
      row.bankPaymentType
        ? { key: String(row.bankPaymentTypeId ?? row.bankPaymentType), label: row.bankPaymentType }
        : null
    );
    setBank(
      row.bankId
        ? ({ BankID: row.bankId, BankName: row.bankName } as BankDetail)
        : null
    );
    setChequeDate(row.chequeDate ?? "");
    setChequeNo(row.chequeNo ?? "");
    setNeftNo(row.neftNo ?? "");
    setBranch(row.branch ?? "");
  }, [open, row]);

  // Escape-to-close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !row) return null;

  // Normalize once so both the conditional-field rendering and validation
  // below agree on what counts as "Cheque/DD" vs "NEFT/RTGS" vs "Cash Deposit".
  const typeKey = (paymentType?.key ?? "").toUpperCase();
  const isChequeOrDD = typeKey === "CHEQUE" || typeKey === "DD";
  const isNeftOrRtgs = typeKey === "NEFT" || typeKey === "RTGS";
  const isCashDeposit = typeKey === "CASH DEPOSIT";

  const canSave =
    !!paymentType &&
    !!bank &&
    (!isChequeOrDD || (!!chequeDate && !!chequeNo)) &&
    (!isNeftOrRtgs || !!neftNo) &&
    (!isCashDeposit || !!branch);

  const handleSave = () => {
    if (!paymentType || !bank) {
      toast.error("Please select both Bank Payment Type and Bank.");
      return;
    }
    if (isChequeOrDD && (!chequeDate || !chequeNo)) {
      toast.error("Please enter both Cheque Date and Cheque Number.");
      return;
    }
    if (isNeftOrRtgs && !neftNo) {
      toast.error("Please enter the NEFT/RTGS No.");
      return;
    }
    if (isCashDeposit && !branch) {
      toast.error("Please enter the Branch.");
      return;
    }

    if (bank.BankID) {
      dispatch(checkChequeNumberDuplication({ bankId: bank.BankID, chequeNo }));
    }

    onSave({
      bankPaymentType: paymentType,
      bank,
      chequeDate: isChequeOrDD ? chequeDate : undefined,
      chequeNo: isChequeOrDD ? chequeNo : undefined,
      neftNo: isNeftOrRtgs ? neftNo : undefined,
      branch: isCashDeposit ? branch : undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bank Details"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 60px -12px rgba(0,70,135,0.35)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: BRAND }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Landmark size={16} strokeWidth={2.2} color="white" />
            </div>
            <span className="text-sm font-bold text-white tracking-widest uppercase">
              Bank Details
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Voucher No. / Amount summary */}
          <div
            className="grid grid-cols-2 gap-4 rounded-xl p-4"
            style={{ background: BRAND_LIGHT }}
          >
            <div className="flex items-center gap-2">
              <Hash size={13} style={{ color: BRAND }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: BRAND }}>
                Voucher No.
              </span>
              <span className="text-xs text-gray-400">:</span>
              <span className="text-sm font-semibold text-gray-700 truncate">
                {voucherNo || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Scale size={13} style={{ color: BRAND }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: BRAND }}>
                Amount
              </span>
              <span className="text-xs text-gray-400">:</span>
              <span className="text-base font-bold text-gray-800 tabular-nums">
                {amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Bank Payment Type + Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel icon={Wallet} label="Bank Payment Type" />
              <SearchableCombobox
                value={paymentType?.label ?? ""}
                placeholder="Select Payment Type"
                icon={<Wallet size={14} />}
                items={BANK_PAYMENT_TYPES}
                searchPlaceholder="Search payment type..."
                emptyText="No payment types found."
                onSelect={(item) => {
                  setPaymentType(item);
                  // Switching payment type invalidates whatever was typed
                  // into the previous type's extra field(s).
                  setChequeDate("");
                  setChequeNo("");
                  setNeftNo("");
                  setBranch("");
                }}
                onClear={() => {
                  setPaymentType(null);
                  setChequeDate("");
                  setChequeNo("");
                  setNeftNo("");
                  setBranch("");
                }}
              />
            </div>
            <div>
              <FieldLabel icon={Landmark} label="Bank" />
              <SearchableCombobox
                value={bank?.BankName ?? ""}
                placeholder="Select Bank"
                icon={<Landmark size={14} />}
                items={bankOptions.map((b) => ({
                  key: String(b.BankID),
                  label: b.BankName,
                }))}
                loading={bankLoading}
                searchPlaceholder="Search bank..."
                emptyText="No banks found."
                onOpenChange={onBankOpen}
                onSelect={(item) => {
                  const selected = bankOptions.find(
                    (b) => String(b.BankID) === item.key
                  );
                  if (selected) setBank(selected);
                }}
                onClear={() => setBank(null)}
              />
            </div>
          </div>

          {/* Conditional fields — depend on the selected Bank Payment Type */}
          {isChequeOrDD && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel icon={Calendar} label="Cheque Date" />
                <InputField
                  icon={<Calendar size={14} />}
                  type="date"
                  placeholder="Select cheque date"
                  value={chequeDate}
                  onChange={setChequeDate}
                />
              </div>
              <div>
                <FieldLabel icon={Hash} label="Cheque Number" />
                <InputField
                  icon={<Hash size={14} />}
                  placeholder="Enter cheque number"
                  value={chequeNo}
                  onChange={setChequeNo}
                />
              </div>
            </div>
          )}

          {isNeftOrRtgs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel icon={Hash} label="NEFT No." />
                <InputField
                  icon={<Hash size={14} />}
                  placeholder="Enter NEFT/RTGS number"
                  value={neftNo}
                  onChange={setNeftNo}
                />
              </div>
            </div>
          )}

          {isCashDeposit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel icon={Building2} label="Branch" />
                <InputField
                  icon={<Building2 size={14} />}
                  placeholder="Enter branch"
                  value={branch}
                  onChange={setBranch}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: BRAND_MID, background: "#fafcfe" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            style={{ background: BRAND }}
          >
            <ShieldCheck size={15} />
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PaymentVoucher ─────────────────────────────────────────────────────────────
const PaymentVoucher: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux-backed lookups ───────────────────────────────────────────────────
  const accountHeadsList = useSelector(
    (state: RootState) => state.paymentVoucher.accountHeadsList
  );
  const accountHeadsLoading = useSelector(
    (state: RootState) => state.paymentVoucher.accountHeadsLoading
  );
  const accountHeadsDetailList = useSelector(
    (state: RootState) => state.paymentVoucher.accountHeadsDetailList
  );
  const accountHeadsDetailLoading = useSelector(
    (state: RootState) => state.paymentVoucher.accountHeadsDetailLoading
  );
  const activeDocumentLoading = useSelector(
    (state: RootState) => state.paymentVoucher.activeDocumentLoading
  );
  const accountBalance = useSelector(
    (state: RootState) => state.paymentVoucher.accountBalance
  );
  const accountBalanceLoading = useSelector(
    (state: RootState) => state.paymentVoucher.accountBalanceLoading
  );
  const currencyStartWithList = useSelector(
    (state: RootState) => state.paymentVoucher.currencyStartWithList
  );
  const currencyStartWithLoading = useSelector(
    (state: RootState) => state.paymentVoucher.currencyStartWithLoading
  );
  const bankList = useSelector(
    (state: RootState) => state.paymentVoucher.bankList
  );
  const bankListLoading = useSelector(
    (state: RootState) => state.paymentVoucher.bankLoading
  );
  const exchangeRateData = useSelector(
    (state: RootState) => state.paymentVoucher.exchangeRateData
  );
  const exchangeRateLoading = useSelector(
    (state: RootState) => state.paymentVoucher.exchangeRateLoading
  );
  const saveChangesLoading = useSelector(
    (state: RootState) => state.paymentVoucher.saveChangesLoading
  );

  // ── Local UI-only state ────────────────────────────────────────────────────
  const [rows, setRows] = useState<PaymentLineItem[]>([makeRow(1)]);
  const [settled, setSettled] = useState(false);
  const [advance, setAdvance] = useState(false);
  const [roundOff, setRoundOff] = useState(false);
  const [employeeLoan, setEmployeeLoan] = useState(false);
  const [employeeAdvance, setEmployeeAdvance] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [voucherDate, setVoucherDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [creditHead, setCreditHead] = useState<AccountHeadHeader | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentStartWith | null>(null);
  const [voucherNo, setVoucherNo] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyStartWith | null>(null);
  const [exchangeRate, setExchangeRate] = useState("");
  const [tdsHead, setTdsHead] = useState<AccountHeadHeader | null>(null);
  const [bankRows, setBankRows] = useState<BankChargeRow[]>([makeBankRow(1)]);
  const [bankCurrentAccount, setBankCurrentAccount] = useState<AccountHeadHeader | null>(null);
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [activeBankRowId, setActiveBankRowId] = useState<number | null>(null);

  // ── Mount-time guards (avoid duplicate fetches on re-render) ──────────────
  const accountHeadsFetchedRef = useRef(false);
  const tdsHeadsFetchedRef = useRef(false);

  // Fetch Credit Head options on mount
  useEffect(() => {
    if (accountHeadsFetchedRef.current) return;
    accountHeadsFetchedRef.current = true;

    dispatch(fetchAccountHeadsHeader())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load account heads.");
      });
  }, [dispatch]);

  // Fetch TDS Account Head options on mount
  useEffect(() => {
    if (tdsHeadsFetchedRef.current) return;
    tdsHeadsFetchedRef.current = true;

    dispatch(fetchAccountHeadsAll())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load TDS account heads.");
      });
  }, [dispatch]);

  // Fired when a Credit Head is picked: clears stale Document/Voucher No.
  // state, then fetches the active Documents (to prefill Document + Voucher
  // No.) and the account balance for that head, in parallel.
  const handleCreditHeadSelect = (selected: AccountHeadHeader) => {
    setCreditHead(selected);
    setSelectedDocument(null);
    setVoucherNo("");

    dispatch(fetchDocumentStartWithActive({ documentType: "BANK PAYMENT" }))
      .unwrap()
      .then((documents) => {
        if (!documents || documents.length === 0) return;
        const defaultDoc =
          documents.find((d) => d.SetDefault) ?? documents[0];
        setSelectedDocument(defaultDoc);
        setVoucherNo(`${defaultDoc.Prefix ?? ""}-${defaultDoc.StartingNo ?? ""}`);
      })
      .catch((err: string) => {
        toast.error(err || "Failed to load documents.");
      });

    dispatch(fetchAccountBalance({ headId: selected.HeadID }))
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load account balance.");
      });
  };

  const handleCreditHeadClear = () => {
    setCreditHead(null);
    setSelectedDocument(null);
    setVoucherNo("");
  };

  // Sync exchange rate field whenever Redux resolves the ex-rate fetch
  useEffect(() => {
    if (exchangeRateData) {
      setExchangeRate(String(exchangeRateData.ExchRate));
    }
  }, [exchangeRateData]);

  const handleCurrencyOpen = (nextOpen: boolean): boolean | void => {
    if (!nextOpen) return; // closing — always allow
    dispatch(fetchCurrencyStartWith())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load currencies.");
      });
  };

  const handleCurrencySelect = (item: { key: string; label: string }) => {
    const picked = currencyStartWithList.find(
      (c) => String(c.CurrencyID) === item.key
    );
    if (!picked) return;
    setSelectedCurrency(picked);
    setExchangeRate(""); // clear stale rate while fetching
    dispatch(clearExchangeRateData());
    dispatch(fetchCurrencyExRate({ currencyId: picked.CurrencyID }))
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to fetch exchange rate.");
      });
  };

  const handleCurrencyClear = () => {
    setSelectedCurrency(null);
    setExchangeRate("");
    dispatch(clearExchangeRateData());
    dispatch(clearCurrencyStartWithList());
  };

  const handleRemoveBankRow = (id: number) =>
    setBankRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  const handleUpdateBankRow = (id: number, field: keyof BankChargeRow, value: string | boolean) =>
    setBankRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // ── Bank Charge row calculation ───────────────────────────────────────────
  // Direct port of `fundCreditAmountChange` + `TaxEnabledChange` from
  // bizcare-base.txt:
  //   1. Require Currency and Credit (Account Head) to be selected before
  //      accepting an amount — otherwise warn and reset Amount to 0.
  //   2. BaseAmount = round(Amount * ExRate, 2)
  //   3. If GST is enabled: split tax evenly into SGST/CGST and add to
  //      BaseAmount for NetAmount. Otherwise NetAmount = BaseAmount.
  // Always reads/writes through the setBankRows updater so it operates on
  // the freshest row state — never a captured/stale snapshot.

  // Pure recompute of BaseAmount/SGST/CGST/NetAmount from whatever is
  // already on the row — no validation, no toasts. Safe to call any time
  // a dependency (Amount, ExRate, GST toggle) changes.
  const computeBankRowAmounts = (row: BankChargeRow): BankChargeRow => {
    const amount = Number(row.amount) || 0;
    const exRate = Number(row.exRate) || 0;
    const baseAmount = round2(amount * exRate);

    let sgst = 0;
    let cgst = 0;
    let netAmt = baseAmount;

    if (row.gst) {
      const totalTax = round2((baseAmount * GST_TAX_PERCENT) / 100);
      sgst = round2(totalTax / 2);
      cgst = round2(totalTax / 2);
      netAmt = round2(baseAmount + totalTax);
    }

    return {
      ...row,
      baseAmt: String(baseAmount),
      sgst: String(sgst),
      cgst: String(cgst),
      netAmt: String(netAmt),
    };
  };

  // Validating wrapper — mirrors fundCreditAmountChange exactly. Used when
  // the Amount field itself is the trigger (on blur), where guarding
  // against a missing Currency/Credit selection makes sense.
  const calculateBankRow = (row: BankChargeRow): BankChargeRow => {
    if (!row.currencyId) {
      toast.error("Please Select Currency");
      return { ...row, amount: "0", baseAmt: "0", sgst: "0", cgst: "0", netAmt: "0" };
    }
    if (!row.creditId) {
      toast.error("Please Select Head");
      return { ...row, amount: "0", baseAmt: "0", sgst: "0", cgst: "0", netAmt: "0" };
    }
    return computeBankRowAmounts(row);
  };

  const handleBankRowCalculate = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) => (r.id === rowId ? calculateBankRow(r) : r))
    );
  };

  const handleToggleBankRowGst = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) => (r.id === rowId ? calculateBankRow({ ...r, gst: !r.gst }) : r))
    );
  };

  // Adding a new row first finalizes the calculation on the current last
  // row (mirrors how the legacy addFundCredit flow only proceeds once the
  // row in progress has a valid, calculated Amount).
  const handleAddBankRow = () =>
    setBankRows((prev) => {
      const updated = prev.map((r, idx) =>
        idx === prev.length - 1 ? calculateBankRow(r) : r
      );
      return [...updated, makeBankRow(updated.length ? updated[updated.length - 1].id + 1 : 1)];
    });

  // Fired when the Bank Charge "Credit" field is opened: lazy-loads the
  // full account heads list used to populate its searchable dropdown.
  const handleBankCreditOpen = (nextOpen: boolean): boolean | void => {
    if (!nextOpen) return; // closing — always allow
    dispatch(fetchAccountHeadsAll())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load account heads.");
      });
  };

  const handleBankCreditSelect = (rowId: number, item: { key: string; label: string }) => {
    const picked = accountHeadsList.find((h) => String(h.HeadID) === item.key);
    if (!picked) return;
    setBankRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, credit: picked.HeadName, creditId: picked.HeadID } : r
      )
    );
  };

  const handleBankCreditClear = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, credit: "", creditId: null } : r))
    );
  };

  // Fired when the Bank Charge "Currency" field is opened: lazy-loads the
  // currency list used to populate its searchable dropdown.
  const handleBankCurrencyOpen = (nextOpen: boolean): boolean | void => {
    if (!nextOpen) return; // closing — always allow
    dispatch(fetchCurrencyStartWith())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load currencies.");
      });
  };

  const handleBankCurrencySelect = (rowId: number, item: { key: string; label: string }) => {
    const picked = currencyStartWithList.find((c) => String(c.CurrencyID) === item.key);
    if (!picked) return;

    // Update currency immediately, clear the stale rate, and show a
    // per-row loading state while the new rate is fetched — separate from
    // the top-level exchangeRateData so multiple rows never clobber
    // each other.
    setBankRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, currency: picked.Currency, currencyId: picked.CurrencyID, exRate: "", exRateLoading: true }
          : r
      )
    );

    dispatch(fetchCurrencyExRate({ currencyId: picked.CurrencyID }))
      .unwrap()
      .then((data) => {
        setBankRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? computeBankRowAmounts({ ...r, exRate: String(data.ExchRate), exRateLoading: false })
              : r
          )
        );
      })
      .catch((err: string) => {
        setBankRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, exRateLoading: false } : r))
        );
        toast.error(err || "Failed to fetch exchange rate.");
      });
  };

  const handleBankCurrencyClear = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, currency: "", currencyId: null, exRate: "0", exRateLoading: false }
          : r
      )
    );
  };

  // ── Bank Details popup (per Bank Charge row) ──────────────────────────────
  // Gated: only opens once at least one Payment Details row has both a
  // Debit Head and a non-zero Amount filled in — otherwise we block the
  // popup and nudge the user with a toast instead.
  const handleOpenBankDetailsModal = (rowId: number) => {
    const hasDebitHeadAndAmount = rows.some(
      (r) => r.debitHeadId !== null && Number(r.amount) > 0
    );

    if (!hasDebitHeadAndAmount) {
      toast.error("Please select a Debit Head and enter an Amount in Payment Details before adding bank details.", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
      });
      return;
    }

    setActiveBankRowId(rowId);
    setBankDetailsModalOpen(true);
  };

  const handleCloseBankDetailsModal = () => {
    setBankDetailsModalOpen(false);
    setActiveBankRowId(null);
  };

  // Fired when the Bank field inside the popup is opened: lazy-loads the
  // bank list used to populate its searchable dropdown.
  const handleBankDetailsBankOpen = (nextOpen: boolean): boolean | void => {
    if (!nextOpen) return; // closing — always allow
    dispatch(fetchBanks())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load banks.");
      });
  };

  const handleSaveBankDetails = (data: {
    bankPaymentType: ComboboxItem;
    bank: BankDetail;
    chequeDate?: string;
    chequeNo?: string;
    neftNo?: string;
    branch?: string;
  }) => {
    if (activeBankRowId == null) return;
    setBankRows((prev) =>
      prev.map((r) =>
        r.id === activeBankRowId
          ? {
            ...r,
            bankPaymentType: data.bankPaymentType.label,
            bankPaymentTypeId: Number.isNaN(Number(data.bankPaymentType.key))
              ? null
              : Number(data.bankPaymentType.key),
            bankName: data.bank.BankName,
            bankId: data.bank.BankID,
            chequeDate: data.chequeDate ?? "",
            chequeNo: data.chequeNo ?? "",
            neftNo: data.neftNo ?? "",
            branch: data.branch ?? "",
          }
          : r
      )
    );
    toast.success("Bank details saved.");
  };

  const activeBankRow =
    activeBankRowId != null
      ? bankRows.find((r) => r.id === activeBankRowId) ?? null
      : null;

  // ── Payment Details totals ────────────────────────────────────────────────
  // Sum of every Payment Details row's Amount. Drives the footer's Total /
  // Net Amount, and the Amount shown inside the Bank Details popup — all
  // derived from the single source of truth (`rows`) instead of duplicated.
  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [rows]
  );
  // Net Amount = Total Amount − TDS Amount. TDS Amount isn't wired to a
  // live input yet (still a static "0" placeholder), so this is currently
  // equal to totalAmount; once TDS Amount is wired, subtract it here.
  const netAmount = totalAmount;

  const handleAddRow = () =>
    setRows((prev) => [...prev, makeRow(prev.length ? prev[prev.length - 1].id + 1 : 1)]);
  const handleRemoveRow = (id: number) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  const handleUpdateRow = (id: number, field: keyof PaymentLineItem, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // Fired when the Debit Head field is opened: lazy-loads the account
  // heads detail list (only needs to happen once per session).
  const handleDebitHeadOpen = (nextOpen: boolean): boolean | void => {
    if (!nextOpen) return; // closing — always allow
    dispatch(fetchAccountHeadsDetail())
      .unwrap()
      .catch((err: string) => {
        toast.error(err || "Failed to load account heads.");
      });
  };

  // Fired when a Debit Head is picked on a row: stores the head on that
  // row, then fetches its account balance and prefills Ledger Balance.
  const handleDebitHeadSelect = (rowId: number, selected: AccountHeadHeader) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
            ...r,
            debitHead: selected.HeadName,
            debitHeadId: selected.HeadID,
            ledgerBalance: "",
            ledgerBalanceLoading: true,
          }
          : r
      )
    );

    dispatch(fetchAccountBalance({ headId: selected.HeadID }))
      .unwrap()
      .then((balance) => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? { ...r, ledgerBalance: balance, ledgerBalanceLoading: false }
              : r
          )
        );
      })
      .catch((err: string) => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, ledgerBalanceLoading: false } : r
          )
        );
        toast.error(err || "Failed to load ledger balance.");
      });
  };

  const handleDebitHeadClear = (rowId: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, debitHead: "", debitHeadId: null, ledgerBalance: "", ledgerBalanceLoading: false }
          : r
      )
    );
  };

  // ── Save / SaveChanges payload ─────────────────────────────────────────────
  // Checks only the fields the form actually requires before a save attempt
  // is allowed. Returns a human-readable error to toast, or null if the form
  // is good to go.
  const validateMandatoryFields = (): string | null => {
    if (!creditHead) return "Please select a Credit Head.";
    if (!selectedDocument) return "Document details are still loading. Please wait and try again.";
    if (!voucherDate) return "Please select a Voucher Date.";

    const validRows = rows.filter((r) => r.debitHeadId !== null && Number(r.amount) > 0);
    if (validRows.length === 0) {
      return "Please add at least one Payment Details row with a Debit Head and Amount.";
    }
    if (totalAmount <= 0) return "Total Amount must be greater than 0.";

    return null;
  };

  // Builds the exact payload shape the /Voucher/SaveChanges API expects, from
  // current form state. Every field is mapped explicitly below — see the
  // inline comments for fields that don't have a dedicated UI control yet
  // (these are sent with safe defaults rather than guessed values).
  const buildSaveChangesPayload = (): SaveChangesPayload => {
    // Only the first Bank Charge row currently drives the single "Bank
    // Details" popup/section on this form, so its values are what get sent
    // for both the top-level Bank* fields and the nested BankDetails object.
    const primaryBankRow = bankRows[0];

    const voucherDateStr = toDDMMYYYY(voucherDate) ?? "";
    const chequeDateStr = toDDMMYYYY(primaryBankRow?.chequeDate);

    // Payment Details rows -> LstVoucherDetails / LstPaymentReceiptT.
    // Both keys are populated identically — only rows with a Debit Head
    // actually selected are sent (blank/in-progress rows are skipped).
    const voucherDetailLines: SaveChangesDetailLine[] = rows
      .filter((r) => r.debitHeadId !== null)
      .map((r) => ({
        HeadName: r.debitHead,
        HeadID: r.debitHeadId as number,
        Balance: r.ledgerBalance || "0.00",
        SystemAmount: r.ledgerBalance || "0.00",
        Amount: Number(r.amount) || 0,
        CESSAmt: 0,
        CGSTAmt: 0,
        IGSTAmt: 0,
        NetAmt: (Number(r.amount) || 0).toFixed(2),
        RefDate: toDDMMYYYY(r.invoiceDate),
        SGSTAmt: 0,
        TaxPercentage: 0,
        TaxRate: "0.00",
        UTGSTAmt: 0,
        VATAmt: "0.00",
        VATPer: 0,
      }));

    // Domestic Bank Charge rows -> lstFundCredit. Only rows with a Credit
    // head actually selected are sent.
    const fundCreditLines: SaveChangesFundCreditLine[] = bankRows
      .filter((r) => r.creditId !== null)
      .map((r) => ({
        Charge: 1,
        IsReceiptOrPayment: 0, // Payment Voucher screen
        AccHeadName: r.credit,
        AccHeadID: r.creditId as number,
        Amount: Number(r.amount) || 0,
        BaseAmount: r.baseAmt || "0.00",
        CGSTAmount: Number(r.cgst) || 0,
        Currency: r.currency,
        CurrencyID: r.currencyId ?? 0,
        ExRate: Number(r.exRate) || 0,
        NetAmount: Number(r.netAmt) || 0,
        SGSTAmount: Number(r.sgst) || 0,
        TaxEnabled: r.gst,
        TotalTaxAmount: round2((Number(r.sgst) || 0) + (Number(r.cgst) || 0)),
      }));

    // Sum of the Domestic Bank Charge rows' Net Amount — the bank-charge
    // side total, distinct from the Payment Details VoucherAmount below.
    const bankChargeTotal = round2(
      bankRows.reduce((sum, r) => sum + (Number(r.netAmt) || 0), 0)
    );

    return {
      Advance: advance,
      BankDetails: {
        BankReceiptTypeID: primaryBankRow?.bankPaymentTypeId ?? 0,
        NeftRefNo: primaryBankRow?.neftNo || null,
        ChequeNo: primaryBankRow?.chequeNo || null,
        ChequeDateStr: chequeDateStr,
        BankID: primaryBankRow?.bankId ?? 0,
        BankName: primaryBankRow?.bankName || null,
        Branch: primaryBankRow?.branch || null,
      },
      BankID: primaryBankRow?.bankId ?? 0,
      BankName: primaryBankRow?.bankName || null,
      BankPaymentType: {
        Id: primaryBankRow?.bankPaymentTypeId ?? 0,
        Title: primaryBankRow?.bankPaymentType || "",
      },
      BankReceiptTypeID: primaryBankRow?.bankPaymentTypeId ?? 0,
      BaseCurrencyAmt: round2(totalAmount * (Number(exchangeRate) || 1)),
      Branch: primaryBankRow?.branch || null,
      ChequeDate: chequeDateStr,
      ChequeDateStr: chequeDateStr,
      ChequeNo: primaryBankRow?.chequeNo || null,
      Currency: selectedCurrency?.Currency ?? "",
      CurrencyID: selectedCurrency?.CurrencyID ?? 0,
      Date: new Date().toISOString(),
      DocumentID: selectedDocument?.DocumentID ?? 0,
      DocumentName: selectedDocument?.DocumentName ?? "Payment",
      EmpLoan: employeeLoan,
      ExchRate: Number(exchangeRate) || 1,
      FundCreditTo: bankCurrentAccount?.HeadID ?? 0,
      HeadID: creditHead?.HeadID ?? 0,
      HeaderGroupID: creditHead?.GroupID ?? 0,
      HeaderHeadID: creditHead?.HeadID ?? 0,
      HeaderHeadName: creditHead?.HeadName ?? "",
      IsCess: false, // no Cess control on this form yet
      IsGST: selectedDocument?.IsGST ?? false,
      IsReceiptOrPayment: 0, // Payment Voucher screen
      IsVAT: selectedDocument?.IsVAT ?? false,
      LstPaymentReceiptAdvanceT: [], // no Advance line items UI yet
      LstPaymentReceiptT: voucherDetailLines,
      LstVoucherDetails: voucherDetailLines,
      NeftRefNo: primaryBankRow?.neftNo || null,
      NextTransNo: 0,
      Percentage: "0", // no UI control for this yet
      ReceiptTypeID: primaryBankRow?.bankPaymentTypeId ?? 0,
      Remarks: remarks,
      RoundOff: roundOff,
      Settled: settled,
      // TDS Head falls back to the Credit Head when no separate TDS Account
      // Head has been picked (the TDS% / TDS Amount inputs aren't wired to
      // live state yet, so the tax amounts below stay at 0 for now).
      TDSHeadID: tdsHead?.HeadID ?? creditHead?.HeadID ?? 0,
      TDSHeadName: tdsHead?.HeadName ?? creditHead?.HeadName ?? "",
      TaxAmountHead: "Tax Amt",
      TaxMasterName: "VAT",
      TaxPercHead: "Tax %",
      TotalTDS: "0.00",
      TotalTDSAmt: 0,
      VoucherAmount: totalAmount,
      VoucherAmountPopUp: totalAmount.toFixed(2),
      VoucherDateStr: voucherDateStr,
      lstFundCredit: fundCreditLines,
      startingnowithoutprefix: selectedDocument?.StartingNo ?? 0,
      totalAmt: bankChargeTotal,
      voucherType: { Id: 1, Name: "Payment" },
      voucherprefix: selectedDocument?.Prefix ?? "",
      vouchersufix: selectedDocument?.Suffix ?? null,
    };
  };

  const handleSubmit = async () => {
    const validationError = validateMandatoryFields();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = buildSaveChangesPayload();

    try {
      const result = await dispatch(saveChanges({ payload })).unwrap();
      toast.success(
        result.Info ? `Voucher saved successfully (${result.Info}).` : "Voucher saved successfully.", {

        style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },

      }
      );
      // Hand control back to PaymentEntry's list view — its onBack handler
      // already re-fetches the voucher list, so the newly saved voucher
      // shows up immediately.
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save voucher. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <CreditCard size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Payment Voucher
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Accounts · Outgoing Payments
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Receipt size={13} />
          Payment Details
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

          {/* Row 1 : Voucher Type | Credit Head | Balance | Document | Voucher No. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <FieldLabel icon={ReceiptText} label="Voucher Type" />
              <InputField
                icon={<ReceiptText size={14} />}
                placeholder=""
                value="Payment"
                readOnly
              />
            </div>
            <div>
              <FieldLabel icon={Landmark} label="Credit Head" />
              <SearchableCombobox
                value={creditHead?.HeadName ?? ""}
                placeholder="Select Account"
                icon={<Landmark size={14} />}
                items={accountHeadsList.map((h) => ({
                  key: String(h.HeadID),
                  label: h.HeadName,
                }))}
                loading={accountHeadsLoading}
                searchPlaceholder="Search account head..."
                emptyText="No account heads found."
                onSelect={(item) => {
                  const selected = accountHeadsList.find(
                    (h) => String(h.HeadID) === item.key
                  );
                  if (selected) handleCreditHeadSelect(selected);
                }}
                onClear={handleCreditHeadClear}
              />
            </div>
            <div>
              <FieldLabel icon={Scale} label="Balance" />
              <InputField
                icon={<Scale size={14} />}
                placeholder="Balance"
                value={accountBalanceLoading ? "Loading..." : accountBalance}
                readOnly
              />
            </div>
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <InputField
                icon={<FileText size={14} />}
                placeholder="Document"
                value={
                  activeDocumentLoading
                    ? "Loading..."
                    : selectedDocument?.DocumentName ?? ""
                }
                readOnly
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Voucher No." />
              <InputField
                icon={<Hash size={14} />}
                placeholder="Voucher No."
                value={voucherNo}
                readOnly
              />
            </div>
          </div>

          {/* Row 2 : Voucher Date | Currency | Exchange Rate | Invoice Tax Type | checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-5 items-end">
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
                value={selectedCurrency?.Currency ?? ""}
                placeholder="Select Currency"
                icon={<Coins size={14} />}
                items={currencyStartWithList.map((c) => ({
                  key: String(c.CurrencyID),
                  label: c.Currency,
                }))}
                loading={currencyStartWithLoading}
                searchPlaceholder="Search currency..."
                emptyText="No currencies found."
                onSelect={handleCurrencySelect}
                onClear={handleCurrencyClear}
                onOpenChange={handleCurrencyOpen}
              />
            </div>
            <div>
              <FieldLabel
                icon={Scale}
                label={`Exchange Rate${selectedCurrency ? ` [${selectedCurrency.CurrencyCode}]` : ""}`}
              />
              <InputField
                icon={<Scale size={14} />}
                placeholder="1"
                value={exchangeRateLoading ? "Loading..." : exchangeRate}
                readOnly={exchangeRateLoading}
                onChange={setExchangeRate}
              />
            </div>
            <div>
              <FieldLabel icon={Tag} label="Invoice Tax Type" />
              <SearchableCombobox
                value=""
                placeholder="Invoice Tax Type"
                icon={<Tag size={14} />}
              />
            </div>
            <div>
              <CheckboxField label="Settled" checked={settled} onChange={setSettled} />
              <CheckboxField label="Advance" checked={advance} onChange={setAdvance} />
              <CheckboxField label="RoundOff" checked={roundOff} onChange={setRoundOff} />
            </div>
          </div>

          {/* Row 3 : Remarks | Paid To | checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5 items-end">
            <div className="lg:col-span-2">
              <FieldLabel icon={StickyNote} label="Remarks" />
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Enter Remarks, If Any"
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
            <div>
              <FieldLabel icon={User} label="Paid To" />
              <InputField
                icon={<User size={14} />}
                placeholder="Paid To"
              />
            </div>
            <div className="flex items-center gap-5">
              <CheckboxField label="Employee Loan" checked={employeeLoan} onChange={setEmployeeLoan} />
              <CheckboxField label="Employee Advance" checked={employeeAdvance} onChange={setEmployeeAdvance} />
            </div>
          </div>
        </div>

        {/* ── Payment Items Table ────────────────────────────────────────────────── */}
        <PaymentItemsTable
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          debitHeadOptions={accountHeadsDetailList}
          debitHeadLoading={accountHeadsDetailLoading}
          onDebitHeadOpen={handleDebitHeadOpen}
          onDebitHeadSelect={handleDebitHeadSelect}
          onDebitHeadClear={handleDebitHeadClear}
        />

        {/* ── Domestic Bank Charge Section ───────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ background: BRAND }} />
        </div>
        <div className="flex items-center gap-2.5 -mt-3 mb-4">
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
            Domestic Bank Charge
          </span>
        </div>

        {/* Current Account */}
        <div className="max-w-xs">
          <FieldLabel icon={Landmark} label="Current Account" />
          <SearchableCombobox
            value={bankCurrentAccount?.HeadName ?? ""}
            placeholder="Select Account"
            icon={<Landmark size={14} />}
            items={accountHeadsList.map((h) => ({
              key: String(h.HeadID),
              label: h.HeadName,
            }))}
            loading={accountHeadsLoading}
            searchPlaceholder="Search account..."
            emptyText="No accounts found."
            onSelect={(item) => {
              const selected = accountHeadsList.find(
                (h) => String(h.HeadID) === item.key
              );
              if (selected) setBankCurrentAccount(selected);
            }}
            onClear={() => setBankCurrentAccount(null)}
          />
        </div>

        {/* Bank Charge Table */}
        <BankChargeTable
          rows={bankRows}
          onAdd={handleAddBankRow}
          onRemove={handleRemoveBankRow}
          onUpdate={handleUpdateBankRow}
          onCalculate={handleBankRowCalculate}
          onToggleGst={handleToggleBankRowGst}
          creditOptions={accountHeadsList}
          creditLoading={accountHeadsLoading}
          onCreditOpen={handleBankCreditOpen}
          onCreditSelect={handleBankCreditSelect}
          onCreditClear={handleBankCreditClear}
          currencyOptions={currencyStartWithList}
          currencyLoading={currencyStartWithLoading}
          onCurrencyOpen={handleBankCurrencyOpen}
          onCurrencySelect={handleBankCurrencySelect}
          onCurrencyClear={handleBankCurrencyClear}
        />

        {/* Bank Details: visible only when a Credit Head is selected */}
        {creditHead && (
          <div
            className="bg-white rounded-2xl shadow-sm border p-5"
            style={{ borderColor: BRAND_MID }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: BRAND_LIGHT }}
                >
                  <Landmark size={14} strokeWidth={2.2} style={{ color: BRAND }} />
                </div>
                <span
                  className="text-sm font-bold tracking-widest uppercase"
                  style={{ color: BRAND }}
                >
                  Bank Details
                </span>
                {bankRows[0]?.bankName && (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: BRAND_LIGHT, color: BRAND }}
                  >
                    <ShieldCheck size={11} />
                    {bankRows[0].bankPaymentType} · {bankRows[0].bankName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleOpenBankDetailsModal(bankRows[0]?.id ?? 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow transition-all hover:opacity-90 cursor-pointer"
                style={{ background: BRAND }}
              >
                <Plus size={13} />
                Add
              </button>
            </div>
          </div>
        )}

        <BankDetailsModal
          open={bankDetailsModalOpen}
          onClose={handleCloseBankDetailsModal}
          voucherNo={voucherNo}
          amount={totalAmount}
          row={activeBankRow}
          bankOptions={bankList}
          bankLoading={bankListLoading}
          onBankOpen={handleBankDetailsBankOpen}
          onSave={handleSaveBankDetails}
        />


        {/* ── Footer Card : TDS + Totals ────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TDS Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel icon={Building2} label="TDS Account Head" />
                <SearchableCombobox
                  value={tdsHead?.HeadName ?? ""}
                  placeholder="Select TDS HeadName"
                  icon={<Building2 size={14} />}
                  items={accountHeadsList.map((h) => ({
                    key: String(h.HeadID),
                    label: h.HeadName,
                  }))}
                  loading={accountHeadsLoading}
                  searchPlaceholder="Search TDS account head..."
                  emptyText="No account heads found."
                  onSelect={(item) => {
                    const picked = accountHeadsList.find(
                      (h) => String(h.HeadID) === item.key
                    );
                    if (picked) setTdsHead(picked);
                  }}
                  onClear={() => setTdsHead(null)}
                />
              </div>
              <div>
                <FieldLabel icon={BarcodeIcon} label="TDS(%)" />
                <InputField
                  icon={<BarcodeIcon size={14} />}
                  placeholder="TDS%"
                />
              </div>
              <div>
                <FieldLabel icon={CalendarDays} label="TDS Applicable On" />
                <SearchableCombobox
                  value=""
                  placeholder="TDS Applicable"
                  icon={<CalendarDays size={14} />}
                />
              </div>
              <div>
                <FieldLabel icon={Scale} label="TDS Amount" />
                <InputField
                  icon={<Scale size={14} />}
                  placeholder="0"
                  value="0"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col justify-end space-y-3">
              <div className="border-t pt-3" style={{ borderColor: BRAND_MID }} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Total Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Tax Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">0.00</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                  <Scale size={15} style={{ color: BRAND }} />
                  Net Amount
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-xl font-bold text-gray-800 tabular-nums">
                  {netAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: "#f59e0b", color: "#f59e0b", background: "white" }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saveChangesLoading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            {saveChangesLoading ? "Saving..." : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentVoucher;
