"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers, fetchBanks, fetchPaymentTypes, fetchPaymentTerms, fetchPendingSalesQuotations, fetchProductDetails, fetchProductionItemDetail, fetchSalesOrderDocuments, fetchInvoiceTaxTypes, fetchDefaultStore, fetchStoreStartWith, fetchCurrencyList, fetchCustomerCodes } from "../store/features/inventory/sales/salesOrder";
import type { Bank, PaymentType, PaymentTerm, PendingSalesQuotation, ProductDetail, ProductionItemDetail, SalesOrderDocument, InvoiceTaxType, StoreStartWith, CurrencyStartWith, CustomerCodeItem } from "../store/features/inventory/sales/salesOrder";
import { DataGrid, type Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Hash,
  Calendar,
  User,
  Store,
  DollarSign,
  Truck,
  FileText,
  MapPin,
  Tag,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  Save,
  RefreshCw,
  Settings2,
  Receipt,
  StickyNote,
  CreditCard,
  ClipboardList,
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
  SlidersHorizontal,
  CalendarDays,
  Package,
  X,
  RefreshCcw,
  ClipboardCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LineItem {
  id: number;
  itemCode: string;
  item: string;
  sqm: string;
  quantity: string;
  unit: string;
  salesRate: string;
  grossAmt: string;
  discPct: string;
  discount: string;
  gstPct: string;
  gstAmt: string;
  netAmount: string;
  specification: string;
}

interface GstBreakdownRow {
  id: number;
  itemId: number | null;
  itemCode: string;
  item: string;
  image: string;
  sqm: string;
  quantity: string;
  unit: string;
  salesRate: string;
  grossAmt: string;
  discPct: string;
  discount: string;
  gstPct: string;
  gstAmt: string;
  netAmount: string;
  specification: string;
  sgstPct: string;
  cgstPct: string;
  igstPct: string;
  utgstPct: string;
  cessPct: string;
  sgstAmt: string;
  cgstAmt: string;
  igstAmt: string;
  utgstAmt: string;
  cessAmt: string;
}

const emptyGstRow = (): GstBreakdownRow => ({
  id: Date.now(),
  itemId: null,
  itemCode: "",
  item: "",
  image: "",
  sqm: "",
  quantity: "",
  unit: "",
  salesRate: "",
  grossAmt: "",
  discPct: "",
  discount: "",
  gstPct: "",
  gstAmt: "",
  netAmount: "",
  specification: "",
  sgstPct: "",
  cgstPct: "",
  igstPct: "",
  utgstPct: "",
  cessPct: "",
  sgstAmt: "",
  cgstAmt: "",
  igstAmt: "",
  utgstAmt: "",
  cessAmt: "",
});


const emptyLine = (): LineItem => ({
  id: Date.now(),
  itemCode: "",
  item: "",
  sqm: "",
  quantity: "",
  unit: "",
  salesRate: "",
  grossAmt: "",
  discPct: "",
  discount: "",
  gstPct: "",
  gstAmt: "",
  netAmount: "",
  specification: "",
});


// ─── Shared sub-components ───────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label
      className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5"
      style={{ color: BRAND }}
    >
      <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
      {label}
    </label>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none placeholder:text-gray-300 text-gray-700 font-medium"
        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = BRAND;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d1dff0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
        }}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
        {icon}
      </span>
    </div>
  );
}

function SelectField({
  icon,
  placeholder,
  options = [],
}: {
  icon: React.ReactNode;
  placeholder: string;
  options?: string[];
}) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-gray-700 font-medium"
        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = BRAND;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d1dff0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
        }}
        defaultValue=""
      >
        <option value="" disabled style={{ color: "#aab8c8" }}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
        {icon}
      </span>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#93b8d8" }}
      />
    </div>
  );
}

function AccordionLabel({
  icon: Icon,
  title,
  extra,
}: {
  icon: React.ElementType;
  title: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: BRAND_LIGHT }}
      >
        <Icon size={15} strokeWidth={2.2} style={{ color: BRAND }} />
      </div>
      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
        {title}
      </span>
      <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
      {extra}
    </div>
  );
}

// ─── DataTable status badge ───────────────────────────────────────────────────
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

// ─── FilterHeader (inline from DataTable.tsx) ─────────────────────────────────
function FilterHeader({
  column,
  filterValue,
  onFilterChange,
}: {
  column: { key: string; name: string };
  filterValue: string;
  onFilterChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-1 px-2">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
        {column.name}
      </div>
      <Input
        placeholder="Filter..."
        value={filterValue}
        onChange={(e) => onFilterChange(column.key, e.target.value)}
        className="h-6 text-[10px] border-slate-200 bg-slate-50 placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-[#004687]/30"
      />
    </div>
  );
}

// ─── Inline DataTable ─────────────────────────────────────────────────────────
function QuotationDataTable({
  columns,
  rows,
  loading = false,
  error = null,
}: {
  columns: Column<PendingSalesQuotation>[];
  rows: PendingSalesQuotation[];
  loading?: boolean;
  error?: string | null;
}) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({});

  const columnsWithFilters: Column<PendingSalesQuotation>[] = useMemo(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, filters]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        Object.entries(filters).every(([key, val]) => {
          if (!val) return true;
          return String((row as any)[key] ?? "").toLowerCase().includes(val.toLowerCase());
        })
      ),
    [rows, filters]
  );

  const getRowClass = useCallback(
    (_row: PendingSalesQuotation, rowIndex: number) => (rowIndex % 2 === 1 ? "!bg-blue-50" : ""),
    []
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCcw size={22} className="text-slate-300 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading quotations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[200px] flex items-center justify-center">
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
        rowKeyGetter={(row) => row.SalesQuotationID}
        className="rdg"
        style={{ height: "auto", width: "100%" }}
        rowHeight={36}
        headerRowHeight={58}
        enableVirtualization
        rowClass={getRowClass}
      />
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

// ─── GST Item Dropdown ────────────────────────────────────────────────────────
function GstItemDropdown({
  rowId,
  value,
  onSelect,
}: {
  rowId: number;
  value: string;
  onSelect: (item: ProductDetail) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.salesOrder?.productDetails ?? []);
  const loading = useSelector((state: RootState) => state.salesOrder?.productDetailsLoading ?? false);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch product list when popover first opens
  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && products.length === 0) {
      dispatch(fetchProductDetails());
    }
  };

  // Re-fetch when search string changes (debounced)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      dispatch(fetchProductDetails({ searchStr: search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open, dispatch]);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.ItemName.toLowerCase().includes(q) ||
        (p.ItemCode ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleOpen(true)}
          className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none font-medium text-gray-700 cursor-pointer select-none transition-all"
          style={{
            borderColor: open ? BRAND : "#d1dff0",
            boxShadow: open ? `0 0 0 2px ${BRAND}22` : "0 1px 2px rgba(0,70,135,0.04)",
            minWidth: 160,
            color: value ? "#374151" : "#d1d5db",
          }}
        >
          <span className="flex-1 truncate">{value || "Select Item"}</span>
          <ChevronsUpDown size={11} className="shrink-0" style={{ color: "#93b8d8" }} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-72"
        align="start"
        style={{ zIndex: 9999 }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search item..."
            className="text-xs h-8"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-52 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" />
                Loading items…
              </div>
            ) : filtered.length === 0 ? (
              <CommandEmpty className="text-xs py-4 text-center text-gray-400">
                No items found.
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((p) => (
                  <CommandItem
                    key={p.ItemID}
                    value={String(p.ItemID)}
                    onSelect={() => {
                      onSelect(p);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 cursor-pointer px-3 py-2"
                  >
                    <Check
                      size={12}
                      className={value === p.ItemName ? "opacity-100" : "opacity-0"}
                      style={{ color: BRAND }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-gray-700 truncate">{p.ItemName}</span>
                      {p.ItemCode && (
                        <span className="text-[10px] text-gray-400 truncate">{p.ItemCode}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── GST Breakdown Table ──────────────────────────────────────────────────────
const GST_COLS: { key: keyof GstBreakdownRow; label: string; isPct?: boolean; isImage?: boolean; isText?: boolean; isItemDropdown?: boolean }[] = [
  { key: "itemCode", label: "Item Code", isText: true },
  { key: "item", label: "Item", isItemDropdown: true },
  { key: "image", label: "Image", isImage: true },
  { key: "sqm", label: "Sqm" },
  { key: "quantity", label: "Quantity" },
  { key: "unit", label: "Unit", isText: true },
  { key: "salesRate", label: "Sales Rate" },
  { key: "grossAmt", label: "Gross Amt" },
  { key: "discPct", label: "Disc. %", isPct: true },
  { key: "discount", label: "Discount" },
  { key: "gstPct", label: "GST %", isPct: true },
  { key: "gstAmt", label: "GST Amt" },
  { key: "netAmount", label: "Net Amount" },
  { key: "specification", label: "Specification", isText: true },
  { key: "sgstPct", label: "SGST %", isPct: true },
  { key: "cgstPct", label: "CGST %", isPct: true },
  { key: "igstPct", label: "IGST %", isPct: true },
  { key: "utgstPct", label: "UTGST %", isPct: true },
  { key: "cessPct", label: "CESS %", isPct: true },
  { key: "sgstAmt", label: "SGST Amt" },
  { key: "cgstAmt", label: "CGST Amt" },
  { key: "igstAmt", label: "IGST Amt" },
  { key: "utgstAmt", label: "UTGST Amt" },
  { key: "cessAmt", label: "CESS Amt" },
];

function GstBreakdownTable({
  gstRows,
  setGstRows,
}: {
  gstRows: GstBreakdownRow[];
  setGstRows: React.Dispatch<React.SetStateAction<GstBreakdownRow[]>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);

  // ── Column Settings ──────────────────────────────────────────────────────────
  const [colSettingsOpen, setColSettingsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(GST_COLS.map((c) => c.key))
  );
  const [draftVisible, setDraftVisible] = useState<Set<string>>(new Set());

  const openColSettings = () => {
    setDraftVisible(new Set(visibleCols));
    setColSettingsOpen(true);
  };
  const applyColSettings = () => {
    setVisibleCols(new Set(draftVisible));
    setColSettingsOpen(false);
  };
  const toggleDraft = (key: string) => {
    setDraftVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const selectAll = () => setDraftVisible(new Set(GST_COLS.map((c) => c.key)));
  const clearAll = () => setDraftVisible(new Set());

  const updateRow = (id: number, field: keyof GstBreakdownRow, value: string) =>
    setGstRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // Step 1 — optimistically fill basic fields from ProductDetail (fast)
  // Step 2 — fetch ProductionItemDetail and fill remaining fields (async)
  const selectItem = async (rowId: number, product: ProductDetail) => {
    // Optimistic update with data we already have
    setGstRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
            ...r,
            itemId: product.ItemID,
            itemCode: product.ItemCode ?? "",
            item: product.ItemName,
            unit: product.SalesUnit ?? "",
          }
          : r
      )
    );

    // Fetch full production item detail
    setLoadingRowId(rowId);
    try {
      const result = await dispatch(
        fetchProductionItemDetail({
          itemId: product.ItemID,
          itemCode: product.ItemCode ?? "",
        })
      ).unwrap();

      // Map every available field from ProductionItemDetail → GstBreakdownRow
      setGstRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
              ...r,
              itemCode: result.ItemCode ?? r.itemCode,
              item: result.ItemName ?? r.item,
              unit: result.SalesUnit ?? r.unit,
              salesRate: result.SalesRate != null ? String(result.SalesRate) : r.salesRate,
              specification: result.Description ?? r.specification,
              // GST % (TaxValue is the combined GST rate)
              gstPct: result.TaxValue != null ? String(result.TaxValue) : r.gstPct,
              // Component-wise percentages
              sgstPct: result.SGST != null ? String(result.SGST) : r.sgstPct,
              cgstPct: result.CGST != null ? String(result.CGST) : r.cgstPct,
              igstPct: result.IGST != null ? String(result.IGST) : r.igstPct,
              utgstPct: result.UTGST != null ? String(result.UTGST) : r.utgstPct,
              cessPct: result.CESS != null ? String(result.CESS) : r.cessPct,
            }
            : r
        )
      );
    } catch {
      // Silently keep the optimistic data already set above
    } finally {
      setLoadingRowId(null);
    }
  };

  const removeRow = (id: number) =>
    setGstRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_MID }}
    >
      {/* Section header */}
      <div
        className="px-6 py-3.5 flex items-center justify-between"
        style={{ background: BRAND, borderBottom: `2px solid ${BRAND}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <Receipt size={14} strokeWidth={2.2} color="white" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-white">
            GST Breakdown
          </span>
        </div>
        <button
          onClick={openColSettings}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer hover:opacity-90 active:scale-95"
          style={{ color: BRAND, background: BRAND_LIGHT }}
        >
          <Settings2 size={13} />
          Column Settings
        </button>
      </div>

      {/* ── Column Settings Modal ─────────────────────────────────────────────── */}
      {colSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setColSettingsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden"
            style={{ border: `1.5px solid ${BRAND_MID}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: BRAND }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Settings2 size={14} color="white" strokeWidth={2.2} />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase text-white">
                  Column Settings
                </span>
              </div>
              <button
                onClick={() => setColSettingsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={14} color="white" />
              </button>
            </div>

            {/* Select All / Clear All */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
            >
              <span className="text-xs font-semibold text-gray-500">
                {draftVisible.size} of {GST_COLS.length} columns visible
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: BRAND, background: BRAND_MID }}
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: "#ef4444", background: "#fee2e2" }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Column checkboxes */}
            <div className="overflow-y-auto max-h-72 px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {GST_COLS.map((col) => {
                const checked = draftVisible.has(col.key);
                return (
                  <label
                    key={col.key}
                    className="flex items-center gap-2.5 cursor-pointer group py-1 px-2 rounded-lg transition-colors hover:bg-blue-50"
                  >
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center border-2 shrink-0 transition-colors"
                      style={{
                        borderColor: checked ? BRAND : "#d1d5db",
                        background: checked ? BRAND : "white",
                      }}
                      onClick={() => toggleDraft(col.key)}
                    >
                      {checked && <Check size={10} color="white" strokeWidth={3} />}
                    </span>
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: checked ? "#1f2937" : "#9ca3af" }}
                      onClick={() => toggleDraft(col.key)}
                    >
                      {col.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Modal footer */}
            <div
              className="flex justify-end gap-2.5 px-5 py-4 border-t"
              style={{ borderColor: BRAND_MID }}
            >
              <button
                onClick={() => setColSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:opacity-80"
                style={{ borderColor: BRAND, color: BRAND, background: "white" }}
              >
                Cancel
              </button>
              <button
                onClick={applyColSettings}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md"
                style={{ background: BRAND }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs" style={{ minWidth: 2000 }}>
          <thead>
            <tr style={{ background: BRAND }}>
              <th
                className="py-2.5 px-3 text-left font-semibold text-white text-[11px] tracking-wide whitespace-nowrap"
                style={{ width: 36 }}
              >
                #
              </th>
              {GST_COLS.filter((col) => visibleCols.has(col.key)).map((col) => (
                <th
                  key={col.key}
                  className="py-2.5 px-3 text-left font-semibold text-white text-[11px] tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th
                className="py-2.5 px-3 text-center font-semibold text-white text-[11px] tracking-wide"
                style={{ width: 44 }}
              >
                ···
              </th>
            </tr>
          </thead>
          <tbody>
            {gstRows.map((row, idx) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{ background: idx % 2 === 0 ? "white" : BRAND_LIGHT }}
              >
                <td className="py-1.5 px-3 text-center font-semibold" style={{ color: BRAND }}>
                  {loadingRowId === row.id ? (
                    <Loader2 size={13} className="animate-spin mx-auto" style={{ color: BRAND }} />
                  ) : (
                    idx + 1
                  )}
                </td>
                {GST_COLS.filter((col) => visibleCols.has(col.key)).map((col) => (
                  <td key={col.key} className="py-1.5 px-2">
                    {col.isItemDropdown ? (
                      <GstItemDropdown
                        rowId={row.id}
                        value={(row as any)[col.key]}
                        onSelect={(product) => selectItem(row.id, product)}
                      />
                    ) : col.isImage ? (
                      <input
                        type="text"
                        value={(row as any)[col.key]}
                        onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none font-medium text-gray-700 placeholder:text-gray-300 transition-all"
                        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 2px rgba(0,70,135,0.04)", minWidth: 80 }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = BRAND;
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1dff0";
                          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,70,135,0.04)";
                        }}
                      />
                    ) : col.isText ? (
                      <input
                        type="text"
                        value={(row as any)[col.key]}
                        onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                        placeholder={col.label}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none font-medium text-gray-700 placeholder:text-gray-300 transition-all"
                        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 2px rgba(0,70,135,0.04)" }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = BRAND;
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1dff0";
                          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,70,135,0.04)";
                        }}
                      />
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step={col.isPct ? "0.01" : "0.01"}
                        value={(row as any)[col.key]}
                        onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                        placeholder={col.label}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none font-medium text-gray-700 placeholder:text-gray-300 transition-all"
                        style={{ borderColor: "#d1dff0", boxShadow: "0 1px 2px rgba(0,70,135,0.04)" }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = BRAND;
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1dff0";
                          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,70,135,0.04)";
                        }}
                      />
                    )}
                  </td>
                ))}
                <td className="py-1.5 px-2 text-center">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors"
                    style={{ color: "#ef4444", background: "#fef2f2" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    title="Remove row"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sales Quotation Section ──────────────────────────────────────────────────
function SalesQuotationSection() {
  const dispatch = useDispatch<AppDispatch>();

  const quotations = useSelector((state: RootState) => state.salesOrder?.pendingSalesQuotations ?? []);
  const loading = useSelector((state: RootState) => state.salesOrder?.pendingSalesQuotationsLoading ?? false);
  const error = useSelector((state: RootState) => state.salesOrder?.pendingSalesQuotationsError ?? null);

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    dispatch(fetchPendingSalesQuotations());
  }, [dispatch]);

  const toggleCheck = useCallback((row: PendingSalesQuotation) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(row.SalesQuotationID) ? next.delete(row.SalesQuotationID) : next.add(row.SalesQuotationID);
      return next;
    });
  }, []);

  const columns: Column<PendingSalesQuotation>[] = useMemo(
    () => [
      {
        key: "QuotationNo",
        name: "Sales Quotation No.",
        minWidth: 180,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={{ key: "QuotationNo", name: "Sales Quotation No." }}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: PendingSalesQuotation }) => (
          <span className="font-semibold text-[#004687] text-xs">{row.QuotationNo}</span>
        ),
      },
      {
        key: "QuotationDate",
        name: "Sales Quotation Date",
        minWidth: 180,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={{ key: "QuotationDate", name: "Sales Quotation Date" }}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: PendingSalesQuotation }) => (
          <span className="text-xs text-slate-600">{row.QuotationDate}</span>
        ),
      },
      {
        key: "CustomerName",
        name: "Customer",
        minWidth: 220,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={{ key: "CustomerName", name: "Customer" }}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: PendingSalesQuotation }) => (
          <span className="text-xs text-slate-700 font-medium">{row.CustomerName ?? "—"}</span>
        ),
      },
      {
        key: "NetAmount",
        name: "Net Amount",
        minWidth: 130,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={{ key: "NetAmount", name: "Net Amount" }}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }: { row: PendingSalesQuotation }) => (
          <span className="text-xs font-semibold text-slate-800 tabular-nums">
            {row.NetAmount.toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        key: "add",
        name: "Add",
        width: 70,
        renderHeaderCell: () => (
          <div className="flex flex-col gap-1 py-1 px-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Add
            </div>
            <div className="h-6" />
          </div>
        ),
        renderCell: ({ row }: { row: PendingSalesQuotation }) => (
          <div className="flex items-center justify-center h-full">
            <input
              type="checkbox"
              checked={checkedIds.has(row.SalesQuotationID)}
              onChange={() => toggleCheck(row)}
              className="w-4 h-4 rounded accent-[#004687] cursor-pointer"
            />
          </div>
        ),
      },
    ],
    [checkedIds, toggleCheck]
  );

  return (
    <div className="space-y-4">
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-2 px-1">
          <ClipboardCheck size={14} style={{ color: BRAND }} />
          <span className="text-xs font-semibold" style={{ color: BRAND }}>
            {checkedIds.size} quotation{checkedIds.size > 1 ? "s" : ""} selected
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: BRAND_LIGHT, color: BRAND, border: `1px solid ${BRAND}33` }}
          >
            {checkedIds.size}
          </span>
        </div>
      )}

      <QuotationDataTable
        columns={columns}
        rows={quotations}
        loading={loading}
        error={error}
      />
    </div>
  );
}

// ─── Party Master Modal ───────────────────────────────────────────────────────
function PartyMasterModal({ onClose }: { onClose: () => void }) {
  const [pmName, setPmName] = useState("");
  const [pmCode, setPmCode] = useState("");
  const [pmPhone, setPmPhone] = useState("");
  const [pmAddress, setPmAddress] = useState("");
  const [pmRemarks, setPmRemarks] = useState("");
  const [pmCreditDays, setPmCreditDays] = useState("");
  const [pmCreditAmount, setPmCreditAmount] = useState("");
  const [pmCreditLimitDaysAlert, setPmCreditLimitDaysAlert] = useState(false);
  const [pmCreditLimitAmountAlert, setPmCreditLimitAmountAlert] = useState(false);
  const [pmRemarksAlert, setPmRemarksAlert] = useState(false);
  const [pmPrintChallan, setPmPrintChallan] = useState(false);
  const [pmActive, setPmActive] = useState(true);
  const [pmCommon, setPmCommon] = useState(true);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const fieldBase =
    "w-full px-3 py-2 text-sm rounded border bg-white outline-none font-medium text-gray-700 placeholder:text-gray-300 transition-all";
  const fieldStyle = { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" };
  const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BRAND;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
  };
  const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#d1dff0";
    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
  };

  const labelCls = "block text-xs font-semibold mb-1" ;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5" style={{ background: BRAND }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <User size={14} color="white" strokeWidth={2.2} />
            </div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-white">Party Master</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X size={15} color="white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Name / Code / Party Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className={labelCls} style={{ color: BRAND }}>Name</label>
              <input className={fieldBase} style={fieldStyle} placeholder="Name" value={pmName}
                onChange={(e) => setPmName(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Code</label>
              <input className={fieldBase} style={fieldStyle} placeholder="Code" value={pmCode}
                onChange={(e) => setPmCode(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Party Category</label>
              <div className="relative">
                <select
                  className={`${fieldBase} appearance-none pr-8`} style={fieldStyle}
                  defaultValue="CUSTOMER" onFocus={focusField} onBlur={blurField}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="SUPPLIER">SUPPLIER</option>
                  <option value="BOTH">BOTH</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
              </div>
            </div>
          </div>

          {/* Row 2: Phone / Taxpayer Type / Currency / Credit Days / Credit Amount */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Phone</label>
              <input className={fieldBase} style={fieldStyle} placeholder="Phone" value={pmPhone}
                onChange={(e) => setPmPhone(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Taxpayer Type</label>
              <div className="relative">
                <select className={`${fieldBase} appearance-none pr-8`} style={fieldStyle} defaultValue="" onFocus={focusField} onBlur={blurField}>
                  <option value="" disabled>Select Taxpayer Type</option>
                  <option>Regular</option>
                  <option>Composition</option>
                  <option>Unregistered</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Currency</label>
              <div className="relative">
                <select className={`${fieldBase} appearance-none pr-8`} style={fieldStyle} defaultValue="" onFocus={focusField} onBlur={blurField}>
                  <option value="" disabled>Select Currency</option>
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Credit Days</label>
              <input className={fieldBase} style={fieldStyle} placeholder="Days" value={pmCreditDays}
                onChange={(e) => setPmCreditDays(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Credit Amount</label>
              <input className={fieldBase} style={fieldStyle} placeholder="Credit Amount" value={pmCreditAmount}
                onChange={(e) => setPmCreditAmount(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
          </div>

          {/* Row 3: Country / State / Grade / Loading Port */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Country", placeholder: "Select Country" },
              { label: "State", placeholder: "Select State" },
              { label: "Grade", placeholder: "Select Grade" },
              { label: "Loading Port", placeholder: "Select Port" },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label className={labelCls} style={{ color: BRAND }}>{label}</label>
                <div className="relative">
                  <select className={`${fieldBase} appearance-none pr-8`} style={fieldStyle} defaultValue="" onFocus={focusField} onBlur={blurField}>
                    <option value="" disabled>{placeholder}</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Row 4: Address / Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Address</label>
              <textarea rows={3} className={`${fieldBase} resize-none`} style={fieldStyle} placeholder="Address"
                value={pmAddress} onChange={(e) => setPmAddress(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND }}>Remarks</label>
              <textarea rows={3} className={`${fieldBase} resize-none`} style={fieldStyle} placeholder="Remarks"
                value={pmRemarks} onChange={(e) => setPmRemarks(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
          </div>

          {/* Row 5: Checkboxes */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {[
              { label: "CreditLimit Days Alert", value: pmCreditLimitDaysAlert, set: setPmCreditLimitDaysAlert },
              { label: "CreditLimit Amount Alert", value: pmCreditLimitAmountAlert, set: setPmCreditLimitAmountAlert },
              { label: "Remarks Alert", value: pmRemarksAlert, set: setPmRemarksAlert },
              { label: "Print Challan", value: pmPrintChallan, set: setPmPrintChallan },
              { label: "Active", value: pmActive, set: setPmActive },
              { label: "Common", value: pmCommon, set: setPmCommon },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-1.5 cursor-pointer select-none">
                <span
                  className="w-4 h-4 rounded flex items-center justify-center border-2 transition-all shrink-0"
                  style={{
                    borderColor: value ? BRAND : "#d1dff0",
                    background: value ? BRAND : "white",
                  }}
                  onClick={() => set(!value)}
                >
                  {value && <Check size={10} color="white" strokeWidth={3} />}
                </span>
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: BRAND_MID }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:opacity-80"
            style={{ borderColor: "#f59e0b", color: "#f59e0b", background: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbeb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            CLEAR
          </button>
          <button
            className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90"
            style={{ background: BRAND }}
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
interface CreateSalesOrderProps {
  onBack?: () => void;
}

export default function CreateSalesOrder({ onBack }: CreateSalesOrderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.salesOrder?.customers ?? []);
  const customersLoading = useSelector((state: RootState) => state.salesOrder?.customersLoading ?? false);
  const banks = useSelector((state: RootState) => state.salesOrder?.banks ?? []);
  const banksLoading = useSelector((state: RootState) => state.salesOrder?.banksLoading ?? false);
  const paymentTypes = useSelector((state: RootState) => state.salesOrder?.paymentTypes ?? []);
  const paymentTypesLoading = useSelector((state: RootState) => state.salesOrder?.paymentTypesLoading ?? false);
  const paymentTerms = useSelector((state: RootState) => state.salesOrder?.paymentTerms ?? []);
  const paymentTermsLoading = useSelector((state: RootState) => state.salesOrder?.paymentTermsLoading ?? false);
  const defaultStore = useSelector((state: RootState) => state.salesOrder?.defaultStore ?? null);
  const storeStartWith = useSelector((state: RootState) => state.salesOrder?.storeStartWith ?? []);
  const storeStartWithLoading = useSelector((state: RootState) => state.salesOrder?.storeStartWithLoading ?? false);
  const currencyList = useSelector((state: RootState) => state.salesOrder?.currencyList ?? []);
  const currencyListLoading = useSelector((state: RootState) => state.salesOrder?.currencyListLoading ?? false);
  const customerCodes = useSelector((state: RootState) => state.salesOrder?.customerCodes ?? []);
  const customerCodesLoading = useSelector((state: RootState) => state.salesOrder?.customerCodesLoading ?? false);

  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [gstRows, setGstRows] = useState<GstBreakdownRow[]>([emptyGstRow()]);
  const [remarks, setRemarks] = useState("");
  const [document, setDocument] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [currency, setCurrency] = useState("");
  const [supplyType, setSupplyType] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [partyMasterOpen, setPartyMasterOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [paymentTypeOpen, setPaymentTypeOpen] = useState(false);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | null>(null);
  const [paymentTermOpen, setPaymentTermOpen] = useState(false);
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<number | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [customerCodeOpen, setCustomerCodeOpen] = useState(false);
  const [selectedCustomerCodeId, setSelectedCustomerCodeId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchBanks());
    dispatch(fetchPaymentTypes());
    dispatch(fetchPaymentTerms());
    dispatch(fetchDefaultStore());
    dispatch(fetchSalesOrderDocuments()).then((action: any) => {
      const docs: SalesOrderDocument[] = action?.payload;
      if (Array.isArray(docs) && docs.length > 0) {
        const first = docs[0];
        setDocument(first.DocumentName ?? "");
        setOrderNo(first.Prefix != null && first.StartingNo != null ? `${first.Prefix}-${first.StartingNo}` : "");
        setCurrency(first.Currency ?? "");
        setSelectedCurrencyId(first.CurrencyID ?? null);
        dispatch(fetchInvoiceTaxTypes({ documentID: first?.DocumentID })).then((taxAction: any) => {
          const types: InvoiceTaxType[] = taxAction?.payload;
          if (Array.isArray(types) && types.length > 0) {
            setSupplyType(types[0].InvoiceTaxType ?? "");
          }
        });
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (defaultStore && selectedStoreId === null) {
      setSelectedStoreId(defaultStore.StoreID);
    }
  }, [defaultStore]);

  const selectedCustomer = customers.find((c) => c.CustomerID === selectedCustomerId);
  const selectedBank = banks.find((b) => b.BankID === selectedBankId);
  const selectedPaymentType = paymentTypes.find((pt) => pt.PaymentTypeID === selectedPaymentTypeId);
  const selectedPaymentTerm = paymentTerms.find((t) => t.TermsID === selectedPaymentTermId);
  const selectedStore = storeStartWith.find((s) => s.StoreID === selectedStoreId);
  const selectedCurrency = currencyList.find((c) => c.CurrencyID === selectedCurrencyId);
  const selectedCustomerCode = customerCodes.find((c) => c.CustomerID === selectedCustomerCodeId);

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const updateLine = (id: number, field: keyof LineItem, value: string) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 shadow-md" style={{ background: BRAND }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                title="Back to Sales Orders"
              >
                <ArrowLeft size={18} color="white" strokeWidth={2.2} />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShoppingCart size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold leading-none">
                Document
              </p>
              <h1 className="text-white text-base font-bold tracking-tight leading-tight">
                Sales Order — GST
              </h1>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hidden sm:block"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            SOG-19 &nbsp;·&nbsp; Sales Order Details ↗
          </span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        <Accordion
          type="multiple"
          defaultValue={["general", "payment", "quotation"]}
          className="space-y-4"
        >

          {/* ═══════════════ GENERAL ═══════════════ */}
          <AccordionItem
            value="general"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger
              className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden"
            >
              <AccordionLabel icon={FileText} title="General" />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <FieldLabel icon={FileText} label="Document" />
                  <InputField icon={<FileText size={14} />} placeholder="SALES ORDER - GST" value={document} readOnly />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Order No." />
                  <InputField icon={<Hash size={14} />} placeholder="Order No." value={orderNo} readOnly />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Order Date" />
                  <InputField icon={<Calendar size={14} />} placeholder="Order Date" type="date" value="2026-05-16" />
                </div>
                <div>
                  <FieldLabel icon={User} label="Customer" />
                  {/* Party Master Modal */}
                  {partyMasterOpen && (
                    <PartyMasterModal onClose={() => setPartyMasterOpen(false)} />
                  )}
                  <div className="flex items-center gap-1.5">
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                      <div
                        role="combobox"
                        aria-expanded={customerOpen}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setCustomerOpen(true)}
                        className="flex-1 flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                        style={{
                          borderColor: customerOpen ? BRAND : "#d1dff0",
                          boxShadow: customerOpen
                            ? `0 0 0 3px ${BRAND}22`
                            : "0 1px 3px rgba(0,70,135,0.05)",
                          color: selectedCustomer ? "#374151" : "#d1d5db",
                        }}
                      >
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                          <User size={14} />
                        </span>
                        <span className="flex-1 truncate">
                          {selectedCustomer ? selectedCustomer.CustomerName : "Select Customer"}
                        </span>
                        <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width]"
                      align="start"
                      style={{ zIndex: 50 }}
                    >
                      <Command>
                        <CommandInput placeholder="Search customer..." className="text-sm" />
                        <CommandList>
                          {customersLoading ? (
                            <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                          ) : (
                            <>
                              <CommandEmpty>No customer found.</CommandEmpty>
                              <CommandGroup>
                                {customers.map((customer) => (
                                  <CommandItem
                                    key={customer.CustomerID}
                                    value={customer.CustomerName}
                                    onSelect={() => {
                                      setSelectedCustomerId(customer.CustomerID);
                                      setCustomerOpen(false);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check
                                      size={14}
                                      className={selectedCustomerId === customer.CustomerID ? "opacity-100" : "opacity-0"}
                                      style={{ color: BRAND }}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium text-gray-700 truncate">
                                        {customer.CustomerName}
                                      </span>
                                      {customer.CustomerCode && (
                                        <span className="text-xs text-gray-400">{customer.CustomerCode}</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* Add New Customer button */}
                  <button
                    type="button"
                    title="Add New Customer"
                    onClick={() => setPartyMasterOpen(true)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-all hover:shadow-md cursor-pointer"
                    style={{ borderColor: BRAND, color: BRAND, background: "white" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_LIGHT)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                  </div>
                </div>
                <div>
                  <FieldLabel icon={Store} label="Store" />
                  <Popover open={storeOpen} onOpenChange={(open) => {
                    setStoreOpen(open);
                    if (open) dispatch(fetchStoreStartWith());
                  }}>
                    <PopoverTrigger asChild>
                      <div
                        role="combobox"
                        aria-expanded={storeOpen}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setStoreOpen(true)}
                        className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                        style={{
                          borderColor: storeOpen ? BRAND : "#d1dff0",
                          boxShadow: storeOpen
                            ? `0 0 0 3px ${BRAND}22`
                            : "0 1px 3px rgba(0,70,135,0.05)",
                          color: (selectedStore || defaultStore) ? "#374151" : "#d1d5db",
                        }}
                      >
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                          <Store size={14} />
                        </span>
                        <span className="flex-1 truncate">
                          {selectedStore?.StoreName ?? defaultStore?.StoreName ?? "Select Store"}
                        </span>
                        <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width]"
                      align="start"
                      style={{ zIndex: 50 }}
                    >
                      <Command>
                        <CommandInput placeholder="Search store..." className="text-sm" />
                        <CommandList>
                          {storeStartWithLoading ? (
                            <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                          ) : (
                            <>
                              <CommandEmpty>No store found.</CommandEmpty>
                              <CommandGroup>
                                {storeStartWith.map((store) => (
                                  <CommandItem
                                    key={store.StoreID}
                                    value={store.StoreName}
                                    onSelect={() => {
                                      setSelectedStoreId(store.StoreID);
                                      setStoreOpen(false);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check
                                      size={14}
                                      className={selectedStoreId === store.StoreID ? "opacity-100" : "opacity-0"}
                                      style={{ color: BRAND }}
                                    />
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                      {store.StoreName}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <FieldLabel icon={DollarSign} label="Currency" />
                  <Popover
                    open={currencyOpen}
                    onOpenChange={(open) => {
                      setCurrencyOpen(open);
                      if (open) dispatch(fetchCurrencyList());
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        role="combobox"
                        aria-expanded={currencyOpen}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setCurrencyOpen(true)}
                        className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                        style={{
                          borderColor: currencyOpen ? BRAND : "#d1dff0",
                          boxShadow: currencyOpen ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
                          color: selectedCurrency ? "#374151" : "#d1d5db",
                        }}
                      >
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                          {currencyListLoading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                        </span>
                        <span className="flex-1 truncate" style={{ color: currencyListLoading ? "#93b8d8" : undefined }}>
                          {currencyListLoading
                            ? "Loading..."
                            : selectedCurrency
                            ? `${selectedCurrency.Currency}${selectedCurrency.CurrencyCode ? ` (${selectedCurrency.CurrencyCode})` : ""}`
                            : currency || "Select Currency"}
                        </span>
                        <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width]"
                      align="start"
                      style={{ zIndex: 50 }}
                    >
                      <Command>
                        <CommandInput placeholder="Search currency..." className="text-sm" />
                        <CommandList>
                          {currencyListLoading ? (
                            <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                          ) : (
                            <>
                              <CommandEmpty>No currency found.</CommandEmpty>
                              <CommandGroup>
                                {currencyList
                                  .filter((c) => c.Currency?.trim())
                                  .map((c) => (
                                    <CommandItem
                                      key={c.CurrencyID}
                                      value={`${c.Currency} ${c.CurrencyCode}`}
                                      onSelect={() => {
                                        setSelectedCurrencyId(c.CurrencyID);
                                        setCurrency(c.Currency);
                                        setCurrencyOpen(false);
                                      }}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Check
                                        size={14}
                                        className={selectedCurrencyId === c.CurrencyID ? "opacity-100" : "opacity-0"}
                                        style={{ color: BRAND }}
                                      />
                                      <span className="text-sm font-medium text-gray-700 flex-1">
                                        {c.Currency}
                                      </span>
                                      {c.CurrencyCode?.trim() && (
                                        <span className="text-xs text-gray-400 font-mono">
                                          {c.CurrencyCode}
                                        </span>
                                      )}
                                      {c.FaClass && (
                                        <i className={`${c.FaClass} text-xs`} style={{ color: "#93b8d8" }} />
                                      )}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <FieldLabel icon={Truck} label="Supply Type" />
                  <InputField icon={<Truck size={14} />} placeholder="Supply Type" value={supplyType} readOnly />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Customer Order No." />
                  <InputField icon={<Hash size={14} />} placeholder="Enter Order No." />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Customer Order Date" />
                  <InputField icon={<Calendar size={14} />} placeholder="Order Date" type="date" />
                </div>
                <div>
                  <FieldLabel icon={Tag} label="Customer Code" />
                  <Popover
                    open={customerCodeOpen}
                    onOpenChange={(open) => {
                      setCustomerCodeOpen(open);
                      if (open) dispatch(fetchCustomerCodes());
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        role="combobox"
                        aria-expanded={customerCodeOpen}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setCustomerCodeOpen(true)}
                        className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                        style={{
                          borderColor: customerCodeOpen ? BRAND : "#d1dff0",
                          boxShadow: customerCodeOpen ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
                          color: selectedCustomerCode ? "#374151" : "#d1d5db",
                        }}
                      >
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                          {customerCodesLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                        </span>
                        <span className="flex-1 truncate" style={{ color: customerCodesLoading ? "#93b8d8" : undefined }}>
                          {customerCodesLoading
                            ? "Loading..."
                            : selectedCustomerCode
                            ? selectedCustomerCode.CustomerCode ?? selectedCustomerCode.CustomerName
                            : "Select Customer Code"}
                        </span>
                        <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width]"
                      align="start"
                      style={{ zIndex: 50 }}
                    >
                      <Command>
                        <CommandInput placeholder="Search customer code..." className="text-sm" />
                        <CommandList>
                          {customerCodesLoading ? (
                            <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                          ) : (
                            <>
                              <CommandEmpty>No customer code found.</CommandEmpty>
                              <CommandGroup>
                                {customerCodes.map((cc) => (
                                  <CommandItem
                                    key={cc.CustomerID}
                                    value={`${cc.CustomerCode ?? ""} ${cc.CustomerName}`}
                                    onSelect={() => {
                                      setSelectedCustomerCodeId(cc.CustomerID);
                                      setCustomerCodeOpen(false);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check
                                      size={14}
                                      className={selectedCustomerCodeId === cc.CustomerID ? "opacity-100" : "opacity-0"}
                                      style={{ color: BRAND }}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      {cc.CustomerCode && (
                                        <span className="text-sm font-semibold text-gray-700 truncate">
                                          {cc.CustomerCode}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400 truncate">{cc.CustomerName}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={MapPin} label="Address" />
                  <div className="relative">
                    <textarea
                      placeholder="Customer Address"
                      rows={3}
                      value={selectedCustomer?.CustomerAddress ?? ""}
                      readOnly
                      className="w-full pl-9 pr-3 pt-2.5 pb-2.5 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700 font-medium"
                      style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
                    />
                    <MapPin size={14} className="absolute left-3 top-3 pointer-events-none" style={{ color: "#93b8d8" }} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════ PAYMENT DETAILS ═══════════════ */}
          <AccordionItem
            value="payment"
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger
              className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden"
            >
              <AccordionLabel icon={CreditCard} title="Payment Details" />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-2 h-full">
              {!selectedCustomer ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                  <AlertCircle size={14} style={{ color: "#93b8d8" }} />
                  <span>Payment details will appear here once a customer is selected.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <FieldLabel icon={CreditCard} label="Bank" />
                    <Popover open={bankOpen} onOpenChange={setBankOpen}>
                      <PopoverTrigger asChild>
                        <div
                          role="combobox"
                          aria-expanded={bankOpen}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setBankOpen(true)}
                          className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                          style={{
                            borderColor: bankOpen ? BRAND : "#d1dff0",
                            boxShadow: bankOpen ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
                            color: selectedBank ? "#374151" : "#d1d5db",
                          }}
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                            {banksLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          </span>
                          <span className="flex-1 truncate" style={{ color: banksLoading ? "#93b8d8" : undefined }}>
                            {banksLoading ? "Loading..." : selectedBank ? selectedBank.BankName : "Select Bank"}
                          </span>
                          <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[--radix-popover-trigger-width]"
                        align="start"
                        style={{ zIndex: 50 }}
                      >
                        <Command>
                          <CommandInput placeholder="Search bank..." className="text-sm" />
                          <CommandList>
                            {banksLoading ? (
                              <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                            ) : (
                              <>
                                <CommandEmpty>No bank found.</CommandEmpty>
                                <CommandGroup>
                                  {banks.map((bank) => (
                                    <CommandItem
                                      key={bank.BankID}
                                      value={bank.BankName}
                                      onSelect={() => {
                                        setSelectedBankId(bank.BankID);
                                        setBankOpen(false);
                                      }}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Check
                                        size={14}
                                        className={selectedBankId === bank.BankID ? "opacity-100" : "opacity-0"}
                                        style={{ color: BRAND }}
                                      />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-gray-700 truncate">
                                          {bank.BankName}
                                        </span>
                                        {bank.AccountNo && (
                                          <span className="text-xs text-gray-400">{bank.AccountNo}</span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <FieldLabel icon={DollarSign} label="Payment Type" />
                    <Popover open={paymentTypeOpen} onOpenChange={setPaymentTypeOpen}>
                      <PopoverTrigger asChild>
                        <div
                          role="combobox"
                          aria-expanded={paymentTypeOpen}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setPaymentTypeOpen(true)}
                          className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                          style={{
                            borderColor: paymentTypeOpen ? BRAND : "#d1dff0",
                            boxShadow: paymentTypeOpen ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
                            color: selectedPaymentType ? "#374151" : "#d1d5db",
                          }}
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                            {paymentTypesLoading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                          </span>
                          <span className="flex-1 truncate" style={{ color: paymentTypesLoading ? "#93b8d8" : undefined }}>
                            {paymentTypesLoading ? "Loading..." : selectedPaymentType ? selectedPaymentType.PaymentTypeName : "Select Payment Type"}
                          </span>
                          <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[--radix-popover-trigger-width]"
                        align="start"
                        style={{ zIndex: 50 }}
                      >
                        <Command>
                          <CommandInput placeholder="Search payment type..." className="text-sm" />
                          <CommandList>
                            {paymentTypesLoading ? (
                              <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                            ) : (
                              <>
                                <CommandEmpty>No payment type found.</CommandEmpty>
                                <CommandGroup>
                                  {paymentTypes.map((pt) => (
                                    <CommandItem
                                      key={pt.PaymentTypeID}
                                      value={pt.PaymentTypeName}
                                      onSelect={() => {
                                        setSelectedPaymentTypeId(pt.PaymentTypeID);
                                        setPaymentTypeOpen(false);
                                      }}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Check
                                        size={14}
                                        className={selectedPaymentTypeId === pt.PaymentTypeID ? "opacity-100" : "opacity-0"}
                                        style={{ color: BRAND }}
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {pt.PaymentTypeName}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <FieldLabel icon={Receipt} label="Payment Terms" />
                    <Popover open={paymentTermOpen} onOpenChange={setPaymentTermOpen}>
                      <PopoverTrigger asChild>
                        <div
                          role="combobox"
                          aria-expanded={paymentTermOpen}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setPaymentTermOpen(true)}
                          className="w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium relative cursor-pointer select-none"
                          style={{
                            borderColor: paymentTermOpen ? BRAND : "#d1dff0",
                            boxShadow: paymentTermOpen ? `0 0 0 3px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
                            color: selectedPaymentTerm ? "#374151" : "#d1d5db",
                          }}
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
                            {paymentTermsLoading ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
                          </span>
                          <span className="flex-1 truncate" style={{ color: paymentTermsLoading ? "#93b8d8" : undefined }}>
                            {paymentTermsLoading ? "Loading..." : selectedPaymentTerm ? selectedPaymentTerm.PaymentTerm : "Select Payment Terms"}
                          </span>
                          <ChevronsUpDown size={14} className="shrink-0" style={{ color: "#93b8d8" }} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[--radix-popover-trigger-width]"
                        align="start"
                        style={{ zIndex: 50 }}
                      >
                        <Command>
                          <CommandInput placeholder="Search payment terms..." className="text-sm" />
                          <CommandList>
                            {paymentTermsLoading ? (
                              <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
                            ) : (
                              <>
                                <CommandEmpty>No payment term found.</CommandEmpty>
                                <CommandGroup>
                                  {paymentTerms.map((term) => (
                                    <CommandItem
                                      key={term.TermsID}
                                      value={term.PaymentTerm}
                                      onSelect={() => {
                                        setSelectedPaymentTermId(term.TermsID);
                                        setPaymentTermOpen(false);
                                      }}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Check
                                        size={14}
                                        className={selectedPaymentTermId === term.TermsID ? "opacity-100" : "opacity-0"}
                                        style={{ color: BRAND }}
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {term.PaymentTerm}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════ SALES QUOTATION ═══════════════ */}
          <AccordionItem
            value="quotation"
            className="bg-white rounded-2xl shadow-sm border"
            style={{ borderColor: BRAND_MID }}
          >
            <AccordionTrigger
              className="px-6 py-4 hover:no-underline hover:bg-blue-50/40 transition-colors [&>svg]:hidden"
            >
              <AccordionLabel
                icon={ClipboardList}
                title="Sales Quotation"
              />
              <ChevronDown
                size={16}
                className="ml-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: BRAND }}
              />
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-2">
              <SalesQuotationSection />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ── GST BREAKDOWN TABLE ── */}
        <GstBreakdownTable gstRows={gstRows} setGstRows={setGstRows} />

        {/* ── REMARKS (outside accordion) ── */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6"
          style={{ borderColor: BRAND_MID }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND_LIGHT }}>
              <StickyNote size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Remarks
            </h2>
            <div className="flex-1 h-px" style={{ background: BRAND_MID }} />
          </div>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Enter any remarks or notes here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full pl-10 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
              style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = BRAND;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1dff0";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
              }}
            />
            <StickyNote size={15} className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_LIGHT)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
