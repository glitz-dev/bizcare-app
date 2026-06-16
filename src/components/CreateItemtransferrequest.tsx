"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { 
  fetchDocumentMasters, 
  fetchDefaultStore,
  fetchBranchStoreStartWith,
  fetchStoreStartWith,
  fetchItemDetailsForOpeningStock,
  fetchBatchDetails,
  saveItemTransferRequest,
  clearSaveTransferRequestStatus,
} from "../store/features/inventory/stockManagement/itemTransferRequestSlice";
import {
  FileText,
  Hash,
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowLeftRight,
  Store,
  GitBranch,
  CalendarDays,
  StickyNote,
  Layers,
  Tag,
  Package,
  Boxes,
  RefreshCw,
  Save,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ─────────────────────────────────────────────────────────────────────
type TransferLineItem = {
  id: number;
  barcode: string;
  itemCode: string;
  item: string;     // holds selected ItemCode value for combobox
  itemName: string; // holds resolved ItemName for payload
  itemId: number;   // holds resolved ItemID for payload
  batchId: number;  // holds resolved BatchID for payload
  stock: string;
  quantity: string;
};

function makeEmptyRow(id: number): TransferLineItem {
  return { id, barcode: "", itemCode: "", item: "", itemName: "", itemId: 0, batchId: 0, stock: "", quantity: "" };
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5" style={{ color: BRAND }}>
      <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
      {label}
    </label>
  );
}

// InputField Component
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
        disabled={readOnly}
        className={cn(
          "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all outline-none placeholder:text-gray-300 font-medium",
          readOnly ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none" : "bg-white text-gray-700"
        )}
        style={!readOnly ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" } : undefined}
        onFocus={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
          }
        }}
        onBlur={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = "#d1dff0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
          }
        }}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}>
        {icon}
      </span>
    </div>
  );
}

// SearchableCombobox Component
function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
  onTriggerClick,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon: React.ReactNode;
  onTriggerClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && onTriggerClick) {
      onTriggerClick();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="relative w-full flex items-center pl-9 pr-8 py-2.5 text-sm rounded-xl border bg-white transition-all outline-none text-left font-medium"
          style={{
            borderColor: open ? BRAND : "#d1dff0",
            boxShadow: open ? `0 0 0 2px ${BRAND}22` : "0 1px 3px rgba(0,70,135,0.05)",
            color: value ? "#374151" : "#9ca3af",
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }}>
            {icon}
          </span>
          <span className="flex-1 truncate">{selectedLabel || placeholder}</span>
          {value ? (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 transition-colors"
              style={{ color: "#93b8d8" }}
              onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }}
            >
              ×
            </span>
          ) : (
            <ChevronsUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#93b8d8" }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" style={{ zIndex: 50 }} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm text-gray-400">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => { onChange(opt.value); setOpen(false); }}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Check
                    size={13}
                    className={cn("shrink-0 transition-opacity", value === opt.value ? "opacity-100" : "opacity-0")}
                    style={{ color: BRAND }}
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

// ─── Items Table ───────────────────────────────────────────────────────────────
function ItemsTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  itemOptions,
  itemOptionsLoading,
  onItemSelect, // Dynamic Callback received to handle async populating
}: {
  rows: TransferLineItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof TransferLineItem, value: string) => void;
  itemOptions: { label: string; value: string }[];
  itemOptionsLoading: boolean;
  onItemSelect: (rowId: number, itemCode: string) => void;
}) {
  const cellInput = (
    row: TransferLineItem,
    field: keyof TransferLineItem,
    placeholder: string,
    numeric = false
  ) => (
    <input
      type={numeric ? "number" : "text"}
      value={row[field]}
      onChange={(e) => onUpdate(row.id, field, e.target.value)}
      placeholder={placeholder}
      className="h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white"
      style={{ borderColor: "#d1dff0" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
      <div className="px-6 py-3.5 flex items-center gap-2.5" style={{ background: BRAND }}>
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
          <Boxes size={14} strokeWidth={2.2} color="white" />
        </div>
        <span className="text-sm font-bold text-white tracking-wide">Transfer Items</span>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide w-12" style={{ color: BRAND }}>SI.No.</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>Barcode</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>Item Code</th>
              <th className="px-3 py-2.5 text-left font-bold tracking-wide min-w-[180px]" style={{ color: BRAND }}>Item</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Stock</th>
              <th className="px-3 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>Quantity</th>
              <th className="px-3 py-2.5 text-center font-bold tracking-wide w-14" style={{ color: BRAND }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-blue-50/30"
                style={{ borderColor: BRAND_MID, background: idx % 2 === 1 ? "#f5f9fd" : "white" }}
              >
                <td className="px-3 py-2 text-center">
                  <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
                </td>
                <td className="px-2 py-2 min-w-[140px]">{cellInput(row, "barcode", "Barcode")}</td>
                <td className="px-2 py-2 min-w-[130px]">{cellInput(row, "itemCode", "Item Code")}</td>
                <td className="px-2 py-2 min-w-[200px]">
                  <SearchableCombobox
                    value={row.item}
                    onChange={(v) => {
                      onItemSelect(row.id, v); // Emits chosen item configuration change handling
                    }}
                    options={itemOptions}
                    placeholder={itemOptionsLoading ? "Loading items…" : "Select Item"}
                    searchPlaceholder="Search item…"
                    emptyText="No items found."
                    icon={<Package size={12} />}
                  />
                </td>
                <td className="px-2 py-2 min-w-[100px]">
                  <input
                    type="number"
                    value={row.stock}
                    onChange={(e) => onUpdate(row.id, "stock", e.target.value)}
                    placeholder="Stock"
                    className="h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white text-right"
                    style={{ borderColor: "#d1dff0" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </td>
                <td className="px-2 py-2 min-w-[100px]">
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => onUpdate(row.id, "quantity", e.target.value)}
                    placeholder="Quantity"
                    className="h-7 text-xs border rounded-lg px-2 w-full outline-none transition-all bg-white text-right"
                    style={{ borderColor: "#d1dff0" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={12} className="text-red-400 hover:text-red-600 transition-colors" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3.5 border-t flex items-center" style={{ borderColor: BRAND_MID }}>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm active:scale-95"
          style={{ background: BRAND_LIGHT, color: BRAND }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Row
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface CreateItemTransferRequestProps {
  onBack?: () => void;
}

const CreateItemTransferRequest: React.FC<CreateItemTransferRequestProps> = ({ onBack }) => {
  // ── Redux
  const dispatch = useDispatch<AppDispatch>();
  const { 
    documentMasters, 
    documentMastersLoading,
    defaultStores,
    defaultStoresLoading,
    branchStoresStartWith,
    branchStoresStartWithLoading,
    storesStartWith,
    storesStartWithLoading,
    itemDetails,
    itemDetailsLoading,
    saveTransferRequestLoading,
    saveTransferRequestSuccess,
    saveTransferRequestError,
  } = useSelector(
    (state: RootState) => state.itemTransferRequest
  );

  // ── Header fields
  const [document_, setDocument_] = useState("");
  const [refNo, setRefNo] = useState("");
  const [requestDate, setRequestDate] = useState(getTodayISO());
  const [transferType, setTransferType] = useState("internal");
  const [requestFromStore, setRequestFromStore] = useState("");
  const [requestToBranch, setRequestToBranch] = useState("");
  const [requestToStore, setRequestToStore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // ── Fetch dependencies on mount
  useEffect(() => {
    dispatch(fetchDocumentMasters());
    dispatch(fetchDefaultStore());
    dispatch(fetchBranchStoreStartWith());
    dispatch(fetchItemDetailsForOpeningStock());
  }, [dispatch]);

  // ── Prefill Document Name and Ref No once document masters load
  useEffect(() => {
    if (documentMasters.length === 0) return;
    const defaultDoc = documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
    setDocument_(defaultDoc.DocumentName);
    setRefNo(`${defaultDoc.Prefix}-${defaultDoc.StartingNo}`);
  }, [documentMasters]);

  // ── Prefill Request From Store once default store data loads
  useEffect(() => {
    if (defaultStores.length === 0) return;
    setRequestFromStore(String(defaultStores[0].StoreID));
  }, [defaultStores]);

  // ── Handle Request From Store field click / dropdown opening
  const handleRequestFromStoreClick = () => {
    dispatch(fetchStoreStartWith());
  };

  // ── Combine default prefilled store option with newly fetched stores list
  const getRequestFromStoreOptions = () => {
    const activeOptions = storesStartWith.map((store) => ({
      label: store.StoreName,
      value: String(store.StoreID),
    }));

    if (defaultStores.length > 0) {
      const defStore = defaultStores[0];
      const exists = activeOptions.some((opt) => opt.value === String(defStore.StoreID));
      if (!exists) {
        activeOptions.unshift({
          label: defStore.StoreName,
          value: String(defStore.StoreID),
        });
      }
    }

    return activeOptions;
  };

  // ── Map raw slice data into Combobox option nodes
  const formattedItemOptions = (itemDetails || []).map((item: any) => ({
    label: item.ItemName || "Unknown Item",
    value: String(item.ItemCode || ""),
  }));

  // ── Line items handling
  const [rows, setRows] = useState<TransferLineItem[]>([makeEmptyRow(1)]);
  const [nextId, setNextId] = useState(2);

  const handleAddRow = () => {
    setRows((prev) => [...prev, makeEmptyRow(nextId)]);
    setNextId((n) => n + 1);
  };
  const handleRemoveRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };
  const handleUpdateRow = (id: number, field: keyof TransferLineItem, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // ── Triggers fetchBatchDetails on item change and autofills row fields
  const handleItemSelect = async (rowId: number, itemCode: string) => {
    if (!itemCode) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, item: "", itemCode: "", itemName: "", itemId: 0, batchId: 0, barcode: "" } : r
        )
      );
      return;
    }

    // Set immediate fields first
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, item: itemCode, itemCode: itemCode } : r
      )
    );

    try {
      // Dispatches fetchBatchDetails thunk action and unwraps the response payload
      const response = await dispatch(fetchBatchDetails({ itemCode })).unwrap();
      
      if (response && response.length > 0) {
        const batchInfo = response[0];
        
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  barcode:  batchInfo.Barcode   || "",
                  itemCode: batchInfo.ItemCode   || itemCode,
                  itemName: batchInfo.ItemName   || "",
                  itemId:   batchInfo.ItemID     ?? 0,
                  batchId:  batchInfo.BatchID    ?? 0,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Failed to prefetch batch details for selected item:", error);
    }
  };

  const netQuantity = rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);

  const handleClear = () => {
    setDocument_("");
    setRefNo("");
    setRequestDate(getTodayISO());
    setTransferType("internal");
    
    if (defaultStores.length > 0) {
      setRequestFromStore(String(defaultStores[0].StoreID));
    } else {
      setRequestFromStore("");
    }
    
    setRequestToBranch("");
    setRequestToStore("");
    setDueDate("");
    setRemarks("");
    setRows([makeEmptyRow(1)]);
    setNextId(2);
  };

  // ── Toast on save result
  useEffect(() => {
    if (saveTransferRequestSuccess) {
      toast.success("Item transfer request saved successfully.");
      dispatch(clearSaveTransferRequestStatus());
      handleClear();
    }
  }, [saveTransferRequestSuccess]);

  useEffect(() => {
    if (saveTransferRequestError) {
      toast.error(saveTransferRequestError);
      dispatch(clearSaveTransferRequestStatus());
    }
  }, [saveTransferRequestError]);

  // ── Submit handler
  const handleSubmit = () => {
    // Validation
    if (!document_) { toast.error("Please select a Document."); return; }
    if (!refNo)      { toast.error("Ref. No. is required."); return; }
    if (!requestDate){ toast.error("Request Date is required."); return; }
    if (!requestFromStore) { toast.error("Please select Request From Store."); return; }
    if (!requestToStore)   { toast.error("Please select Request To Store."); return; }

    const filledRows = rows.filter((r) => r.item);
    if (filledRows.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    const docMaster = documentMasters.find((d) => d.DocumentName === document_);
    const fromStoreName = [...defaultStores, ...storesStartWith]
      .find((s) => String(s.StoreID) === requestFromStore)?.StoreName ?? "";
    const toStoreName = branchStoresStartWith
      .find((s) => String(s.ToStoreID) === requestToStore)?.branchStoreName ?? "";

    const isInternalTransfer = transferType === "internal";

    // requestDate is "YYYY-MM-DD" from the date input
    // transferrequestDateStr must be "DD-MM-YYYY"
    const [yyyy, mm, dd] = requestDate.split("-");
    const transferrequestDateStr = `${dd}-${mm}-${yyyy}`;

    const payload = {
      DesignID: 0,
      DocumentID: docMaster?.DocumentID ?? 0,
      DocumentName: document_,
      DueDate: dueDate || null,
      IsInternalTransfer: isInternalTransfer,
      ItemTransferRequestRefNo: refNo,
      LstItemTransferRequestT: filledRows.map((r) => ({
        ItemName: r.itemName || r.item,
        ItemID:   r.itemId,
        ItemCode: r.itemCode,
        BatchID:  r.batchId,
        Quantity: parseFloat(r.quantity) || 0,
        Status:   true,
      })),
      Remarks: remarks,
      RequestDate: new Date(requestDate).toISOString(),
      RequestFromStoreID: parseInt(requestFromStore, 10),
      RequestToBranchID: null,
      RequestToStoreID: parseInt(requestToStore, 10),
      SizeID: 0,
      SpecID: 0,
      StoreName: fromStoreName,
      TransferType: isInternalTransfer,
      branchStoreName: toStoreName,
      transferrequestDateStr,
    };

    dispatch(saveItemTransferRequest(payload));
  };

  const transferTypeOptions = [
    { label: "Internal Transfer", value: "internal" },
    { label: "External Transfer", value: "external" },
    { label: "Branch Transfer", value: "branch" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0"
        style={{ background: BRAND }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors shrink-0"
            >
              <ArrowLeft size={15} color="white" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">
              Item Transfer Request
            </h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">
              Inventory · Stock Transfer
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <Layers size={13} />
          Item Transfer Details
        </button>
      </div>

      {/* ── Form body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">

        {/* ── Header Fields Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>

          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
              <FileText size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Transfer Details
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1: Document | Ref. No | Request Date | Transfer Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <FieldLabel icon={FileText} label="Document" />
              <SearchableCombobox
                value={document_}
                onChange={setDocument_}
                options={documentMasters.map((d) => ({ label: d.DocumentName, value: d.DocumentName }))}
                placeholder={documentMastersLoading ? "Loading…" : "Select Document"}
                searchPlaceholder="Search document…"
                emptyText="No documents found."
                icon={<FileText size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={Hash} label="Ref. No." />
              <InputField
                icon={<Hash size={14} />}
                placeholder="Enter Transfer Request No."
                value={refNo}
                onChange={setRefNo}
              />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="Request Date" />
              <InputField
                icon={<Calendar size={14} />}
                placeholder="Request Date"
                value={requestDate}
                onChange={setRequestDate}
                type="date"
              />
            </div>
            <div>
              <FieldLabel icon={Tag} label="Transfer Type" />
              <SearchableCombobox
                value={transferType}
                onChange={setTransferType}
                options={transferTypeOptions}
                placeholder="Select Transfer Type"
                searchPlaceholder="Search type…"
                emptyText="No types found."
                icon={<Tag size={14} />}
              />
            </div>
          </div>

          {/* Row 2: Request From Store | Request To Branch | Request To Store | Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <FieldLabel icon={Store} label="Request From Store" />
              <SearchableCombobox
                value={requestFromStore}
                onChange={setRequestFromStore}
                onTriggerClick={handleRequestFromStoreClick}
                options={getRequestFromStoreOptions()}
                placeholder={defaultStoresLoading || storesStartWithLoading ? "Loading stores…" : "Select Store"}
                searchPlaceholder="Search store…"
                emptyText="No stores found."
                icon={<Store size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={GitBranch} label="Request To Branch" />
              <InputField
                icon={<GitBranch size={14} />}
                placeholder="Disabled Field"
                value={requestToBranch}
                onChange={setRequestToBranch}
                readOnly={true}
              />
            </div>
            <div>
              <FieldLabel icon={Store} label="Request To Store" />
              <SearchableCombobox
                value={requestToStore}
                onChange={setRequestToStore}
                options={branchStoresStartWith.map((bs) => ({ label: bs.branchStoreName, value: String(bs.ToStoreID) }))}
                placeholder={branchStoresStartWithLoading ? "Loading…" : "Select Store"}
                searchPlaceholder="Search store…"
                emptyText="No stores found."
                icon={<Store size={14} />}
              />
            </div>
            <div>
              <FieldLabel icon={CalendarDays} label="Due Date" />
              <InputField
                icon={<CalendarDays size={14} />}
                placeholder="Select Due Date"
                value={dueDate}
                onChange={setDueDate}
                type="date"
              />
            </div>
          </div>
        </div>

        {/* ── Items Table ────────────────────────────────────────────────────── */}
        <ItemsTable
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onUpdate={handleUpdateRow}
          itemOptions={formattedItemOptions}
          itemOptionsLoading={itemDetailsLoading}
          onItemSelect={handleItemSelect} // Injected handleItemSelect function
        />

        {/* ── Footer Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FieldLabel icon={StickyNote} label="Remarks" />
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="Enter Remarks, If Any"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full pl-9 pr-4 pt-3 pb-3 text-sm rounded-xl border bg-white transition-all outline-none resize-none placeholder:text-gray-300 text-gray-700"
                  style={{
                    borderColor: "#d1dff0",
                    boxShadow: "0 1px 3px rgba(0,70,135,0.05)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = BRAND;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1dff0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
                  }}
                />
                <StickyNote
                  size={14}
                  className="absolute left-3 top-3.5 pointer-events-none"
                  style={{ color: "#93b8d8" }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-3">
              <div className="border-t pt-3" style={{ borderColor: BRAND_MID }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-base font-bold" style={{ color: BRAND }}>
                  <Boxes size={15} style={{ color: BRAND }} />
                  Net Quantity
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">
                  {netQuantity.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
            style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            <RefreshCw size={15} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveTransferRequestLoading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BRAND }}
          >
            <Save size={15} />
            {saveTransferRequestLoading ? "Saving…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateItemTransferRequest;
