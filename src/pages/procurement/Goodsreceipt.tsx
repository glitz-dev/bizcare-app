"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Column } from "react-data-grid";
import { PackageCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store"; // Adjust path as needed

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

// Import the goods receipt slice (thunk + item type)
import {
  fetchGoodsReceiptList,
  type GoodsReceiptListItem,
} from "../../store/features/inventory/procurement/goodsreceiptSlice"; // Adjust path as needed

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

// ─── Date Helpers ─────────────────────────────────────────────────────────────
// PageFilters works with "YYYY-MM-DD" (native <input type="date"> format), but
// the GetInPasssDetails API expects "DD-MM-YYYY" for From/To.
const toApiDate = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}-${month}-${year}`;
};

// ─── API → Row Mapper ───────────────────────────────────────────────────────
// Converts a raw GetInPasssDetails record into the row shape the grid expects.
const mapListItemToRow = (item: GoodsReceiptListItem): GoodsReceiptRow => {
  let status: GoodsReceiptRow["status"] = "Created";
  if (item.Approved) {
    status = "Approved";
  } else if (item.Approve && item.Approve.toLowerCase().includes("reject")) {
    status = "Rejected";
  } else if (item.Approve) {
    status = "Pending";
  }

  return {
    receiptId: String(item.InPassID),
    goodsReceiptNo: item.InPassNo,
    date: item.InPassDate,
    documentNo: item.DocumentName,
    supplier: item.Supplier,
    amount: item.NetAmount,
    status,
    createdDate: item.CreatedDate,
    approvedBy: item.ApprovedBy ?? "-",
    against: item.Against,
    approvedDate: item.ApprovedDate ?? "-",
    receivedAt: item.ReceivedAt ?? "-",
    supplierBillNo: item.BillNo ?? "-",
    createdBy: item.CreatedBy ?? "-",
    purchaseOrderNo: item.OrderNo ?? "-",
  };
};

export default function GoodsReceipt() {
  // ─── View Toggle State ──────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ─── Filter & State Management ──────────────────────────────────────────────
  const [fromDate, setFromDate] = useState("2026-07-20");
  const [toDate, setToDate] = useState("2026-08-19");
  const [selectedItem, setSelectedItem] = useState("");

  // ─── Redux Wiring ───────────────────────────────────────────────────────────
  const dispatch = useDispatch<AppDispatch>();
  const {
    goodsReceiptListList,
    goodsReceiptListLoading,
    goodsReceiptListError,
  } = useSelector((state: RootState) => state.goodsReceipt);

  const loading = goodsReceiptListLoading;
  const rows = useMemo<GoodsReceiptRow[]>(
    () => goodsReceiptListList.map(mapListItemToRow),
    [goodsReceiptListList]
  );

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
    dispatch(
      fetchGoodsReceiptList({
        from: toApiDate(fromDate),
        to: toApiDate(toDate),
        currentPage: 1,
        rowsPerPage: 25,
        searchStr: "",
      })
    );
  };

  // Fetch on mount using the initial date range. Guarded with a ref so
  // React 18 Strict Mode's double-invoke in dev doesn't fire the request twice.
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {/* 3. Error Banner */}
        {goodsReceiptListError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {goodsReceiptListError}
          </div>
        )}

        {/* 4. Modernized Data Grid */}
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
