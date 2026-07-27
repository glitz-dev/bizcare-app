"use client";

import { useMemo, useState } from "react";
import { Landmark, Search, X } from "lucide-react";

import { PageHeader } from "../../../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell } from "../../../../common/DataTable";
import type { Column } from "react-data-grid";

import BankReconciliationDetails from "../../../../components/Bankreconciliationdetails";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BankReconciliationRow {
  ReconID: number;
  ReconNo: string;
  ReconcileDate: string;
  Party: string;
  Amount: number;
  CreatedOn: string;
}

// Static placeholder data, purely for UI display
const dummyBanks = [
  { BankID: 1, BankName: "HDFC Bank" },
  { BankID: 2, BankName: "ICICI Bank" },
  { BankID: 3, BankName: "SBI" },
];

const dummyRows: BankReconciliationRow[] = [];

// ─── Bank Filter Bar (Bank / From Date / To Date / Search) ──────────────────
interface BankFiltersProps {
  selectedBank: string;
  setSelectedBank: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

function BankFilters({
  selectedBank,
  setSelectedBank,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: BankFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div
        className="grid gap-3 items-end"
        style={{ gridTemplateColumns: "1.5fr 1fr 1fr auto" }}
      >
        {/* Bank */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Bank
          </label>
          <div className="relative">
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                {dummyBanks.map((bank) => (
                  <SelectItem key={bank.BankID} value={String(bank.BankID)}>
                    {bank.BankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBank && (
              <button
                onClick={() => setSelectedBank("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            From Date
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-8 text-sm border-slate-200 rounded-lg w-full"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            To Date
          </label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-8 text-sm border-slate-200 rounded-lg w-full"
          />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap cursor-pointer">
            <Search size={12} /> Search
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDisplayDate = (value: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(value ?? 0);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BankReconciliationPage() {
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedBank, setSelectedBank] = useState("");
  const [fromDate, setFromDate] = useState("2024-04-01");
  const [toDate, setToDate] = useState("2026-07-14");

  const columns: Column<BankReconciliationRow>[] = useMemo(
    () => [
      {
        key: "ReconNo",
        name: "Recon.No.",
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "ReconcileDate",
        name: "Reconcile Date",
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.ReconcileDate),
      },
      {
        key: "Party",
        name: "Party",
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "Amount",
        name: "Amount",
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => (
          <div className="text-right w-full pr-2">{formatAmount(row.Amount)}</div>
        ),
      },
      {
        key: "CreatedOn",
        name: "Created On",
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.CreatedOn),
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => <ActionsCell row={row} onView={() => {}} />,
      },
    ],
    []
  );

  if (view === "details") {
    return <BankReconciliationDetails onBack={() => setView("list")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Accounting"
        icon={<Landmark size={16} className="text-white" />}
        createButtonLabel="Create Bank Reconciliation"
        onCreateClick={() => setView("details")}
      />

      <div className="p-5 flex flex-col gap-5">
        <BankFilters
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        <DataTable columns={columns} rows={dummyRows} rowKey="ReconID" />
      </div>
    </div>
  );
}