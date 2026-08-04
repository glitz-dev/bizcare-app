import { useMemo, useState } from "react";
import type { Column } from "react-data-grid";
import { Landmark, Search } from "lucide-react";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, StatusBadge, ActionsCell, FilterHeader } from "../../common/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";

// ─── Static demo data (UI only) ────────────────────────────────────────────
interface BankRow {
  id: number;
  bank: string;
  address: string;
  status: "Active" | "InActive";
}

const BANK_ROWS: BankRow[] = [
  { id: 1, bank: "New Bank44", address: "", status: "Active" },
  { id: 2, bank: "testnew1", address: "", status: "Active" },
  { id: 3, bank: "MANAPPURAM", address: "", status: "Active" },
  { id: 4, bank: "NEW BANK3", address: "", status: "Active" },
  { id: 5, bank: "NEW BANK2", address: "", status: "Active" },
  { id: 6, bank: "New Bank", address: "", status: "Active" },
];

export default function Bank() {
  const [isCreating, setIsCreating] = useState(false);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "bank",
        name: "Bank",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="font-medium text-slate-700">{row.bank || "—"}</span>
        ),
      },
      {
        key: "address",
        name: "Address",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="text-slate-600">{row.address || "—"}</span>
        ),
      },
      {
        key: "status",
        name: "Status",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderCell: ({ row }) => (
          <ActionsCell row={row} onEdit={() => {}} onDelete={() => {}} />
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Bank"
        subtitle="Bank Master"
        icon={<Landmark size={16} className="text-white" />}
        createButtonLabel="Create Bank"
        onCreateClick={() => setIsCreating(true)}
      />

      <div className="p-5 space-y-3">
        {/* ── Show entries / Search toolbar ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-16 text-xs border-slate-200 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs font-semibold text-slate-600">entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Search:</span>
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search"
                className="h-9 pl-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>
        </div>

        <DataTable columns={columns} rows={BANK_ROWS} rowKey="id" />
      </div>
    </div>
  );
}
