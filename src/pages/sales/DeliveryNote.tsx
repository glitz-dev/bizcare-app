"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { AppDispatch, RootState } from "@/store";
import { ClipboardList, User, FileDown, CheckCircle2, X, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import CreateDeliveryNote from "../../components/Createdeliverynote";
import {
  fetchDeliveryNotes,
  clearDeliveryNotes,
  deleteDeliveryNote,
  clearDeleteDeliveryNote,
} from "../../store/features/inventory/sales/deliveryNoteSlice";
import type { DeliveryNoteListItem } from "../../store/features/inventory/sales/deliveryNoteSlice";

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-sm"
      style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#dcfce7" }}>
        <CheckCircle2 size={16} strokeWidth={2.5} style={{ color: "#16a34a" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#15803d" }}>Note Saved</p>
        <p className="text-xs mt-0.5 break-words" style={{ color: "#166534" }}>{message}</p>
      </div>
      <button onClick={onClose} className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity">
        <X size={14} style={{ color: "#16a34a" }} />
      </button>
    </div>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

function ConfirmDialog({
  dnNo,
  loading,
  onConfirm,
  onCancel,
}: {
  dnNo: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
        style={{ border: "1.5px solid #fecaca" }}
      >
        {/* Icon + heading */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fee2e2" }}>
            <Trash2 size={18} style={{ color: "#dc2626" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Delete Delivery Note</p>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        {/* Body */}
        <p className="text-sm text-slate-600">
          Are you sure you want to delete delivery note{" "}
          <span className="font-bold text-slate-800">{dnNo}</span>?
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-slate-50 disabled:opacity-50"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#dc2626" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Error Toast ──────────────────────────────────────────────────────────────

function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-sm"
      style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fee2e2" }}>
        <AlertTriangle size={16} strokeWidth={2.5} style={{ color: "#dc2626" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#b91c1c" }}>Delete Failed</p>
        <p className="text-xs mt-0.5 break-words" style={{ color: "#991b1b" }}>{message}</p>
      </div>
      <button onClick={onClose} className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity">
        <X size={14} style={{ color: "#dc2626" }} />
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryNoteRow = {
  id: number;
  slNo: number;
  dnNo: string;
  dnDate: string;
  customer: string;
  challanNo: string;
  store: string;
  salesman: string;
  amount: number;
  stockStatus: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getOneMonthAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
}

// ─── Stock Status Badge ───────────────────────────────────────────────────────

const stockStatusStyles: Record<string, string> = {
  Available:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Out of Stock": "bg-red-50 text-red-700 border border-red-200",
  Partial:        "bg-amber-50 text-amber-700 border border-amber-200",
  Reserved:       "bg-blue-50 text-blue-700 border border-blue-200",
};

function StockStatusBadge({ status }: { status: string }) {
  const cls =
    stockStatusStyles[status] ??
    "bg-slate-100 text-slate-600 border border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}
    >
      {status || <span className="text-slate-300">—</span>}
    </span>
  );
}

// ─── PDF Action Button ────────────────────────────────────────────────────────

function PdfCell({ row, onPdf }: { row: any; onPdf?: (row: any) => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg hover:bg-[#004687]/10 text-[#004687] cursor-pointer"
          onClick={() => onPdf?.(row)}
        >
          <FileDown size={13} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Download PDF
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DeliveryNote = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── View state: "list" | "create" ──────────────────────────────────────
  const [view, setView] = useState<"list" | "create">("list");

  // ── Success toast state ─────────────────────────────────────────────────
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ── Delete confirm dialog state ─────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<DeliveryNoteRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // ── Local deleted IDs (for instant removal before re-fetch) ─────────────
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  // ── Filter state ────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getOneMonthAgo());
  const [toDate, setToDate] = useState(getToday());
  const [selectedItem, setSelectedItem] = useState("");

  // ── Redux: delivery notes list ───────────────────────────────────────────
  const rawDeliveryNotes = useSelector(
    (s: RootState) => s.deliveryNote?.deliveryNotes ?? []
  );
  const deliveryNotesLoading = useSelector(
    (s: RootState) => s.deliveryNote?.deliveryNotesLoading ?? false
  );
  const deliveryNotesError = useSelector(
    (s: RootState) => s.deliveryNote?.deliveryNotesError ?? null
  );

  // ── Extra rows prepended after a successful create ───────────────────────
  const [extraRows, setExtraRows] = useState<DeliveryNoteRow[]>([]);

  // ── Map API response → table rows ────────────────────────────────────────
  const deliveryNotes: DeliveryNoteRow[] = useMemo(
    () =>
      rawDeliveryNotes.map((item: DeliveryNoteListItem) => ({
        id:          item.DeliveryNoteID,
        slNo:        item.rowAscNum,
        dnNo:        item.DeliveryNoteNo,
        dnDate:      item.DeliveryNoteDate,
        customer:    item.Customer,
        challanNo:   item.DeliveryChallanNo ?? "—",
        store:       item.StoreName ?? "—",
        salesman:    item.Salesman ?? "—",
        amount:      item.NetAmount,
        stockStatus: "",           // not returned by list API — left blank
      })),
    [rawDeliveryNotes]
  );

  // ── Merged rows: newly created notes on top, then fetched list ──────────
  const allDeliveryNotes = useMemo(() => {
    const rows = [
      ...extraRows,
      ...deliveryNotes.map((r, i) => ({ ...r, slNo: extraRows.length + i + 1 })),
    ];
    return rows.filter((r) => !deletedIds.has(r.id));
  }, [extraRows, deliveryNotes, deletedIds]);

  // ── Fetch helper (reused by mount + search button) ───────────────────────
  const doFetch = useCallback(() => {
    dispatch(fetchDeliveryNotes({ fromDate, toDate }));
  }, [dispatch, fromDate, toDate]);

  // ── Fetch on mount; clear on unmount ────────────────────────────────────
  useEffect(() => {
    doFetch();
    return () => { dispatch(clearDeliveryNotes()); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    doFetch();
  }, [doFetch]);

  const handleSaveSuccess = useCallback((note: {
    dnNo: string; dnDate: string; customer: string; challanNo: string;
    store: string; salesman: string; amount: number; message: string;
  }) => {
    setExtraRows((prev) => [
      {
        id: Date.now(),           // temporary unique id until the list re-fetches
        slNo: 1,
        dnNo:        note.dnNo,
        dnDate:      note.dnDate,
        customer:    note.customer,
        challanNo:   note.challanNo,
        store:       note.store,
        salesman:    note.salesman,
        amount:      note.amount,
        stockStatus: "",
      },
      ...prev,
    ]);
    setSuccessToast(note.message);
    setView("list");
  }, []);

  const handleEdit = useCallback((row: DeliveryNoteRow) => {
    console.log("Edit", row);
  }, []);

  const handleDelete = useCallback((row: DeliveryNoteRow) => {
    setConfirmDelete(row);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    const result = await dispatch(deleteDeliveryNote({ id: confirmDelete.id }));
    setDeleteLoading(false);
    if (deleteDeliveryNote.fulfilled.match(result)) {
      setDeletedIds((prev) => new Set(prev).add(confirmDelete.id));
      setExtraRows((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      dispatch(clearDeleteDeliveryNote());
      setConfirmDelete(null);
    } else {
      const errMsg = typeof result.payload === "string"
        ? result.payload
        : "Failed to delete delivery note. Please try again.";
      setErrorToast(errMsg);
      setConfirmDelete(null);
    }
  }, [confirmDelete, dispatch]);

  const handlePdf = useCallback((row: DeliveryNoteRow) => {
    console.log("PDF", row);
  }, []);

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: Column<DeliveryNoteRow>[] = useMemo(
    () => [
      {
        key: "slNo",
        name: "#",
        width: 56,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-400 tabular-nums">
            {row.slNo}
          </span>
        ),
      },
      {
        key: "dnNo",
        name: "DN No.",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold text-[#004687]">
            {row.dnNo}
          </span>
        ),
      },
      {
        key: "dnDate",
        name: "DN Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.dnDate}</span>
        ),
      },
      {
        key: "customer",
        name: "Customer",
        width: 200,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#004687]/10 flex items-center justify-center shrink-0">
              <User size={11} className="text-[#004687]" />
            </div>
            <span className="text-[12px] font-medium text-slate-700">
              {row.customer}
            </span>
          </div>
        ),
      },
      {
        key: "challanNo",
        name: "Challan No.",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-mono text-slate-600">
            {row.challanNo}
          </span>
        ),
      },
      {
        key: "store",
        name: "Store",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.store}</span>
        ),
      },
      {
        key: "salesman",
        name: "Salesman",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-medium text-slate-700">
            {row.salesman}
          </span>
        ),
      },
      {
        key: "amount",
        name: "Amount",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
            ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "stockStatus",
        name: "Stock Status",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => <StockStatusBadge status={row.stockStatus} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 120,
        renderCell: ({ row }) => (
          <div className="flex items-center">
            <ActionsCell
              row={row}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <PdfCell row={row} onPdf={handlePdf} />
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, handlePdf]
  );

  // ─── Conditional render ──────────────────────────────────────────────────
  if (view === "create") {
    return <CreateDeliveryNote onBack={() => setView("list")} onSaveSuccess={handleSaveSuccess} />;
  }

  // ─── List view ───────────────────────────────────────────────────────────
  return (
    <>
      {successToast && (
        <SuccessToast message={successToast} onClose={() => setSuccessToast(null)} />
      )}
      {errorToast && (
        <ErrorToast message={errorToast} onClose={() => setErrorToast(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          dnNo={confirmDelete.dnNo}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <PageHeader
        title="DELIVERY NOTE"
        subtitle="Details"
        icon={<ClipboardList size={16} className="text-white" />}
        createButtonLabel="CREATE DELIVERY NOTE"
        onCreateClick={() => setView("create")} // ← switch to create view
      />

      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        <PageFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={[]}
          itemsLoading={false}
          loading={deliveryNotesLoading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={allDeliveryNotes}
          rowKey="id"
          loading={deliveryNotesLoading}
          error={deliveryNotesError}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default DeliveryNote;
