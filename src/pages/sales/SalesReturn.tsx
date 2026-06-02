"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { type Column } from "react-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/store"; 
import { fetchAllSalesReturns } from "../../store/features/inventory/sales/salesReturnSlice"; 
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { RotateCcw, User, FileDown } from "lucide-react";
import CreateSalesReturn from "../../components/CreateSalesReturn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesReturnRow = {
  id: number;
  slNo: number;
  returnNo: string;
  returnDate: string;
  customer: string;
  paymentType: string;
  totalQty: number;
  totalAmt: number;
  status: string;
  approvedBy: string;
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

/**
 * Converts standard HTML input state strings (YYYY-MM-DD)
 * to the exact format needed by your backend routing layer (DD-MM-YYYY)
 */
function formatDateToApi(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
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

const SalesReturn = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux State Extraction ──────────────────────────────────────────────────
  const { salesReturns, salesReturnsLoading, salesReturnsError } = useSelector(
    (state: RootState) => state.salesReturn
  );

  // ── View State ──────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);

  // ── Local Picker States (Kept clean internally in HTML native YYYY-MM-DD) ──
  const [fromDate, setFromDate] = useState<string>(getOneMonthAgo());
  const [toDate, setToDate] = useState<string>(getToday());
  const [selectedItem, setSelectedItem] = useState<string>("");

  // ── Load Data Core Dispatches ───────────────────────────────────────────────
  const loadSalesReturns = useCallback(() => {
    // Transform parameters to DD-MM-YYYY strings layout right before API execution
    const apiFromDate = formatDateToApi(fromDate);
    const apiToDate = formatDateToApi(toDate);

    dispatch(
      fetchAllSalesReturns({
        fromDate: apiFromDate,
        toDate: apiToDate,
        rowsPerPage: 25,
        currentPage: 1,
        searchStr: "",
        documentType: "SALES RETURN",
      })
    );
  }, [dispatch, fromDate, toDate]);

  // ── Initial Boot Mount Trigger ──────────────────────────────────────────────
  useEffect(() => {
    loadSalesReturns();
  }, [loadSalesReturns]);

  // ── Search Form Control Interception ─────────────────────────────────────────
  const handleSearch = useCallback(() => {
    loadSalesReturns();
  }, [loadSalesReturns]);

  const handleEdit = useCallback((row: SalesReturnRow) => {
    console.log("Edit", row);
  }, []);

  const handleDelete = useCallback((row: SalesReturnRow) => {
    console.log("Delete", row);
  }, []);

  const handlePdf = useCallback((row: SalesReturnRow) => {
    console.log("PDF", row);
  }, []);

  const handleView = useCallback((row: SalesReturnRow) => {
    console.log("View", row);
  }, []);

  // ── Normalization Mapping Layer ──────────────────────────────────────────────
  const rows: SalesReturnRow[] = useMemo(() => {
    return salesReturns.map((item, index) => ({
      id: item.SalesReturnMID ?? index,
      slNo: item.rowAscNum ?? index + 1,
      returnNo: item.ReturnNo,
      returnDate: item.ReturnDate,
      customer: item.Supplier,
      paymentType: item.PaymentType,
      totalQty: item.TotalQuantity,
      totalAmt: item.NetAmount,
      status: item.Approve || "Pending",
      approvedBy: item.ApprovedBy || "",
    }));
  }, [salesReturns]);

  // ── Columns UI Matrix ────────────────────────────────────────────────────────
  const columns: Column<SalesReturnRow>[] = useMemo(
    () => [
      {
        key: "slNo",
        name: "#",
        width: 70,
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
        key: "returnNo",
        name: "Return No.",
        width: 140,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold text-[#004687]">
            {row.returnNo}
          </span>
        ),
      },
      {
        key: "returnDate",
        name: "Return Date",
        width: 130,
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
        key: "paymentType",
        name: "Payment Type",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              row.paymentType === "Credit"
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-teal-50 text-teal-700 border-teal-200"
            }`}
          >
            {row.paymentType}
          </span>
        ),
      },
      {
        key: "totalQty",
        name: "Total Qty",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-700 tabular-nums">
            {row.totalQty}
          </span>
        ),
      },
      {
        key: "totalAmt",
        name: "Total Amt",
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
            ₹{row.totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 130,
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
            {row.approvedBy || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 130,
        renderCell: ({ row }) => (
          <div className="flex items-center">
            <ActionsCell
              row={row}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <PdfCell row={row} onPdf={handlePdf} />
          </div>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete, handlePdf]
  );

  // ─── Rendering View Context ──────────────────────────────────────────────────
  if (showCreate) {
    return <CreateSalesReturn onBack={() => setShowCreate(false)} />;
  }

  return (
    <>
      <PageHeader
        title="SALES RETURN"
        subtitle="Details"
        icon={<RotateCcw size={16} className="text-white" />}
        createButtonLabel="CREATE NEW SALES RETURN"
        onCreateClick={() => setShowCreate(true)}
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
          loading={salesReturnsLoading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={salesReturnsLoading}
          error={salesReturnsError}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default SalesReturn;
