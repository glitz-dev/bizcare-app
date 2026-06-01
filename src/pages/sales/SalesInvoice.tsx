"use client";

import React, { useState, useMemo, useCallback } from "react";
import { type Column } from "react-data-grid";
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { ReceiptText, User, FileDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CreateSalesInvoice } from "../../components/CreateSalesInvoice";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesInvoiceRow = {
  id: number;
  slNo: number;
  invoiceNo: string;
  invoiceDate: string;
  customer: string;
  amount: number;
  createdBy: string;
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROWS: SalesInvoiceRow[] = [
  {
    id: 1,
    slNo: 1,
    invoiceNo: "SI-ZVT-62",
    invoiceDate: "05-05-2026",
    customer: "CUSTOMER567",
    amount: 2640,
    createdBy: "Admin",
    status: "Approved",
    approvedBy: "Admin",
  },
  {
    id: 2,
    slNo: 2,
    invoiceNo: "SI-ZVT-61",
    invoiceDate: "02-05-2026",
    customer: "CUSTOMER123",
    amount: 8750,
    createdBy: "Admin",
    status: "Pending",
    approvedBy: "",
  },
  {
    id: 3,
    slNo: 3,
    invoiceNo: "SI-ZVT-60",
    invoiceDate: "28-04-2026",
    customer: "CUSTOMER890",
    amount: 4320,
    createdBy: "Admin",
    status: "Completed",
    approvedBy: "Admin",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesInvoice = () => {
  // ── View state ───────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<string>(getOneMonthAgo());
  const [toDate, setToDate] = useState<string>(getToday());
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleEdit = useCallback((row: SalesInvoiceRow) => {
    console.log("Edit", row);
  }, []);

  const handleDelete = useCallback((row: SalesInvoiceRow) => {
    console.log("Delete", row);
  }, []);

  const handlePdf = useCallback((row: SalesInvoiceRow) => {
    console.log("PDF", row);
  }, []);

  const handleView = useCallback((row: SalesInvoiceRow) => {
    console.log("View", row);
  }, []);

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns: Column<SalesInvoiceRow>[] = useMemo(
    () => [
      {
        key: "slNo",
        name: "#",
        width: 100,
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
        key: "invoiceNo",
        name: "Invoice No.",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold text-[#004687]">
            {row.invoiceNo}
          </span>
        ),
      },
      {
        key: "invoiceDate",
        name: "Invoice Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.invoiceDate}</span>
        ),
      },
      {
        key: "customer",
        name: "Customer",
        width: 210,
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
          <span className="text-[12px] font-medium text-slate-700">
            {row.createdBy}
          </span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 150,
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
        width: 150,
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

  // ─── Render ───────────────────────────────────────────────────────────────
  if (showCreate) {
    return (
      <CreateSalesInvoice
        onClose={() => setShowCreate(false)}
        onSuccess={() => setShowCreate(false)}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="SALES INVOICE"
        subtitle="Details"
        icon={<ReceiptText size={16} className="text-white" />}
        createButtonLabel="CREATE SALES INVOICE"
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
          loading={loading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={MOCK_ROWS}
          rowKey="id"
          loading={loading}
          error={null}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default SalesInvoice;
