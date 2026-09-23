"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import {
  SlidersHorizontal,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateGeneralPreference from "../../components/Creategeneralpreference";
import type { AppDispatch, RootState } from "@/store";
import { fetchAllGeneralPreference } from "../../store/features/settings/systemsetup/generalpreferenceSlice";

const ITEMS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreferenceRow {
  id: string;
  moduleName: string;
  functionName: string;
}

// ─── Column Definitions ─────────────────────────────────────────────────────

function getColumns(onEdit: (row: PreferenceRow) => void): Column<PreferenceRow>[] {
  return [
    {
      key: "moduleName",
      name: "Module Name",
      width: 240,
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => (
        <span className="font-semibold text-[11px] tracking-wide text-slate-500 uppercase">
          {row.moduleName}
        </span>
      ),
    },
    {
      key: "functionName",
      name: "Function Name",
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => <span className="text-slate-700">{row.functionName}</span>,
    },
    {
      key: "actions",
      name: "Actions",
      width: 90,
      renderCell: ({ row }) => <ActionsCell row={row} onEdit={() => onEdit(row)} />,
    },
  ];
}

export default function GeneralPreference() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    generalPreferenceList,
    generalPreferenceListLoading,
    generalPreferenceListError,
  } = useSelector((state: RootState) => state.generalPreference);

  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    dispatch(fetchAllGeneralPreference());
  }, [dispatch]);

  const allRows: PreferenceRow[] = useMemo(
    () =>
      generalPreferenceList.map((item) => ({
        id: String(item.PreferenceID),
        moduleName: item.ModuleName,
        functionName: item.FunctionName,
      })),
    [generalPreferenceList]
  );

  const columns = useMemo(
    () =>
      getColumns((row) => {
        // TODO: open an edit dialog / inline editor for this preference's value.
        console.log("Edit preference:", row);
      }),
    []
  );

  const totalEntries = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const rows = allRows.slice(startIndex, startIndex + itemsPerPage);

  const rangeStart = rows.length ? startIndex + 1 : 0;
  const rangeEnd = startIndex + rows.length;

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  }

  if (showCreate) {
    return <CreateGeneralPreference onBack={() => setShowCreate(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="GENERAL PREFERENCE"
        subtitle="System-wide module preferences"
        icon={<SlidersHorizontal size={16} className="text-white" />}
        showCreateButton={true}
        createButtonLabel="General Preference"
        onCreateClick={() => setShowCreate(true)}
      />

      <div className="p-5 space-y-3">
        {/* ── Table ───────────────────────────────────────────────────── */}
        {generalPreferenceListLoading ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Loading preferences…
          </div>
        ) : generalPreferenceListError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {generalPreferenceListError}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey="id" />
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => goToPage(1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronLeft size={14} />
            </Button>

            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={() => goToPage(Number(pageInput) || 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToPage(Number(pageInput) || 1);
              }}
              className="h-8 w-12 text-center text-xs"
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">/ {totalPages}</span>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
              className="h-8 w-8 bg-white"
            >
              <ChevronsRight size={14} />
            </Button>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                goToPage(1);
              }}
              className="h-8 rounded-md border border-slate-200 bg-white text-xs px-2 text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#004687]/30 cursor-pointer"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500 whitespace-nowrap">items per page</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {rows.length
              ? `${rangeStart} - ${rangeEnd} of ${totalEntries} items`
              : "No entries found"}
          </div>
        </div>
      </div>
    </div>
  );
}
