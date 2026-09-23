"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Column } from "react-data-grid";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreateParty from "../../components/Createparty";
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import { fetchAllParties, type PartyListItem } from "../../store/features/settings/systemsetup/partySlice";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BRAND = "#004687";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartyRow {
  id: string;
  code: string;
  party: string;
  partyCategory: string;
  address: string;
  country: string;
  phoneNo: string;
  gstNo: string;
  email: string;
  partyCredit: number;
  localOrOverseas: "Local" | "Overseas";
  status: "Active" | "InActive";
  lastActivityBy: string;
  lastActivityDate: string;
}

function PartyStatusBadge({ status }: { status: PartyRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        status === "Active"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-600 border-red-200"
      )}
    >
      {status}
    </span>
  );
}

// ─── Map API response (PartyListItem) to the table row shape ──────────────
function mapPartyListItemToRow(item: PartyListItem): PartyRow {
  return {
    id: String(item.PartyID),
    code: item.PartyCode ?? "",
    party: item.PartyName,
    partyCategory: item.PartyCategory,
    address: item.PartyAddress ?? "",
    country: item.Country ?? "",
    phoneNo: item.PhoneNo ?? "",
    gstNo: item.GSTIN ?? "",
    email: item.PartyEmail ?? "",
    partyCredit: item.PartyCreditLimitDays ?? 0,
    localOrOverseas: item.Local,
    status: item.Active,
    lastActivityBy: item.CreatedBy ?? "",
    lastActivityDate: item.CreatedOn ?? "",
  };
}

const columns: Column<PartyRow>[] = [
  {
    key: "code",
    name: "Code",
    width: 90,
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => (
      <span className="font-semibold text-slate-700">{row.code || "—"}</span>
    ),
  },
  {
    key: "party",
    name: "Party",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => (
      <span className="font-medium text-slate-700">{row.party || "—"}</span>
    ),
  },
  {
    key: "partyCategory",
    name: "Party Category",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
          row.partyCategory === "SUPPLIER"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-sky-50 text-sky-700 border-sky-200"
        )}
      >
        {row.partyCategory}
      </span>
    ),
  },
  {
    key: "address",
    name: "Address",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600 truncate">{row.address || "—"}</span>,
  },
  {
    key: "country",
    name: "Country",
    width: 100,
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.country || "—"}</span>,
  },
  {
    key: "phoneNo",
    name: "Phone No.",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600 truncate">{row.phoneNo || "—"}</span>,
  },
  {
    key: "gstNo",
    name: "GST No.",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.gstNo || "—"}</span>,
  },
  {
    key: "email",
    name: "Email",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.email || "—"}</span>,
  },
  {
    key: "partyCredit",
    name: "Party Credit",
    width: 110,
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600 tabular-nums">{row.partyCredit}</span>,
  },
  {
    key: "localOrOverseas",
    name: "Local/Overseas",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.localOrOverseas}</span>,
  },
  {
    key: "status",
    name: "Status",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <PartyStatusBadge status={row.status} />,
  },
  {
    key: "lastActivityBy",
    name: "Last Activity By",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.lastActivityBy || "—"}</span>,
  },
  {
    key: "lastActivityDate",
    name: "Last Activity Date",
    renderHeaderCell: (props) => (
      <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.lastActivityDate || "—"}</span>,
  },
  {
    key: "actions",
    name: "Actions",
    width: 100,
    renderCell: ({ row }) => <ActionsCell row={row} onEdit={() => {}} onDelete={() => {}} />,
  },
];

export default function Party() {
  const [view, setView] = useState<"list" | "create">("list");

  const dispatch = useDispatch<AppDispatch>();
  const partyList = useSelector((s: RootState) => s.party.partyList);
  const partyListLoading = useSelector((s: RootState) => s.party.partyListLoading);
  const partyListError = useSelector((s: RootState) => s.party.partyListError);

  useEffect(() => {
    dispatch(fetchAllParties());
  }, [dispatch]);

  const rows: PartyRow[] = partyList.map(mapPartyListItemToRow);

  if (view === "create") {
    return (
      <CreateParty
        onBack={() => setView("list")}
        onSubmit={(data) => {
          // TODO: persist the new party (call your create-party API),
          // then return to the list. The list itself now refreshes via
          // fetchAllParties() on mount.
          console.log("New party submitted:", data);
          setView("list");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="PARTY"
        subtitle="Manage suppliers and customers"
        icon={<Users size={16} className="text-white" />}
        createButtonLabel="CREATE PARTY"
        onCreateClick={() => setView("create")}
      />

      <div className="p-5 space-y-3">
        {/* ── Show entries / Search toolbar ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Show</span>
            <Select value="15">
              <SelectTrigger className="h-8 w-16 text-xs border-slate-200 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
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
                placeholder="Search party, code, address..."
                className="h-9 pl-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        {partyListLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white py-16 text-sm text-slate-500">
            Loading parties...
          </div>
        ) : partyListError ? (
          <div className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 py-16 text-sm text-red-600">
            {partyListError}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey="id" />
        )}

        {/* ── Pagination (visual only) ──────────────────────────────── */}
        <div className="flex items-center justify-between px-2">
          <div className="text-xs text-slate-500 font-medium">
            Showing 1 to {rows.length} of {rows.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="h-8 text-xs px-3 bg-white">
              <ChevronLeft size={14} className="mr-1" /> Prev
            </Button>
            <div className="text-xs font-semibold px-2 text-slate-600">Page 1 of 1</div>
            <Button variant="outline" size="sm" disabled className="h-8 text-xs px-3 bg-white">
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
