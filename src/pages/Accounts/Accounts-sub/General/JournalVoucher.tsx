"use client";

import { useState, useMemo, useEffect } from "react";
import { BookOpen, CalendarDays, Search, X, CheckCircle2 } from "lucide-react";
import { type Column } from "react-data-grid";

import { fetchVoucherDetails, type VoucherDetail } from "../../../../store/features/Accounts/accounts/journalVoucherSlice";

import { PageHeader } from "../../../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell, StatusBadge } from "../../../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JournalEntry from "../../../../components/Journalentry";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JournalVoucherRow {
  id: number;
  voucherNo: string;
  date: string;
  amount: number;
  narration: string;
  status: string;
  approvedBy: string;
  createdOn: string;
  createdBy: string;
  approvedDate: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Pending", label: "Not Approved" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Maps the API's VoucherDetail shape onto the row shape the table renders.
const mapVoucherDetailToRow = (v: VoucherDetail): JournalVoucherRow => ({
  id: v.VoucherID,
  voucherNo: v.VoucherNo,
  date: v.VoucherDate,
  amount: v.VoucherAmount,
  narration: v.Remarks ?? "",
  status: v.Approve,
  approvedBy: v.ApprovedBy ?? "",
  createdOn: v.CreatedOn,
  createdBy: v.UserName ?? "",
  approvedDate: v.ApprovedDate ?? "",
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JournalVoucher() {
  const dispatch = useDispatch<any>();

  const today = new Date().toISOString().split("T")[0];
  const fyStart = "2024-04-01";

  const [showCreate, setShowCreate] = useState(false);
  const [fromDate, setFromDate] = useState(fyStart);
  const [toDate, setToDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("all");

  const { voucherDetails, voucherDetailsLoading } = useSelector(
    (state: RootState) => state.journalVoucher
  );

  const loadVoucherDetails = () => {
    dispatch(
      fetchVoucherDetails({
        fromDate,
        toDate,
      })
    );
  };

  // Fetch voucher details on mount using the default date range.
  useEffect(() => {
    loadVoucherDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadVoucherDetails();
  };

  const handleEdit = (row: JournalVoucherRow) => {
    console.log("Edit", row);
  };

  const handleDelete = (row: JournalVoucherRow) => {
    console.log("Delete", row);
  };

  // Map API data to table rows, then apply the status filter client-side.
  const rows: JournalVoucherRow[] = useMemo(() => {
    const mapped = voucherDetails.map(mapVoucherDetailToRow);
    if (!statusFilter || statusFilter === "all") return mapped;
    return mapped.filter((row) => row.status === statusFilter);
  }, [voucherDetails, statusFilter]);

  const columns: Column<JournalVoucherRow>[] = useMemo(
    () => [
      {
        key: "voucherNo",
        name: "Voucher No",
        width: 120,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-semibold text-[#004687]">
            {row.voucherNo}
          </span>
        ),
      },
      {
        key: "date",
        name: "Date",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.date}</span>
        ),
      },
      {
        key: "amount",
        name: "Amount",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700 tabular-nums">
            {row.amount > 0 ? row.amount.toFixed(2) : ""}
          </span>
        ),
      },
      {
        key: "narration",
        name: "Narration",
        minWidth: 160,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.narration}</span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 120,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "approvedBy",
        name: "Approved By",
        width: 120,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.approvedBy}</span>
        ),
      },
      {
        key: "createdOn",
        name: "Created On",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.createdOn}</span>
        ),
      },
      {
        key: "createdBy",
        name: "Created By",
        width: 120,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.createdBy}</span>
        ),
      },
      {
        key: "approvedDate",
        name: "Approved Date",
        width: 120,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => { }}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.approvedDate}</span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 90,
        resizable: false,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </div>
          </div>
        ),
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    []
  );

  if (showCreate) {
    return <JournalEntry onBack={() => setShowCreate(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Journal Entry"
        subtitle="Accounts · Journal"
        icon={<BookOpen size={16} className="text-white" />}
        createButtonLabel="Create Journal Voucher"
        showCreateButton
        onCreateClick={() => setShowCreate(true)}
      />

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">

        {/* ── Filters Card ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex items-end gap-3 flex-wrap">

            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CalendarDays size={10} /> From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-sm border-slate-200 rounded-lg w-44"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CalendarDays size={10} /> To Date
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-sm border-slate-200 rounded-lg w-44"
              />
            </div>

            {/* Search */}
            <div className="pb-0.5">
              <Button
                onClick={handleSearch}
                disabled={voucherDetailsLoading}
                className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none cursor-pointer"
              >
                <Search size={12} />
                {voucherDetailsLoading ? "Searching…" : "Search"}
              </Button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={10} /> Status
              </label>
              <div className="relative">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-44">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusFilter && statusFilter !== "all" && (
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={voucherDetailsLoading}
          loadingLabel="Fetching journal vouchers…"
        />

      </div>
    </div>
  );
}
