import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentStartWith,
  fetchPaymentTypeStartWith,
  fetchUserTableColumn,
  fetchInvoiceTaxTypeDetails,
  fetchCurrencyStartWith,
  fetchServiceBillList,
  fetchAllSuppliers,
  fetchSalesListForServiceBill,
  fetchPurchaseListForServiceBill,
  fetchTaxRates,
  fetchAccountHeads,
  setSelectedDocument,
  setSelectedInvoiceTaxType,
  setSelectedPaymentType,
  setSelectedCurrency,
  setSelectedSupplier,
  setSelectedAccountHead,
  type ServiceBillListItem,
  type SalesForServiceBillItem,
  type SalesPurchaseForServiceBillItem,
  type TaxRate,
  type AccountHead,
} from "../store/features/inventory/procurement/serviceBillSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FileText,
  Hash,
  Calendar,
  Building2,
  Tag,
  Receipt,
  CreditCard,
  RefreshCw,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  BarChart2,
  ShoppingCart,
  Eye,
  DollarSign,
  Percent,
  Globe,
  ArrowLeft,
  MessageSquare,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  PackageX,
  ListChecks,
  IndianRupee,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";
import { DataTable, FilterHeader, StatusBadge } from "../common/DataTable";
import type { Column } from "react-data-grid";


// ─── Show Bills Modal ─────────────────────────────────────────────────────────
interface ShowBillsModalProps {
  open: boolean;
  onClose: () => void;
  bills: ServiceBillListItem[];
  loading: boolean;
  error: string | null;
  onAdd: (selected: ServiceBillListItem[]) => void;
}

const makeBillColumns = (
  selectedIds: Set<number>,
  toggleSelect: (id: number) => void
): Column<ServiceBillListItem>[] => [
  {
    key: "rowAscNum",
    name: "#",
    width: 55,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "rowAscNum", name: "#" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
        {row.rowAscNum}
      </span>
    ),
  },
  {
    key: "InvoiceNo",
    name: "Invoice No",
    width: 120,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "InvoiceNo", name: "Invoice No" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="font-semibold text-[#004687] text-[12px]">{row.InvoiceNo}</span>
    ),
  },
  {
    key: "InvoiceDate",
    name: "Date",
    width: 120,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "InvoiceDate", name: "Date" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="flex items-center gap-1.5 text-slate-600 text-[12px]">
        <Calendar size={11} className="text-[#004687]/50" />
        {row.InvoiceDate}
      </span>
    ),
  },
  {
    key: "PartyName",
    name: "Supplier",
    minWidth: 160,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "PartyName", name: "Supplier" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="flex items-center gap-1.5 text-slate-700 text-[12px]">
        <Building2 size={11} className="text-[#004687]/50 shrink-0" />
        {row.PartyName}
      </span>
    ),
  },
  {
    key: "SupInvoiceNo",
    name: "Sup Invoice No",
    width: 140,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "SupInvoiceNo", name: "Sup Invoice No" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="text-slate-600 text-[12px]">{row.SupInvoiceNo || "—"}</span>
    ),
  },
  {
    key: "GrossAmount",
    name: "Gross Amount",
    width: 130,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "GrossAmount", name: "Gross Amount" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="flex items-center justify-end gap-1 text-[12px] font-semibold text-slate-700 tabular-nums w-full pr-2">
        <IndianRupee size={10} className="text-slate-400" />
        {row.GrossAmount.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    key: "NetAmount",
    name: "Net Amount",
    width: 130,
    renderHeaderCell: (props: any) => (
      <FilterHeader column={{ key: "NetAmount", name: "Net Amount" }} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
    ),
    renderCell: ({ row }) => (
      <span className="flex items-center justify-end gap-1 text-[12px] font-bold text-[#004687] tabular-nums w-full pr-2">
        <IndianRupee size={10} className="text-[#004687]/60" />
        {row.NetAmount.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    key: "select" as any,
    name: "Select",
    width: 80,
    renderCell: ({ row }) => {
      const isSelected = selectedIds.has(row.ServiceBillID);
      return (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => toggleSelect(row.ServiceBillID)}
            title="Select this bill"
            className={`group relative flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-200 ease-out active:scale-95 shadow-sm
              ${isSelected
                ? "bg-[#004687] border-[#004687] shadow-[0_0_0_3px_rgba(0,70,135,0.2)]"
                : "border-[#004687]/30 bg-white hover:border-[#004687] hover:bg-[#004687]/10"}`}
          >
            <CheckCircle2
              size={14}
              className={isSelected ? "text-white" : "text-[#004687]/60 group-hover:text-[#004687] transition-colors duration-200"}
            />
          </button>
        </div>
      );
    },
  },
];

function ShowBillsModal({ open, onClose, bills, loading, error, onAdd }: ShowBillsModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  // Reset selection when modal opens/closes
  React.useEffect(() => { if (!open) setSelectedIds(new Set()); }, [open]);

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = () => {
    const selected = bills.filter((b) => selectedIds.has(b.ServiceBillID));
    if (selected.length === 0) return;
    onAdd(selected);
    onClose();
  };

  const totalGross = bills.reduce((s, b) => s + b.GrossAmount, 0);
  const totalNet = bills.reduce((s, b) => s + b.NetAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-full p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-0">
          <div className="bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
                <ListChecks size={16} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-white font-bold text-[15px] tracking-wide m-0">
                  SHOW BILLS
                </DialogTitle>
                <p className="text-white/60 text-[10px] tracking-wider mt-0.5">
                  Service Bill Records
                </p>
              </div>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <ReceiptText size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">{bills.length} Bills</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <IndianRupee size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">
                  Net: {totalNet.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
          {[
            { label: "Total Bills", value: bills.length, icon: <ListChecks size={14} className="text-[#004687]" /> },
            { label: "Gross Total", value: `₹${totalGross.toLocaleString("en-IN")}`, icon: <ReceiptText size={14} className="text-amber-500" /> },
            { label: "Net Total", value: `₹${totalNet.toLocaleString("en-IN")}`, icon: <IndianRupee size={14} className="text-emerald-600" /> },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 px-5 py-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-[14px] font-bold text-slate-700 tabular-nums">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="p-4 bg-slate-50/30 max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-[#004687]">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-[13px] font-medium text-slate-500">Loading bills...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 gap-2 text-red-500">
              <span className="text-[13px] font-medium">{error}</span>
            </div>
          ) : bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <ListChecks size={28} />
              <span className="text-[13px] font-medium">No bills found</span>
            </div>
          ) : (
            <DataTable
              columns={makeBillColumns(selectedIds, toggleSelect)}
              rows={bills}
              rowKey="ServiceBillID"
              rowHeight={38}
              headerRowHeight={60}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckSquare size={11} className="text-[#004687]/50" />
            {selectedIds.size > 0
              ? `${selectedIds.size} bill${selectedIds.size > 1 ? "s" : ""} selected`
              : "Select bills to link to the service entry"}
          </p>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="h-8 px-5 text-[12px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Add
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Show Sales Modal ─────────────────────────────────────────────────────────

interface ShowSalesModalProps {
  open: boolean;
  onClose: () => void;
  salesItems: SalesForServiceBillItem[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSearch: () => void;
  onAdd: (selected: SalesForServiceBillItem[]) => void;
}

function ShowSalesModal({
  open,
  onClose,
  salesItems,
  loading,
  error,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onAdd,
}: ShowSalesModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  React.useEffect(() => { if (!open) setSelectedIds(new Set()); }, [open]);

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = () => {
    const selected = salesItems.filter((r) => selectedIds.has(r.VoucherID));
    if (selected.length === 0) return;
    onAdd(selected);
    onClose();
  };

  const totalNet = salesItems.reduce((s, r) => s + r.NetAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-full p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl">

        {/* ── Header ── */}
        <DialogHeader className="p-0">
          <div className="bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-white font-bold text-[15px] tracking-wide m-0">
                  SALES
                </DialogTitle>
                <p className="text-white/60 text-[10px] tracking-wider mt-0.5">
                  Sales Records for Service Bill
                </p>
              </div>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <ReceiptText size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">{salesItems.length} Records</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <IndianRupee size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">
                  Net: {totalNet.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Date filter strip ── */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-end gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              <Calendar size={11} className="text-emerald-600" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              <Calendar size={11} className="text-emerald-600" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                transition-all"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={loading}
            className="h-9 px-5 rounded-lg text-[13px] font-semibold bg-[#004687] hover:bg-[#0062b8] text-white flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Eye size={13} />}
            Search
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
          {[
            {
              label: "Total Records",
              value: salesItems.length,
              icon: <ListChecks size={14} className="text-emerald-600" />,
            },
            {
              label: "Unique Customers",
              value: new Set(salesItems.map((r) => r.PartyName)).size,
              icon: <Building2 size={14} className="text-[#004687]" />,
            },
            {
              label: "Net Total",
              value: `₹${totalNet.toLocaleString("en-IN")}`,
              icon: <IndianRupee size={14} className="text-emerald-600" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 px-5 py-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-[14px] font-bold text-slate-700 tabular-nums">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-slate-50/30 max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-emerald-600">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-[13px] font-medium text-slate-500">Loading sales records...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[13px] font-medium text-red-500">{error}</span>
            </div>
          ) : salesItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <TrendingUp size={28} />
              <span className="text-[13px] font-medium">No sales records found</span>
              <span className="text-[11px] text-slate-300">Try adjusting the date range and searching again</span>
            </div>
          ) : (
            <table className="w-full text-[12px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#004687]/5 border-b border-[#004687]/10">
                  {["#", "Bill No", "Date", "Customer", "Net Amount", "Select"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] font-bold text-[#004687]/70 uppercase tracking-wider whitespace-nowrap last:text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesItems.map((row, idx) => (
                  <tr
                    key={row.VoucherID}
                    className={`border-b border-slate-100 transition-colors group hover:bg-emerald-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCEAF7] text-[10px] font-bold text-[#004687]">
                        {row.rowAscNum}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-[#004687]">{row.InvoiceNo}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={11} className="text-emerald-500/60" />
                        {row.InvoiceDate}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Building2 size={11} className="text-[#004687]/40 shrink-0" />
                        {row.PartyName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-700">
                      <span className="flex items-center justify-end gap-1">
                        <IndianRupee size={10} className="text-slate-400" />
                        {row.NetAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleSelect(row.VoucherID)}
                        title="Select this record"
                        className={`group/btn inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-150 shadow-sm active:scale-95
                          ${selectedIds.has(row.VoucherID)
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:border-emerald-600"}`}
                      >
                        <CheckCircle2
                          size={14}
                          className={selectedIds.has(row.VoucherID) ? "text-white" : "text-emerald-500 group-hover/btn:text-white transition-colors duration-150"}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckSquare size={11} className="text-emerald-500/60" />
            {selectedIds.size > 0
              ? `${selectedIds.size} record${selectedIds.size > 1 ? "s" : ""} selected`
              : "Select sales records to link to the service bill"}
          </p>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="h-8 px-5 text-[12px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Add
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Show Purchase Modal ──────────────────────────────────────────────────────

interface ShowPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  purchaseItems: SalesPurchaseForServiceBillItem[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSearch: () => void;
  onAdd: (selected: SalesPurchaseForServiceBillItem[]) => void;
}

function ShowPurchaseModal({
  open,
  onClose,
  purchaseItems,
  loading,
  error,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onAdd,
}: ShowPurchaseModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  React.useEffect(() => { if (!open) setSelectedIds(new Set()); }, [open]);

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = () => {
    const selected = purchaseItems.filter((r) => selectedIds.has(r.VoucherID));
    if (selected.length === 0) return;
    onAdd(selected);
    onClose();
  };

  const totalNet = purchaseItems.reduce((s, r) => s + r.NetAmount, 0);
  const uniqueSuppliers = new Set(purchaseItems.map((r) => r.PartyName)).size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-full p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl">

        {/* ── Header ── */}
        <DialogHeader className="p-0">
          <div className="bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
                <ShoppingCart size={16} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-white font-bold text-[15px] tracking-wide m-0">
                  PURCHASE
                </DialogTitle>
                <p className="text-white/60 text-[10px] tracking-wider mt-0.5">
                  Purchase Records for Service Bill
                </p>
              </div>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <ReceiptText size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">{purchaseItems.length} Records</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <IndianRupee size={12} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">
                  Net: {totalNet.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Date filter strip ── */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-end gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              <Calendar size={11} className="text-indigo-500" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              <Calendar size={11} className="text-indigo-500" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                transition-all"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={loading}
            className="h-9 px-5 rounded-lg text-[13px] font-semibold bg-[#004687] hover:bg-[#0062b8] text-white flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Eye size={13} />}
            Search
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
          {[
            {
              label: "Total Records",
              value: purchaseItems.length,
              icon: <ListChecks size={14} className="text-indigo-600" />,
            },
            {
              label: "Unique Suppliers",
              value: uniqueSuppliers,
              icon: <Building2 size={14} className="text-[#004687]" />,
            },
            {
              label: "Net Total",
              value: `₹${totalNet.toLocaleString("en-IN")}`,
              icon: <IndianRupee size={14} className="text-indigo-600" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 px-5 py-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-[14px] font-bold text-slate-700 tabular-nums">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-slate-50/30 max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-indigo-600">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-[13px] font-medium text-slate-500">Loading purchase records...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[13px] font-medium text-red-500">{error}</span>
            </div>
          ) : purchaseItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <ShoppingCart size={28} />
              <span className="text-[13px] font-medium">No purchase records found</span>
              <span className="text-[11px] text-slate-300">Try adjusting the date range and searching again</span>
            </div>
          ) : (
            <table className="w-full text-[12px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#004687]/5 border-b border-[#004687]/10">
                  {["#", "Bill No", "Date", "Supplier", "Supplier Bill No", "Net Amount", "Select"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] font-bold text-[#004687]/70 uppercase tracking-wider whitespace-nowrap last:text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseItems.map((row, idx) => (
                  <tr
                    key={row.VoucherID}
                    className={`border-b border-slate-100 transition-colors group hover:bg-indigo-50/40 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                        {row.rowAscNum}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-[#004687]">{row.InvoiceNo}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={11} className="text-indigo-400/60" />
                        {row.InvoiceDate}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Building2 size={11} className="text-[#004687]/40 shrink-0" />
                        {row.PartyName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-slate-600">{row.SupInvoiceNo || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-700">
                      <span className="flex items-center justify-end gap-1">
                        <IndianRupee size={10} className="text-slate-400" />
                        {row.NetAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleSelect(row.VoucherID)}
                        title="Select this record"
                        className={`group/btn inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-150 shadow-sm active:scale-95
                          ${selectedIds.has(row.VoucherID)
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-indigo-200 bg-indigo-50 hover:bg-indigo-600 hover:border-indigo-600"}`}
                      >
                        <CheckCircle2
                          size={14}
                          className={selectedIds.has(row.VoucherID) ? "text-white" : "text-indigo-500 group-hover/btn:text-white transition-colors duration-150"}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckSquare size={11} className="text-indigo-500/60" />
            {selectedIds.size > 0
              ? `${selectedIds.size} record${selectedIds.size > 1 ? "s" : ""} selected`
              : "Select purchase records to link to the service bill"}
          </p>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="h-8 px-5 text-[12px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Add
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: number;
  item: string;
  hsn: string;
  crDr: string;
  pRate: string;
  taxPercent: string;
  taxAmt: string;
  sgst: string;
  cgst: string;
  igst: string;
  utgst: string;
  sgstAmt: string;
  cgstAmt: string;
  igstAmt: string;
}

const defaultItem: LineItem = {
  id: 1,
  item: "",
  hsn: "",
  crDr: "Debit",
  pRate: "",
  taxPercent: "",
  taxAmt: "",
  sgst: "",
  cgst: "",
  igst: "",
  utgst: "",
  sgstAmt: "",
  cgstAmt: "",
  igstAmt: "",
};

// ─── Reusable Field Components ───────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: SelectFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
        <span className="text-[#004687]">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-9 px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
            appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
}: InputFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
        <span className="text-[#004687]">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          placeholder:text-slate-300 read-only:bg-slate-50 read-only:text-slate-400 transition-all"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceBillDetail({ onBack }: { onBack?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();

  // ─── Redux State ────────────────────────────────────────────────────────────
  const {
    documentList,
    selectedDocument,
    documentLoading,
    paymentTypeList,
    selectedPaymentType,
    invoiceTaxTypeList,
    selectedInvoiceTaxType,
    currencyList,
    selectedCurrency,
    currencyLoading,
    serviceBillList,
    serviceBillListLoading,
    serviceBillListError,
    supplierList,
    selectedSupplier,
    supplierLoading,
    salesItemList,
    salesItemListLoading,
    salesItemListError,
    purchaseItemList,
    purchaseItemListLoading,
    purchaseItemListError,
    taxRateList,
    taxRateLoading,
    accountHeadList,
    selectedAccountHead,
    accountHeadLoading,
  } = useSelector((state: RootState) => state.serviceBill);

  // ─── Local Form State ───────────────────────────────────────────────────────
  const [purchaseDate, setPurchaseDate] = useState("2026-05-06");
  const [supplyInvoiceDate, setSupplyInvoiceDate] = useState("");
  const [supplyInvoiceNo, setSupplyInvoiceNo] = useState("");
  const [gstReverse, setGstReverse] = useState(false);
  const [roundOff, setRoundOff] = useState(false);
  const [salesPurchase, setSalesPurchase] = useState("");
  const [tdsHead, setTdsHead] = useState("");
  const [tdsHeadOpen, setTdsHeadOpen] = useState(false);
  const [tdsHeadSearch, setTdsHeadSearch] = useState("");
  const [tdsPercent, setTdsPercent] = useState("");
  const [tdsApplicable, setTdsApplicable] = useState("");
  const [tdsAmount, setTdsAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...defaultItem }]);
  const [paymentTypeOpen, setPaymentTypeOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [showBillsOpen, setShowBillsOpen] = useState(false);
  const [showSalesOpen, setShowSalesOpen] = useState(false);
  const [showPurchaseOpen, setShowPurchaseOpen] = useState(false);

  // Track which row's Tax % popover is open (null = none)
  const [taxPopoverRowId, setTaxPopoverRowId] = useState<number | null>(null);

  // Sales modal date range — default: last 30 days → today
  const todayISO = new Date().toISOString().split("T")[0];
  const thirtyDaysAgoISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [salesStartDate, setSalesStartDate] = useState(thirtyDaysAgoISO);
  const [salesEndDate, setSalesEndDate] = useState(todayISO);

  // Purchase modal date range — default: last 30 days → today
  const [purchaseStartDate, setPurchaseStartDate] = useState(thirtyDaysAgoISO);
  const [purchaseEndDate, setPurchaseEndDate] = useState(todayISO);

  // ─── Derived autofill values ───────────────────────────────────────────────
  const document_ = selectedDocument?.DocumentName ?? "";
  const purchaseNo = selectedDocument
    ? `${selectedDocument.Prefix}-${selectedDocument.StartingNo}`
    : "";
  const exchangeRate = selectedDocument ? String(selectedDocument.ExchRate) : "1";

  // ─── On Mount: fetch all APIs ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDocumentStartWith());
    dispatch(fetchPaymentTypeStartWith());
    dispatch(fetchUserTableColumn());
    dispatch(fetchCurrencyStartWith());
    dispatch(fetchAllSuppliers());
    dispatch(fetchAccountHeads());
  }, [dispatch]);

  // ─── Fetch service bill list when popup opens ──────────────────────────────
  useEffect(() => {
    if (showBillsOpen) {
      dispatch(fetchServiceBillList());
    }
  }, [dispatch, showBillsOpen]);

  // ─── Fetch invoice tax types once we have a selected document ──────────────
  useEffect(() => {
    if (selectedDocument?.DocumentID) {
      dispatch(fetchInvoiceTaxTypeDetails({ documentID: selectedDocument.DocumentID }));
    }
  }, [dispatch, selectedDocument?.DocumentID]);

  const addRow = () =>
    setLineItems((prev) => [...prev, { ...defaultItem, id: Date.now() }]);

  const removeRow = (id: number) =>
    setLineItems((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: number, field: keyof LineItem, value: string) =>
    setLineItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  // ─── Totals ────────────────────────────────────────────────────────────────
  const grossAmount = lineItems.reduce(
    (sum, r) => sum + (parseFloat(r.pRate) || 0),
    0
  );
  const totalTax = lineItems.reduce(
    (sum, r) => sum + (parseFloat(r.taxAmt) || 0),
    0
  );
  const preNet = grossAmount + totalTax;
  const tdsAmt = parseFloat(tdsAmount) || 0;
  const netAmount = preNet - tdsAmt;

  const fmt = (n: number, d = 2) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  const handleClear = () => {
    const defaultDoc = documentList.find((d) => d.SetDefault) ?? documentList[0] ?? null;

    dispatch(setSelectedDocument(defaultDoc));
    dispatch(setSelectedPaymentType(paymentTypeList[0] ?? null));
    dispatch(setSelectedInvoiceTaxType(invoiceTaxTypeList[0] ?? null));

    // Prefer Rupees as default currency
    const rupees = currencyList.find(c => c.Currency === "Rupees" || c.CurrencyID === 4);
    dispatch(setSelectedCurrency(rupees ?? currencyList[0] ?? null));

    // Reset other fields...
    dispatch(setSelectedSupplier(null));
    dispatch(setSelectedAccountHead(null));
    setTdsHeadSearch("");
    setSupplyInvoiceDate("");
    setSupplyInvoiceNo("");
    setGstReverse(false);
    setRoundOff(false);
    setSalesPurchase("");
    setTdsHead("");
    setTdsPercent("");
    setTdsApplicable("");
    setTdsAmount("");
    setRemarks("");
    setLineItems([{ ...defaultItem }]);
  };

  // ─── Open Tax % popover for a row; fetch rates on first open ──────────────
  const handleTaxPercentClick = (rowId: number) => {
    setTaxPopoverRowId((prev) => (prev === rowId ? null : rowId));
    if (taxRateList.length === 0) {
      dispatch(fetchTaxRates());
    }
  };

  const handleTaxRateSelect = (rowId: number, rate: TaxRate) => {
    updateRow(rowId, "taxPercent", String(rate.TaxValue));
    setTaxPopoverRowId(null);
  };

  // ─── Open Sales modal + trigger fetch ──────────────────────────────────────
  const handleOpenSales = () => {
    if (!selectedSupplier) {
      toast.warning("Please select a supplier first.", {
        description: "A supplier must be selected before viewing sales records.",
        style: {
          background: '#a8325a', 
          color: '#FFFFFF',
          borderLeft: '4px solid #ffff',
        }
      });
      return;
    }
    setShowSalesOpen(true);
    dispatch(
      fetchSalesListForServiceBill({
        startDate: salesStartDate,
        endDate: salesEndDate,
        supplierID: selectedSupplier.SupplierID,
      })
    );
  };

  // ─── Re-search with current date filters ───────────────────────────────────
  const handleSalesSearch = () => {
    dispatch(
      fetchSalesListForServiceBill({
        startDate: salesStartDate,
        endDate: salesEndDate,
        supplierID: selectedSupplier?.SupplierID ?? 0,
      })
    );
  };

  // ─── Open Purchase modal + trigger fetch ────────────────────────────────────
  const handleOpenPurchase = () => {
    if (!selectedSupplier) {
      toast.warning("Please select a supplier first.", {
        description: "A supplier must be selected before viewing purchase records.",
        style: {
          background: '#a8325a',
          color: '#FFFFFF',
          borderLeft: '4px solid #ffff',
        }
      });
      return;
    }
    setShowPurchaseOpen(true);
    dispatch(
      fetchPurchaseListForServiceBill({
        startDate: purchaseStartDate,
        endDate: purchaseEndDate,
        supplierID: selectedSupplier.SupplierID,
      })
    );
  };

  // ─── Re-search purchase with current date filters ───────────────────────────
  const handlePurchaseSearch = () => {
    dispatch(
      fetchPurchaseListForServiceBill({
        startDate: purchaseStartDate,
        endDate: purchaseEndDate,
        supplierID: selectedSupplier?.SupplierID ?? 0,
      })
    );
  };

  // ─── Map selected bills/sales/purchase rows → LineItems and append ──────────
  const handleAddFromBills = (selected: ServiceBillListItem[]) => {
    const newRows: LineItem[] = selected.map((b) => ({
      id: Date.now() + Math.random(),
      item: b.ItemName ?? b.InvoiceNo ?? "",
      hsn: "",
      crDr: "Debit",
      pRate: String(b.NetAmount),
      taxPercent: String(b.TaxPercentage ?? ""),
      taxAmt: "",
      sgst: String(b.SGSTPer ?? ""),
      cgst: String(b.CGSTPer ?? ""),
      igst: String(b.IGSTPer ?? ""),
      utgst: String(b.UTGTPer ?? ""),
      sgstAmt: "",
      cgstAmt: "",
      igstAmt: "",
    }));
    setLineItems((prev) => {
      // If the only row is an empty default row, replace it
      const isOnlyDefault =
        prev.length === 1 && prev[0].item === "" && prev[0].pRate === "";
      return isOnlyDefault ? newRows : [...prev, ...newRows];
    });
  };

  const handleAddFromSales = (selected: SalesForServiceBillItem[]) => {
    const newBillNos = selected.map((r) => r.InvoiceNo).join(", ");
    setSalesPurchase((prev) =>
      prev.trim() ? `${prev}, ${newBillNos}` : newBillNos
    );
  };

  const handleAddFromPurchase = (selected: SalesPurchaseForServiceBillItem[]) => {
    const newBillNos = selected.map((r) => r.InvoiceNo).join(", ");
    setSalesPurchase((prev) =>
      prev.trim() ? `${prev}, ${newBillNos}` : newBillNos
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="font-[system-ui,sans-serif]">
      <ShowBillsModal
        open={showBillsOpen}
        onClose={() => setShowBillsOpen(false)}
        bills={serviceBillList}
        loading={serviceBillListLoading}
        error={serviceBillListError}
        onAdd={handleAddFromBills}
      />
      <ShowSalesModal
        open={showSalesOpen}
        onClose={() => setShowSalesOpen(false)}
        salesItems={salesItemList}
        loading={salesItemListLoading}
        error={salesItemListError}
        startDate={salesStartDate}
        endDate={salesEndDate}
        onStartDateChange={setSalesStartDate}
        onEndDateChange={setSalesEndDate}
        onSearch={handleSalesSearch}
        onAdd={handleAddFromSales}
      />
      <ShowPurchaseModal
        open={showPurchaseOpen}
        onClose={() => setShowPurchaseOpen(false)}
        purchaseItems={purchaseItemList}
        loading={purchaseItemListLoading}
        error={purchaseItemListError}
        startDate={purchaseStartDate}
        endDate={purchaseEndDate}
        onStartDateChange={setPurchaseStartDate}
        onEndDateChange={setPurchaseEndDate}
        onSearch={handlePurchaseSearch}
        onAdd={handleAddFromPurchase}
      />
      <div className="bg-white border border-slate-200 shadow-md overflow-hidden">

        {/* ── Top Header Bar ── */}
        <div className="bg-[#004687] px-5 py-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">SERVICE BILL</p>
              <p className="text-white/60 text-[10px] tracking-wider uppercase">
                Service Bill Management
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={13} color="#fff" />
            Back to List
          </button>
        </div>

        <div className="p-5 space-y-4 bg-slate-50/30">

          {/* ── General Form Card ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] border-b border-[#004687]/20">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                <FileText size={13} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-white uppercase tracking-wide">
                General
              </span>
            </div>

            <div className="p-4 space-y-4 pb-3">

              {/* Row 1: Document | Purchase No | Purchase Date | Supplier */}
              <div className="grid grid-cols-4 gap-4">
                <SelectField
                  label="Document"
                  icon={<FileText size={11} />}
                  value={document_}
                  onChange={(val) => {
                    const doc = documentList.find((d) => d.DocumentName === val) ?? null;
                    dispatch(setSelectedDocument(doc));
                  }}
                  options={documentList.map((d) => ({
                    value: d.DocumentName,
                    label: d.DocumentName,
                  }))}
                  disabled={documentLoading}
                />
                <InputField
                  label="Purchase No."
                  icon={<Hash size={11} />}
                  value={purchaseNo}
                  readOnly
                />
                <InputField
                  label="Purchase Date"
                  icon={<Calendar size={11} />}
                  value={purchaseDate}
                  onChange={setPurchaseDate}
                  type="date"
                />
                {/* Supplier — searchable dropdown */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687]"><Building2 size={11} /></span>
                    Supplier
                  </label>
                  <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={supplierOpen}
                        disabled={supplierLoading}
                        className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg justify-between font-normal hover:bg-white focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 disabled:opacity-50"
                      >
                        <span className={cn(!selectedSupplier && "text-slate-400")}>
                          {supplierLoading
                            ? "Loading suppliers..."
                            : (selectedSupplier?.SupplierName ?? "Select Supplier")}
                        </span>
                        <ChevronDown size={13} className="text-slate-400 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search supplier..." className="h-8 text-[13px]" />
                        <CommandList>
                          <CommandEmpty className="py-3 text-center text-[12px] text-slate-500">
                            No supplier found.
                          </CommandEmpty>
                          <CommandGroup>
                            {supplierList.map((s) => (
                              <CommandItem
                                key={s.SupplierID}
                                value={s.SupplierName}
                                onSelect={() => {
                                  dispatch(setSelectedSupplier(s));
                                  setSupplierOpen(false);
                                }}
                                className="text-[13px] cursor-pointer"
                              >
                                <Check
                                  size={13}
                                  className={cn(
                                    "mr-2 shrink-0",
                                    selectedSupplier?.SupplierID === s.SupplierID
                                      ? "opacity-100 text-[#004687]"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{s.SupplierName}</span>
                                  {s.SupplierCode && (
                                    <span className="text-[11px] text-slate-400">{s.SupplierCode}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row 2: Supply Type | Sup Invoice Date | Sup Invoice No | Payment Type */}
              <div className="grid grid-cols-4 gap-4 items-start">
                <SelectField
                  label="Supply Type"
                  icon={<Globe size={11} />}
                  value={selectedInvoiceTaxType?.InvoiceTaxType ?? ""}
                  onChange={(val) => {
                    const found = invoiceTaxTypeList.find((t) => t.InvoiceTaxType === val) ?? null;
                    dispatch(setSelectedInvoiceTaxType(found));
                  }}
                  options={invoiceTaxTypeList.map((t) => ({
                    value: t.InvoiceTaxType,
                    label: t.InvoiceTaxType,
                  }))}
                />
                <InputField
                  label="Supply Invoice Date"
                  icon={<Calendar size={11} />}
                  value={supplyInvoiceDate}
                  onChange={setSupplyInvoiceDate}
                  type="date"
                />
                <InputField
                  label="Supply Invoice No."
                  icon={<Receipt size={11} />}
                  value={supplyInvoiceNo}
                  onChange={setSupplyInvoiceNo}
                  placeholder="Supply Invoice No"
                />

                {/* Payment Type + Toggles */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687]"><CreditCard size={11} /></span>
                    Payment Type
                  </label>
                  <div className="mb-2.5">
                    <Popover open={paymentTypeOpen} onOpenChange={setPaymentTypeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={paymentTypeOpen}
                          className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg justify-between font-normal hover:bg-white focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                        >
                          <span className={cn(!selectedPaymentType && "text-slate-400")}>
                            {selectedPaymentType?.PaymentTypeName ?? "Select Payment Type"}
                          </span>
                          <ChevronDown size={13} className="text-slate-400 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search payment type..." className="h-8 text-[13px]" />
                          <CommandList>
                            <CommandEmpty className="py-3 text-center text-[12px] text-slate-500">
                              No payment type found.
                            </CommandEmpty>
                            <CommandGroup>
                              {paymentTypeList.map((p) => (
                                <CommandItem
                                  key={p.PaymentTypeID}
                                  value={p.PaymentTypeName}
                                  onSelect={() => {
                                    dispatch(setSelectedPaymentType(p));
                                    setPaymentTypeOpen(false);
                                  }}
                                  className="text-[13px] cursor-pointer"
                                >
                                  <Check
                                    size={13}
                                    className={cn(
                                      "mr-2 shrink-0",
                                      selectedPaymentType?.PaymentTypeID === p.PaymentTypeID
                                        ? "opacity-100 text-[#004687]"
                                        : "opacity-0"
                                    )}
                                  />
                                  {p.PaymentTypeName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { label: "GST Reverse", val: gstReverse, set: setGstReverse },
                      { label: "Round Off", val: roundOff, set: setRoundOff },
                    ].map(({ label, val, set }) => (
                      <label
                        key={label}
                        className="flex items-center gap-1.5 cursor-pointer select-none text-[12px] text-slate-600 font-medium"
                        onClick={() => set((p) => !p)}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all
                            ${val ? "bg-[#004687] border-[#004687]" : "bg-white border-slate-300 hover:border-sky-400"}`}
                        >
                          {val && (
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-white stroke-[2.5]">
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          )}
                        </div>
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Sales/Purchase | Currency | Exchange Rate */}
              <div className="grid grid-cols-4 gap-4 pb-1">
                <div className="col-span-2">
                  <InputField
                    label="Selected Sales, Purchase Or Workorder"
                    icon={<Tag size={11} />}
                    value={salesPurchase}
                    onChange={setSalesPurchase}
                    placeholder="Selected Sales And Purchase"
                  />
                </div>

                <SelectField
                  label="Currency"
                  icon={<DollarSign size={11} />}
                  value={selectedCurrency?.Currency ?? ""}
                  onChange={(val) => {
                    const curr = currencyList.find((c) => c.Currency === val) ?? null;
                    dispatch(setSelectedCurrency(curr));
                  }}
                  options={currencyList.map((c) => ({
                    value: c.Currency,
                    label: c.Currency,
                  }))}
                  disabled={currencyLoading}
                  placeholder="Select Currency"
                />

                <InputField
                  label="Exchange Rate"
                  icon={<RefreshCw size={11} />}
                  value={exchangeRate}
                  readOnly
                />
              </div>

              {/* Quick-action buttons */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => setShowBillsOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all bg-[#004687]/8 text-[#004687] hover:bg-[#004687]/15 border-[#004687]/20 cursor-pointer"
                >
                  <Eye size={13} />
                  Show Bills
                </button>
                {[
                  { label: "Sales", icon: BarChart2, cls: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200", onClick: handleOpenSales },
                  { label: "Purchase", icon: ShoppingCart, cls: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200", onClick: handleOpenPurchase },
                ].map(({ label, icon: Ic, cls, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer ${cls}`}
                  >
                    <Ic size={13} />
                    {label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* ── Line Items Card ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] border-b border-[#004687]/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <ReceiptText size={13} className="text-white" />
                </div>
                <span className="text-[13px] font-semibold text-white uppercase tracking-wide">
                  Line Items
                </span>
              </div>
              <button
                onClick={addRow}
                className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-white/30 cursor-pointer cursor-pointer"
              >
                <Plus size={11} /> Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#004687]/5 border-b border-[#004687]/10">
                    {[
                      { label: "Sl.", w: "w-10" },
                      { label: "Item", w: "min-w-[180px]" },
                      { label: "HSN", w: "w-24" },
                      { label: "Cr/Dr", w: "w-20" },
                      { label: "P.Rate", w: "w-24" },
                      { label: "Tax %", w: "w-16" },
                      { label: "Tax Amt", w: "w-20" },
                      { label: "SGST %", w: "w-16" },
                      { label: "CGST %", w: "w-16" },
                      { label: "IGST %", w: "w-16" },
                      { label: "UTGST %", w: "w-16" },
                      { label: "SGST Amt", w: "w-20" },
                      { label: "CGST Amt", w: "w-20" },
                      { label: "IGST Amt", w: "w-20" },
                      { label: "", w: "w-8" },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`${col.w} px-2 py-2.5 text-left font-bold tracking-wider text-[#004687]/70 whitespace-nowrap`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition-colors group ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        } hover:bg-sky-50/30`}
                    >
                      <td className="px-2 py-1.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-1 py-1.5">
                        <input
                          value={row.item}
                          onChange={(e) => updateRow(row.id, "item", e.target.value)}
                          placeholder="Select Item"
                          className="h-7 w-full px-2 text-[12px] text-slate-700 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300"
                        />
                      </td>

                      <td className="px-1 py-1.5">
                        <input
                          value={row.hsn}
                          onChange={(e) => updateRow(row.id, "hsn", e.target.value)}
                          placeholder="HSN"
                          className="h-7 w-full px-2 text-[12px] text-slate-700 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300"
                        />
                      </td>

                      <td className="px-1 py-1.5">
                        <select
                          value={row.crDr}
                          onChange={(e) => updateRow(row.id, "crDr", e.target.value)}
                          className="h-7 w-full px-1.5 text-[12px] text-slate-700 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all"
                        >
                          <option>Debit</option>
                          <option>Credit</option>
                        </select>
                      </td>

                      {(
                        [
                          ["pRate", "0.00"],
                        ] as [keyof LineItem, string][]
                      ).map(([field, ph]) => (
                        <td key={field} className="px-1 py-1.5">
                          <input
                            value={row[field] as string}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            placeholder={ph}
                            className="h-7 w-full px-2 text-[12px] text-right text-slate-700 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300"
                          />
                        </td>
                      ))}

                      {/* ── Tax % — popover dropdown ── */}
                      <td className="px-1 py-1.5 relative">
                        <Popover
                          open={taxPopoverRowId === row.id}
                          onOpenChange={(open) => {
                            if (!open) setTaxPopoverRowId(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              onClick={() => handleTaxPercentClick(row.id)}
                              className={cn(
                                "h-7 w-full px-2 text-[12px] text-right border rounded-md bg-white flex items-center justify-between gap-1 transition-all",
                                taxPopoverRowId === row.id
                                  ? "border-sky-400 ring-1 ring-sky-400"
                                  : "border-slate-200 hover:border-sky-300",
                                row.taxPercent ? "text-slate-700" : "text-slate-300"
                              )}
                            >
                              <span className="flex-1 text-right tabular-nums">
                                {row.taxPercent !== "" ? `${row.taxPercent}%` : "0"}
                              </span>
                              <ChevronDown
                                size={10}
                                className={cn(
                                  "shrink-0 text-slate-400 transition-transform",
                                  taxPopoverRowId === row.id && "rotate-180"
                                )}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="bottom"
                            align="start"
                            className="w-52 p-0 shadow-lg border border-slate-200 rounded-lg overflow-hidden"
                          >
                            {taxRateLoading ? (
                              <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                                <RefreshCw size={12} className="animate-spin" />
                                <span className="text-[11px]">Loading rates…</span>
                              </div>
                            ) : taxRateList.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-slate-400">
                                No tax rates found
                              </div>
                            ) : (
                              <div className="max-h-52 overflow-y-auto">
                                {taxRateList.map((rate) => (
                                  <button
                                    key={rate.TaxCategoryId}
                                    onClick={() => handleTaxRateSelect(row.id, rate)}
                                    className={cn(
                                      "w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors hover:bg-sky-50",
                                      row.taxPercent === String(rate.TaxValue)
                                        ? "bg-[#004687]/5 text-[#004687] font-semibold"
                                        : "text-slate-700"
                                    )}
                                  >
                                    <span className="truncate">{rate.TaxCategoryName}</span>
                                    <span className="ml-2 shrink-0 tabular-nums font-medium text-[#004687]">
                                      {rate.TaxValue}%
                                    </span>
                                    {row.taxPercent === String(rate.TaxValue) && (
                                      <Check size={11} className="ml-1.5 shrink-0 text-[#004687]" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </td>

                      {(
                        [
                          ["taxAmt", "0.00"],
                          ["sgst", "0"],
                          ["cgst", "0"],
                          ["igst", "0"],
                          ["utgst", "0"],
                          ["sgstAmt", "0.00"],
                          ["cgstAmt", "0.00"],
                          ["igstAmt", "0.00"],
                        ] as [keyof LineItem, string][]
                      ).map(([field, ph]) => (
                        <td key={field} className="px-1 py-1.5">
                          <input
                            value={row[field] as string}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            placeholder={ph}
                            className="h-7 w-full px-2 text-[12px] text-right text-slate-700 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300"
                          />
                        </td>
                      ))}

                      <td className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={15} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <PackageX size={28} />
                          <span className="text-[12px] font-medium text-slate-400">No items added yet</span>
                          <button
                            onClick={addRow}
                            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004687]/8 text-[#004687] text-[11px] font-semibold hover:bg-[#004687]/15 transition-all cursor-pointer"
                          >
                            <Plus size={11} /> Add first item
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TDS Details Card ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] border-b border-[#004687]/20">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                <Percent size={13} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-white uppercase tracking-wide">
                TDS Details
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {/* TDS Account Head — searchable dropdown */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687]"><Landmark size={11} /></span>
                    TDS Account Head
                  </label>
                  <Popover open={tdsHeadOpen} onOpenChange={setTdsHeadOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full h-9 px-3 text-[13px] border rounded-lg bg-white flex items-center justify-between gap-2 transition-all",
                          tdsHeadOpen
                            ? "border-sky-400 ring-2 ring-sky-500/30"
                            : "border-slate-200 hover:border-sky-300",
                          selectedAccountHead ? "text-slate-700" : "text-slate-300"
                        )}
                      >
                        <span className="truncate text-left flex-1">
                          {selectedAccountHead ? selectedAccountHead.HeadName || `Head #${selectedAccountHead.HeadID}` : "Select TDS Head"}
                        </span>
                        {accountHeadLoading
                          ? <RefreshCw size={12} className="animate-spin text-slate-400 shrink-0" />
                          : <ChevronDown size={13} className={cn("text-slate-400 shrink-0 transition-transform", tdsHeadOpen && "rotate-180")} />
                        }
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-72 p-0 shadow-lg border border-slate-200 rounded-lg overflow-hidden">
                      <Command>
                        <CommandInput
                          placeholder="Search account head…"
                          value={tdsHeadSearch}
                          onValueChange={setTdsHeadSearch}
                          className="text-[12px]"
                        />
                        <CommandList className="max-h-52">
                          <CommandEmpty className="py-4 text-center text-[11px] text-slate-400">
                            No account heads found
                          </CommandEmpty>
                          <CommandGroup>
                            {accountHeadList
                              .filter(h =>
                                (h.HeadName || "").toLowerCase().includes(tdsHeadSearch.toLowerCase())
                              )
                              .map(head => (
                                <CommandItem
                                  key={head.HeadID}
                                  value={head.HeadName || String(head.HeadID)}
                                  onSelect={() => {
                                    dispatch(setSelectedAccountHead(head));
                                    setTdsHeadOpen(false);
                                    setTdsHeadSearch("");
                                  }}
                                  className="flex items-center justify-between px-3 py-2 text-[12px] cursor-pointer"
                                >
                                  <span className={cn(
                                    "truncate",
                                    selectedAccountHead?.HeadID === head.HeadID ? "font-semibold text-[#004687]" : "text-slate-700"
                                  )}>
                                    {head.HeadName || `(unnamed)`}
                                  </span>
                                  {selectedAccountHead?.HeadID === head.HeadID && (
                                    <Check size={12} className="shrink-0 text-[#004687]" />
                                  )}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <InputField
                  label="TDS (%)"
                  icon={<Percent size={11} />}
                  value={tdsPercent}
                  onChange={setTdsPercent}
                  placeholder="TDS %"
                />
                <InputField
                  label="TDS Applicable On"
                  icon={<Tag size={11} />}
                  value={tdsApplicable}
                  onChange={setTdsApplicable}
                  placeholder="TDS Applicable"
                />
                <InputField
                  label="TDS Amount"
                  icon={<DollarSign size={11} />}
                  value={tdsAmount}
                  onChange={setTdsAmount}
                  placeholder="Total TDS"
                />
              </div>
            </div>
          </div>

          {/* ── Bottom: Remarks + Totals ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Remarks */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="w-6 h-6 rounded-md bg-[#004687]/10 flex items-center justify-center">
                  <MessageSquare size={13} className="text-[#004687]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">
                  Remarks
                </span>
              </div>
              <div className="p-4">
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter Remarks, If Any"
                  rows={4}
                  className="w-full px-3 py-2.5 text-[13px] text-slate-700 bg-transparent border border-slate-200 rounded-lg resize-none
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                    placeholder:text-slate-300 transition-all"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-[#004687]/20 bg-gradient-to-br from-[#004687]/5 to-sky-50/40 shadow-sm p-4 flex flex-col gap-2">
              {[
                { label: "Gross Amount", value: fmt(grossAmount), icon: <ReceiptText size={12} /> },
                { label: "Total Tax", value: fmt(totalTax, 3), icon: <Percent size={12} /> },
                { label: "Pre Net Amount", value: fmt(preNet, 3), icon: <TrendingDown size={12} /> },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100"
                >
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                    <span className="text-[#004687]/60">{r.icon}</span>
                    {r.label}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-slate-700 w-28 text-right">
                    {r.value}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004687]/10 flex items-center justify-center">
                    <Landmark size={18} className="text-[#004687]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Net Amount
                    </p>
                    <p className="text-2xl font-bold text-[#004687] tabular-nums">
                      ₹{fmt(netAmount, 3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <SlidersHorizontal size={10} /> Service Bill Management
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="h-9 px-5 text-[13px] font-medium border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 rounded-lg gap-1.5 flex items-center transition-colors"
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button className="h-9 px-6 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg gap-1.5 flex items-center transition-colors cursor-pointer">
              <Save size={13} /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
