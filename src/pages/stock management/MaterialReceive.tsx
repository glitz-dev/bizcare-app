"use client";

import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { type Column } from "react-data-grid";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell, StatusBadge } from "../../common/DataTable";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MaterialReceiveRow {
  id: number;
  docNo: string;
  date: string;
  documentName: string;
  fromStore: string;
  toStore: string;
  issuedQty: number;
  status: string;
  approvedBy: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROWS: MaterialReceiveRow[] = [];

// ─── Filters Bar ─────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Store, Search, X } from "lucide-react";

interface MaterialReceiveFiltersProps {
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  selectedStore: string;
  setSelectedStore: (v: string) => void;
  stores: { StoreID: number; StoreName: string }[];
  storesLoading: boolean;
  loading: boolean;
  onSearch: () => void;
}

function MaterialReceiveFilters({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedStore,
  setSelectedStore,
  stores,
  storesLoading,
  loading,
  onSearch,
}: MaterialReceiveFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div
        className="grid gap-3 items-end"
        style={{ gridTemplateColumns: "1fr 1fr 2fr auto" }}
      >
        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={10} /> From Date
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-8 text-sm border-slate-200 rounded-lg w-full"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={10} /> To Date
          </label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-8 text-sm border-slate-200 rounded-lg w-full"
          />
        </div>

        {/* Receiving Store */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Store size={10} /> Receiving Store
          </label>
          <div className="relative">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                {storesLoading ? (
                  <SelectItem value="__loading__" disabled>
                    Loading stores…
                  </SelectItem>
                ) : stores.length === 0 ? (
                  <SelectItem value="__empty__" disabled>
                    No stores available
                  </SelectItem>
                ) : (
                  stores.map((s) => (
                    <SelectItem key={s.StoreID} value={String(s.StoreID)}>
                      {s.StoreName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedStore && (
              <button
                onClick={() => setSelectedStore("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center">
          <Button
            onClick={onSearch}
            disabled={loading}
            className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap cursor-pointer"
          >
            <Search size={12} />
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MaterialReceive() {
  const today = new Date().toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);
  const [selectedStore, setSelectedStore] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows] = useState<MaterialReceiveRow[]>(MOCK_ROWS);

  // Mock store list — replace with Redux selector
  const stores: { StoreID: number; StoreName: string }[] = [];
  const storesLoading = false;

  const handleSearch = () => {
    setLoading(true);
    // TODO: dispatch fetchMaterialReceive({ fromDate, toDate, storeId: selectedStore })
    setTimeout(() => setLoading(false), 800);
  };

  const handleView = (row: MaterialReceiveRow) => {
    console.log("View", row);
    // TODO: navigate to view page
  };

  const handleEdit = (row: MaterialReceiveRow) => {
    console.log("Edit", row);
    // TODO: navigate to edit page
  };

  const handleDelete = (row: MaterialReceiveRow) => {
    console.log("Delete", row);
    // TODO: dispatch deleteMaterialReceive(row.id)
  };

  const columns: Column<MaterialReceiveRow>[] = useMemo(
    () => [
      {
        key: "docNo",
        name: "Doc No.",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-semibold text-[#004687]">
            {row.docNo}
          </span>
        ),
      },
      {
        key: "date",
        name: "Date",
        width: 100,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.date}</span>
        ),
      },
      {
        key: "documentName",
        name: "Document Name",
        width: 160,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-700">{row.documentName}</span>
        ),
      },
      {
        key: "fromStore",
        name: "From Store",
        width: 140,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.fromStore}</span>
        ),
      },
      {
        key: "toStore",
        name: "To Store",
        width: 140,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.toStore}</span>
        ),
      },
      {
        key: "issuedQty",
        name: "Issued Qty",
        width: 100,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700">
            {row.issuedQty}
          </span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "approvedBy",
        name: "Approved By",
        width: 130,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.approvedBy}</span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 100,
        resizable: false,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </div>
          </div>
        ),
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Material Receive"
        subtitle="Inventory · Receive"
        icon={<ArrowLeftRight size={16} className="text-white" />}
        showCreateButton={false}
      />

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">
        {/* Filters */}
        <MaterialReceiveFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          stores={stores}
          storesLoading={storesLoading}
          loading={loading}
          onSearch={handleSearch}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          loadingLabel="Fetching material receive records…"
        />
      </div>
    </div>
  );
}
