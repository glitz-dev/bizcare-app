import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Eye, Pencil, Megaphone } from "lucide-react";
import { DataTable, FilterHeader, StatusBadge } from "@/common/DataTable";
import type { Column } from "react-data-grid";
import { PageHeader } from "@/common/PageHeader";
import CreatePurchaseForm from "@/components/Createpurchaseform";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchAllPurchases,
  setDateRange,
  type PurchaseRecord,
} from "@/store/features/inventory/procurement/purchaseSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert JS date string "YYYY-MM-DD" → API format "DD-MM-YYYY" */
const toApiDate = (isoDate: string): string => {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
};

const todayIso = new Date().toISOString().split("T")[0];
const monthAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

// ─── Purchase Page ─────────────────────────────────────────────────────────────

const Purchase = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state ──
  const { data, loading, error, documentType, rowsPerPage, currentPage } =
    useSelector((state: RootState) => state.purchase);

  // ── Local filter state (controlled inputs, committed on Search) ──
  const [fromDate, setFromDate] = useState(monthAgoIso);
  const [toDate, setToDate] = useState(todayIso);

  const [showForm, setShowForm] = useState(false);

  // ── Map API PurchaseRecord → table row shape ──
  const rows = useMemo(
    () =>
      data.map((item: PurchaseRecord) => ({
        InvoiceNo: item.InvoiceNo,
        InvoiceDate: item.InvoiceDate,
        PaymentType: item.PaymentType,
        Supplier: item.Supplier,
        Amount: item.NetAmount,
        TotalAmount: item.TotalAmt,
        GRNo: item.InpassNo,
        SupInvNo: item.SupInvoiceNo,
        Status: item.Approve,
        SupInvDate: item.SupInvoiceDate,
        CreatedBy: item.Username,
        CreatedDate: item.CreatedDate,
        ApprovedBy: item.ApprovedBy,
        ApprovedDate: item.ApprovedDate,
      })),
    [data]
  );

  // ── Initial fetch on mount ──
  useEffect(() => {
    dispatch(
      fetchAllPurchases({
        FromDate: toApiDate(fromDate),
        ToDate: toApiDate(toDate),
        rowsPerPage,
        documentType,
        currentPage,
        searchStr: "",
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search button handler ──
  const handleSearch = () => {
    dispatch(setDateRange({ fromDate, toDate }));
    dispatch(
      fetchAllPurchases({
        FromDate: toApiDate(fromDate),
        ToDate: toApiDate(toDate),
        rowsPerPage,
        documentType,
        currentPage: 1,
        searchStr: "",
      })
    );
  };

  const handleView = (row: (typeof rows)[number]) => console.log("View", row);
  const handleEdit = (row: (typeof rows)[number]) => console.log("Edit", row);
  const handleAnnounce = (row: (typeof rows)[number]) =>
    console.log("Announce", row);

  // ─── Columns ───────────────────────────────────────────────────────────────

  type TableRow = (typeof rows)[number];

  const columns: Column<TableRow>[] = useMemo(
    () => [
      {
        key: "InvoiceNo",
        name: "Invoice No",
        minWidth: 100,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "InvoiceDate",
        name: "Invoice Date",
        minWidth: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "PaymentType",
        name: "Payment Type",
        minWidth: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "Supplier",
        name: "Supplier",
        minWidth: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "Amount",
        name: "Amount",
        minWidth: 90,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
        renderCell: ({ row }: { row: TableRow }) => (
          <span className="tabular-nums">{row.Amount.toLocaleString("en-IN")}</span>
        ),
      },
      {
        key: "TotalAmount",
        name: "Total Amount",
        minWidth: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
        renderCell: ({ row }: { row: TableRow }) => (
          <span className="tabular-nums">{row.TotalAmount.toLocaleString("en-IN")}</span>
        ),
      },
      {
        key: "GRNo",
        name: "GR No",
        minWidth: 90,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "SupInvNo",
        name: "Sup Inv.No",
        minWidth: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "Status",
        name: "Status",
        minWidth: 100,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
        renderCell: ({ row }: { row: TableRow }) => (
          <StatusBadge label={row.Status} />
        ),
      },
      {
        key: "SupInvDate",
        name: "Sup Inv. Date",
        minWidth: 115,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "CreatedBy",
        name: "Created By",
        minWidth: 100,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "CreatedDate",
        name: "Created Date",
        minWidth: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "ApprovedBy",
        name: "Approved By",
        minWidth: 105,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "ApprovedDate",
        name: "Approved Date",
        minWidth: 115,
        renderHeaderCell: (props: any) => (
          <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange ?? (() => {})} />
        ),
      },
      {
        key: "actions",
        name: "Actions",
        minWidth: 110,
        frozen: true,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </div>
            <div className="h-6" />
          </div>
        ),
        renderCell: ({ row }: { row: TableRow }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleView(row)}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-500 transition-colors cursor-pointer"
              title="View Items"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() => handleEdit(row)}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-amber-50 text-amber-500 transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => handleAnnounce(row)}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-sky-50 text-sky-500 transition-colors cursor-pointer"
              title="Announce"
            >
              <Megaphone size={13} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // ── Full-page form ──
  if (showForm) {
    return <CreatePurchaseForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      {/* Header */}
      <PageHeader
        title="PURCHASE"
        subtitle="Purchase Invoice Management"
        icon={<ShoppingCart size={16} color="white" />}
        createButtonLabel="Create New Purchase"
        showCreateButton
        onCreateClick={() => setShowForm(true)}
      />

      {/* Body */}
      <div className="flex flex-col gap-4 p-4 flex-1">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-8 px-5 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-60 cursor-pointer transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="InvoiceNo"
          loading={loading}
          loadingLabel="Loading purchases…"
        />
      </div>
    </div>
  );
};

export default Purchase;