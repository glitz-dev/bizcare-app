"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { Layers, RotateCcw, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentMasters,
  clearDocumentMasters,
  fetchDefaultStore,
  clearDefaultStore,
  fetchStoreStartWith,
  clearStoresStartWith,
  fetchDefaultStockType,
  clearDefaultStockType,
  fetchStockTypeStartWith,
  clearStockTypesStartWith,
  fetchItemsBySearch,
  clearStockItems,
  fetchActualStock,
  updatePhysicalStock,
  clearUpdatePhysicalStock,
} from "../../store/features/inventory/stockManagement/physicalStockSlice";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader } from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface PhysicalStockRow {
  id: number;
  item: string;
  itemId: string;
  size: string;
  design: string;
  spec: string;
  unit: string;
  currentStock: number | string;
  physicalStock: string;
  rate: string;
  remarks: string;
}

// ─── Searchable Combobox ───────────────────────────────────────────────────────

interface SearchableComboboxProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  onOpen?: () => void;
}

function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No options found.",
  disabled = false,
  className,
  loading = false,
  onOpen,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) onOpen?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-none",
            "hover:border-[#004687]/40 focus:outline-none focus:ring-2 focus:ring-[#004687]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-slate-400 text-xs")}>
            {loading ? "Loading…" : selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown size={12} className="shrink-0 text-slate-400 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 shadow-md rounded-xl border-slate-200" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs text-slate-400 py-4 text-center">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value === value ? "" : opt.value);
                    setOpen(false);
                  }}
                  className="text-xs cursor-pointer"
                >
                  <Check
                    size={12}
                    className={cn("mr-2 shrink-0", value === opt.value ? "opacity-100 text-[#004687]" : "opacity-0")}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Field Label ───────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
      {children}
    </label>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-8 text-sm border-slate-200 rounded-lg shadow-none focus-visible:ring-2 focus-visible:ring-[#004687]/20 focus-visible:border-[#004687]/40",
        className
      )}
    />
  );
}

// ─── Inline Combobox (for table rows) ─────────────────────────────────────────

function InlineCombobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  loading = false,
  onOpen,
  onSearchChange,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
  onOpen?: () => void;
  onSearchChange?: (search: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const handleOpenChange = (next: boolean) => {
    // If opening is blocked upstream by ItemCombobox context validation, 
    // it won't trigger or will be handled via controlled logic.
    setOpen(next);
    if (next) onOpen?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-6 w-full items-center justify-between rounded-md border border-transparent bg-transparent px-2 text-xs",
            "hover:border-slate-200 hover:bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#004687]/40",
            "transition-colors"
          )}
        >
          <span className={cn("truncate", !selected && "text-slate-300")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown size={10} className="shrink-0 text-slate-300 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0 shadow-md rounded-xl border-slate-200" align="start">
        <Command>
          <CommandInput
            placeholder="Search…"
            className="h-7 text-xs"
            onValueChange={onSearchChange}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-xs text-slate-400">Loading…</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="text-xs text-slate-400 py-3 text-center">No results.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => {
                        onChange(opt.value === value ? "" : opt.value);
                        setOpen(false);
                      }}
                      className="text-xs cursor-pointer"
                    >
                      <Check
                        size={10}
                        className={cn("mr-1.5 shrink-0", value === opt.value ? "opacity-100 text-[#004687]" : "opacity-0")}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Item Combobox (fetches from Redux on open + search) ──────────────────────

function ItemCombobox({
  value,
  onChange,
  options,
  loading,
  onOpen,
  onSearchChange,
  time,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  loading: boolean;
  onOpen: () => void;
  onSearchChange: (search: string) => void;
  time: string;
}) {
  const handleOpenWithValidation = () => {
    if (!time) {
      toast.error("Please check Specified Date & Time", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
      });
      return;
    }
    onOpen();
  };

  return (
    <Popover open={!time ? false : undefined}>
      <InlineCombobox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select Item"
        loading={loading}
        onOpen={handleOpenWithValidation}
        onSearchChange={onSearchChange}
      />
    </Popover>
  );
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const SIZE_OPTIONS: SelectOption[] = [
  { value: "S", label: "Small" },
  { value: "M", label: "Medium" },
  { value: "L", label: "Large" },
  { value: "XL", label: "X-Large" },
];

const DESIGN_OPTIONS: SelectOption[] = [
  { value: "D1", label: "Floral" },
  { value: "D2", label: "Striped" },
  { value: "D3", label: "Plain" },
  { value: "D4", label: "Checked" },
];

const SPEC_OPTIONS: SelectOption[] = [
  { value: "SP1", label: "60 GSM" },
  { value: "SP2", label: "80 GSM" },
  { value: "SP3", label: "100 GSM" },
];

const RATE_OPTIONS: SelectOption[] = [
  { value: "MRP", label: "MRP" },
  { value: "COST", label: "Cost Price" },
  { value: "SALE", label: "Sale Price" },
];

// ─── Column Header (label-only, no filter input) ──────────────────────────────

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1 py-1 px-2 h-full justify-center">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

// ─── Empty row factory ─────────────────────────────────────────────────────────

let rowCounter = 1;
function makeEmptyRow(): PhysicalStockRow {
  return {
    id: rowCounter++,
    item: "",
    itemId: "",
    size: "",
    design: "",
    spec: "",
    unit: "",
    currentStock: "",
    physicalStock: "",
    rate: "",
    remarks: "",
  };
}

// ─── PhysicalStock ─────────────────────────────────────────────────────────────

export default function PhysicalStock() {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state
  const documentMasters = useSelector((s: RootState) => s.physicalStock.documentMasters);
  const documentMastersLoading = useSelector((s: RootState) => s.physicalStock.documentMastersLoading);
  const defaultStores = useSelector((s: RootState) => s.physicalStock.defaultStores);
  const defaultStoresLoading = useSelector((s: RootState) => s.physicalStock.defaultStoresLoading);
  const storesStartWith = useSelector((s: RootState) => s.physicalStock.storesStartWith);
  const storesStartWithLoading = useSelector((s: RootState) => s.physicalStock.storesStartWithLoading);
  const defaultStockTypes = useSelector((s: RootState) => s.physicalStock.defaultStockTypes);
  const defaultStockTypesLoading = useSelector((s: RootState) => s.physicalStock.defaultStockTypesLoading);
  const stockTypesStartWith = useSelector((s: RootState) => s.physicalStock.stockTypesStartWith);
  const stockTypesStartWithLoading = useSelector((s: RootState) => s.physicalStock.stockTypesStartWithLoading);
  const stockItems = useSelector((s: RootState) => s.physicalStock.stockItems);
  const stockItemsLoading = useSelector((s: RootState) => s.physicalStock.stockItemsLoading);
  const updatePhysicalStockLoading = useSelector((s: RootState) => s.physicalStock.updatePhysicalStockLoading);

  // ── Derived options from Redux
  const documentOptions: SelectOption[] = useMemo(
    () => documentMasters.map((d) => ({ value: String(d.DocumentID), label: d.DocumentName })),
    [documentMasters]
  );

  const storeOptions: SelectOption[] = useMemo(
    () =>
      (storesStartWith.length > 0 ? storesStartWith : defaultStores).map((s) => ({
        value: String(s.StoreID),
        label: s.StoreName,
      })),
    [storesStartWith, defaultStores]
  );

  const stockTypeOptions: SelectOption[] = useMemo(
    () =>
      (stockTypesStartWith.length > 0 ? stockTypesStartWith : defaultStockTypes).map((t) => ({
        value: String(t.TypeID),
        label: t.TypeName,
      })),
    [stockTypesStartWith, defaultStockTypes]
  );

  const itemOptions: SelectOption[] = useMemo(
    () => stockItems.map((i) => ({ value: String(i.ItemID), label: i.ItemName })),
    [stockItems]
  );

  // ── Item search — debounced so typing doesn't fire on every keystroke
  const itemSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleItemOpen = useCallback(() => {
    dispatch(fetchItemsBySearch());
  }, [dispatch]);

  const handleItemSearchChange = useCallback(
    (search: string) => {
      if (itemSearchTimer.current) clearTimeout(itemSearchTimer.current);
      itemSearchTimer.current = setTimeout(() => {
        dispatch(fetchItemsBySearch({ searchStr: search }));
      }, 300);
    },
    [dispatch]
  );

  const handleStoreOpen = useCallback(() => {
    dispatch(fetchStoreStartWith());
  }, [dispatch]);

  const handleStockTypeOpen = useCallback(() => {
    dispatch(fetchStockTypeStartWith());
  }, [dispatch]);

  const handleItemChange = useCallback(
    async (rowId: number, itemId: string) => {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, item: itemId, unit: "", currentStock: "" } : r))
      );

      if (!itemId) return;

      const numericItemId = Number(itemId);

      const matchedItem = stockItems.find((i) => i.ItemID === numericItemId);
      if (matchedItem) {
        setRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, unit: matchedItem.ItemUnit } : r))
        );
      }

      try {
        const result = await dispatch(
          fetchActualStock({
            payload: {
              ItemID: numericItemId,
              ItemName: matchedItem?.ItemName ?? "",
              ItemCode: matchedItem?.ItemCode ?? null,
              UnitID: matchedItem?.ItemUnitID ?? 0,
              Unit: matchedItem?.ItemUnit ?? "",
              Stock: null,
              CurrentStock: 0,
              ExactStockCheck: false,
              StockCheckTime: new Date().toISOString(),
              StockTypeID: Number(stockType) || 0,
              StoreID: Number(store) || 0,
            },
          })
        ).unwrap();

        setRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, currentStock: result.stock } : r))
        );
      } catch {
        // stock fetch failed — leave currentStock blank
      }
    },
    [dispatch, stockItems]
  );

  // ── Header form state
  const [document_, setDocument_] = useState("");
  const [stockNo, setStockNo] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [store, setStore] = useState("");
  const [stockType, setStockType] = useState("");

  // ── Prefill flags
  const prefilled = useRef(false);
  const storePrefilled = useRef(false);
  const stockTypePrefilled = useRef(false);

  // ── Fetch data on mount; clear on unmount
  useEffect(() => {
    dispatch(clearDocumentMasters());
    dispatch(clearDefaultStore());
    dispatch(clearStoresStartWith());
    dispatch(clearDefaultStockType());
    dispatch(clearStockTypesStartWith());
    dispatch(clearStockItems());

    dispatch(fetchDocumentMasters());
    dispatch(fetchDefaultStore());
    dispatch(fetchDefaultStockType());
    dispatch(clearUpdatePhysicalStock());
  }, [dispatch]);

  // ── Prefill Document + Stock No. once response arrives
  useEffect(() => {
    if (prefilled.current || documentMasters.length === 0) return;

    const defaultDoc =
      documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];

    setDocument_(String(defaultDoc.DocumentID));

    const suffix = defaultDoc.Suffix ? `-${defaultDoc.Suffix}` : "";
    setStockNo(`${defaultDoc.Prefix}-${defaultDoc.StartingNo}${suffix}`);

    prefilled.current = true;
  }, [documentMasters]);

  // ── Prefill Store once response arrives
  useEffect(() => {
    if (storePrefilled.current || defaultStores.length === 0) return;

    const defaultStoreObj = defaultStores[0];
    if (defaultStoreObj) {
      setStore(String(defaultStoreObj.StoreID));
    }

    storePrefilled.current = true;
  }, [defaultStores]);

  // ── Prefill Stock Type once response arrives
  useEffect(() => {
    if (stockTypePrefilled.current || defaultStockTypes.length === 0) return;

    const defaultTypeObj = defaultStockTypes[0];
    if (defaultTypeObj) {
      setStockType(String(defaultTypeObj.TypeID));
    }

    stockTypePrefilled.current = true;
  }, [defaultStockTypes]);

  // ── Row state
  const [rows, setRows] = useState<PhysicalStockRow[]>([makeEmptyRow()]);
  const [saving, setSaving] = useState(false);

  // ── Row update helpers
  const updateRow = useCallback(
    <K extends keyof PhysicalStockRow>(id: number, field: K, value: PhysicalStockRow[K]) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const addRow = () => setRows((prev) => [...prev, makeEmptyRow()]);

  const deleteRow = (id: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const handleReset = () => {
    if (documentMasters.length > 0) {
      const defaultDoc =
        documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
      setDocument_(String(defaultDoc.DocumentID));
      const suffix = defaultDoc.Suffix ? `-${defaultDoc.Suffix}` : "";
      setStockNo(`${defaultDoc.Prefix}-${defaultDoc.StartingNo}${suffix}`);
    } else {
      setDocument_("");
      setStockNo("");
    }

    if (defaultStores.length > 0) {
      setStore(String(defaultStores[0].StoreID));
    } else {
      setStore("");
    }

    if (defaultStockTypes.length > 0) {
      setStockType(String(defaultStockTypes[0].TypeID));
    } else {
      setStockType("");
    }

    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setRows([makeEmptyRow()]);
  };

  const handleUpdate = async () => {
    // ── Header validation
    if (!document_ || !store || !stockType || !date || !time) {
      toast.error("Please fill all header fields before saving.", {
        style: { background: "#FF4433", color: "white", border: "1px solid #d97706" },
      });
      return;
    }

    // ── Row validation: every row must have item, currentStock, physicalStock, and rate
    const filledRows = rows.filter((r) => r.item); // skip completely blank rows
    if (filledRows.length === 0) {
      toast.error("Add at least one stock item before saving.", {
        style: { background: "#FF4433", color: "white", border: "1px solid #d97706" },
      });
      return;
    }

    const invalidRows = filledRows.filter(
      (r) =>
        r.currentStock === "" ||
        r.currentStock === null ||
        r.physicalStock === "" ||
        !r.rate
    );

    if (invalidRows.length > 0) {
      const rowNums = invalidRows
        .map((r) => rows.indexOf(r) + 1)
        .join(", ");
      toast.error(
        `Row${invalidRows.length > 1 ? "s" : ""} ${rowNums}: Stock, Physical Stock and Rate are required.`,
        { style: { background: "#FF4433", color: "white", border: "1px solid #d97706" } }
      );
      return;
    }

    // ── Build payload
    const selectedDoc = documentMasters.find((d) => String(d.DocumentID) === document_);
    const selectedStore = [...defaultStores, ...storesStartWith].find(
      (s) => String(s.StoreID) === store
    );
    const selectedStockType = [...defaultStockTypes, ...stockTypesStartWith].find(
      (t) => String(t.TypeID) === stockType
    );

    // Format date as "DD-MM-YYYY"
    const [year, month, day] = date.split("-");
    const physicalStockDateStr = `${day}-${month}-${year}`;

    // Time as ISO string using epoch date (matching payload pattern observed)
    const [hh, mm] = time.split(":");
    const timeDate = new Date(0);
    timeDate.setUTCHours(Number(hh), Number(mm), 0, 0);
    const physicalStockTimeStr = timeDate.toISOString();

    const payload = {
      PhysicalStockDateStr: physicalStockDateStr,
      PhysicalStockTimeStr: physicalStockTimeStr,
      CurrentStockType: selectedStockType?.TypeName ?? "",
      DocumentID: Number(document_),
      DocumentName: selectedDoc?.DocumentName ?? "PHYSICAL STOCK",
      LstPhysicalStockDetails: filledRows.map((r) => {
        const item = stockItems.find((i) => String(i.ItemID) === r.item);
        return {
          ItemName: item?.ItemName ?? r.item,
          ItemID: Number(r.item),
          ItemCode: item?.ItemCode ?? null,
          UnitID: item?.ItemUnitID ?? 0,
          Unit: r.unit,
          Stock: Number(r.physicalStock),
          CurrentStock: Number(r.currentStock),
          ExactStockCheck: false,
          StockCheckTime: new Date().toISOString(),
          StockTypeID: Number(stockType),
          StoreID: Number(store),
        };
      }),
      PhysicalStkDate: new Date(`${date}T${time}`).toISOString(),
      PhysicalStockDate: new Date().toISOString(),
      PhysicalStockNo: stockNo,
      PhysicalStockTime: time,
      StockTime: time,
      StockTypeID: Number(stockType),
      StoreID: Number(store),
      StoreName: selectedStore?.StoreName ?? "",
    };

    setSaving(true);
    try {
      const result = await dispatch(updatePhysicalStock({ payload })).unwrap();
      toast.success(`Physical Stock saved — ${result.physicalStockNo}`, {
        style: { background: "#004687", color: "white" },
      });
      // Update stock no. in header to the one returned by server
      setStockNo(result.physicalStockNo);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save. Please try again.", {
        style: { background: "#FF4433", color: "white", border: "1px solid #d97706" },
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Columns
  const columns: Column<PhysicalStockRow>[] = useMemo(
    () => [
      {
        key: "slno",
        name: "Sl.No.",
        width: 66,
        renderHeaderCell: () => <ColumnHeader label="Sl.No." />,
        renderCell: ({ rowIdx }) => (
          <span className="text-xs font-semibold text-slate-400">{rowIdx + 1}</span>
        ),
      },
      {
        key: "item",
        name: "Item",
        width: 160,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <ItemCombobox
            value={row.item}
            onChange={(v) => handleItemChange(row.id, v)}
            options={itemOptions}
            loading={stockItemsLoading}
            onOpen={handleItemOpen}
            onSearchChange={handleItemSearchChange}
            time={time}
          />
        ),
      },
      {
        key: "size",
        name: "Size",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <InlineCombobox
            options={SIZE_OPTIONS}
            value={row.size}
            onChange={(v) => updateRow(row.id, "size", v)}
            placeholder="Select Size"
          />
        ),
      },
      {
        key: "design",
        name: "Design",
        width: 130,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <InlineCombobox
            options={DESIGN_OPTIONS}
            value={row.design}
            onChange={(v) => updateRow(row.id, "design", v)}
            placeholder="Select Design"
          />
        ),
      },
      {
        key: "spec",
        name: "Spec",
        width: 140,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <InlineCombobox
            options={SPEC_OPTIONS}
            value={row.spec}
            onChange={(v) => updateRow(row.id, "spec", v)}
            placeholder="Select Spec"
          />
        ),
      },
      {
        key: "unit",
        name: "Unit",
        width: 110,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600 px-2">
            {row.unit || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        key: "currentStock",
        name: "Stock",
        width: 80,
        renderHeaderCell: () => <ColumnHeader label="Stock" />,
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-500 px-2">
            {row.currentStock !== "" ? row.currentStock : "—"}
          </span>
        ),
      },
      {
        key: "physicalStock",
        name: "Physical Stock",
        width: 120,
        renderHeaderCell: () => <ColumnHeader label="Physical Stock" />,
        renderCell: ({ row }) => (
          <input
            type="number"
            value={row.physicalStock}
            onChange={(e) => updateRow(row.id, "physicalStock", e.target.value)}
            placeholder="Enter qty"
            className={cn(
              "w-full h-6 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-700",
              "hover:border-slate-200 hover:bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#004687]/40",
              "placeholder:text-slate-300 transition-colors"
            )}
          />
        ),
      },
      {
        key: "rate",
        name: "Rate",
        width: 120,
        renderHeaderCell: () => <ColumnHeader label="Rate" />,
        renderCell: ({ row }) => (
          <InlineCombobox
            options={RATE_OPTIONS}
            value={row.rate}
            onChange={(v) => updateRow(row.id, "rate", v)}
            placeholder="Select Rate"
          />
        ),
      },
      {
        key: "remarks",
        name: "Remarks",
        width: 140,
        renderHeaderCell: () => <ColumnHeader label="Remarks" />,
        renderCell: ({ row }) => (
          <input
            type="text"
            value={row.remarks}
            onChange={(e) => updateRow(row.id, "remarks", e.target.value)}
            placeholder="Remarks"
            className={cn(
              "w-full h-6 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600",
              "hover:border-slate-200 hover:bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#004687]/40",
              "placeholder:text-slate-300 transition-colors"
            )}
          />
        ),
      },
      {
        key: "actions",
        name: "",
        width: 44,
        renderHeaderCell: () => <div className="h-full" />,
        renderCell: ({ row }) => (
          <button
            onClick={() => deleteRow(row.id)}
            className="h-6 w-6 flex items-center justify-center rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        ),
      },
    ],
    [updateRow, itemOptions, stockItemsLoading, handleItemOpen, handleItemSearchChange, handleItemChange, time]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Physical Stock"
        subtitle="Inventory · Stock Adjustment"
        icon={<Layers size={15} className="text-white" />}
        showCreateButton={false}
      />

      <div className="flex flex-col gap-4 p-4 flex-1 overflow-auto">
        {/* ── Header Form Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          {/* Card title bar */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[#004687]" />
              <span className="text-xs font-semibold text-slate-600 tracking-wide">
                Document Details
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold text-emerald-600 border-emerald-200 bg-emerald-50 px-2 py-0 h-5"
            >
              Draft
            </Badge>
          </div>

          {/* Fields */}
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
            {/* Document */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Document</FieldLabel>
              <SearchableCombobox
                options={documentOptions}
                value={document_}
                onChange={setDocument_}
                placeholder="Select Document"
                loading={documentMastersLoading}
              />
            </div>

            {/* Physical Stock No. */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Physical Stock No.</FieldLabel>
              <InputField
                value={documentMastersLoading ? "Loading…" : stockNo}
                readOnly
                className="bg-slate-50 text-slate-500 cursor-default"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Date</FieldLabel>
              <InputField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Time</FieldLabel>
              <InputField
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* Store */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Store</FieldLabel>
              <SearchableCombobox
                options={storeOptions}
                value={store}
                onChange={setStore}
                placeholder="Select Store"
                loading={storesStartWithLoading || defaultStoresLoading}
                onOpen={handleStoreOpen}
              />
            </div>

            {/* Current Stock Type */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Current Stock Type</FieldLabel>
              <SearchableCombobox
                options={stockTypeOptions}
                value={stockType}
                onChange={setStockType}
                placeholder="Select Type"
                loading={stockTypesStartWithLoading || defaultStockTypesLoading}
                onOpen={handleStockTypeOpen}
              />
            </div>
          </div>

          {/* Action bar */}
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 px-3 text-xs rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 gap-1.5"
            >
              <RotateCcw size={11} />
              Reset
            </Button>
          </div>
        </div>

        {/* ── Items Table Card ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-1">
          {/* Sub-header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[#004687]" />
              <span className="text-xs font-semibold text-slate-600 tracking-wide">
                Stock Items
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-[#004687] border-blue-200 bg-blue-50 px-2 py-0 h-5"
              >
                {rows.length} {rows.length === 1 ? "row" : "rows"}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={addRow}
              className="h-7 px-3 text-xs rounded-lg border-[#004687]/30 text-[#004687] hover:bg-blue-50 gap-1.5"
            >
              <Plus size={11} />
              Add Row
            </Button>
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            rows={rows}
            rowKey="id"
            rowHeight={36}
            headerRowHeight={58}
          />

          {/* Footer action */}
          <div className="flex items-center justify-end pt-1">
            <Button
              onClick={handleUpdate}
              disabled={saving || updatePhysicalStockLoading}
              className="h-8 px-5 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg shadow-none gap-1.5 cursor-pointer"
            >
              <Save size={12} />
              {saving ? "Saving…" : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
