// DataTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pencil,
  Trash2,
  ChevronDown,
  RefreshCcw,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-600 border-red-200",
  Ordered: "bg-blue-50 text-blue-700 border-blue-200",
  Created: "bg-blue-50 text-blue-700 border-blue-200",
  Partial: "bg-violet-50 text-violet-700 border-violet-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function StatusBadge({ label }: { label: string }) {
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

function ColFilter() {
  return (
    <Input
      placeholder="Filter..."
      className="h-7 text-[11px] rounded-md border-slate-200 bg-slate-50 placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-[#004687]/30"
    />
  );
}

interface DataTableProps {
  columns: string[];
  indentOrders: any[];
  loading: boolean;
  error: string | null;
  searched: boolean;
}

export function DataTable({
  columns,
  indentOrders,
  loading,
  error,
  searched,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
      <div style={{ overflowX: "auto" }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap px-3 py-2.5 first:pl-4"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {col !== "Actions" && (
                      <ChevronDown size={10} className="text-slate-300" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              {columns.map((col) => (
                <TableHead key={col} className="px-2 py-1.5 first:pl-3">
                  {col !== "Actions" ? <ColFilter /> : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-14">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw size={22} className="text-slate-300 animate-spin" />
                    <p className="text-sm font-medium text-slate-400">
                      Loading indent orders…
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-14">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold text-red-500">Error: {error}</p>
                    <p className="text-xs text-slate-300">Please try again</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : indentOrders.length > 0 ? (
              indentOrders.map((row, i) => (
                <TableRow
                  key={row.IndentID}
                  className={cn(
                    "hover:bg-blue-50/40 transition-colors",
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  )}
                >
                  <TableCell className="px-3 py-2 pl-4">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-amber-50 text-amber-500"
                          >
                            <Pencil size={13} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Edit
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-500"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Delete
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 whitespace-nowrap">
                    <span className="text-[#004687] font-semibold text-xs">
                      {row.IndentNo}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.IndentDate}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.DocumentName}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 font-medium">
                    {row.TotalQuantity}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.CategoryName}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.SubCategoryName}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-500 italic whitespace-nowrap">
                    {row.Remarks ?? "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.EmpName}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <StatusBadge label={row.Approve} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.ApprovedBY ?? "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <StatusBadge label={row.POStatus} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.SalesOrderNo ?? "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.CreatedDate}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {row.DepartmentName}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-14">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowUpDown size={26} className="text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">No records found</p>
                    <p className="text-xs text-slate-300">
                      Adjust your filters and search again
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {searched && indentOrders.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Showing <span className="font-semibold text-slate-600">1–{indentOrders.length}</span> of{" "}
            <span className="font-semibold text-slate-600">{indentOrders.length}</span> results
          </p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                  p === 1 ? "bg-[#004687] text-white" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}