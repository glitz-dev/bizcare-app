"use client";

import React, { useState } from "react";
import {
  ReceiptText,
  Layers,
  FileText,
  Hash,
  Calendar,
  Coins,
  Building2,
  CreditCard,
  IndianRupee,
  BookOpen,
  ChevronsUpDown,
  Check,
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

// ─── Static option lists (display only) ────────────────────────────────────────
const documentOptions = [
  { label: "Customer Receipt-INR", value: "1" },
  { label: "Advance Receipt", value: "2" },
  { label: "Other Receipt", value: "3" },
];
const customerOptions = [
  { label: "Glitzit Traders", value: "1" },
  { label: "Kairali Suppliers", value: "2" },
  { label: "Coastal Hardware", value: "3" },
  { label: "Malabar Agencies", value: "4" },
];
const debitAccountOptions = [
  { label: "HDFC Bank - Current A/C", value: "1" },
  { label: "SBI - Current A/C", value: "2" },
  { label: "ICICI Bank - OD A/C", value: "3" },
  { label: "Cash A/C", value: "4" },
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
  defaultValue,
  type = "text",
  readOnly,
  align = "left",
}: {
  icon: React.ReactNode;
  placeholder: string;
  defaultValue?: string;
  type?: string;
  readOnly?: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className="relative">
      <input
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
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
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}
      >
        {icon}
      </span>
    </div>
  );
}

// ─── SearchableCombobox (display only — static option lists, no data wiring) ──
function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
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
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
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

// ─── CreateCustomerReceipt ─────────────────────────────────────────────────────
const CreateCustomerReceipt: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  // Display-only state (no fetches, no save/submit logic)
  const [documentVal, setDocumentVal] = useState("1");
  const [customer, setCustomer] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [throughCurrentAccount, setThroughCurrentAccount] = useState(false);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <ReceiptText size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Customer Receipt-INR
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Accounts · Customer Receipt
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Layers size={13} />
          Customer Receipt Details
        </button>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">
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
              General
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1 : Type | Document | Document No. | Settled Date | Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <FieldLabel icon={ReceiptText} label="Type" />
              <InputField
                icon={<ReceiptText size={14} />}
                placeholder="Type"
                defaultValue="Customer Receipt-INR"
                readOnly
              />
            </div>
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <SearchableCombobox
                value={documentVal}
                onChange={setDocumentVal}
                options={documentOptions}
                placeholder="Select Document"
                searchPlaceholder="Search document…"
                emptyText="No documents found."
                icon={<FileText size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Document No." />
              <InputField icon={<Hash size={14} />} placeholder="Settlement No." readOnly />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Settled Date" />
              <InputField
                icon={<Calendar size={14} />}
                placeholder="Settled Date"
                defaultValue="2026-07-15"
                type="date"
              />
            </div>
            <div>
              <FieldLabel icon={Coins} label="Currency" />
              <InputField icon={<Coins size={14} />} placeholder="Currency" defaultValue="Rupees" />
            </div>
          </div>

          {/* Row 2 : Customer | Debit A/C | Receivable Amount | Settled Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <FieldLabel icon={Building2} label="Customer" />
              <SearchableCombobox
                value={customer}
                onChange={setCustomer}
                options={customerOptions}
                placeholder="Select Party"
                searchPlaceholder="Search customer…"
                emptyText="No customers found."
                icon={<Building2 size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={CreditCard} label="Debit A/C" />
              <SearchableCombobox
                value={debitAccount}
                onChange={setDebitAccount}
                options={debitAccountOptions}
                placeholder="Select Account"
                searchPlaceholder="Search account…"
                emptyText="No accounts found."
                icon={<CreditCard size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={IndianRupee} label="Receivable Amount" />
              <InputField icon={<IndianRupee size={14} />} placeholder="Enter Amount" align="right" />
            </div>
            <div>
              <FieldLabel icon={IndianRupee} label="Settled Amount" />
              <InputField
                icon={<IndianRupee size={14} />}
                placeholder="0.00"
                defaultValue="0.00"
                align="right"
                readOnly
              />
            </div>
          </div>

          {/* Row 3 : Bank Ref No | Through Current Account | Bills */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mt-5">
            <div className="flex items-end gap-5">
              <div className="w-full sm:w-64">
                <FieldLabel icon={Hash} label="Bank Ref No" />
                <InputField icon={<Hash size={14} />} placeholder="Bank Ref No" />
              </div>
              <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
                <span
                  onClick={() => setThroughCurrentAccount((v) => !v)}
                  className="w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors"
                  style={{
                    borderColor: throughCurrentAccount ? BRAND : "#d1dff0",
                    background: throughCurrentAccount ? BRAND : "white",
                  }}
                >
                  {throughCurrentAccount && <Check size={11} color="white" strokeWidth={3} />}
                </span>
                <span className="text-xs font-medium text-gray-500">Through Current Account</span>
              </label>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90 shrink-0"
              style={{ background: BRAND }}
            >
              <BookOpen size={15} />
              Bills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerReceipt;
