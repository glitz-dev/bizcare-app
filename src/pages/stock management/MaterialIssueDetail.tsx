"use client";

import { useState, useCallback } from "react";
import { type Column } from "react-data-grid";
import { ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader, StatusBadge, ActionsCell } from "../../common/DataTable";

// --> NEW IMPORT ADDED HERE
// Adjust the path if your component is in a different folder
import CreateMaterialIssueDetail from "../../components/CreateMaterialIssueDetail";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MaterialIssueRow {
  DocNo: string;
  DocName: string;
  Date: string;
  FromStore: string;
  ToStore: string;
  IssuedQty: number;
  StockStatus: string;
  CreatedBy: string;
  Status: string;
  ApprovedBy: string;
  CreatedDate: string;
  ApprovedDate: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROWS: MaterialIssueRow[] = [
  {
    DocNo: "MI-2026-001",
    DocName: "Issue to Production",
    Date: "18-05-2026",
    FromStore: "Main Warehouse",
    ToStore: "Production Floor",
    IssuedQty: 120,
    StockStatus: "Issued",
    CreatedBy: "Rajan K.",
    Status: "Approved",
    ApprovedBy: "Suresh M.",
    CreatedDate: "18-05-2026",
    ApprovedDate: "19-05-2026",
  },
  {
    DocNo: "MI-2026-002",
    DocName: "Issue to Assembly",
    Date: "20-05-2026",
    FromStore: "Raw Materials Store",
    ToStore: "Assembly Unit",
    IssuedQty: 45,
    StockStatus: "Pending",
    CreatedBy: "Priya N.",
    Status: "Pending",
    ApprovedBy: "—",
    CreatedDate: "20-05-2026",
    ApprovedDate: "—",
  },
  {
    DocNo: "MI-2026-003",
    DocName: "Spare Parts Issue",
    Date: "22-05-2026",
    FromStore: "Spare Parts Store",
    ToStore: "Maintenance Dept",
    IssuedQty: 8,
    StockStatus: "Issued",
    CreatedBy: "Anil T.",
    Status: "Completed",
    ApprovedBy: "Rajan K.",
    CreatedDate: "22-05-2026",
    ApprovedDate: "22-05-2026",
  },
  {
    DocNo: "MI-2026-004",
    DocName: "Packing Materials",
    Date: "25-05-2026",
    FromStore: "Packing Store",
    ToStore: "Dispatch",
    IssuedQty: 300,
    StockStatus: "Partial",
    CreatedBy: "Meena S.",
    Status: "Partial",
    ApprovedBy: "Suresh M.",
    CreatedDate: "25-05-2026",
    ApprovedDate: "25-05-2026",
  },
  {
    DocNo: "MI-2026-005",
    DocName: "Chemical Issue",
    Date: "01-06-2026",
    FromStore: "Chemical Store",
    ToStore: "Lab",
    IssuedQty: 15,
    StockStatus: "Issued",
    CreatedBy: "Rajan K.",
    Status: "Approved",
    ApprovedBy: "Vijay P.",
    CreatedDate: "01-06-2026",
    ApprovedDate: "02-06-2026",
  },
  {
    DocNo: "MI-2026-006",
    DocName: "Electrical Components",
    Date: "05-06-2026",
    FromStore: "Main Warehouse",
    ToStore: "Electrical Dept",
    IssuedQty: 60,
    StockStatus: "Pending",
    CreatedBy: "Anita R.",
    Status: "Pending",
    ApprovedBy: "—",
    CreatedDate: "05-06-2026",
    ApprovedDate: "—",
  },
];

// ─── Columns ──────────────────────────────────────────────────────────────────
function buildColumns(
  onView: (row: MaterialIssueRow) => void,
  onEdit: (row: MaterialIssueRow) => void,
  onDelete: (row: MaterialIssueRow) => void
): Column<MaterialIssueRow>[] {
  const fh = (name: string, key: string) => ({
    name,
    key,
    renderHeaderCell: (props: any) => (
      <FilterHeader
        column={{ name, key }}
        filterValue={props.filterValue ?? ""}
        onFilterChange={props.onFilterChange ?? (() => {})}
      />
    ),
  });

  return [
    { ...fh("Doc No.", "DocNo"), width: 110, frozen: true },
    { ...fh("Doc Name", "DocName"), width: 180 },
    { ...fh("Date", "Date"), width: 110 },
    { ...fh("From Store", "FromStore"), width: 160 },
    { ...fh("To Store", "ToStore"), width: 160 },
    {
      ...fh("Issued Qty", "IssuedQty"),
      width: 110,
      renderCell: ({ row }: { row: MaterialIssueRow }) => (
        <span className="font-semibold text-slate-700 tabular-nums">
          {row.IssuedQty.toLocaleString()}
        </span>
      ),
    },
    {
      ...fh("Stock Status", "StockStatus"),
      width: 130,
      renderCell: ({ row }: { row: MaterialIssueRow }) => (
        <StatusBadge label={row.StockStatus} />
      ),
    },
    { ...fh("Created By", "CreatedBy"), width: 130 },
    {
      ...fh("Status", "Status"),
      width: 110,
      renderCell: ({ row }: { row: MaterialIssueRow }) => (
        <StatusBadge label={row.Status} />
      ),
    },
    { ...fh("Approved By", "ApprovedBy"), width: 130 },
    { ...fh("Created Date", "CreatedDate"), width: 120 },
    { ...fh("Approved Date", "ApprovedDate"), width: 130 },
    {
      key: "actions",
      name: "Actions",
      width: 100,
      frozen: false,
      resizable: false,
      renderHeaderCell: () => (
        <div className="flex flex-col gap-1 py-1 px-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Actions
          </div>
          <div className="h-6" />
        </div>
      ),
      renderCell: ({ row }: { row: MaterialIssueRow }) => (
        <ActionsCell
          row={row}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaterialIssueDetail() {
  const navigate = useNavigate();

  // --> NEW STATE ADDED HERE
  const [isCreating, setIsCreating] = useState(false);

  // Filter state
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(fmt(oneMonthAgo));
  const [toDate, setToDate] = useState(fmt(today));
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MaterialIssueRow[]>(MOCK_ROWS);

  // Handlers
  const handleSearch = useCallback(() => {
    setLoading(true);
    // Replace with real dispatch / API call
    setTimeout(() => {
      setRows(MOCK_ROWS);
      setLoading(false);
    }, 800);
  }, []);

  const handleView = useCallback((row: MaterialIssueRow) => {
    console.log("View", row);
  }, []);

  const handleEdit = useCallback((row: MaterialIssueRow) => {
    navigate(`/material-issue/edit/${row.DocNo}`);
  }, [navigate]);

  const handleDelete = useCallback((row: MaterialIssueRow) => {
    console.log("Delete", row);
  }, []);

  const columns = buildColumns(handleView, handleEdit, handleDelete);

  // --> NEW CONDITIONAL RENDERING ADDED HERE
  // If the user clicks "Create", we show the creation component instead of the list
  if (isCreating) {
    return (
      <CreateMaterialIssueDetail 
        onBack={() => setIsCreating(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <PageHeader
        title="Material Issue Detail"
        subtitle="Inventory · Stock Transfer"
        icon={<ArrowLeftRight size={16} className="text-white" />}
        createButtonLabel="Create Material Issue"
        showCreateButton
        onCreateClick={() => setIsCreating(true)} // --> UPDATED HERE
      />

      {/* ── Body ── */}
      <div className="p-4 flex flex-col gap-3">

        {/* ── Filters (inline — no item dropdown needed for this page) ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-sm border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#004687]/30 bg-white"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-sm border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#004687]/30 bg-white"
              />
            </div>

            {/* Search */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-8 px-5 bg-[#004687] hover:bg-[#003a70] disabled:opacity-60 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching…
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="DocNo"
          loading={loading}
          loadingLabel="Fetching material issues…"
        />
      </div>
    </div>
  );
}
