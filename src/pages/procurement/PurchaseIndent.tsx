"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  CalendarDays,
  Package,
  ArrowUpDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IndentRow {
  id: string;
  indentNo: string;
  indentDate: string;
  document: string;
  qty: number;
  category: string;
  subCategory: string;
  remarks: string;
  requestedBy: string;
  status: "Pending" | "Approved" | "Rejected" | "Ordered";
  approvedBy: string;
  poStatus: "Pending" | "Created" | "Partial" | "Completed";
  salesOrder: string;
  createdDate: string;
  createdBy: string;
}

const mockData: IndentRow[] = [
  { id: "1", indentNo: "PI-2026-0041", indentDate: "18-03-2026", document: "DOC-001", qty: 50, category: "Raw Material", subCategory: "Chemicals", remarks: "Urgent", requestedBy: "Arjun Nair", status: "Approved", approvedBy: "Rahul Menon", poStatus: "Created", salesOrder: "SO-2026-0012", createdDate: "18-03-2026", createdBy: "Priya K" },
  { id: "2", indentNo: "PI-2026-0042", indentDate: "19-03-2026", document: "DOC-002", qty: 120, category: "Packaging", subCategory: "Boxes", remarks: "Monthly stock", requestedBy: "Sneha Pillai", status: "Pending", approvedBy: "—", poStatus: "Pending", salesOrder: "—", createdDate: "19-03-2026", createdBy: "Arun T" },
  { id: "3", indentNo: "PI-2026-0043", indentDate: "20-03-2026", document: "DOC-003", qty: 30, category: "Spare Parts", subCategory: "Mechanical", remarks: "Machine repair", requestedBy: "Vinod R", status: "Rejected", approvedBy: "Rahul Menon", poStatus: "Pending", salesOrder: "—", createdDate: "20-03-2026", createdBy: "Priya K" },
  { id: "4", indentNo: "PI-2026-0044", indentDate: "20-03-2026", document: "DOC-004", qty: 200, category: "Raw Material", subCategory: "Plastics", remarks: "—", requestedBy: "Meera S", status: "Ordered", approvedBy: "Rahul Menon", poStatus: "Completed", salesOrder: "SO-2026-0015", createdDate: "20-03-2026", createdBy: "Arun T" },
];

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
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", statusStyles[label] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
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

export default function PurchaseIndent() {
  const [fromDate, setFromDate] = useState("18-03-2026");
  const [toDate, setToDate] = useState("20-03-2026");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [searched, setSearched] = useState(true);
  const [data] = useState<IndentRow[]>(mockData);

  const columns = ["Indent No.", "Indent Date", "Document", "Qty", "Category", "Sub Category", "Remarks", "Requested By", "Status", "Approved By", "PO Status", "Sales Order", "Created Date", "Created By", "Actions"];

  return (
    <TooltipProvider>
      {/* Root: never wider than its parent, no horizontal overflow */}
      <div style={{ maxWidth: "100%", overflowX: "hidden" }} className="bg-slate-50 font-sans">

        {/* Header — fits 100% width */}
        <div className="bg-[#004687] px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 shrink">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Package size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm tracking-wide uppercase truncate">Purchase Indent</h1>
              <p className="text-blue-200 text-[10px] tracking-widest uppercase">Bizcare ERP · Procurement</p>
            </div>
          </div>
          <Button className="bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs h-8 px-3 rounded-lg shadow-none gap-1.5 shrink-0 whitespace-nowrap">
            <Plus size={13} />
            Create New Purchase Indent
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">

          {/* Filter bar — CSS grid so inputs shrink to fit, never push wider */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <div className="grid gap-3 items-end" style={{ gridTemplateColumns: "1fr 1fr 2fr auto" }}>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <CalendarDays size={10} /> From Date
                </label>
                <Input
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 text-sm border-slate-200 rounded-lg w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <CalendarDays size={10} /> To Date
                </label>
                <Input
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 text-sm border-slate-200 rounded-lg w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Package size={10} /> Item
                </label>
                <div className="relative">
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="plastics">Plastics</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="mechanical">Mechanical Parts</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedItem && (
                    <button onClick={() => setSelectedItem("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSearched(true)}
                  className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap"
                >
                  <Search size={12} /> Search
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:text-[#004687]">
                      <SlidersHorizontal size={13} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Advanced filters</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Table card — fits the screen, inner table scrolls horizontally */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm" style={{ maxWidth: "100%", overflow: "hidden" }}>

            {/* Toolbar — no scroll */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                {searched ? `${data.length} records found` : "Run a search to view records"}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 rounded-md px-2">
                  {fromDate} → {toDate}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-md">
                  <SlidersHorizontal size={12} />
                </Button>
              </div>
            </div>

            {/* Only THIS div scrolls horizontally */}
            <div style={{ overflowX: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap px-3 py-2.5 first:pl-4">
                        <div className="flex items-center gap-1">
                          {col}
                          {col !== "Actions" && <ChevronDown size={10} className="text-slate-300" />}
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
                  {searched && data.length > 0 ? (
                    data.map((row, i) => (
                      <TableRow key={row.id} className={cn("hover:bg-blue-50/40 transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                        <TableCell className="px-3 py-2 pl-4 whitespace-nowrap">
                          <span className="text-[#004687] font-semibold text-xs">{row.indentNo}</span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.indentDate}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.document}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 font-medium">{row.qty}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.category}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.subCategory}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-500 italic whitespace-nowrap">{row.remarks}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.requestedBy}</TableCell>
                        <TableCell className="px-3 py-2"><StatusBadge label={row.status} /></TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.approvedBy}</TableCell>
                        <TableCell className="px-3 py-2"><StatusBadge label={row.poStatus} /></TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.salesOrder}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.createdDate}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{row.createdBy}</TableCell>
                        <TableCell className="px-3 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs w-36 rounded-xl shadow-lg border-slate-100">
                              <DropdownMenuItem className="gap-2 text-xs rounded-lg cursor-pointer">
                                <Eye size={13} className="text-[#004687]" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-xs rounded-lg cursor-pointer">
                                <Pencil size={13} className="text-amber-500" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-xs rounded-lg cursor-pointer text-red-500 focus:text-red-500">
                                <Trash2 size={13} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-14">
                        <div className="flex flex-col items-center gap-2">
                          <ArrowUpDown size={26} className="text-slate-200" />
                          <p className="text-sm font-medium text-slate-400">No records found</p>
                          <p className="text-xs text-slate-300">Adjust your filters and search again</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination — no scroll */}
            {searched && data.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Showing <span className="font-semibold text-slate-600">1–{data.length}</span> of{" "}
                  <span className="font-semibold text-slate-600">{data.length}</span> results
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((p) => (
                    <button key={p} className={cn("w-7 h-7 rounded-lg text-xs font-semibold transition-colors", p === 1 ? "bg-[#004687] text-white" : "text-slate-400 hover:bg-slate-100")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}