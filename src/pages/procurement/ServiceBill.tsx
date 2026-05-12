"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { type Column } from "react-data-grid";
import {
  DataTable,
  StatusBadge,
  ActionsCell,
  FilterHeader,
} from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, RotateCcw, FileText, CalendarDays } from "lucide-react";
import ServiceBillDetail from "../../components/ServiceBillDetails";
import {
  fetchPurchaseList,
  type PurchaseListItem,
} from "../../store/features/inventory/procurement/serviceBillSlice";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ServiceBill() {
  const dispatch = useDispatch<AppDispatch>();
  const { purchaseList, purchaseListLoading, purchaseListError } = useSelector(
    (state: RootState) => state.serviceBill
  );

  // ─── Date helpers ────────────────────────────────────────────────────────────
  const toApiDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const fiveYearsAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 5)
  )
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(fiveYearsAgo);
  const [toDate, setToDate] = useState(today);
  const [showDetail, setShowDetail] = useState(false);

  // ─── Fetch on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(
      fetchPurchaseList({
        fromDate: toApiDate(fiveYearsAgo),
        toDate: toApiDate(today),
      })
    );
  }, [dispatch]);

  // ─── Search / Reset ───────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    dispatch(
      fetchPurchaseList({
        fromDate: toApiDate(fromDate),
        toDate: toApiDate(toDate),
      })
    );
  }, [dispatch, fromDate, toDate]);

  const handleReset = useCallback(() => {
    setFromDate(fiveYearsAgo);
    setToDate(today);
    dispatch(
      fetchPurchaseList({
        fromDate: toApiDate(fiveYearsAgo),
        toDate: toApiDate(today),
      })
    );
  }, [dispatch]);

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns: Column<PurchaseListItem>[] = useMemo(
    () => [
      {
        key: "InvoiceDate",
        name: "Date",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.InvoiceDate}</span>
        ),
      },
      {
        key: "Supplier",
        name: "Supplier",
        width: 180,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-700 font-medium">{row.Supplier}</span>
        ),
      },
      {
        key: "PaymentType",
        name: "Payment Type",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-600">{row.PaymentType}</span>
        ),
      },
      {
        key: "SupInvoiceDate",
        name: "Sup Invoice Date",
        width: 140,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.SupInvoiceDate ?? "—"}</span>
        ),
      },
      {
        key: "InvoiceNo",
        name: "Doc No",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-semibold text-[#004687]">{row.InvoiceNo}</span>
        ),
      },
      {
        key: "SupInvoiceNo",
        name: "Sup Invoice No",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] text-slate-600">{row.SupInvoiceNo || "—"}</span>
        ),
      },
      {
        key: "TotalAmt",
        name: "Amount",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-700">
            ₹{row.TotalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "Approve",
        name: "Status",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.Approve} />,
      },
      {
        key: "ApprovedBy",
        name: "Approved By",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.ApprovedBy ?? "—"}</span>
        ),
      },
      {
        key: "CreatedDate",
        name: "Created Date",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.CreatedDate}</span>
        ),
      },
      {
        key: "Username",
        name: "Created By",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.Username}</span>
        ),
      },
      {
        key: "ApprovedDate",
        name: "Approved Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.ApprovedDate ?? "—"}</span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</div>
            <div className="h-6" />
          </div>
        ),
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ),
      },
    ],
    []
  );

  // ─── Show Detail Page ────────────────────────────────────────────────────────
  if (showDetail) {
    return <ServiceBillDetail onBack={() => setShowDetail(false)} />;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page Header ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-0 shadow-md"
        style={{ background: "#004687", minHeight: 52 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-white/15 rounded-lg p-1.5">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide text-white leading-tight">
              Service Bill
            </h1>
            <p className="text-[10px] text-blue-200 font-medium">
              Manage &amp; track all service bills
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowDetail(true)}
          className="flex items-center gap-1.5 bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs px-4 py-2 h-8 rounded-lg shadow transition-all cursor-pointer"
        >
          <Plus size={14} />
          Create New Service Bill
        </Button>
      </header>

      <main className="px-6 py-5 space-y-5 max-w-[1400px] mx-auto">
        {/* ── Page Filters ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={11} className="text-[#004687]" />
                From Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 text-sm pl-3 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#004687]/30 focus-visible:border-[#004687]/50"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={11} className="text-[#004687]" />
                To Date
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 text-sm pl-3 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#004687]/30 focus-visible:border-[#004687]/50"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-0.5">
              <Button
                onClick={handleSearch}
                className="h-9 px-5 text-sm font-semibold flex items-center gap-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                style={{ background: "#004687" }}
              >
                <Search size={14} />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-9 px-4 text-sm font-medium flex items-center gap-1.5 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
              >
                <RotateCcw size={13} />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {purchaseListError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {purchaseListError}
          </div>
        )}

        {/* ── Data Table ── */}
        <DataTable
          columns={columns}
          rows={purchaseList}
          rowKey="PurchaseID"
          loading={purchaseListLoading}
          rowHeight={38}
          headerRowHeight={60}
        />
      </main>
    </div>
  );
}