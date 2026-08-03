"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Wallet,
  FileText,
  Hash,
  Calendar,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Scale,
  ChevronsUpDown,
  Check,
  ArrowLeft,
  ReceiptText,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchCompanyCurrency,
  fetchSupplierStartWithForSettlement,
  fetchPaymentTypeStartWith,
  fetchCashBankAccountHeads,
} from "../store/features/Accounts/accounts/SupplierpaymentSlice"; 

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_MID = "#ccdff2";

// ─── Mock lookups (swap for live API data when wiring up) ──────────────────
const DOCUMENT_OPTIONS = ["Purchase Invoice", "Purchase Order", "Debit Note", "Advance Adjustment"];

// ─── FieldLabel ───────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5" style={{ color: BRAND }}>
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
  align = "left",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  align?: "left" | "right";
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
          align === "right" && "text-right",
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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}>
        {icon}
      </span>
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

// ─── Main component ──────────────────────────────────────────────────────────
const SupplierPaymentDetails = ({ onBack }: { onBack?: () => void }) => {
  const dispatch = useDispatch<any>();

  // ─ Currency + Supplier lookups from Redux ─
  const currencies = useSelector((state: any) => state.supplierPayment.currencies);
  const selectedCurrency = useSelector((state: any) => state.supplierPayment.selectedCurrency);
  const supplierStartWithList = useSelector((state: any) => state.supplierPayment.supplierStartWithList);
  const paymentTypeStartWithList = useSelector((state: any) => state.supplierPayment.paymentTypeStartWithList);
  const cashBankAccountHeads = useSelector((state: any) => state.supplierPayment.cashBankAccountHeads);

  const currencyOptions = useMemo(
    () => currencies.map((c: { Currency: string }) => c.Currency),
    [currencies]
  );
  const supplierOptions = useMemo(
    () => supplierStartWithList.map((s: { PartyName: string }) => s.PartyName),
    [supplierStartWithList]
  );
  const paymentTypeOptions = useMemo(
    () => paymentTypeStartWithList.map((p: { PaymentTypeName: string }) => p.PaymentTypeName),
    [paymentTypeStartWithList]
  );
  const accountOptions = useMemo(
    () => cashBankAccountHeads.map((a: { HeadName: string }) => a.HeadName),
    [cashBankAccountHeads]
  );

  useEffect(() => {
    dispatch(fetchCompanyCurrency());
    dispatch(fetchSupplierStartWithForSettlement());
    dispatch(fetchPaymentTypeStartWith());
    dispatch(fetchCashBankAccountHeads());
  }, [dispatch]);

  // General section state
  const [document, setDocument] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [settledDate, setSettledDate] = useState("2026-07-16");
  const [currency, setCurrency] = useState("");

  // Prefill currency once the company currency response arrives
  useEffect(() => {
    if (selectedCurrency?.Currency && !currency) {
      setCurrency(selectedCurrency.Currency);
    }
  }, [selectedCurrency]);

  const [supplier, setSupplier] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");

  const [bankRefNo, setBankRefNo] = useState("");
  const [neftRtgsNo, setNeftRtgsNo] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [payableAmount] = useState("0");

  const [settledAmount, setSettledAmount] = useState("0.00");
  const [ledgerBalance, setLedgerBalance] = useState("");

  const handleBills = () => {
    // TODO: open bills selection dialog / dispatch fetchOutstandingBills(supplier) thunk
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0" style={{ background: BRAND }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Wallet size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">Supplier Payment-INR</h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">Accounts · Supplier Payment</p>
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
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          {/* Section tab */}
          <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: `1.5px solid ${BRAND_MID}` }}>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              General
            </span>
          </div>

          {/* Row 1 : Type | Document | Document No. | Settled Date | Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <FieldLabel icon={ReceiptText} label="Type" />
              <InputField icon={<ReceiptText size={14} />} placeholder="Type" value="Supplier Payment-INR" readOnly />
            </div>
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
              <InputField icon={<Hash size={14} />} placeholder="Settlement No." value={documentNo} onChange={setDocumentNo} readOnly={!document} />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Settled Date" />
              <InputField icon={<Calendar size={14} />} placeholder="Settled Date" value={settledDate} onChange={setSettledDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Banknote} label="Currency" />
              <SimpleSelect
                value={currency}
                placeholder="Select Currency"
                icon={<Banknote size={14} />}
                items={currencyOptions}
                onSelect={setCurrency}
                onClear={() => setCurrency("")}
              />
            </div>
          </div>

          {/* Row 2 : Supplier | Credit A/C | Payment Type | Cheque No. | Cheque Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-5">
            <div>
              <FieldLabel icon={Building2} label="Supplier" />
              <SimpleSelect
                value={supplier}
                placeholder="Select Party"
                icon={<Building2 size={14} />}
                items={supplierOptions}
                onSelect={setSupplier}
                onClear={() => setSupplier("")}
              />
            </div>
            <div>
              <FieldLabel icon={CreditCard} label="Credit A/C" />
              <SimpleSelect
                value={creditAccount}
                placeholder="Select Account"
                icon={<CreditCard size={14} />}
                items={accountOptions}
                onSelect={setCreditAccount}
                onClear={() => setCreditAccount("")}
              />
            </div>
            <div>
              <FieldLabel icon={Wallet} label="Payment Type" />
              <SimpleSelect
                value={paymentType}
                placeholder="Payment Type"
                icon={<Wallet size={14} />}
                items={paymentTypeOptions}
                onSelect={setPaymentType}
                onClear={() => setPaymentType("")}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Cheque No." />
              <InputField icon={<Hash size={14} />} placeholder="Enter Cheque No." value={chequeNo} onChange={setChequeNo} />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Cheque Date" />
              <InputField icon={<Calendar size={14} />} placeholder="Select Cheque Date" value={chequeDate} onChange={setChequeDate} type="date" />
            </div>
          </div>

          {/* Row 3 : Bank Ref No | NEFT/RTGS No | Transaction ID | Payable Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <FieldLabel icon={Landmark} label="Bank Ref No" />
              <InputField icon={<Landmark size={14} />} placeholder="Enter Bank Ref No" value={bankRefNo} onChange={setBankRefNo} />
            </div>
            <div>
              <FieldLabel icon={Hash} label="NEFT/RTGS No" />
              <InputField icon={<Hash size={14} />} placeholder="Enter NEFT/RTGS No" value={neftRtgsNo} onChange={setNeftRtgsNo} />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Transaction ID" />
              <InputField icon={<Hash size={14} />} placeholder="Enter Transaction ID" value={transactionId} onChange={setTransactionId} />
            </div>
            <div>
              <FieldLabel icon={IndianRupee} label="Payable Amount" />
              <InputField icon={<IndianRupee size={14} />} placeholder="0" value={payableAmount} readOnly align="right" />
            </div>
          </div>

          {/* Row 4 : Settled Amount | Ledger Balance ... Bills button */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full lg:max-w-[42%]">
              <div>
                <FieldLabel icon={IndianRupee} label="Settled Amount" />
                <InputField icon={<IndianRupee size={14} />} placeholder="0.00" value={settledAmount} onChange={setSettledAmount} align="right" />
              </div>
              <div>
                <FieldLabel icon={Scale} label="Ledger Balance" />
                <InputField icon={<Scale size={14} />} placeholder="Enter Ledger Balance" value={ledgerBalance} onChange={setLedgerBalance} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleBills}
              className="flex items-center justify-center gap-2 h-[42px] px-6 rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 shrink-0"
              style={{ background: BRAND }}
            >
              <ReceiptText size={14} />
              Bills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPaymentDetails;
