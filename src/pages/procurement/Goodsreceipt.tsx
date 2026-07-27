"use client";

import { useState, useMemo } from "react";
import type { Column } from "react-data-grid";
import { PackageCheck } from "lucide-react";

// Import your existing common UI components
import { PageHeader } from "../../common/PageHeader";
import { PageFilters } from "../../common/PageFilters";
import {
  DataTable,
  FilterHeader,
  StatusBadge,
  ActionsCell,
} from "../../common/DataTable";

// Import CreateGoodsreceipt Component
import { CreateGoodsreceipt } from "../../components/CreateGoodsreceipt"; // Adjust path as needed

// Sample Type definition based on legacy grid columns
export interface GoodsReceiptRow {
  receiptId: string;
  goodsReceiptNo: string;
  date: string;
  documentNo: string;
  supplier: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected" | "Created" | "Completed";
  createdDate: string;
  approvedBy: string;
  against: string;
  approvedDate: string;
  receivedAt: string;
  supplierBillNo: string;
  createdBy: string;
  purchaseOrderNo: string;
}

// Sample Data
const MOCK_DATA: GoodsReceiptRow[] = [
  {
    receiptId: "1",
    goodsReceiptNo: "GR-2026-001",
    date: "2026-07-20",
    documentNo: "DOC-8941",
    supplier: "Acme Industrial Supplies",
    amount: 12500.0,
    status: "Approved",
    createdDate: "2026-07-20",
    approvedBy: "John Doe",
    against: "PO-4501",
    approvedDate: "2026-07-21",
    receivedAt: "Main Warehouse",
    supplierBillNo: "INV-9901",
    createdBy: "Alice Smith",
    purchaseOrderNo: "PO-4501",
  },
  {
    receiptId: "2",
    goodsReceiptNo: "GR-2026-002",
    date: "2026-07-22",
    documentNo: "DOC-8942",
    supplier: "Apex Global Trading",
    amount: 4350.5,
    status: "Pending",
    createdDate: "2026-07-22",
    approvedBy: "-",
    against: "PO-4508",
    approvedDate: "-",
    receivedAt: "Dock B",
    supplierBillNo: "INV-7732",
    createdBy: "Bob Johnson",
    purchaseOrderNo: "PO-4508",
  },
];

export default function GoodsReceipt() {
  // ─── View Toggle State ──────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ─── Filter & State Management ──────────────────────────────────────────────
  const [fromDate, setFromDate] = useState("2026-07-20");
  const [toDate, setToDate] = useState("2026-08-19");
  const [selectedItem, setSelectedItem] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<GoodsReceiptRow[]>(MOCK_DATA);

  // Sample items list for PageFilters dropdown
  const sampleItems = [
    { ItemID: 1, ItemName: "Raw Steel Sheets" },
    { ItemID: 2, ItemName: "Hydraulic Valves" },
    { ItemID: 3, ItemName: "Industrial Lubricant" },
  ];

  // Handler for Action Buttons
  const handleView = (row: GoodsReceiptRow) => console.log("View:", row);
  const handleEdit = (row: GoodsReceiptRow) => console.log("Edit:", row);
  const handleDelete = (row: GoodsReceiptRow) => console.log("Delete:", row);
  
  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // ─── DataGrid Columns ───────────────────────────────────────────────────────
  const columns = useMemo<Column<GoodsReceiptRow>[]>(
    () => [
      {
        key: "goodsReceiptNo",
        name: "Goods Receipt",
        width: 140,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
        renderCell: (props) => (
          <span className="font-medium text-slate-800 text-xs">
            {props.row.goodsReceiptNo}
          </span>
        ),
      },
      {
        key: "date",
        name: "Date",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "documentNo",
        name: "Document",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "supplier",
        name: "Supplier",
        width: 180,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "amount",
        name: "Amount",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
        renderCell: (props) => (
          <span className="font-semibold text-slate-700 text-xs">
            ${props.row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
        renderCell: (props) => <StatusBadge label={props.row.status} />,
      },
      {
        key: "createdDate",
        name: "Created Date",
        width: 120,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "approvedBy",
        name: "Approved By",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "against",
        name: "Against",
        width: 110,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "approvedDate",
        name: "Approved Date",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 100,
        renderCell: (props) => (
          <ActionsCell
            row={props.row}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
      {
        key: "receivedAt",
        name: "Received At",
        width: 140,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "supplierBillNo",
        name: "Supplier Bill",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "createdBy",
        name: "Created By",
        width: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
      {
        key: "purchaseOrderNo",
        name: "Purchase Order",
        width: 140,
        renderHeaderCell: (props: any) => (
          <FilterHeader {...props} filterValue="" onFilterChange={() => {}} />
        ),
      },
    ],
    []
  );

  // Conditional Rendering: Show Creation Form if `showCreateForm` is true
  if (showCreateForm) {
    return <CreateGoodsreceipt onClose={handleCloseForm} />;
  }

  return (
    <>
      {/* 1. Header Bar */}
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="Goods Receipt Detail"
          subtitle="Manage & Track Inventory Receipts"
          icon={<PackageCheck className="w-5 h-5 text-white" />}
          createButtonLabel="Create Goods Receipt"
          showCreateButton={true}
          onCreateClick={handleCreateNew}
        />
      </div>

      <div className="flex flex-col gap-4 p-4 bg-slate-50 min-h-screen">
        {/* 2. Top Filter Bar */}
        <PageFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={sampleItems}
          itemsLoading={false}
          loading={loading}
          onSearch={handleSearch}
        />

        {/* 3. Modernized Data Grid */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="receiptId"
          loading={loading}
          rowHeight={40}
          headerRowHeight={62}
        />
      </div>
    </>
  );
}
