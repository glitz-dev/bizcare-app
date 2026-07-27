"use client";

import { useMemo, useState } from "react";
import { Wallet, Search, X } from "lucide-react";
import type { Column } from "react-data-grid";

import { PageHeader } from "../../../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell, StatusBadge } from "../../../../common/DataTable";

import SupplierPaymentDetails from "../../../../components/Supplierpaymentdetails";

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
interface SupplierPaymentRow {
  PaymentID: number;
  Type: string;
  SettleType: string;
  Date: string;
  Party: string;
  InvoiceNo: string;
  SettleDate: string;
  VoucherNo: string;
  ShortName: string;
  PayableAmount: number;
  PartyBank: string;
  ChequeNo: string;
  ChequeDate: string;
  VoucherDate: string;
  SupplierInvoiceNo: string;
  Status: string;
  ApprovedBy: string;
  CreatedBy: string;
  CreatedOn: string;
  ApprovedOn: string;
  UTRNo: string;
  UTRDate: string;
  UTRType: string;
}

// Static placeholder data, purely for UI display
const dummyRows: SupplierPaymentRow[] = [];

const statusOptions = ["Not Approved", "Approved", "Rejected", "All"];

// ─── Filter Bar (From Date / To Date / Search ... Status) ───────────────────
interface SupplierPaymentFiltersProps {
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  loading: boolean;
  onSearch: () => void;
}

function SupplierPaymentFilters({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  status,
  setStatus,
  loading,
  onSearch,
}: SupplierPaymentFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap">
          {/* From Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              From Date
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-sm border-slate-200 rounded-lg w-[150px]"
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
              className="h-8 text-sm border-slate-200 rounded-lg w-[150px]"
            />
          </div>

          {/* Search */}
          <Button
            onClick={onSearch}
            disabled={loading}
            className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap cursor-pointer"
          >
            <Search size={12} /> {loading ? "Searching…" : "Search"}
          </Button>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 w-[190px]">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Status
          </label>
          <div className="relative">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {status && status !== "All" && (
              <button
                onClick={() => setStatus("All")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
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
export default function SupplierPaymentEntryPage() {
  const [view, setView] = useState<"list" | "details">("list");
  const [fromDate, setFromDate] = useState("2024-04-01");
  const [toDate, setToDate] = useState("2026-07-16");
  const [status, setStatus] = useState("Not Approved");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    // TODO: replace with live thunk call, e.g. dispatch(fetchSupplierPayments({ fromDate, toDate, status }))
    setTimeout(() => setLoading(false), 300);
  };

  const columns: Column<SupplierPaymentRow>[] = useMemo(
    () => [
      {
        key: "Type",
        name: "Type",
        width: 90,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "SettleType",
        name: "Settlement Type",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "Date",
        name: "Date",
        width: 100,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.Date),
      },
      {
        key: "Party",
        name: "Party",
        width: 150,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "InvoiceNo",
        name: "Invoice No.",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "SettleDate",
        name: "Settlement Date",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.SettleDate),
      },
      {
        key: "VoucherNo",
        name: "Voucher No.",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "ShortName",
        name: "Short Name",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "PayableAmount",
        name: "Payable Amount",
        width: 120,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => (
          <div className="text-right w-full pr-2">{formatAmount(row.PayableAmount)}</div>
        ),
      },
      {
        key: "PartyBank",
        name: "Party Bank",
        width: 150,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "ChequeNo",
        name: "Cheque No.",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "ChequeDate",
        name: "Cheque Date",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.ChequeDate),
      },
      {
        key: "VoucherDate",
        name: "Voucher Date",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.VoucherDate),
      },
      {
        key: "SupplierInvoiceNo",
        name: "Supplier Invoice No.",
        width: 140,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "Status",
        name: "Status",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => <StatusBadge label={row.Status} />,
      },
      {
        key: "ApprovedBy",
        name: "Approved By",
        width: 120,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "CreatedBy",
        name: "Created By",
        width: 120,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "CreatedOn",
        name: "Created On",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.CreatedOn),
      },
      {
        key: "ApprovedOn",
        name: "Approved On",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.ApprovedOn),
      },
      {
        key: "UTRNo",
        name: "UTR No.",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "UTRDate",
        name: "UTR Date",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => formatDisplayDate(row.UTRDate),
      },
      {
        key: "UTRType",
        name: "UTR Type",
        width: 100,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderHeaderCell: (props: any) => <FilterHeader {...props} />,
        renderCell: ({ row }) => <ActionsCell row={row} onView={() => {}} onEdit={() => {}} />,
      },
    ],
    []
  );

  if (view === "details") {
    return <SupplierPaymentDetails onBack={() => setView("list")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Supplier Payment Entry"
        subtitle="Accounts"
        icon={<Wallet size={16} className="text-white" />}
        createButtonLabel="Create New Supplier Payment"
        onCreateClick={() => setView("details")}
      />

      <div className="p-5 flex flex-col gap-5">
        <SupplierPaymentFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          status={status}
          setStatus={setStatus}
          loading={loading}
          onSearch={handleSearch}
        />

        <DataTable columns={columns} rows={dummyRows} rowKey="PaymentID" />
      </div>
    </div>
  );
}
