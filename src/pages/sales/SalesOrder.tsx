"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import {
  DataTable,
  ActionsCell,
  FilterHeader,
} from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { User, ShoppingCart, Check, AlertCircle, X } from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import CreateSalesOrder from "../../components/CreateSalesOrder";
import {
  fetchSalesOrders,
  SalesOrderListItem,
} from "../../store/features/inventory/sales/salesOrder";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesOrderRow = {
  id: number;
  soNo: string;
  csCode: string;
  documentType: string;
  date: string;
  customerName: string;
  currency: string;
  grossAmount: number;
  netAmount: number;
  country: string;
  createdBy: string;
  status: string;
  approvedBy: string;
  approvedDate: string;
  createdDate: string;
  modifiedDate: string;
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";
interface ToastProps { message: string; type: ToastType; onClose: () => void }
function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[300px] max-w-sm"
      style={{
        background: type === "success" ? "#f0fdf4" : "#fef2f2",
        border: `1.5px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: type === "success" ? "#dcfce7" : "#fee2e2" }}
      >
        {type === "success"
          ? <Check size={16} strokeWidth={2.5} style={{ color: "#16a34a" }} />
          : <AlertCircle size={16} strokeWidth={2.5} style={{ color: "#dc2626" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: type === "success" ? "#15803d" : "#b91c1c" }}>
          {type === "success" ? "Order Saved Successfully" : "Save Failed"}
        </p>
        <p className="text-xs mt-0.5 break-words" style={{ color: type === "success" ? "#166534" : "#991b1b" }}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity">
        <X size={14} style={{ color: type === "success" ? "#16a34a" : "#dc2626" }} />
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getOneMonthAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
    Draft: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  const cls = styles[status] ?? styles["Draft"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}
    >
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesOrder = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ─── View state ─────────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── Filter state ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getOneMonthAgo());
  const [toDate, setToDate] = useState(getToday());
  const [selectedItem, setSelectedItem] = useState("");

  // ─── Redux state ────────────────────────────────────────────────────────
  const salesOrders = useSelector(
    (state: RootState) => state.salesOrder.salesOrders
  );
  const salesOrdersLoading = useSelector(
    (state: RootState) => state.salesOrder.salesOrdersLoading
  );
  const salesOrdersError = useSelector(
    (state: RootState) => state.salesOrder.salesOrdersError
  );

  // ─── Fetch on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchSalesOrders({ fromDate, toDate }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Map API response → table rows ──────────────────────────────────────
  const rows: SalesOrderRow[] = useMemo(
    () =>
      salesOrders.map((item: SalesOrderListItem) => ({
        id: item.SalesOrderID,
        soNo: item.SalesOrderNo,
        csCode: item.CustomerCode ?? "",
        documentType: item.Document,
        date: item.SalesOrderDate,
        customerName: item.CustomerName,
        currency: item.FaClass ?? "",
        grossAmount: item.GrossAmount,
        netAmount: item.NetAmount,
        country: item.CountryName,
        createdBy: item.CreatedBy,
        status: item.StatusDetails,
        approvedBy: item.ApprovedBy ?? "",
        approvedDate: item.ApprovedDate ?? "",
        createdDate: item.CreatedDate,
        modifiedDate: item.ModifiedBy ?? "",
      })),
    [salesOrders]
  );

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    dispatch(fetchSalesOrders({ fromDate, toDate }));
  }, [dispatch, fromDate, toDate]);

  const handleEdit = useCallback((row: any) => {
    if (!row.id) {
      console.warn("No id on row", row);
      return;
    }
    // TODO: open edit form
  }, []);

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  // Called by CreateSalesOrder on successful save — store the message,
  // navigate back, then re-fetch so the new record appears in the table.
  const handleSaveSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
  }, []);

  const handleBackFromCreate = useCallback(() => {
    setShowCreateForm(false);
    dispatch(fetchSalesOrders({ fromDate, toDate }));
  }, [dispatch, fromDate, toDate]);

  // ─── Columns ────────────────────────────────────────────────────────────
  const columns: Column<SalesOrderRow>[] = useMemo(
    () => [
      {
        key: "soNo",
        name: "SO. No.",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold text-[#004687]">
            {row.soNo}
          </span>
        ),
      },
      {
        key: "csCode",
        name: "Cs.Code",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-600 font-mono">
            {row.csCode}
          </span>
        ),
      },
      {
        key: "documentType",
        name: "Document Type",
        width: 150,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.documentType}</span>
        ),
      },
      {
        key: "date",
        name: "Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.date}</span>
        ),
      },
      {
        key: "customerName",
        name: "Customer Name",
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
              {row.customerName}
            </span>
          </div>
        ),
      },
      {
        key: "currency",
        name: "Currency",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500 font-mono">
            {row.currency || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        key: "grossAmount",
        name: "Gross Amount",
        width: 150,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
            ₹{row.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "netAmount",
        name: "Net Amount",
        width: 150,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
            ₹{row.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "country",
        name: "Country",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.country}</span>
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
        key: "status",
        name: "Status",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => <StatusBadge status={row.status} />,
      },
      {
        key: "approvedBy",
        name: "Approved By",
        width: 130,
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
        key: "approvedDate",
        name: "Approved Date",
        width: 150,
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
        key: "createdDate",
        name: "Created Date",
        width: 150,
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
        key: "modifiedDate",
        name: "Modified Date",
        width: 150,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">
            {row.modifiedDate || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 130,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={handleEdit}
            onDelete={() => {}}
          />
        ),
      },
    ],
    [handleEdit]
  );

  // ─── List view ──────────────────────────────────────────────────────────
  if (showCreateForm) {
    return (
      <CreateSalesOrder
        onBack={handleBackFromCreate}
        onSaveSuccess={handleSaveSuccess}
      />
    );
  }

  return (
    <>
      {/* ── Success toast after save+redirect ── */}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <PageHeader
        title="SALES ORDER"
        subtitle="Details"
        icon={<ShoppingCart size={16} className="text-white" />}
        createButtonLabel="CREATE SALES ORDER"
        onCreateClick={handleCreateNew}
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
          loading={salesOrdersLoading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={salesOrdersLoading}
          error={salesOrdersError}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default SalesOrder;
