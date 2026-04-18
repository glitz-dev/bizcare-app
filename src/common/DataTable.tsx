"use client";

import { DataGrid, type Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Eye, RefreshCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Pending:   "bg-amber-50 text-amber-700 border-amber-200",
  Approved:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected:  "bg-red-50 text-red-600 border-red-200",
  Ordered:   "bg-blue-50 text-blue-700 border-blue-200",
  Created:   "bg-blue-50 text-blue-700 border-blue-200",
  Partial:   "bg-violet-50 text-violet-700 border-violet-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        statusStyles[label] ?? "bg-slate-50 text-slate-600 border-slate-200"
      )}
    >
      {label}
    </span>
  );
}

// ─── Actions Cell ─────────────────────────────────────────────────────────────
export function ActionsCell({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: any;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-blue-50 text-blue-500 cursor-pointer"
              onClick={() => onView(row)}
            >
              <Eye size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">View Items</TooltipContent>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-amber-50 text-amber-500 cursor-pointer"
              onClick={() => onEdit(row)}
            >
              <Pencil size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
              onClick={() => onDelete(row)}
            >
              <Trash2 size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─── Filter Header ────────────────────────────────────────────────────────────
export function FilterHeader({
  column,
  filterValue,
  onFilterChange,
}: {
  column: Column<any>;
  filterValue: string;
  onFilterChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-1 px-2">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
        {column.name as string}
      </div>
      <Input
        placeholder="Filter..."
        value={filterValue}
        onChange={(e) => onFilterChange(column.key as string, e.target.value)}
        className="h-6 text-[10px] border-slate-200 bg-slate-50 placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-[#004687]/30"
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface DataTableProps {
  columns: Column<any>[];
  rows: any[];
  rowKey: string;
  loading?: boolean;
  error?: string | null;
  loadingLabel?: string;
  rowHeight?: number;
  headerRowHeight?: number;
}

// ─── DataTable ────────────────────────────────────────────────────────────────
export function DataTable({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  loadingLabel = "Loading…",
  rowHeight = 36,
  headerRowHeight = 58,
}: DataTableProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({});

  const columnsWithFilters: Column<any>[] = useMemo(
    () =>
      columns.map((col) => {
        if (!col.renderHeaderCell) return col;
        const original = col.renderHeaderCell;
        return {
          ...col,
          renderHeaderCell: (props: any) =>
            original({
              ...props,
              filterValue: filters[col.key as string] ?? "",
              onFilterChange: handleFilterChange,
            }),
        };
      }),
    [columns, filters]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        Object.entries(filters).every(([key, val]) => {
          if (!val) return true;
          return String(row[key] ?? "").toLowerCase().includes(val.toLowerCase());
        })
      ),
    [rows, filters]
  );

  // Memoized rowClass for performance + !important to beat react-data-grid styles
  const getRowClass = useMemo(() => {
    return (row: any, rowIndex: number) => (rowIndex % 2 === 1 ? "!bg-blue-50" : "");
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCcw size={22} className="text-slate-300 animate-spin" />
          <p className="text-sm font-medium text-slate-400">{loadingLabel}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-500">Error: {error}</p>
          <p className="text-xs text-slate-300 mt-1">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <DataGrid
        columns={columnsWithFilters}
        rows={filteredRows}
        rowKeyGetter={(row: any) => row[rowKey]}
        className="rdg"
        style={{ height: "auto", width: "100%" }}
        rowHeight={rowHeight}
        headerRowHeight={headerRowHeight}
        enableVirtualization
        rowClass={getRowClass}
      />

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-600">1–{filteredRows.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-slate-600">{rows.length}</span> results
        </p>
        {Object.values(filters).some((v) => v) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700"
          >
            <X size={13} />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}