"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  X,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";
import type { Column } from "react-data-grid";
import { DataTable, FilterHeader } from "@/common/DataTable";

// ─── Import the REAL type from the Redux slice ───────────────────────────────
import type { SalesOrder } from "@/store/features/inventory/procurement/procurementSlice";

export interface SalesOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (salesOrderNo: string) => void;
  salesOrders?: SalesOrder[];      // ← real data from Redux
  loading?: boolean;
  error?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SalesOrderModal({
  open,
  onClose,
  onSelect,
  salesOrders = [],
  loading = false,
  error = null,
}: SalesOrderModalProps) {
  const [globalSearch, setGlobalSearch] = useState("");

  const orders = salesOrders;

  useEffect(() => {
    if (open) setGlobalSearch("");
  }, [open]);

  const handleSelect = (no: string) => {
    onSelect(no);
    onClose();
  };

  // Filter (works with real backend fields)
  const searchedRows = useMemo(() => {
    if (!globalSearch) return orders;
    const q = globalSearch.toLowerCase();
    return orders.filter((r) =>
      [
        r.OrderNo,
        r.PartyName,
        r.CustCode,
        r.ApprovedBy,
        r.ApprovedDate,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, globalSearch]);

  // ── Updated columns to match real backend response ───────────────────────
  const salesOrderColumns: Column<SalesOrder>[] = useMemo(
    () => [
      {
        key: "select",
        name: "",
        width: 56,
        frozen: true,
        resizable: false,
        renderCell: ({ row }) => (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleSelect(row.OrderNo)}
              title="Select this order"
              className="group relative flex items-center justify-center w-8 h-8 rounded-xl bg-white border-2 border-[#004687]/20 hover:border-[#004687] hover:bg-[#004687] active:scale-95 transition-all duration-200 ease-out shadow-sm hover:shadow-[0_0_0_3px_rgba(0,70,135,0.15)]"
            >
              <CheckCircle2
                size={14}
                className="text-[#004687]/60 group-hover:text-white transition-colors duration-200"
              />
            </button>
          </div>
        ),
      },
      {
        key: "OrderNo",
        name: "Sales Order No.",
        width: 155,
        frozen: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <div className="flex items-center gap-2 h-full">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#004687]/8 border border-[#004687]/15 font-bold text-[#004687] text-xs tracking-wider font-mono">
              {row.OrderNo}
            </span>
          </div>
        ),
      },
      {
        key: "SalesOrderDate",
        name: "Order Date",
        width: 140,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600 font-medium">
            {row.SalesOrderDate || row.OrderDate || "—"}
          </span>
        ),
      },
      {
        key: "CustCode",
        name: "Customer Code",
        width: 145,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold tracking-wide">
            {row.CustCode || "—"}
          </span>
        ),
      },
      {
        key: "ApprovedBy",
        name: "Approved By",
        width: 130,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.ApprovedBy || "—"}</span>
        ),
      },
      {
        key: "ApprovedDate",
        name: "Approved Date",
        width: 135,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600 tabular-nums">
            {row.ApprovedDate || "—"}
          </span>
        ),
      },
      {
        key: "ApprovedTime",
        name: "Approved Time",
        width: 125,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <div className="flex items-center h-full">
            {row.ApprovedTime ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-500 tabular-nums">
                <Clock size={10} className="text-slate-400" />
                {row.ApprovedTime}
              </span>
            ) : (
              <span className="text-xs text-slate-300">—</span>
            )}
          </div>
        ),
      },
    ],
    [handleSelect]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden flex flex-col border-0 [&>button:last-child]:hidden"
        style={{
          width: "min(905px, 96vw)",
          maxWidth: "96vw",
          maxHeight: "88vh",
          borderRadius: "20px",
          boxShadow: "0 32px 80px -12px rgba(0,30,80,0.35), 0 0 0 1px rgba(0,70,135,0.08)",
        }}
      >
        <DialogTitle className="sr-only">Sales Orders</DialogTitle>

        {/* Header */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #002d5a 0%, #004687 55%, #0059a8 100%)",
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-full h-px bg-white/10 pointer-events-none" />

          <div className="relative px-6 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/15 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <ShoppingCart size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-[15px] tracking-tight leading-tight">
                    Sales Orders
                  </h2>
                  <p className="text-white/50 text-[11px] mt-0.5 tracking-wide">
                    Select an order to link to this indent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white/80 text-xs font-semibold tabular-nums">
                  {searchedRows.length} {searchedRows.length === 1 ? "order" : "orders"}
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 hover:bg-white/20 hover:border-white/25 active:scale-95 transition-all duration-150"
                >
                  <X size={15} className="text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <DataTable
            columns={salesOrderColumns}
            rows={searchedRows}
            rowKey="SalesOrderID"
            loading={loading}
            error={error}
            loadingLabel="Loading sales orders…"
            rowHeight={42}
            headerRowHeight={60}
          />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Package size={11} />
            <span>Click <CheckCircle2 size={10} className="inline text-[#004687]/60 mx-0.5" /> to select an order</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 active:scale-95 transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}