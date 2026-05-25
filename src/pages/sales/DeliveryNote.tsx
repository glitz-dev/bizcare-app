"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { type Column } from "react-data-grid";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { AppDispatch } from "@/store";
import { ClipboardList, User, FileDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import CreateDeliveryNote from "../../components/Createdeliverynote";

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

  // ── Filter state ────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getOneMonthAgo());
  const [toDate, setToDate] = useState(getToday());
  const [selectedItem, setSelectedItem] = useState("");

  // ── Mock data ───────────────────────────────────────────────────────────
  const [deliveryNotes] = useState<DeliveryNoteRow[]>([
    {
      id: 1,
      slNo: 1,
      dnNo: "DN-ZVT-20",
      dnDate: "04/20/2026",
      customer: "CUSTOMER567",
      challanNo: "Cha567",
      store: "XXXX",
      salesman: "DEEPAK",
      amount: 1770,
      stockStatus: "Available",
    },
    {
      id: 2,
      slNo: 2,
      dnNo: "DN-ZVT-21",
      dnDate: "04/20/2026",
      customer: "CUSTOMER567",
      challanNo: "Chall678",
      store: "XXXX",
      salesman: "DEEPAK",
      amount: 5310,
      stockStatus: "Partial",
    },
    {
      id: 3,
      slNo: 3,
      dnNo: "DN-ZVT-22",
      dnDate: "05/05/2026",
      customer: "CUSTOMER567",
      challanNo: "Hjhj",
      store: "XXXX",
      salesman: "DEEPAK",
      amount: 2642.64,
      stockStatus: "Reserved",
    },
  ]);
  const deliveryNotesLoading = false;
  const deliveryNotesError: string | null = null;

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    // dispatch(fetchDeliveryNotes({ fromDate, toDate }));
  }, [fromDate, toDate]);

  const handleEdit = useCallback((row: DeliveryNoteRow) => {
    console.log("Edit", row);
  }, []);

  const handleDelete = useCallback((row: DeliveryNoteRow) => {
    console.log("Delete", row);
  }, []);

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
    return <CreateDeliveryNote onBack={() => setView("list")} />;
  }

  // ─── List view ───────────────────────────────────────────────────────────
  return (
    <>
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
          rows={deliveryNotes}
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
