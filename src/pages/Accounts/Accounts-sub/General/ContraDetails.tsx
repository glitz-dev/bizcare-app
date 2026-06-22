"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { Column } from "react-data-grid";
import { ArrowLeftRight } from "lucide-react";

import { AppDispatch, RootState } from "@/store";
import { fetchContraDetailsByDate } from "../../../../store/features/Accounts/accounts/contraEntrySlice";

import CreateContraEntry from "../../../../components/Createcontraentry";
import { PageHeader } from "../../../../common/PageHeader";
import { PageFilters } from "../../../../common/PageFilters";
import {
  DataTable,
  StatusBadge,
  ActionsCell,
  FilterHeader,
} from "../../../../common/DataTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function fiscalStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
}

// ─── Column definition ────────────────────────────────────────────────────────
function buildColumns(
  filters: Record<string, string>,
  handleFilterChange: (key: string, value: string) => void,
  onView: (row: any) => void,
  onEdit: (row: any) => void,
  onDelete: (row: any) => void
): Column<any>[] {
  const fh = (col: Column<any>) => (props: any) => (
    <FilterHeader
      column={col}
      filterValue={filters[col.key as string] ?? ""}
      onFilterChange={handleFilterChange}
    />
  );

  const cols: Column<any>[] = [
    {
      key: "VoucherNo",
      name: "Voucher No",
      width: 130,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="font-semibold text-[#004687] text-xs">{row.VoucherNo}</span>
      ),
    },
    {
      key: "VoucherDate",
      name: "Voucher Date",
      width: 120,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.VoucherDate ?? "—"}</span>
      ),
    },
    {
      key: "Type",
      name: "Type",
      width: 110,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-700">{row.Type ?? "—"}</span>
      ),
    },
    {
      key: "VoucherAmount",
      name: "Amount",
      width: 130,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-800 tabular-nums">
          {row.VoucherAmount != null
            ? Number(row.VoucherAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "—"}
        </span>
      ),
    },
    {
      key: "Narration",
      name: "Narration",
      minWidth: 160,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500 truncate">{row.Narration ?? "—"}</span>
      ),
    },
    {
      key: "ChequeNo",
      name: "Cheque No",
      width: 120,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ChequeNo ?? "—"}</span>
      ),
    },
    {
      key: "ChequeDate",
      name: "Cheque Date",
      width: 120,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ChequeDate ?? "—"}</span>
      ),
    },
    {
      key: "CreatedOn",
      name: "Created On",
      width: 120,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.CreatedOn ?? "—"}</span>
      ),
    },
    {
      key: "UserName",
      name: "Created By",
      width: 130,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.UserName ?? "—"}</span>
      ),
    },
    {
      key: "Approve",
      name: "Status",
      width: 130,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => <StatusBadge label={row.Approve ?? "Pending"} />,
    },
    {
      key: "ApprovedBy",
      name: "Approved By",
      width: 130,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ApprovedBy ?? "—"}</span>
      ),
    },
    {
      key: "ApprovedDate",
      name: "Approved Date",
      width: 120,
      renderHeaderCell: undefined as any,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ApprovedDate ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      name: "Actions",
      width: 100,
      resizable: false,
      renderHeaderCell: () => (
        <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Actions
        </div>
      ),
      renderCell: ({ row }) => (
        <ActionsCell row={row} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];

  // Attach filter headers to all filterable columns (all except actions)
  return cols.map((col) => {
    if (col.key === "actions") return col;
    return { ...col, renderHeaderCell: fh(col) };
  });
}

// ─── ContraEntry ──────────────────────────────────────────────────────────────
export default function ContraEntry() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasMounted = useRef(false);

  // ── View state: "list" | "create" ─────────────────────────────────────────
  const [view, setView] = useState<"list" | "create">("list");

  // ── Redux state ────────────────────────────────────────────────────────────
  const { contraList, contraListLoading, contraListError } = useSelector(
    (state: RootState) => state.contraEntry
  );

  // ── Filter bar state ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(fiscalStart());
  const [toDate, setToDate] = useState(today());
  const [selectedItem, setSelectedItem] = useState("");

  // ── Column-level filter state ──────────────────────────────────────────────
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const handleFilterChange = useCallback((key: string, value: string) => {
    setColFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Mount: initial fetch ───────────────────────────────────────────────────
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    dispatch(fetchContraDetailsByDate({ fromDate, toDate }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search button ──────────────────────────────────────────────────────────
  const handleSearch = () => {
    dispatch(fetchContraDetailsByDate({
      fromDate,
      toDate,
      searchStr: selectedItem || undefined,
    }));
  };

  // ── Row actions ────────────────────────────────────────────────────────────
  const handleView = (row: any) => navigate(`/accounts/contra-entry/${row.VoucherNo}`);
  const handleEdit = (row: any) => navigate(`/accounts/contra-entry/edit/${row.VoucherNo}`);
  const handleDelete = (_row: any) => {
    // wire up delete thunk here
  };

  const columns = buildColumns(
    colFilters,
    handleFilterChange,
    handleView,
    handleEdit,
    handleDelete
  );

  // ── Render CreateContraEntry inline when view === "create" ─────────────────
  if (view === "create") {
    return <CreateContraEntry onBack={() => setView("list")} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Contra Entry"
        subtitle="Accounts · Cash & Bank Transfers"
        icon={<ArrowLeftRight size={16} className="text-white" />}
        createButtonLabel="Create Contra Voucher"
        showCreateButton
        onCreateClick={() => setView("create")}
      />

      {/* Filters + Table */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">
        <PageFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={[]}
          itemsLoading={false}
          loading={contraListLoading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={contraList}
          rowKey="VoucherID"
          loading={contraListLoading}
          error={contraListError}
          loadingLabel="Fetching contra entries…"
          rowHeight={36}
          headerRowHeight={58}
        />
      </div>
    </div>
  );
}
