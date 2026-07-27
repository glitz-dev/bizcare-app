"use client";

import { useState } from "react";
import type { Column } from "react-data-grid";
import { ReceiptText, CalendarDays, Search, SlidersHorizontal, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PageHeader } from "../../../../common/PageHeader"; 
import { DataTable, FilterHeader, StatusBadge, ActionsCell } from "../../../../common/DataTable"; 
import CreateCustomerReceipt from "../../../../components/Createcustomerreceipt"; 

// ─── Row shape ────────────────────────────────────────────────────────────────
interface CustomerReceiptRow {
  Id: number;
  Type: string;
  SettlementNo: string;
  Date: string;
  Party: string;
  InvoiceNo: string;
  BankRefNo: string;
  InvoiceAmount: string;
  SettledAmount: string;
  VoucherNo: string;
  ShortFall: string;
  ReceivableAmount: string;
  Status: string;
  ApprovedBy: string;
  CreatedOn: string;
  CreatedBy: string;
  ApprovedOn: string;
}

// ─── Static display rows ───────────────────────────────────────────────────────
const ROWS: CustomerReceiptRow[] = [
  {
    Id: 1,
    Type: "Customer Receipt-INR",
    SettlementNo: "CR/26-27/0001",
    Date: "05-07-2026",
    Party: "Glitzit Traders",
    InvoiceNo: "INV/26-27/0021",
    BankRefNo: "REF884521",
    InvoiceAmount: "45,000.00",
    SettledAmount: "45,000.00",
    VoucherNo: "V/26-27/0102",
    ShortFall: "0.00",
    ReceivableAmount: "0.00",
    Status: "Approved",
    ApprovedBy: "Anoop K",
    CreatedOn: "05-07-2026",
    CreatedBy: "Mone",
    ApprovedOn: "05-07-2026",
  },
  {
    Id: 2,
    Type: "Customer Receipt-INR",
    SettlementNo: "CR/26-27/0002",
    Date: "08-07-2026",
    Party: "Kairali Suppliers",
    InvoiceNo: "INV/26-27/0034",
    BankRefNo: "REF884777",
    InvoiceAmount: "1,20,000.00",
    SettledAmount: "1,10,000.00",
    VoucherNo: "V/26-27/0110",
    ShortFall: "10,000.00",
    ReceivableAmount: "10,000.00",
    Status: "Pending",
    ApprovedBy: "-",
    CreatedOn: "08-07-2026",
    CreatedBy: "Mone",
    ApprovedOn: "-",
  },
  {
    Id: 3,
    Type: "Customer Receipt-INR",
    SettlementNo: "CR/26-27/0003",
    Date: "12-07-2026",
    Party: "Coastal Hardware",
    InvoiceNo: "INV/26-27/0041",
    BankRefNo: "REF885003",
    InvoiceAmount: "62,500.00",
    SettledAmount: "0.00",
    VoucherNo: "V/26-27/0118",
    ShortFall: "62,500.00",
    ReceivableAmount: "62,500.00",
    Status: "Rejected",
    ApprovedBy: "Anoop K",
    CreatedOn: "12-07-2026",
    CreatedBy: "Mone",
    ApprovedOn: "13-07-2026",
  },
];

const STATUS_OPTIONS = ["Not Approved", "Approved", "Pending", "Rejected"];

// ─── Local filter bar (page-specific — PageFilters.tsx is shared and is not
// modified here; this mirrors its visual language for Date + Search, and adds
// the Status filter that this page needs instead of the Item filter) ─────────
function CustomerReceiptFilters() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div className="grid gap-3 items-end" style={{ gridTemplateColumns: "1fr 1fr auto 1fr" }}>
        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={10} /> From Date
          </label>
          <Input type="date" defaultValue="2024-04-01" className="h-8 text-sm border-slate-200 rounded-lg w-full" />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={10} /> To Date
          </label>
          <Input type="date" defaultValue="2026-07-15" className="h-8 text-sm border-slate-200 rounded-lg w-full" />
        </div>

        {/* Search & Advanced */}
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap cursor-pointer">
            <Search size={12} /> Search
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:text-[#004687]"
              >
                <SlidersHorizontal size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Advanced filters
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 justify-self-end w-full max-w-[220px]">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Filter size={10} /> Status
          </label>
          <Select defaultValue="Not Approved">
            <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────
const columns: Column<any>[] = [
  {
    key: "Type",
    name: "Type",
    width: 170,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "SettlementNo",
    name: "Settlement No",
    width: 150,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "Date",
    name: "Date",
    width: 110,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "Party",
    name: "Party",
    width: 170,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "InvoiceNo",
    name: "Invoice No",
    width: 150,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "BankRefNo",
    name: "Bank Ref No",
    width: 140,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "InvoiceAmount",
    name: "Invoice Amount",
    width: 140,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
    renderCell: ({ row }) => <div className="text-right w-full">{row.InvoiceAmount}</div>,
  },
  {
    key: "SettledAmount",
    name: "Settled Amount",
    width: 140,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
    renderCell: ({ row }) => <div className="text-right w-full">{row.SettledAmount}</div>,
  },
  {
    key: "VoucherNo",
    name: "Voucher No",
    width: 140,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "ShortFall",
    name: "Short Fall",
    width: 120,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
    renderCell: ({ row }) => <div className="text-right w-full">{row.ShortFall}</div>,
  },
  {
    key: "ReceivableAmount",
    name: "Receivable Amount",
    width: 150,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
    renderCell: ({ row }) => <div className="text-right w-full">{row.ReceivableAmount}</div>,
  },
  {
    key: "Status",
    name: "Status",
    width: 120,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
    renderCell: ({ row }) => <StatusBadge label={row.Status} />,
  },
  {
    key: "ApprovedBy",
    name: "Approved By",
    width: 130,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "CreatedOn",
    name: "Created On",
    width: 120,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "CreatedBy",
    name: "Created By",
    width: 120,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "ApprovedOn",
    name: "Approved On",
    width: 130,
    renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
  },
  {
    key: "Actions",
    name: "Actions",
    width: 110,
    frozen: true,
    renderCell: ({ row }) => <ActionsCell row={row} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />,
  },
];

// ─── Main component ─────────────────────────────────────────────────────────
const CustomerReceiptEntry = () => {
  const [view, setView] = useState<"list" | "create">("list");

  if (view === "create") {
    return <CreateCustomerReceipt onBack={() => setView("list")} />;
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <PageHeader
        title="Customer Receipt Entry"
        subtitle="Accounts · Customer Receipt"
        icon={<ReceiptText size={15} color="white" />}
        createButtonLabel="Create New Customer Receipt"
        onCreateClick={() => setView("create")}
      />

      <div className="flex flex-col gap-4 p-5 flex-1">
        <CustomerReceiptFilters />
        <DataTable columns={columns} rows={ROWS} rowKey="Id" />
      </div>
    </div>
  );
};

export default CustomerReceiptEntry;
