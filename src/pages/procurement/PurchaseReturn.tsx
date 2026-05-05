"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
  Plus,
  Search,
  RotateCcw,
  PackageX,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import PurchaseReturnDetails from "@/components/Purchasereturndetails";
import { fetchPurchaseReturnList } from "../../store/features/inventory/procurement/purchaseReturnSlice";
import type { AppDispatch, RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PurchaseReturnRow {
  id: string;
  purchaseNo: string;
  returnNo: string;
  paymentType: string;
  supplier: string;
  totalAmt: number;
  returnDate: string;
  totalQty: number;
  status: string;
  approvedBy: string;
  createdDate: string;
  createdBy: string;
  approvedDate: string;
}

// ─── Helper: format "YYYY-MM-DD" → "DD-MM-YYYY" for the API ──────────────────
const toApiDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseReturn() {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state ──────────────────────────────────────────────────────────
  const {
    purchaseReturnList,
    purchaseReturnListLoading: loading,
    purchaseReturnListError,
  } = useSelector((state: RootState) => state.purchaseReturn);

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searched, setSearched] = useState(false);

  // ── View toggle ──────────────────────────────────────────────────────────
  const [showDetails, setShowDetails] = useState(false);

  // ── Fetch on mount with today's date range ───────────────────────────────
  useEffect(() => {
    const apiDate = toApiDate(today);
    dispatch(
      fetchPurchaseReturnList({ fromDate: apiDate, toDate: apiDate })
    ).then(() => setSearched(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map API items → table rows ───────────────────────────────────────────
  const rows: PurchaseReturnRow[] = useMemo(
    () =>
      purchaseReturnList.map((item) => ({
        id: String(item.ReturnID),
        purchaseNo: item.InvoiceNo,
        returnNo: item.ReturnNo,
        paymentType: item.PaymentType,
        supplier: item.Supplier,
        totalAmt: item.NetAmount,
        returnDate: item.ReturnDate,
        totalQty: item.TotalQuantity,
        status: item.Approve,
        approvedBy: item.ApprovedBy ?? "—",
        createdDate: item.CreatedDate,
        createdBy: String(item.UserID),
        approvedDate: item.ApprovedDate ?? "—",
      })),
    [purchaseReturnList]
  );

  const handleSearch = () => {
    dispatch(
      fetchPurchaseReturnList({
        fromDate: toApiDate(fromDate),
        toDate: toApiDate(toDate),
      })
    ).then(() => setSearched(true));
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearched(false);
    const apiDate = toApiDate(today);
    dispatch(
      fetchPurchaseReturnList({ fromDate: apiDate, toDate: apiDate })
    ).then(() => setSearched(true));
  };

  // Stats derived from rows
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const approved = rows.filter(
      (r) => r.status === "Approved" || r.status === "Completed"
    ).length;
    const totalAmt = rows.reduce((s, r) => s + r.totalAmt, 0);
    return { total, pending, approved, totalAmt };
  }, [rows]);

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: Column<PurchaseReturnRow>[] = useMemo(
    () => [
      {
        key: "purchaseNo",
        name: "Purchase No",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-semibold text-[#004687]">
            {row.purchaseNo}
          </span>
        ),
      },
      {
        key: "returnNo",
        name: "Return No",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-semibold text-slate-600">
            {row.returnNo}
          </span>
        ),
      },
      {
        key: "paymentType",
        name: "Payment Type",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-600">{row.paymentType}</span>
        ),
      },
      {
        key: "supplier",
        name: "Supplier",
        width: 180,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-700 font-medium">
            {row.supplier}
          </span>
        ),
      },
      {
        key: "totalAmt",
        name: "Total Amt",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-700">
            ₹{row.totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "returnDate",
        name: "Return Date",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.returnDate}</span>
        ),
      },
      {
        key: "totalQty",
        name: "Total Qty",
        width: 90,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-600 font-medium">
            {row.totalQty}
          </span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "approvedBy",
        name: "Approved By",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.approvedBy}</span>
        ),
      },
      {
        key: "createdDate",
        name: "Created Date",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.createdDate}</span>
        ),
      },
      {
        key: "createdBy",
        name: "Created By",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.createdBy}</span>
        ),
      },
      {
        key: "approvedDate",
        name: "Approved Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.approvedDate}</span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </div>
            <div className="h-6" />
          </div>
        ),
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={(r) => alert(`Viewing: ${r.returnNo}`)}
            onEdit={(r) => alert(`Editing: ${r.returnNo}`)}
            onDelete={(r) => alert(`Deleting: ${r.returnNo}`)}
          />
        ),
      },
    ],
    []
  );

  // ─── Render: Details Form ────────────────────────────────────────────────
  if (showDetails) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <PurchaseReturnDetails setShowDetails={setShowDetails} />
      </div>
    );
  }

  // ─── Render: List View ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-0 shadow-md"
        style={{ background: "#004687", minHeight: 52 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-white/15 rounded-lg p-1.5">
            <PackageX size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide text-white leading-tight">
              Purchase Return
            </h1>
            <p className="text-[10px] text-blue-200 font-medium">
              Manage &amp; track all return requests
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowDetails(true)}
          className="flex items-center gap-1.5 bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs px-4 py-2 h-8 rounded-lg shadow transition-all cursor-pointer"
        >
          <Plus size={14} />
          Create New Purchase Return
        </Button>
      </header>

      <main className="px-6 py-5 space-y-5 max-w-[1400px] mx-auto">
        {/* ── Filter Card ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={11} className="text-[#004687]" />
                From Date
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 text-sm pl-3 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#004687]/30 focus-visible:border-[#004687]/50"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={11} className="text-[#004687]" />
                To Date
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 text-sm pl-3 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#004687]/30 focus-visible:border-[#004687]/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-0.5">
              <Button
                onClick={handleSearch}
                disabled={loading}
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

        {/* ── Data Table ── */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          loadingLabel="Fetching purchase returns…"
          rowHeight={38}
          headerRowHeight={60}
        />

        {/* Empty state / error hint */}
        {!loading && searched && rows.length === 0 && !purchaseReturnListError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageX size={40} className="text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-400">
              No purchase returns found for the selected date range.
            </p>
          </div>
        )}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageX size={40} className="text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-400">
              Select a date range and press{" "}
              <span className="text-[#004687]">Search</span> to load returns.
            </p>
          </div>
        )}
        {!loading && purchaseReturnListError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageX size={40} className="text-red-200 mb-3" />
            <p className="text-sm font-semibold text-red-400">
              {purchaseReturnListError}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}