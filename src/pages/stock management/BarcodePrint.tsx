"use client";

import { useState, useMemo } from "react";
import { Barcode, Search, X, Printer, RotateCcw, Tag, Layers } from "lucide-react";
import { type Column } from "react-data-grid";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader } from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BarcodePrintRow {
  id: number;
  slNo: number;
  code: string;
  item: string;
  barCode: string;
  newBarCode: string;
  mrp: number;
  rate: number;
  noOfPrint: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROWS: BarcodePrintRow[] = [];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BarcodePrint() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [selectedPrintModule, setSelectedPrintModule] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows] = useState<BarcodePrintRow[]>(MOCK_ROWS);

  // Mock options — replace with Redux selectors
  const categories: { CategoryID: number; CategoryName: string }[] = [];
  const itemTypes: { ItemTypeID: number; ItemTypeName: string }[] = [];
  const printModules: { ModuleID: number; ModuleName: string }[] = [];

  const categoriesLoading = false;
  const itemTypesLoading = false;
  const printModulesLoading = false;

  const handleShow = () => {
    setLoading(true);
    // TODO: dispatch fetchBarcodeItems({ categoryId: selectedCategory, itemTypeId: selectedItemType })
    setTimeout(() => setLoading(false), 800);
  };

  const handleClear = () => {
    setSelectedCategory("");
    setSelectedItemType("");
    setSelectedPrintModule("");
    // TODO: dispatch clearBarcodeList()
  };

  const handlePrint = () => {
    // TODO: trigger barcode print with selectedPrintModule
    console.log("Print", { selectedPrintModule, rows });
  };

  const columns: Column<BarcodePrintRow>[] = useMemo(
    () => [
      {
        key: "slNo",
        name: "#",
        width: 55,
        resizable: false,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={{ ...props.column, name: "#" }}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-500">{row.slNo}</span>
        ),
      },
      {
        key: "code",
        name: "Code",
        width: 110,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-semibold text-[#004687]">{row.code}</span>
        ),
      },
      {
        key: "item",
        name: "Item",
        minWidth: 200,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-700">{row.item}</span>
        ),
      },
      {
        key: "barCode",
        name: "BarCode",
        width: 160,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600">{row.barCode}</span>
        ),
      },
      {
        key: "newBarCode",
        name: "New BarCode",
        width: 150,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600">{row.newBarCode}</span>
        ),
      },
      {
        key: "mrp",
        name: "MRP",
        width: 90,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700">
            {row.mrp > 0 ? row.mrp.toFixed(2) : ""}
          </span>
        ),
      },
      {
        key: "rate",
        name: "Rate",
        width: 90,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700">
            {row.rate > 0 ? row.rate.toFixed(2) : ""}
          </span>
        ),
      },
      {
        key: "noOfPrint",
        name: "No. of Print",
        width: 100,
        resizable: true,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={""}
            onFilterChange={() => {}}
            {...(props as any)}
          />
        ),
        renderCell: ({ row }) => (
          <Input
            type="number"
            min={0}
            defaultValue={row.noOfPrint}
            className="h-6 text-xs border-slate-200 rounded px-1.5 w-16"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Barcode Print"
        subtitle="Inventory · Barcode"
        icon={<Barcode size={16} className="text-white" />}
        showCreateButton={false}
      />

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">

        {/* ── Filters Card ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex flex-col gap-4">

            {/* Row 1: Category · Item Type · Show · Clear */}
            <div className="flex items-end gap-3">

              {/* Category */}
              <div className="flex flex-col gap-1 w-64">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Layers size={10} /> Category
                </label>
                <div className="relative">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="__loading__" disabled>Loading…</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="__empty__" disabled>No categories</SelectItem>
                      ) : (
                        categories.map((c) => (
                          <SelectItem key={c.CategoryID} value={String(c.CategoryID)}>
                            {c.CategoryName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Item Type */}
              <div className="flex flex-col gap-1 w-64">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag size={10} /> Item Type
                </label>
                <div className="relative">
                  <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                    <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                      <SelectValue placeholder="Select Item Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypesLoading ? (
                        <SelectItem value="__loading__" disabled>Loading…</SelectItem>
                      ) : itemTypes.length === 0 ? (
                        <SelectItem value="__empty__" disabled>No item types</SelectItem>
                      ) : (
                        itemTypes.map((t) => (
                          <SelectItem key={t.ItemTypeID} value={String(t.ItemTypeID)}>
                            {t.ItemTypeName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedItemType && (
                    <button
                      onClick={() => setSelectedItemType("")}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Show & Clear */}
              <div className="flex items-center gap-2 pb-0.5">
                <Button
                  onClick={handleShow}
                  disabled={loading}
                  className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none cursor-pointer"
                >
                  <Search size={12} />
                  {loading ? "Loading…" : "Show"}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="h-8 px-4 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 text-xs font-semibold rounded-lg gap-1.5 shadow-none cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Clear
                </Button>
              </div>
            </div>

            {/* Row 2: Print Module · Print */}
            <div className="flex items-end gap-3">

              {/* Print Module */}
              <div className="flex flex-col gap-1 w-64">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Printer size={10} /> Print Module
                </label>
                <div className="relative">
                  <Select value={selectedPrintModule} onValueChange={setSelectedPrintModule}>
                    <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                      <SelectValue placeholder="Select Print Module" />
                    </SelectTrigger>
                    <SelectContent>
                      {printModulesLoading ? (
                        <SelectItem value="__loading__" disabled>Loading…</SelectItem>
                      ) : printModules.length === 0 ? (
                        <SelectItem value="__empty__" disabled>No modules</SelectItem>
                      ) : (
                        printModules.map((m) => (
                          <SelectItem key={m.ModuleID} value={String(m.ModuleID)}>
                            {m.ModuleName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedPrintModule && (
                    <button
                      onClick={() => setSelectedPrintModule("")}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Print Button */}
              <div className="pb-0.5">
                <Button
                  onClick={handlePrint}
                  disabled={rows.length === 0}
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none cursor-pointer disabled:opacity-50"
                >
                  <Printer size={12} />
                  Print
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          loadingLabel="Fetching barcode items…"
        />

      </div>
    </div>
  );
}
