"use client";

import { useMemo, useState } from "react";
import type { Column } from "react-data-grid";
import { Wallet } from "lucide-react";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell } from "../../common/DataTable";
import GenerateCountercash from "@/components/GenerateCountercash";

const BRAND = "#004687";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CounterCashRow {
  id: string | number;
  machineCode: string;
  userName: string;
  shiftName: string;
  salesDate: string;
  description: string;
}

// TODO: Replace with real data from counterCashSlice (GetCounterCashDetails thunk)
// once the backend endpoint + slice conventions are confirmed. Left as local
// state here so the page can be wired up in a follow-up pass.
const SAMPLE_ROWS: CounterCashRow[] = [
  { id: 1, machineCode: "G1", userName: "Admin", shiftName: "Shift 1", salesDate: "03-02-2026", description: "" },
  { id: 2, machineCode: "M02", userName: "Admin", shiftName: "Shift 1", salesDate: "03-02-2026", description: "" },
  { id: 3, machineCode: "M02", userName: "Admin", shiftName: "General Shift", salesDate: "03-02-2026", description: "" },
  { id: 4, machineCode: "M1", userName: "Admin", shiftName: "Shift 1", salesDate: "03-02-2026", description: "" },
  { id: 5, machineCode: "M1", userName: "Admin", shiftName: "General Shift", salesDate: "08-06-2023", description: "" },
];

export default function CounterCash() {
  const [rows, setRows] = useState<CounterCashRow[]>(SAMPLE_ROWS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const machineOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.machineCode))),
    [rows]
  );
  const shiftOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.shiftName))),
    [rows]
  );
  const userOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.userName))),
    [rows]
  );

  const handleCloseEntry = (row: CounterCashRow) => {
    // TODO: wire to actual close/delete API thunk once endpoint is confirmed
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const columns: Column<CounterCashRow>[] = useMemo(
    () => [
      {
        key: "machineCode",
        name: "Machine Code",
        resizable: true,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <span className="font-semibold text-slate-700">{row.machineCode}</span>
        ),
      },
      {
        key: "userName",
        name: "UserName",
        resizable: true,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <span className="text-slate-600">{row.userName}</span>
        ),
      },
      {
        key: "shiftName",
        name: "Shift Name",
        resizable: true,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <span className="font-medium" style={{ color: BRAND }}>
            {row.shiftName}
          </span>
        ),
      },
      {
        key: "salesDate",
        name: "Sales Date",
        resizable: true,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <span className="text-slate-500">{row.salesDate}</span>
        ),
      },
      {
        key: "description",
        name: "Description",
        resizable: true,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <span className="text-slate-400 italic">{row.description || "—"}</span>
        ),
      },
      {
        key: "actions",
        name: "",
        width: 60,
        resizable: false,
        renderCell: ({ row }: { row: CounterCashRow }) => (
          <div className="flex items-center justify-center h-full">
            <ActionsCell row={row} onDelete={handleCloseEntry} />
          </div>
        ),
      },
    ],
    []
  );

  // Clicking "Open/Close Counter" swaps the list view for the
  // GenerateCountercash form; its own "Counter Cash Details" button
  // (onViewDetails) brings the list back.
  if (showGenerateForm) {
    return (
      <GenerateCountercash
        onViewDetails={() => setShowGenerateForm(false)}
        shiftOptions={shiftOptions}
        machineOptions={machineOptions}
        userOptions={userOptions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden border border-slate-100 shadow-sm">
        <PageHeader
          title="Counter Cash"
          subtitle="Cash Management"
          icon={<Wallet size={16} className="text-white" />}
          createButtonLabel="Open/Close Counter"
          onCreateClick={() => setShowGenerateForm(true)}
        />
      </div>

      <div className="px-3">
        <DataTable
        columns={columns}
        rows={rows}
        rowKey="id"
        loading={loading}
        error={error}
        loadingLabel="Loading counter cash entries…"
      />
      </div>
    </div>
  );
}
