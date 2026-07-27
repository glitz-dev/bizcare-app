"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Wallet,
  Layers,
  Scale,
  FileText,
  Hash,
  Calendar,
  Coins,
  ReceiptText,
  StickyNote,
  Save,
  RefreshCw,
  Check,
  ChevronsUpDown,
  Trash2,
  Plus,
  Landmark,
  Receipt,
  Tag,
  BadgeIndianRupee,
  Building2,
  ShieldCheck,
  X,
} from "lucide-react";
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
import {
  fetchPreferenceDetails,
  fetchCompanyCurrency,
  fetchDocumentStartWith,
  fetchDocumentStartWithActive,
  fetchIsTaxOnService,
  fetchCurrencyExRate,
  fetchAccountHeadsHeader,
  fetchAccountHeadsDetailStartWith,
  fetchAccountHeadsAll,
  fetchAccountBalance,
  fetchCurrencyStartWith,
  fetchBanks,
  saveChanges,
  clearSaveChangesResult,
  setSelectedActiveDocument,
  AccountHeadHeader,
  DocumentStartWith,
  CurrencyStartWith,
  BankDetail,
  SaveChangesPayload,
  SaveChangesDetailLine,
  SaveChangesBankChargeDetailLine,
  SaveChangesFundCreditLine,
} from "../store/features/Accounts/accounts/receiptVoucherSlice";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ────────────────────────────────────────────────────────────────────
type CreditLineItem = {
  id: number;
  creditHead: AccountHeadHeader | null;
  amount: string;
  orderNo: string;
  narration: string;
};

const makeRow = (id: number): CreditLineItem => ({
  id,
  creditHead: null,
  amount: "0",
  orderNo: "",
  narration: "",
});

// ─── BankChargeRow ────────────────────────────────────────────────────────────
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
// Standard GST rate applied to Bank Charge rows when the GST checkbox is on.
const GST_TAX_PERCENT = 18;

const round2 = (value: number) => Math.round(value * 100) / 100;

// ─── SearchableCombobox ─────────────────────────────────────────────────────────
// Generic shadcn Popover + Command driven combobox, used by the Bank Charge
// table and Bank Details popup (live-wired fields with search + lazy fetch).
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
  onOpenChange?: (nextOpen: boolean) => boolean | void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
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
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
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
                        className={cn("mr-2", value === item.label ? "opacity-100" : "opacity-0")}
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

// ─── Bank Payment Type options (static lookup) ─────────────────────────────
const BANK_PAYMENT_TYPES: ComboboxItem[] = [
  { key: "NEFT", label: "NEFT" },
  { key: "RTGS", label: "RTGS" },
  { key: "Cash Deposit", label: "Cash Deposit" },
  { key: "CHEQUE", label: "Cheque" },
  { key: "DD", label: "Demand Draft" },
];

// Maps the combobox's Bank Payment Type key to the numeric
// BankReceiptTypeID / BankPaymentType.{Id,Title} pair the SaveChanges API
// expects. Only one real example was seen ({ Id: 1, Title: "Cheque/DD" }
// for Cheque), so NEFT/RTGS and Cash Deposit below are a best-effort
// extrapolation — flag/confirm with backend if a save comes back wrong for
// those types.
const BANK_PAYMENT_TYPE_ID_MAP: Record<string, { Id: number; Title: string }> = {
  CHEQUE: { Id: 1, Title: "Cheque/DD" },
  DD: { Id: 1, Title: "Cheque/DD" },
  NEFT: { Id: 2, Title: "NEFT/RTGS" },
  RTGS: { Id: 2, Title: "NEFT/RTGS" },
  "Cash Deposit": { Id: 3, Title: "Cash Deposit" },
};

// Converts an HTML <input type="date"> value ("YYYY-MM-DD") into the
// "DD-MM-YYYY" string format the SaveChanges API expects (VoucherDateStr,
// ChequeDateStr, etc.). Returns "" for empty/invalid input.
const toDDMMYYYY = (isoDate: string | null | undefined): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${month}-${year}`;
};

// Converts an HTML <input type="date"> value into a full ISO datetime
// string, as the API expects for Date/ChequeDate. Falls back to "now" for
// empty input so we never send an invalid date string.
const toISODateTime = (isoDate: string | null | undefined): string => {
  if (!isoDate) return new Date().toISOString();
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

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

// ─── StaticCombobox (display-only dropdown look, no live data wiring) ────────
function StaticCombobox({
  value,
  placeholder,
  icon,
}: {
  value: string;
  placeholder: string;
  icon: React.ReactNode;
}) {
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
        <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#93b8d8" }}>
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

// ─── AccountHeadCombobox (live dropdown wired to accountHeadsList) ──────────
function AccountHeadCombobox({
  value,
  list,
  loading,
  placeholder,
  icon,
  onSelect,
}: {
  value: AccountHeadHeader | null;
  list: AccountHeadHeader[];
  loading: boolean;
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (head: AccountHeadHeader) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = list.filter((h) =>
    h.HeadName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
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
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{value?.HeadName || placeholder}</span>
        <ChevronsUpDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full rounded-xl border bg-white shadow-lg overflow-hidden"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="p-2 border-b" style={{ borderColor: BRAND_MID }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search account head..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
              style={{ borderColor: "#d1dff0" }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">No account heads found</div>
            ) : (
              filtered.map((head) => (
                <button
                  key={head.HeadID}
                  type="button"
                  onClick={() => {
                    onSelect(head);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
                  style={{ color: value?.HeadID === head.HeadID ? BRAND : "#374151" }}
                >
                  {head.HeadName}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DocumentCombobox (live dropdown wired to activeDocumentList) ───────────
function DocumentCombobox({
  value,
  list,
  loading,
  placeholder,
  icon,
  onSelect,
}: {
  value: DocumentStartWith | null;
  list: DocumentStartWith[];
  loading: boolean;
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (doc: DocumentStartWith) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = list.filter((d) =>
    d.DocumentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
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
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{value?.DocumentName || placeholder}</span>
        <ChevronsUpDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full rounded-xl border bg-white shadow-lg overflow-hidden"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="p-2 border-b" style={{ borderColor: BRAND_MID }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
              style={{ borderColor: "#d1dff0" }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">No documents found</div>
            ) : (
              filtered.map((doc) => (
                <button
                  key={doc.DocumentID}
                  type="button"
                  onClick={() => {
                    onSelect(doc);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
                  style={{ color: value?.DocumentID === doc.DocumentID ? BRAND : "#374151" }}
                >
                  {doc.DocumentName}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CurrencyCombobox (live dropdown wired to currencyStartWithList) ────────
function CurrencyCombobox({
  value,
  list,
  loading,
  placeholder,
  icon,
  onOpen,
  onSelect,
}: {
  value: string;
  list: CurrencyStartWith[];
  loading: boolean;
  placeholder: string;
  icon: React.ReactNode;
  onOpen: () => void;
  onSelect: (currency: CurrencyStartWith) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = list.filter((c) =>
    c.Currency?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) onOpen();
            return next;
          });
        }}
        className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium"
        style={{
          borderColor: open ? BRAND : "#d1dff0",
          boxShadow: open ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
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
        <ChevronsUpDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full rounded-xl border bg-white shadow-lg overflow-hidden"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="p-2 border-b" style={{ borderColor: BRAND_MID }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
              style={{ borderColor: "#d1dff0" }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">No currencies found</div>
            ) : (
              filtered.map((currency) => (
                <button
                  key={currency.CurrencyID}
                  type="button"
                  onClick={() => {
                    onSelect(currency);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
                  style={{ color: value === currency.Currency ? BRAND : "#374151" }}
                >
                  {currency.Currency}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
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
      style={{ borderColor: "#d1dff0" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = BRAND;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#d1dff0";
        e.currentTarget.style.boxShadow = "none";
        onBlur?.();
      }}
    />
  );
}

// ─── CreditHeadCombobox (live dropdown wired to creditHeadList, per table row) ──
function CreditHeadCombobox({
  value,
  list,
  loading,
  placeholder,
  icon,
  onOpen,
  onSelect,
}: {
  value: AccountHeadHeader | null;
  list: AccountHeadHeader[];
  loading: boolean;
  placeholder: string;
  icon: React.ReactNode;
  onOpen: () => void;
  onSelect: (head: AccountHeadHeader) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep the portal-positioned dropdown aligned if the page or the table's
  // horizontal scroll container moves while it's open.
  useEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

  const filtered = list.filter((h) =>
    h.HeadName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) onOpen();
            return next;
          });
        }}
        className="relative w-full flex items-center pl-8 pr-7 py-1.5 text-xs rounded-lg border bg-white transition-all outline-none text-left font-medium h-7"
        style={{
          borderColor: open ? BRAND : "#d1dff0",
          color: value ? "#374151" : "#9ca3af",
        }}
      >
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{value?.HeadName || placeholder}</span>
        <ChevronsUpDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b8d8" }}
        />
      </button>

      {open && coords &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-50 rounded-xl border bg-white shadow-lg overflow-hidden"
            style={{ top: coords.top, left: coords.left, width: coords.width, borderColor: BRAND_MID }}
          >
            <div className="p-2 border-b" style={{ borderColor: BRAND_MID }}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search account head..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
                style={{ borderColor: "#d1dff0" }}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {loading ? (
                <div className="px-3 py-2.5 text-xs text-gray-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2.5 text-xs text-gray-400">No account heads found</div>
              ) : (
                filtered.map((head) => (
                  <button
                    key={head.HeadID}
                    type="button"
                    onClick={() => {
                      onSelect(head);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
                    style={{ color: value?.HeadID === head.HeadID ? BRAND : "#374151" }}
                  >
                    {head.HeadName}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// ─── CreditHeadTable ────────────────────────────────────────────────────────────
function CreditHeadTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  creditHeadList,
  creditHeadLoading,
  onOpenCreditHead,
  onSelectCreditHead,
}: {
  rows: CreditLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof CreditLineItem, value: string) => void;
  creditHeadList: AccountHeadHeader[];
  creditHeadLoading: boolean;
  onOpenCreditHead: () => void;
  onSelectCreditHead: (id: number, head: AccountHeadHeader) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
      {/* Table header bar */}
      <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: BRAND }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Receipt size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Receipt Details</span>
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
                { label: "Credit Head", cls: "min-w-[220px] text-left" },
                { label: "Amount", cls: "min-w-[130px] text-right" },
                { label: "OrderNo", cls: "min-w-[140px] text-left" },
                { label: "Narration", cls: "min-w-[220px] text-left" },
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

                {/* Credit Head */}
                <td className="px-2 py-2 min-w-[220px]">
                  <CreditHeadCombobox
                    value={row.creditHead}
                    list={creditHeadList}
                    loading={creditHeadLoading}
                    placeholder="Select Account Head"
                    icon={<Layers size={12} />}
                    onOpen={onOpenCreditHead}
                    onSelect={(head) => onSelectCreditHead(row.id, head)}
                  />
                </td>

                {/* Amount */}
                <td className="px-2 py-2 min-w-[130px]">
                  <CellInput
                    value={row.amount}
                    onChange={(v) => onUpdate(row.id, "amount", v)}
                    placeholder="0"
                    align="right"
                  />
                </td>

                {/* OrderNo */}
                <td className="px-2 py-2 min-w-[140px]">
                  <CellInput
                    value={row.orderNo}
                    onChange={(v) => onUpdate(row.id, "orderNo", v)}
                    placeholder="OrderNo"
                  />
                </td>

                {/* Narration */}
                <td className="px-2 py-2 min-w-[220px]">
                  <CellInput
                    value={row.narration}
                    onChange={(v) => onUpdate(row.id, "narration", v)}
                    placeholder="Enter Narration"
                  />
                </td>

                {/* Options */}
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-blue-50 transition-colors"
                    style={{ color: BRAND }}
                  >
                    <Trash2 size={14} />
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
      <div className="px-6 py-3 flex items-center justify-between" style={{ background: BRAND }}>
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
                    className="w-4 h-4 rounded border flex items-center justify-center mx-auto transition-colors"
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
    setBank(row.bankId ? ({ BankID: row.bankId, BankName: row.bankName } as BankDetail) : null);
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
        <div className="flex items-center justify-between px-6 py-4" style={{ background: BRAND }}>
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
          <div className="grid grid-cols-2 gap-4 rounded-xl p-4" style={{ background: BRAND_LIGHT }}>
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
                  const selected = bankOptions.find((b) => String(b.BankID) === item.key);
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

// ─── ReceiptVoucher (UI only) ────────────────────────────────────────────────
const ReceiptVoucher = ({ onBack }: { onBack?: () => void }) => {
  const dispatch = useDispatch<any>();
  const {
    companyCurrency,
    exchangeRateData,
    accountHeadsList,
    accountHeadsLoading,
    accountHeadsError,
    activeDocumentList,
    selectedActiveDocument,
    activeDocumentLoading,
    activeDocumentError,
    balance,
    loading: balanceLoading,
    error: balanceError,
    currencyStartWithList,
    currencyStartWithLoading,
    currencyStartWithError,
    creditHeadList,
    creditHeadLoading,
    creditHeadError,
    bankList,
    bankLoading: bankListLoading,
    bankError: bankListError,
    saveChangesLoading,
    saveChangesError,
    saveChangesResult,
  } = useSelector((state: any) => state.receiptVoucher);

  const [voucherDate, setVoucherDate] = useState("2026-07-03");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [remarks, setRemarks] = useState("");
  const [bankRefNo, setBankRefNo] = useState("");

  const [settled, setSettled] = useState(false);
  const [advance, setAdvance] = useState(false);
  const [roundOff, setRoundOff] = useState(false);

  const [debitHead, setDebitHead] = useState<AccountHeadHeader | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyStartWith | null>(null);

  const [rows, setRows] = useState<CreditLineItem[]>([makeRow(1)]);

  const [bankRows, setBankRows] = useState<BankChargeRow[]>([makeBankRow(1)]);
  const [bankCurrentAccount, setBankCurrentAccount] = useState<AccountHeadHeader | null>(null);
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [activeBankRowId, setActiveBankRowId] = useState<number | null>(null);

  // ── Initial data load on mount ────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPreferenceDetails({ functionName: "Receipt Voucher" }));
    dispatch(fetchDocumentStartWith());
    dispatch(fetchDocumentStartWithActive({ documentType: "BANK RECEIPT" }));
    dispatch(fetchIsTaxOnService());
    dispatch(fetchAccountHeadsHeader());

    // Currency must resolve first so we know which CurrencyID to price the
    // exchange rate lookup against.
    dispatch(fetchCompanyCurrency())
      .unwrap()
      .then((currency: { CurrencyID: number }) => {
        if (currency?.CurrencyID) {
          dispatch(fetchCurrencyExRate({ currencyId: currency.CurrencyID }));
        }
      })
      .catch(() => {
        // surfaced via currencyError in slice state
      });
  }, [dispatch]);

  // ── Prefill Exchange Rate once fetched ────────────────────────────────────
  useEffect(() => {
    if (exchangeRateData?.ExchRate != null) {
      setExchangeRate(String(exchangeRateData.ExchRate));
    }
  }, [exchangeRateData]);

  // ── Surface account heads / balance errors as toasts ──────────────────────
  useEffect(() => {
    if (accountHeadsError) toast.error(accountHeadsError);
  }, [accountHeadsError]);

  useEffect(() => {
    if (activeDocumentError) toast.error(activeDocumentError);
  }, [activeDocumentError]);

  useEffect(() => {
    if (balanceError) toast.error(balanceError);
  }, [balanceError]);

  useEffect(() => {
    if (currencyStartWithError) toast.error(currencyStartWithError);
  }, [currencyStartWithError]);

  useEffect(() => {
    if (creditHeadError) toast.error(creditHeadError);
  }, [creditHeadError]);

  useEffect(() => {
    if (bankListError) toast.error(bankListError);
  }, [bankListError]);

  useEffect(() => {
    if (saveChangesError) toast.error(saveChangesError);
  }, [saveChangesError]);

  useEffect(() => {
    if (!saveChangesResult) return;
    toast.success(
      saveChangesResult.Info
        ? `Receipt Voucher ${saveChangesResult.Info} saved successfully.`
        : saveChangesResult.Message || "Receipt Voucher saved successfully."
    );

    dispatch(clearSaveChangesResult());
    onBack?.();
  }, [saveChangesResult, dispatch, onBack]);

  // ── Currency field opened → lazy-fetch currency list ──────────────────────
  const handleOpenCurrency = () => {
    dispatch(fetchCurrencyStartWith());
  };

  // ── Currency selection → fetch & prefill Exchange Rate ────────────────────
  const handleSelectCurrency = (currency: CurrencyStartWith) => {
    setSelectedCurrency(currency);
    dispatch(fetchCurrencyExRate({ currencyId: currency.CurrencyID }));
  };

  // ── Debit Head selection → fetch & prefill Balance ────────────────────────
  const handleSelectDebitHead = (head: AccountHeadHeader) => {
    setDebitHead(head);
    dispatch(fetchAccountBalance(head.HeadID));
  };

  // ── Document selection → refresh & prefill Voucher No. (Prefix-StartingNo) ──
  const handleSelectDocument = (doc: DocumentStartWith) => {
    dispatch(setSelectedActiveDocument(doc));
    dispatch(fetchDocumentStartWithActive({ documentType: "Receipt", startWith: doc.DocumentName }))
      .unwrap()
      .then((docs: DocumentStartWith[]) => {
        const refreshed = docs.find((d) => d.DocumentID === doc.DocumentID) ?? docs[0];
        if (refreshed) dispatch(setSelectedActiveDocument(refreshed));
      })
      .catch(() => {
        // surfaced via activeDocumentError in slice state
      });
  };

  // ── Credit Head field opened → lazy-fetch credit head list ────────────────
  const handleOpenCreditHead = () => {
    dispatch(fetchAccountHeadsDetailStartWith({ voucherTypeId: 2 }));
  };

  // ── Credit Head selection (per row) ────────────────────────────────────────
  const handleSelectCreditHead = (id: number, head: AccountHeadHeader) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, creditHead: head } : r)));
  };

  // ── Domestic Bank Charge: Current Account ──────────────────────────────────
  const handleSelectBankCurrentAccount = (head: AccountHeadHeader) => {
    setBankCurrentAccount(head);
  };

  const handleClearBankCurrentAccount = () => {
    setBankCurrentAccount(null);
  };

  const handleRemoveBankRow = (id: number) =>
    setBankRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));

  const handleUpdateBankRow = (id: number, field: keyof BankChargeRow, value: string | boolean) =>
    setBankRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

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

  // Validating wrapper — used when the Amount field itself is the trigger
  // (on blur), where guarding against a missing Currency/Credit selection
  // makes sense.
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
    setBankRows((prev) => prev.map((r) => (r.id === rowId ? calculateBankRow(r) : r)));
  };

  const handleToggleBankRowGst = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) => (r.id === rowId ? calculateBankRow({ ...r, gst: !r.gst }) : r))
    );
  };

  // Adding a new row first finalizes the calculation on the current last row.
  const handleAddBankRow = () =>
    setBankRows((prev) => {
      const updated = prev.map((r, idx) => (idx === prev.length - 1 ? calculateBankRow(r) : r));
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
    const picked = accountHeadsList.find((h: AccountHeadHeader) => String(h.HeadID) === item.key);
    if (!picked) return;
    setBankRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, credit: picked.HeadName, creditId: picked.HeadID } : r))
    );
  };

  const handleBankCreditClear = (rowId: number) => {
    setBankRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, credit: "", creditId: null } : r)));
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
    const picked = currencyStartWithList.find((c: CurrencyStartWith) => String(c.CurrencyID) === item.key);
    if (!picked) return;

    setBankRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, currency: picked.Currency, currencyId: picked.CurrencyID, exRate: "", exRateLoading: true }
          : r
      )
    );

    dispatch(fetchCurrencyExRate({ currencyId: picked.CurrencyID }))
      .unwrap()
      .then((data: { ExchRate: number }) => {
        setBankRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? computeBankRowAmounts({ ...r, exRate: String(data.ExchRate), exRateLoading: false })
              : r
          )
        );
      })
      .catch((err: string) => {
        setBankRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, exRateLoading: false } : r)));
        toast.error(err || "Failed to fetch exchange rate.");
      });
  };

  const handleBankCurrencyClear = (rowId: number) => {
    setBankRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, currency: "", currencyId: null, exRate: "0", exRateLoading: false } : r
      )
    );
  };

  // ── Bank Details popup (per Bank Charge row) ──────────────────────────────
  // Gated: only opens once at least one Receipt Details row has both a
  // Credit Head and a non-zero Amount filled in — otherwise we block the
  // popup and nudge the user with a toast instead.
  const handleOpenBankDetailsModal = (rowId: number) => {
    const hasCreditHeadAndAmount = rows.some(
      (r) => r.creditHead !== null && Number(r.amount) > 0
    );

    if (!hasCreditHeadAndAmount) {
      toast.error("Please select a Credit Head and enter an Amount in Receipt Details before adding bank details.", {
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
    activeBankRowId != null ? bankRows.find((r) => r.id === activeBankRowId) ?? null : null;

  const handleAddRow = () => {
    setRows((prev) => [...prev, makeRow((prev[prev.length - 1]?.id ?? 0) + 1)]);
  };

  const handleRemoveRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleUpdateRow = (id: number, field: keyof CreditLineItem, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const totalAmount = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const netAmount = totalAmount;

  // ── Build a Receipt Details row → LstPaymentReceiptT / LstVoucherDetails line ──
  const buildDetailLine = (row: CreditLineItem): SaveChangesDetailLine => ({
    HeadName: row.creditHead?.HeadName ?? "",
    HeadID: row.creditHead?.HeadID ?? 0,
    Balance: "",
    Amount: parseFloat(row.amount) || 0,
    SGSTAmt: 0,
    CGSTAmt: 0,
    IGSTAmt: 0,
    UTGSTAmt: 0,
    CESSAmt: 0,
    VATAmt: 0,
    NetAmt: (parseFloat(row.amount) || 0).toFixed(2),
    TaxRate: "0.00",
    RefDate: null,
  });

  // ── Build a Bank Charge row → LstVoucherDetails line ────────────────────────
  const buildBankChargeDetailLine = (row: BankChargeRow): SaveChangesBankChargeDetailLine => ({
    AccHeadName: row.credit,
    Currency: row.currency,
    Amount: parseFloat(row.amount) || 0,
    ExRate: parseFloat(row.exRate) || 0,
    BaseAmount: parseFloat(row.baseAmt) || 0,
    TaxEnabled: row.gst,
    SGSTAmount: parseFloat(row.sgst) || 0,
    CGSTAmount: parseFloat(row.cgst) || 0,
    NetAmount: parseFloat(row.netAmt) || 0,
  });

  // ── Build a valid, filled-in Bank Charge row → lstFundCredit line ──────────
  const buildFundCreditLine = (row: BankChargeRow): SaveChangesFundCreditLine => ({
    Charge: 0,
    AccHeadName: row.credit,
    AccHeadID: row.creditId ?? 0,
    CurrencyID: row.currencyId ?? 0,
    Currency: row.currency,
    Amount: parseFloat(row.amount) || 0,
    ExRate: parseFloat(row.exRate) || 0,
    BaseAmount: row.baseAmt,
    TaxEnabled: row.gst,
    SGSTAmount: parseFloat(row.sgst) || 0,
    CGSTAmount: parseFloat(row.cgst) || 0,
    TotalTaxAmount: (parseFloat(row.sgst) || 0) + (parseFloat(row.cgst) || 0),
    NetAmount: parseFloat(row.netAmt) || 0,
  });

  const handleSubmit = () => {
    // ── Validation ───────────────────────────────────────────────────────────
    if (!debitHead) {
      toast.error("Please select a Debit Head.");
      return;
    }
    if (!selectedActiveDocument) {
      toast.error("Please select a Document.");
      return;
    }
    const validRows = rows.filter((r) => r.creditHead !== null && Number(r.amount) > 0);
    if (validRows.length === 0) {
      toast.error("Please add at least one Receipt Detail row with a Credit Head and Amount.");
      return;
    }

    // Primary bank-charge row — the one the Bank Details popup writes into.
    const primaryBankRow = bankRows[0];
    const paymentTypeMeta = primaryBankRow?.bankPaymentType
      ? BANK_PAYMENT_TYPE_ID_MAP[
      BANK_PAYMENT_TYPES.find((t) => t.label === primaryBankRow.bankPaymentType)?.key ?? ""
      ]
      : undefined;

    const currency = selectedCurrency?.Currency ?? companyCurrency?.Currency ?? "";
    const currencyId = selectedCurrency?.CurrencyID ?? companyCurrency?.CurrencyID ?? 0;
    const exRate = Number(exchangeRate) || 1;

    const bankChequeDateStr = toDDMMYYYY(primaryBankRow?.chequeDate);

    const payload: SaveChangesPayload = {
      VoucherDateStr: toDDMMYYYY(voucherDate),
      ChequeDateStr: bankChequeDateStr,
      Advance: advance,
      BankDetails: {
        BankID: primaryBankRow?.bankId ?? 0,
        BankName: primaryBankRow?.bankName ?? "",
        BankReceiptTypeID: paymentTypeMeta?.Id ?? 0,
        Branch: primaryBankRow?.branch ?? "",
        ChequeDateStr: bankChequeDateStr,
        ChequeNo: primaryBankRow?.chequeNo ?? "",
        NeftRefNo: primaryBankRow?.neftNo ?? "",
      },
      BankID: primaryBankRow?.bankId ?? 0,
      BankName: primaryBankRow?.bankName ?? "",
      BankPaymentType: {
        Id: paymentTypeMeta?.Id ?? 0,
        Title: paymentTypeMeta?.Title ?? "",
      },
      BankReceiptTypeID: paymentTypeMeta?.Id ?? 0,
      BankRefNo: bankRefNo,
      BaseCurrencyAmt: round2(totalAmount * exRate),
      Branch: primaryBankRow?.branch ?? "",
      ChequeDate: toISODateTime(primaryBankRow?.chequeDate),
      ChequeNo: primaryBankRow?.chequeNo ?? "",
      Currency: currency,
      CurrencyID: currencyId,
      Date: new Date().toISOString(),
      DocumentID: selectedActiveDocument.DocumentID,
      DocumentName: selectedActiveDocument.DocumentName,
      DomesticHeadID: validRows[0]?.creditHead?.HeadID ?? 0,
      DomesticHeadName: validRows[0]?.creditHead?.HeadName ?? "",
      ExchRate: exRate,
      FundCreditTo: bankCurrentAccount?.HeadID ?? 0,
      HeadID: debitHead.HeadID,
      HeaderGroupID: debitHead.GroupID ?? 0,
      HeaderHeadID: debitHead.HeadID,
      HeaderHeadName: debitHead.HeadName,
      IsCess: false,
      IsGST: selectedActiveDocument.IsGST ?? false,
      IsReceiptOrPayment: 1,
      IsVAT: selectedActiveDocument.IsVAT ?? false,
      LstPaymentReceiptAdvanceT: [],
      LstPaymentReceiptT: validRows.map(buildDetailLine),
      LstVoucherDetails: [...validRows.map(buildDetailLine), ...bankRows.map(buildBankChargeDetailLine)],
      NeftRefNo: primaryBankRow?.neftNo ?? "",
      NextTransNo: 0,
      PayOrRecID: 0,
      Percentage: "",
      ReceiptTypeID: 2,
      Remarks: remarks,
      RoundOff: roundOff,
      Settled: settled,
      TaxAmountHead: "Tax Amt",
      TaxMasterName: selectedActiveDocument.IsGST ? "GST" : "VAT",
      TaxPercHead: "Tax %",
      VoucherAmount: totalAmount,
      VoucherAmountPopUp: totalAmount.toFixed(2),
      lstFundCredit: bankRows
        .filter((r) => r.creditId !== null && r.currencyId !== null && (parseFloat(r.amount) || 0) > 0)
        .map(buildFundCreditLine),
      startingnowithoutprefix: selectedActiveDocument.StartingNo ?? 0,
      totalAmt: 0,
      voucherType: { Id: 2, Name: "Receipt" },
      voucherprefix: selectedActiveDocument.Prefix ?? "",
      vouchersufix: selectedActiveDocument.Suffix ?? null,
    };

    dispatch(saveChanges(payload));
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
            <Wallet size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Receipt Voucher
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Accounts · Incoming Receipts
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Receipt size={13} />
          Receipt Details
        </button>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">
        {/* ── Voucher Details Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
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

          {/* Row 1 : Voucher Type | Debit Head | Balance | Document | Voucher No. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <FieldLabel icon={ReceiptText} label="Voucher Type" />
              <InputField icon={<ReceiptText size={14} />} placeholder="" value="Receipt" readOnly />
            </div>
            <div>
              <FieldLabel icon={Landmark} label="Debit Head" />
              <AccountHeadCombobox
                value={debitHead}
                list={accountHeadsList}
                loading={accountHeadsLoading}
                placeholder="Select Account"
                icon={<Landmark size={14} />}
                onSelect={handleSelectDebitHead}
              />
            </div>
            <div>
              <FieldLabel icon={Scale} label="Balance" />
              <InputField
                icon={<Scale size={14} />}
                placeholder={balanceLoading ? "Fetching..." : "Balance"}
                value={
                  debitHead && !balanceLoading
                    ? Number(balance ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    : ""
                }
                readOnly
              />
            </div>
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <DocumentCombobox
                value={selectedActiveDocument}
                list={activeDocumentList}
                loading={activeDocumentLoading}
                placeholder="Select Document"
                icon={<FileText size={14} />}
                onSelect={handleSelectDocument}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Voucher No." />
              <InputField
                icon={<Hash size={14} />}
                placeholder="Voucher No."
                value={
                  selectedActiveDocument
                    ? `${selectedActiveDocument.Prefix}-${selectedActiveDocument.StartingNo}`
                    : ""
                }
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
              <CurrencyCombobox
                value={selectedCurrency?.Currency ?? companyCurrency?.Currency ?? ""}
                list={currencyStartWithList}
                loading={currencyStartWithLoading}
                placeholder="Select Currency"
                icon={<Coins size={14} />}
                onOpen={handleOpenCurrency}
                onSelect={handleSelectCurrency}
              />
            </div>
            <div>
              <FieldLabel
                icon={Scale}
                label={`Exchange Rate [${selectedCurrency?.Currency ?? companyCurrency?.Currency ?? "Rupees"}]`}
              />
              <InputField
                icon={<Scale size={14} />}
                placeholder="1"
                value={exchangeRate}
                onChange={setExchangeRate}
              />
            </div>
            <div>
              <FieldLabel icon={Tag} label="Invoice Tax Type" />
              <StaticCombobox value="" placeholder="Invoice Tax Type" icon={<Tag size={14} />} />
            </div>
            <div className="flex items-center gap-5">
              <CheckboxField label="Settled" checked={settled} onChange={setSettled} />
              <CheckboxField label="Advance" checked={advance} onChange={setAdvance} />
            </div>
          </div>

          {/* Row 3 : Remarks | Bank Ref No | RoundOff */}
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
              <FieldLabel icon={BadgeIndianRupee} label="Bank Ref No" />
              <InputField
                icon={<BadgeIndianRupee size={14} />}
                placeholder="Bank Ref No"
                value={bankRefNo}
                onChange={setBankRefNo}
              />
            </div>
            <div className="flex items-center gap-5">
              <CheckboxField label="RoundOff" checked={roundOff} onChange={setRoundOff} />
            </div>
          </div>
        </div>

        {/* ── Credit Head Table ────────────────────────────────────────────────── */}
        <CreditHeadTable
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          creditHeadList={creditHeadList}
          creditHeadLoading={creditHeadLoading}
          onOpenCreditHead={handleOpenCreditHead}
          onSelectCreditHead={handleSelectCreditHead}
        />

        {/* ── Domestic Bank Charge Section ─────────────────────────────────────── */}
        {debitHead && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: BRAND }} />
            </div>
            <div className="flex items-center gap-2.5 -mt-3 mb-1">
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
                items={accountHeadsList.map((h: AccountHeadHeader) => ({
                  key: String(h.HeadID),
                  label: h.HeadName,
                }))}
                loading={accountHeadsLoading}
                searchPlaceholder="Search account..."
                emptyText="No accounts found."
                onSelect={(item) => {
                  const selected = accountHeadsList.find(
                    (h: AccountHeadHeader) => String(h.HeadID) === item.key
                  );
                  if (selected) handleSelectBankCurrentAccount(selected);
                }}
                onClear={handleClearBankCurrentAccount}
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

            {/* Bank Details: visible only when a Debit Head is selected */}
            <div className="bg-white rounded-2xl shadow-sm border p-5" style={{ borderColor: BRAND_MID }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: BRAND_LIGHT }}
                  >
                    <Landmark size={14} strokeWidth={2.2} style={{ color: BRAND }} />
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
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

            <BankDetailsModal
              open={bankDetailsModalOpen}
              onClose={handleCloseBankDetailsModal}
              voucherNo={
                selectedActiveDocument
                  ? `${selectedActiveDocument.Prefix}-${selectedActiveDocument.StartingNo}`
                  : ""
              }
              amount={totalAmount}
              row={activeBankRow}
              bankOptions={bankList}
              bankLoading={bankListLoading}
              onBankOpen={handleBankDetailsBankOpen}
              onSave={handleSaveBankDetails}
            />
          </>
        )}

        {/* ── Footer Card : Totals ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="flex flex-col items-end gap-3 max-w-sm ml-auto">
            <div className="flex items-center justify-between w-full">
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

            <div className="flex items-center justify-between w-full">
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

export default ReceiptVoucher;
