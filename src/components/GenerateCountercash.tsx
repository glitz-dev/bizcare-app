"use client";

import { useMemo, useState } from "react";
import type { Column } from "react-data-grid";
import {
  Wallet,
  LockOpen,
  Lock,
  X,
  Keyboard,
  Clock,
  Cpu,
  UserRound,
  CalendarDays,
  Receipt,
  Banknote,
  Undo2,
  RefreshCcw,
  PiggyBank,
  CreditCard,
  ArrowLeftRight,
  Calculator,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "../common/PageHeader";
import { DataTable } from "../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// The Shift / Machine Code / User fields below use a lightweight inline
// search-select (SearchSelectField) as a stand-in for the project's real
// SearchableCombobox (Radix Popover + Command) since that shared component
// wasn't provided in this pass. Swap it in once available — the prop shape
// (value, options, onChange) is compatible.

interface SearchSelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
}

function SearchSelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  icon: Icon,
}: SearchSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  return (
    <div className="grid gap-1.5 relative">
      <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        {Icon ? <Icon size={13} className="text-slate-400" /> : null}
        {label}
      </Label>
      <div className="relative">
        <input
          className="w-full h-9 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 pr-8 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004687]/30"
          placeholder={placeholder}
          value={value || query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {value ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
              setQuery("");
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => {
                onChange(opt);
                setQuery("");
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  ...inputProps
}: { label: string; icon?: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        {Icon ? <Icon size={13} className="text-slate-400" /> : null}
        {label}
      </Label>
      <Input className="h-9 text-sm" {...inputProps} />
    </div>
  );
}

// ─── Coinage list ─────────────────────────────────────────────────────────────
const COIN_DENOMINATIONS = [
  { label: ".50", value: 0.5 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "500", value: 500 },
  { label: "2000", value: 2000 },
];

interface CoinRow {
  coin: string;
  value: number;
  quantity: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CounterMode = "opening" | "closing";

interface GenerateCounterCashProps {
  onViewDetails?: () => void;
  shiftOptions?: string[];
  machineOptions?: string[];
  userOptions?: string[];
}

export default function GenerateCounterCash({
  onViewDetails,
  shiftOptions = ["Shift 1", "General Shift"],
  machineOptions = ["G1", "M02", "M1"],
  userOptions = ["Admin"],
}: GenerateCounterCashProps) {
  const [mode, setMode] = useState<CounterMode>("opening");

  const [shift, setShift] = useState("");
  const [machineCode, setMachineCode] = useState("");
  const [user, setUser] = useState("");
  const [salesDate, setSalesDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const [openingCash, setOpeningCash] = useState("");

  // Closing-only fields
  const [salesAmount, setSalesAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashRefund, setCashRefund] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [cardRefund, setCardRefund] = useState("");
  const [closingCardAmount, setClosingCardAmount] = useState("");
  const [cashDifference, setCashDifference] = useState("");
  const [cardDifference, setCardDifference] = useState("");
  const [description, setDescription] = useState("");

  const totalDifference = useMemo(() => {
    const cash = parseFloat(cashDifference) || 0;
    const card = parseFloat(cardDifference) || 0;
    return (cash + card).toFixed(2);
  }, [cashDifference, cardDifference]);

  const [coinage, setCoinage] = useState<CoinRow[]>(
    COIN_DENOMINATIONS.map((d) => ({ coin: d.label, value: d.value, quantity: 0 }))
  );

  const updateQuantity = (coin: string, qty: number) => {
    setCoinage((prev) =>
      prev.map((c) => (c.coin === coin ? { ...c, quantity: qty } : c))
    );
  };

  const coinageRows = useMemo(
    () =>
      coinage.map((c) => ({
        id: c.coin,
        coin: c.coin,
        quantity: c.quantity,
        amount: c.quantity * c.value,
      })),
    [coinage]
  );

  const totalCoinAmount = useMemo(
    () => coinageRows.reduce((sum, r) => sum + r.amount, 0),
    [coinageRows]
  );

  const coinageColumns: Column<any>[] = useMemo(
    () => [
      {
        key: "coin",
        name: "Coin",
        resizable: true,
        renderCell: ({ row }: { row: any }) => (
          <span className="font-medium text-slate-700">{row.coin}</span>
        ),
      },
      {
        key: "quantity",
        name: "Quantity",
        resizable: true,
        renderCell: ({ row }: { row: any }) => (
          <input
            type="number"
            min={0}
            value={row.quantity}
            onChange={(e) => updateQuantity(row.coin, Number(e.target.value) || 0)}
            className="w-24 h-7 text-sm border border-slate-200 rounded px-2 focus:outline-none focus:ring-1 focus:ring-[#004687]/30"
          />
        ),
      },
      {
        key: "amount",
        name: "Amount",
        resizable: true,
        renderCell: ({ row }: { row: any }) => (
          <span className="text-slate-600">{row.amount.toFixed(2)}</span>
        ),
      },
    ],
    []
  );

  const clearForm = () => {
    setShift("");
    setMachineCode("");
    setUser("");
    setOpeningCash("");
    setSalesAmount("");
    setCashAmount("");
    setCashRefund("");
    setClosingCash("");
    setCardAmount("");
    setCardRefund("");
    setClosingCardAmount("");
    setCashDifference("");
    setCardDifference("");
    setDescription("");
    setCoinage(COIN_DENOMINATIONS.map((d) => ({ coin: d.label, value: d.value, quantity: 0 })));
  };

  const handleSubmit = () => {
    // TODO: dispatch the actual Set-Counter-For-Opening / Set-Counter-For-Closing
    // thunk here once the API contract + slice conventions are confirmed.
    const payload = {
      mode,
      shift,
      machineCode,
      user,
      salesDate,
      openingCash,
      ...(mode === "closing" && {
        salesAmount,
        cashAmount,
        cashRefund,
        closingCash,
        cardAmount,
        cardRefund,
        closingCardAmount,
        cashDifference,
        cardDifference,
        totalDifference,
        description,
      }),
      coinage: coinageRows,
    };
    console.log("Submit counter cash", payload);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden border border-slate-100 shadow-sm">
        <PageHeader
          title="Counter Cash"
          subtitle="Cash Management"
          icon={<Wallet size={16} className="text-white" />}
          createButtonLabel="Counter Cash Details"
          onCreateClick={onViewDetails}
        />
      </div>

      {/* Mode toggle */}
      <div className="flex justify-end gap-2 px-5">
        <Button
          type="button"
          onClick={() => setMode("opening")}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer text-white"
          style={{
            backgroundColor: mode === "opening" ? BRAND : "#93b6d6",
          }}
        >
          <LockOpen size={13} />
          Set Counter for Opening
        </Button>
        <Button
          type="button"
          onClick={() => setMode("closing")}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer text-white"
          style={{
            backgroundColor: mode === "closing" ? BRAND : "#93b6d6",
          }}
        >
          <Lock size={13} />
          Set Counter for Closing
        </Button>
      </div>

      {/* Form card */}
      <div className="px-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchSelectField
            label="Shift"
            placeholder="Select Shift"
            value={shift}
            options={shiftOptions}
            onChange={setShift}
            icon={Clock}
          />
          <SearchSelectField
            label="Machine Code"
            placeholder="Select Machine Code"
            value={machineCode}
            options={machineOptions}
            onChange={setMachineCode}
            icon={Cpu}
          />
          <SearchSelectField
            label="User"
            placeholder="Select User"
            value={user}
            options={userOptions}
            onChange={setUser}
            icon={UserRound}
          />
          <FormField
            label="Opening Cash"
            placeholder="Enter Opening Cash"
            type="number"
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
            icon={Wallet}
          />

          <FormField
            label="Sales Date"
            type="date"
            value={salesDate}
            onChange={(e) => setSalesDate(e.target.value)}
            icon={CalendarDays}
          />

          {mode === "closing" && (
            <>
              <FormField
                label="Sales Amount"
                placeholder="Enter Sales Amount"
                type="number"
                value={salesAmount}
                onChange={(e) => setSalesAmount(e.target.value)}
                icon={Receipt}
              />
              <FormField
                label="Cash Amount"
                placeholder="Enter Cash Amount"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                icon={Banknote}
              />
              <FormField
                label="Cash Refund"
                placeholder="Enter Cash Refund"
                type="number"
                value={cashRefund}
                onChange={(e) => setCashRefund(e.target.value)}
                icon={Undo2}
              />
              <FormField
                label="Closing Cash"
                placeholder="Enter Closing Cash"
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                icon={PiggyBank}
              />

              <FormField
                label="Card Amount"
                placeholder="Enter Card Amount"
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                icon={CreditCard}
              />
              <FormField
                label="Card Refund"
                placeholder="Enter Card Refund"
                type="number"
                value={cardRefund}
                onChange={(e) => setCardRefund(e.target.value)}
                icon={RefreshCcw}
              />
              <FormField
                label="Closing Card Amount"
                placeholder="Enter Closing Card Amount"
                type="number"
                value={closingCardAmount}
                onChange={(e) => setClosingCardAmount(e.target.value)}
                icon={CreditCard}
              />
              <FormField
                label="Cash Difference"
                placeholder="Enter Cash Difference"
                type="number"
                value={cashDifference}
                onChange={(e) => setCashDifference(e.target.value)}
                icon={ArrowLeftRight}
              />

              <FormField
                label="Card Difference"
                placeholder="Enter Card Difference"
                type="number"
                value={cardDifference}
                onChange={(e) => setCardDifference(e.target.value)}
                icon={ArrowLeftRight}
              />
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calculator size={13} className="text-slate-400" />
                  Total Difference
                </Label>
                <Input
                  className="h-9 text-sm bg-slate-50"
                  readOnly
                  value={totalDifference}
                />
              </div>
              <FormField
                label="Description"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                icon={FileText}
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button
            type="button"
            onClick={handleSubmit}
            className="h-8 text-xs font-semibold px-4 cursor-pointer text-white"
            style={{ backgroundColor: BRAND }}
          >
            Submit
          </Button>
          <Button
            type="button"
            onClick={clearForm}
            className="h-8 text-xs font-semibold px-4 cursor-pointer text-white bg-amber-500 hover:bg-amber-600"
          >
            Clear
          </Button>
        </div>
      </div>
      {/* Coinage list */}
      <div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-t-xl border border-b-0 border-slate-100"
          style={{ backgroundColor: BRAND_LIGHT }}
        >
          <Keyboard size={14} style={{ color: BRAND }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND }}>
            Coinage List
          </span>
        </div>

        <DataTable
          columns={coinageColumns}
          rows={coinageRows}
          rowKey="id"
          rowHeight={34}
          headerRowHeight={36}
        />
        
      </div>
      </div>
      <div className="flex justify-end px-4 py-2 bg-white border border-t-0 border-slate-100 ">
          <span className="text-xs text-slate-500">
            Total Coin Amount:{" "}
            <span className="font-bold text-slate-700 px-2">
              {totalCoinAmount.toFixed(2)}
            </span>
          </span>
        </div>
    </div>
  );
}
