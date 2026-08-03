import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
    fetchDocumentStartWith,
    fetchSupplierJobWorkers,
    fetchUserFormWiseStore,
    fetchCompanyStore,
    fetchPurchaseOrdersForInPass,
    fetchInPassAgainstDoc,
    fetchUserTableColumn,
    fetchItemDetails,
    fetchUnitsOfSelectedItem,
    fetchSelectedPurchaseOrderForInPass,
    clearSelectedPurchaseOrderForInPass,
    checkSupplyInvoiceExist,
    saveGoodsReceipt,
    type ItemDetailItem,
    type SaveGoodsReceiptPayload,
    type SaveInPassDetailLine,
} from "../store/features/inventory/procurement/goodsreceiptSlice"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    Plus,
    X,
    Trash2,
    FileText,
    Hash,
    Calendar,
    Tag,
    Layers,
    User,
    MessageSquare,
    Package,
    Ruler,
    BarChart3,
    Info,
    Save,
    ChevronsUpDown,
    Check,
    Receipt,
    DollarSign,
    PackageCheck,
    Clock,
    Store,
    ArrowLeftRight,
    ShoppingCart,
    ClipboardList,
    PlusCircle,
    AlertTriangle,
    Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
    id: number;
    selected: boolean;
    itemId: string;
    item: string;
    specification: string;
    billUnit: string;
    orderedQty: string;
    landedQty: string;
    remainQty: string;
    billQty: string;
    excessQty: string;
    rejectedQty: string;
    rate: string;
    amount: string;
    remarks: string;
    // Holds values for any table column returned by fetchUserTableColumn that
    // doesn't map to one of the known fields above, keyed by TableColumnID.
    extra: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newLineItem(id: number): LineItem {
    return {
        id,
        selected: false,
        itemId: "",
        item: "",
        specification: "",
        billUnit: "",
        orderedQty: "",
        landedQty: "",
        remainQty: "",
        billQty: "",
        excessQty: "",
        rejectedQty: "",
        rate: "",
        amount: "",
        remarks: "",
        extra: {},
    };
}

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

// ─── Line Item Table Column Config ──────────────────────────────────────────
// Canonical fields available on a LineItem row, with the icon/label/width used
// when that column is rendered. `aliases` are normalized ColumnName variants
// used to match against whatever the GetUserTableColumn API returns.
type ItemColumnField =
    | "item"
    | "specification"
    | "billUnit"
    | "orderedQty"
    | "landedQty"
    | "remainQty"
    | "billQty"
    | "excessQty"
    | "rejectedQty"
    | "rate"
    | "amount"
    | "remarks";

interface ItemColumnDef {
    field: ItemColumnField;
    label: string; // fallback label if API doesn't send a ColumnDisplayName
    icon: React.ElementType;
    width: string;
    aliases: string[]; // normalized ColumnName variants that map to this field
}

const ITEM_COLUMN_DEFS: ItemColumnDef[] = [
    { field: "item", label: "Item", icon: Package, width: "13%", aliases: ["item", "itemname"] },
    { field: "specification", label: "Spec.", icon: Layers, width: "9%", aliases: ["specification", "spec", "itemspec"] },
    { field: "billUnit", label: "Bill Unit", icon: Ruler, width: "8%", aliases: ["billunit", "unit"] },
    { field: "orderedQty", label: "Ordered Qty", icon: BarChart3, width: "8%", aliases: ["orderedqty", "orderqty", "orderedquantity"] },
    { field: "landedQty", label: "Landed Qty", icon: BarChart3, width: "8%", aliases: ["landedqty", "landedquantity"] },
    { field: "remainQty", label: "Remain. Qty", icon: BarChart3, width: "8%", aliases: ["remainqty", "remainingqty", "remainquantity", "balanceqty"] },
    { field: "billQty", label: "Bill Qty", icon: Check, width: "7%", aliases: ["billqty", "billquantity"] },
    { field: "excessQty", label: "Excess Qty", icon: PlusCircle, width: "7%", aliases: ["excessqty", "excessquantity"] },
    { field: "rejectedQty", label: "Rejected Qty", icon: AlertTriangle, width: "7%", aliases: ["rejectedqty", "rejectedquantity", "rejectqty"] },
    { field: "rate", label: "Rate", icon: DollarSign, width: "7%", aliases: ["rate", "purchaserate"] },
    { field: "amount", label: "Amount", icon: DollarSign, width: "8%", aliases: ["amount", "totalamount"] },
    { field: "remarks", label: "Remarks", icon: MessageSquare, width: "9%", aliases: ["remarks", "remark"] },
];

const normalizeColumnName = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const ITEM_COLUMN_BY_ALIAS: Map<string, ItemColumnDef> = new Map(
    ITEM_COLUMN_DEFS.flatMap((def) => def.aliases.map((alias) => [alias, def] as const))
);

// A visible column is either a "known" field (renders with its dedicated
// input/combobox) or a "dynamic" one (API returned a column we don't have a
// specific renderer for — falls back to a generic text input). Every column
// with Show === true from fetchUserTableColumn ends up here; none are dropped.
interface VisibleColumn {
    key: string; // stable React key — TableColumnID from the API, or the field name for the pre-load fallback
    label: string; // always ColumnDisplayName from the API when available
    icon: React.ElementType;
    width: string;
    field: ItemColumnField | null; // null => dynamic/unmatched column, stored in line.extra[key]
}

const DEFAULT_DYNAMIC_ICON = Tag;

// ─── Searchable Combobox ──────────────────────────────────────────────────────
interface ComboboxOption {
    value: string;
    label: string;
}

interface SearchableComboboxProps {
    options: ComboboxOption[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
    onOpen?: () => void;
}

function SearchableCombobox({
    options,
    value,
    onValueChange,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyText = "No results found.",
    disabled = false,
    className,
    triggerClassName,
    onOpen,
}: SearchableComboboxProps) {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find((o) => o.value === value)?.label || value;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) onOpen?.();
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        "flex items-center justify-between w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:border-slate-300",
                        triggerClassName
                    )}
                >
                    <span className={cn("truncate", !selectedLabel && "text-slate-400")}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronsUpDown size={11} className="ml-1 shrink-0 text-slate-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("p-0 w-[220px]", className)}
                align="start"
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
                    <CommandList>
                        <CommandEmpty className="py-4 text-center text-xs text-slate-400">
                            {emptyText}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => {
                                        onValueChange(opt.value === value ? "" : opt.value);
                                        setOpen(false);
                                    }}
                                    className="text-xs cursor-pointer"
                                >
                                    <Check
                                        size={11}
                                        className={cn(
                                            "mr-2 shrink-0",
                                            value === opt.value ? "opacity-100 text-[#004687]" : "opacity-0"
                                        )}
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

// ─── Reusable Field Wrapper ───────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            <Icon size={12} className="text-[#004687]" />
            {label}
        </label>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                    <Icon size={12} className="text-[#004687]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">{title}</span>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

// ─── ClearableInput ───────────────────────────────────────────────────────────
function ClearableInput({ value, onChange, placeholder, className, ...rest }: Omit<React.ComponentProps<"input">, "onChange"> & { onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <input
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn("w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all pr-7", className)}
                {...rest}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <X size={11} />
                </button>
            )}
        </div>
    );
}

// ─── ComboboxWithClear ────────────────────────────────────────────────────────
function ComboboxWithClear({
    value,
    onClear,
    children,
}: {
    value: string;
    onClear: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            {children}
            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 z-10 transition-colors"
                >
                    <X size={11} />
                </button>
            )}
        </div>
    );
}

// ─── Line Item Row ────────────────────────────────────────────────────────────
// ─── Cell renderer for a single item-column field ─────────────────────────────
function renderLineItemCell(
    col: VisibleColumn,
    line: LineItem,
    updateLine: (id: number, field: keyof LineItem, value: string) => void,
    updateExtraField: (id: number, key: string, value: string) => void,
    inputCls: string,
    itemOptions: ComboboxOption[],
    itemDetailsList: ItemDetailItem[],
    onItemFieldOpen: () => void,
    unitOptions: ComboboxOption[],
    onBillUnitFieldOpen: (itemId: string) => void
) {
    if (col.field === null) {
        // Dynamic column — API returned it but we don't have a dedicated
        // renderer, so fall back to a plain text input bound to line.extra.
        return (
            <input
                value={line.extra[col.key] ?? ""}
                onChange={(e) => updateExtraField(line.id, col.key, e.target.value)}
                placeholder={col.label}
                className={inputCls}
            />
        );
    }

    switch (col.field) {
        case "item":
            return (
                <ComboboxWithClear
                    value={line.itemId}
                    onClear={() => {
                        updateLine(line.id, "item", "");
                        updateLine(line.id, "itemId", "");
                    }}
                >
                    <SearchableCombobox
                        options={itemOptions}
                        value={line.itemId}
                        onValueChange={(v) => {
                            const picked = itemDetailsList.find((it) => String(it.ItemID) === v);
                            updateLine(line.id, "itemId", v);
                            updateLine(line.id, "item", picked ? picked.ItemName : "");
                        }}
                        onOpen={onItemFieldOpen}
                        placeholder="Select Item"
                        searchPlaceholder="Search items…"
                        triggerClassName="h-7 text-[11px]"
                    />
                </ComboboxWithClear>
            );
        case "specification":
            return (
                <input
                    value={line.specification}
                    onChange={(e) => updateLine(line.id, "specification", e.target.value)}
                    placeholder="Specification"
                    className={inputCls}
                />
            );
        case "billUnit":
            return (
                <ComboboxWithClear value={line.billUnit} onClear={() => updateLine(line.id, "billUnit", "")}>
                    <SearchableCombobox
                        options={unitOptions}
                        value={line.billUnit}
                        onValueChange={(v) => updateLine(line.id, "billUnit", v)}
                        onOpen={() => onBillUnitFieldOpen(line.itemId)}
                        placeholder="Bill Unit"
                        searchPlaceholder="Search units…"
                        triggerClassName="h-7 text-[11px]"
                    />
                </ComboboxWithClear>
            );
        case "orderedQty":
            return (
                <input
                    value={line.orderedQty}
                    onChange={(e) => updateLine(line.id, "orderedQty", e.target.value)}
                    placeholder="Ordered Qty"
                    type="number"
                    className={cn(inputCls, "text-center font-medium")}
                />
            );
        case "landedQty":
            return (
                <input
                    value={line.landedQty}
                    onChange={(e) => updateLine(line.id, "landedQty", e.target.value)}
                    placeholder="Landed Qty"
                    type="number"
                    className={cn(inputCls, "text-center font-medium")}
                />
            );
        case "remainQty":
            return (
                <input
                    value={line.remainQty}
                    onChange={(e) => updateLine(line.id, "remainQty", e.target.value)}
                    placeholder="Remain. Qty"
                    type="number"
                    className={cn(inputCls, "text-center font-medium text-slate-500")}
                />
            );
        case "billQty":
            return (
                <input
                    value={line.billQty}
                    onChange={(e) => updateLine(line.id, "billQty", e.target.value)}
                    placeholder="Bill Qty"
                    type="number"
                    className={cn(inputCls, "text-center font-medium text-[#004687]")}
                />
            );
        case "excessQty":
            return (
                <input
                    value={line.excessQty}
                    onChange={(e) => updateLine(line.id, "excessQty", e.target.value)}
                    placeholder="0"
                    type="number"
                    className={cn(inputCls, "text-center font-medium text-amber-600")}
                />
            );
        case "rejectedQty":
            return (
                <input
                    value={line.rejectedQty}
                    onChange={(e) => updateLine(line.id, "rejectedQty", e.target.value)}
                    placeholder="0"
                    type="number"
                    className={cn(inputCls, "text-center font-medium text-rose-600")}
                />
            );
        case "rate":
            return (
                <input
                    value={line.rate}
                    onChange={(e) => updateLine(line.id, "rate", e.target.value)}
                    placeholder="Rate"
                    type="number"
                    className={cn(inputCls, "text-right")}
                />
            );
        case "amount":
            return (
                <input
                    value={line.amount}
                    onChange={(e) => updateLine(line.id, "amount", e.target.value)}
                    placeholder="0.00"
                    type="number"
                    className={cn(inputCls, "text-right font-semibold")}
                />
            );
        case "remarks":
            return (
                <input
                    value={line.remarks}
                    onChange={(e) => updateLine(line.id, "remarks", e.target.value)}
                    placeholder="Remarks"
                    className={inputCls}
                />
            );
        default:
            return null;
    }
}

const LineItemRow = memo(
    ({
        line,
        idx,
        visibleColumns,
        updateLine,
        updateExtraField,
        toggleSelected,
        removeLine,
        itemOptions,
        itemDetailsList,
        onItemFieldOpen,
        unitOptions,
        onBillUnitFieldOpen,
    }: {
        line: LineItem;
        idx: number;
        visibleColumns: VisibleColumn[];
        updateLine: (id: number, field: keyof LineItem, value: string) => void;
        updateExtraField: (id: number, key: string, value: string) => void;
        toggleSelected: (id: number) => void;
        removeLine: (id: number) => void;
        itemOptions: ComboboxOption[];
        itemDetailsList: ItemDetailItem[];
        onItemFieldOpen: () => void;
        unitOptions: ComboboxOption[];
        onBillUnitFieldOpen: (itemId: string) => void;
    }) => {
        const cellCls = "px-2 py-2";
        const inputCls = "h-7 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#6F8FAF]/60 w-full px-2 transition";

        return (
            <tr className={cn(
                "border-b border-slate-100 transition-colors group",
                idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                "hover:bg-blue-50/30"
            )}>
                {/* SI# */}
                <td className="px-2 py-2 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
                        {idx + 1}
                    </span>
                </td>

                {/* Select checkbox */}
                <td className="px-1 py-2 text-center">
                    <input
                        type="checkbox"
                        checked={line.selected}
                        onChange={() => toggleSelected(line.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
                    />
                </td>

                {/* Delete */}
                <td className="px-1 py-2 text-center">
                    <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                </td>

                {/* Columns driven by fetchUserTableColumn — every Show === true column renders */}
                {visibleColumns.map((col) => (
                    <td key={col.key} className={cellCls}>
                        {renderLineItemCell(col, line, updateLine, updateExtraField, inputCls, itemOptions, itemDetailsList, onItemFieldOpen, unitOptions, onBillUnitFieldOpen)}
                    </td>
                ))}
            </tr>
        );
    }
);
LineItemRow.displayName = "LineItemRow";

// ─── Component Props ──────────────────────────────────────────────────────────
interface CreateGoodsReceiptProps {
    onClose?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateGoodsreceipt({ onClose }: CreateGoodsReceiptProps) {
    const dispatch = useDispatch<AppDispatch>();

    // NOTE: assumes the root reducer key for this slice is "goodsReceipt" (the slice's `name`).
    // Adjust the state path below if your store mounts it under a different key.
    const documentStartWithList = useSelector(
        (state: RootState) => state.goodsReceipt.documentStartWithList
    );
    const supplierJobWorkerList = useSelector(
        (state: RootState) => state.goodsReceipt.supplierJobWorkerList
    );
    const userFormWiseStoreList = useSelector(
        (state: RootState) => state.goodsReceipt.userFormWiseStoreList
    );
    const companyStoreList = useSelector(
        (state: RootState) => state.goodsReceipt.companyStoreList
    );
    const purchaseOrdersForInPassList = useSelector(
        (state: RootState) => state.goodsReceipt.purchaseOrdersForInPassList
    );
    const inPassAgainstDocList = useSelector(
        (state: RootState) => state.goodsReceipt.inPassAgainstDocList
    );
    const userTableColumnList = useSelector(
        (state: RootState) => state.goodsReceipt.userTableColumnList
    );
    const itemDetailsList = useSelector(
        (state: RootState) => state.goodsReceipt.itemDetailsList
    );
    const itemUnitsList = useSelector(
        (state: RootState) => state.goodsReceipt.itemUnitsList
    );
    const selectedPurchaseOrderForInPassList = useSelector(
        (state: RootState) => state.goodsReceipt.selectedPurchaseOrderForInPassList
    );

    // Header / Form state placeholders
    const [documentType, setDocumentType] = useState("GOODS RECEIPT");
    const [grnNo, setGrnNo] = useState("GR-52");
    const [grnDate, setGrnDate] = useState(getToday());
    const [supplierJobworker, setSupplierJobworker] = useState("");

    const [receivedAt, setReceivedAt] = useState("");
    const [through, setThrough] = useState("");
    const [purchaseOrder, setPurchaseOrder] = useState("");
    const [billNo, setBillNo] = useState("");
    const [time, setTime] = useState("");
    const [billNeeded, setBillNeeded] = useState(true);

    const [remarks, setRemarks] = useState("");

    const [lines, setLines] = useState<LineItem[]>([newLineItem(1)]);

    // Submit flow state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // ── Reset the receipt items grid on every mount — clears both local rows
    // and any stale selectedPurchaseOrderForInPassList left in Redux from a
    // previous time this component was mounted, so a leftover PO's details
    // can't silently re-populate the grid before the user picks one. ──
    useEffect(() => {
        setLines([newLineItem(1)]);
        dispatch(clearSelectedPurchaseOrderForInPass());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch lookups on mount ──
    useEffect(() => {
        dispatch(fetchDocumentStartWith({ documentType: "GOODS RECEIPT" }));
        dispatch(fetchSupplierJobWorkers());
        dispatch(fetchInPassAgainstDoc({ startWith: "GOODS RECEIPT" }));
        // NOTE: "GoodsReceipt_Tbl" is a placeholder tableCode — swap in whatever
        // code the backend actually uses to identify this grid's columns.
        dispatch(fetchUserTableColumn({ tableCode: "GoodsReceipt_Tbl" }));
    }, [dispatch]);

    // ── Prefill Document + Goods Receipt No. once document types load ──
    useEffect(() => {
        if (documentStartWithList.length === 0) return;
        const doc = documentStartWithList.find((d) => d.SetDefault) ?? documentStartWithList[0];
        setDocumentType(doc.DocumentName);
        setGrnNo(`${doc.Prefix}-${doc.StartingNo}`);
    }, [documentStartWithList]);

    // NOTE: Purchase Order intentionally has no auto-prefill — it stays on the
    // "Select Order" placeholder until the user picks one.

    // ── Fetch Purchase Orders only when the user opens the field — not on mount —
    // since the result depends on whichever supplier is currently selected. ──
    const handlePurchaseOrderOpen = () => {
        if (inPassAgainstDocList.length === 0) return;
        dispatch(fetchPurchaseOrdersForInPass({
            documentID: inPassAgainstDocList[0].DocumentID,
            supplierId: supplierJobworker ? Number(supplierJobworker) : 0,
        }));
    };

    // ── Fetch full PO details (and prefill the receipt items grid) once a Purchase Order is picked ──
    const handlePurchaseOrderSelect = (value: string) => {
        setPurchaseOrder(value);
        const po = purchaseOrdersForInPassList.find((p) => p.SelectedDocNo === value);
        if (po) {
            dispatch(fetchSelectedPurchaseOrderForInPass({ purchaseOrderID: po.ID }));
        }
    };

    useEffect(() => {
        const master = selectedPurchaseOrderForInPassList[0];
        if (!master) return; // nothing fetched yet

        const details = master.LstInPassDetails ?? [];

        setLines(
            details.length > 0
                ? details.map((d) => ({
                      id: d.POTID,
                      selected: false,
                      itemId: String(d.ItemID),
                      item: d.ItemName,
                      specification: "",
                      billUnit: d.UnitName ?? "",
                      orderedQty: String(d.OrderedQty),
                      landedQty: String(d.LandedQty),
                      remainQty: String(d.RemainingQty),
                      billQty: String(d.BillQty),
                      excessQty: d.ExcessQty != null ? String(d.ExcessQty) : "",
                      rejectedQty: d.RejectedQty != null ? String(d.RejectedQty) : "",
                      rate: String(d.Rate),
                      amount: String(d.Amount),
                      remarks: d.Remarks ?? "",
                      extra: {},
                  }))
                : [newLineItem(1)] // PO has no detail lines — reset the grid to a single blank row
        );
    }, [selectedPurchaseOrderForInPassList]);

    // ── Prefill Received At once the user's form-wise store loads ──
    useEffect(() => {
        if (userFormWiseStoreList.length === 0) return;
        if (receivedAt) return; // don't clobber a value the user already picked
        setReceivedAt(userFormWiseStoreList[0].StoreName);
    }, [userFormWiseStoreList, receivedAt]);

    // ── Fetch stores when the "Received At" combobox is opened ──
    const handleReceivedAtOpen = () => {
        dispatch(fetchUserFormWiseStore());
        dispatch(fetchCompanyStore());
    };

    // ── Item table columns: `allColumns` is every field the API knows about
    // (regardless of its Show flag) — the full universe offered in the
    // "Select Fields" picker. `visibleColumns` is just the subset the user
    // has chosen to see in the table, defaulting to the first 15.
    const allColumns: VisibleColumn[] = useMemo(() => {
        if (userTableColumnList.length === 0) {
            return ITEM_COLUMN_DEFS.map((d) => ({ key: d.field, label: d.label, icon: d.icon, width: d.width, field: d.field }));
        }
        return userTableColumnList.map((c) => {
            const def = ITEM_COLUMN_BY_ALIAS.get(normalizeColumnName(c.ColumnName));
            return {
                key: String(c.TableColumnID),
                label: c.ColumnDisplayName || c.ColumnName,
                icon: def?.icon ?? DEFAULT_DYNAMIC_ICON,
                width: c.Width || def?.width || "8%",
                field: def?.field ?? null,
            };
        });
    }, [userTableColumnList]);

    const DEFAULT_VISIBLE_FIELD_COUNT = 15;
    const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(() =>
        allColumns.slice(0, DEFAULT_VISIBLE_FIELD_COUNT).map((c) => c.key)
    );
    const [fieldsPopoverOpen, setFieldsPopoverOpen] = useState(false);

    // `allColumns` at mount may only be the pre-API fallback list (fewer/different
    // fields than what the real API returns). Once the real list arrives, its keys
    // won't match the fallback keys, so re-apply "first 15" against the real list.
    // If the user has already made a selection that still matches (real keys),
    // this leaves it untouched — it never adds fields beyond what's selected.
    useEffect(() => {
        setSelectedFieldKeys((prev) => {
            const stillValid = prev.filter((k) => allColumns.some((c) => c.key === k));
            if (stillValid.length > 0) return stillValid;
            return allColumns.slice(0, DEFAULT_VISIBLE_FIELD_COUNT).map((c) => c.key);
        });
    }, [allColumns]);

    const visibleColumns: VisibleColumn[] = useMemo(
        () => allColumns.filter((c) => selectedFieldKeys.includes(c.key)),
        [allColumns, selectedFieldKeys]
    );

    const toggleFieldKey = (key: string) => {
        setSelectedFieldKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const itemOptions: ComboboxOption[] = useMemo(
        () => itemDetailsList.map((it) => ({ value: String(it.ItemID), label: it.ItemName })),
        [itemDetailsList]
    );

    // ── Fetch item details when the user opens the item field's dropdown ──
    const handleItemFieldOpen = () => {
        dispatch(fetchItemDetails());
    };

    const unitOptions: ComboboxOption[] = useMemo(
        () => itemUnitsList.map((u) => ({ value: u.Unit, label: u.Unit })),
        [itemUnitsList]
    );

    // ── Fetch units for the row's selected item when the Bill Unit dropdown opens ──
    const handleBillUnitFieldOpen = (itemId: string) => {
        if (!itemId) return; // no item picked yet on this row — nothing to look up units for
        dispatch(fetchUnitsOfSelectedItem({ itemID: Number(itemId) }));
    };

    const documentOptions: ComboboxOption[] = documentStartWithList.map((d) => ({
        value: d.DocumentName,
        label: d.DocumentName,
    }));
    const supplierJobworkerOptions: ComboboxOption[] = supplierJobWorkerList.map((s) => ({
        value: String(s.SupplierID),
        label: s.SupplierName,
    }));
    const receivedAtOptions: ComboboxOption[] = companyStoreList.map((s) => ({
        value: s.StoreName,
        label: s.StoreName,
    }));
    const purchaseOrderOptions: ComboboxOption[] = purchaseOrdersForInPassList.map((p) => {
        // firstDescr comes from the API as "Date:15-11-2024" — strip the label, keep the value.
        const poDate = p.firstDescr.replace(/^[^:]*:\s*/, "").trim();
        const parts = [p.SelectedDocNo, poDate, p.SuppilerName].filter(Boolean);
        return {
            value: p.SelectedDocNo,
            label: parts.join(" • "),
        };
    });

    // Calculated fields
    const netBillQty = lines.reduce((sum, l) => sum + (parseFloat(l.billQty) || 0), 0);
    const netRejectedQty = lines.reduce((sum, l) => sum + (parseFloat(l.rejectedQty) || 0), 0);
    const totalAmount = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

    const updateLine = (id: number, field: keyof LineItem, value: string) => {
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    };

    const updateExtraField = (id: number, key: string, value: string) => {
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, extra: { ...l.extra, [key]: value } } : l)));
    };

    const toggleSelected = (id: number) => {
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)));
    };

    const addLine = () => {
        setLines((ls) => [...ls, newLineItem(ls.length > 0 ? Math.max(...ls.map((l) => l.id)) + 1 : 1)]);
    };

    const removeLine = (id: number) => {
        setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));
    };

    const handleClear = () => {
        if (documentStartWithList.length > 0) {
            const doc = documentStartWithList.find((d) => d.SetDefault) ?? documentStartWithList[0];
            setDocumentType(doc.DocumentName);
            setGrnNo(`${doc.Prefix}-${doc.StartingNo}`);
        } else {
            setDocumentType("GOODS RECEIPT");
            setGrnNo("GR-52");
        }
        setGrnDate(getToday());
        setSupplierJobworker("");
        setReceivedAt("");
        setThrough("");
        setPurchaseOrder("");
        setBillNo("");
        setTime("");
        setBillNeeded(true);
        setRemarks("");
        setLines([newLineItem(1)]);
    };

    // ── Submit: verify the bill isn't already used for this supplier, then save ──
    const handleSubmit = async () => {
        setSubmitError(null);

        if (!supplierJobworker) {
            setSubmitError("Please select a Supplier/Jobworker before submitting.");
            return;
        }
        const validLines = lines.filter((l) => l.itemId);
        if (validLines.length === 0) {
            setSubmitError("Add at least one item line before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Make sure this Bill No. hasn't already been recorded against this supplier.
            const existResult = await dispatch(
                checkSupplyInvoiceExist({
                    str: billNo,
                    supplierID: Number(supplierJobworker),
                    inpassID: 0, // 0 = new/unsaved goods receipt
                })
            ).unwrap();

            // NOTE: assumes a non-zero result means a matching supply invoice was
            // already found for this supplier/bill no. — flip this check if the
            // API's convention turns out to be the reverse.
            if (existResult) {
                setSubmitError("A supply invoice with this Bill No. already exists for this supplier.");
                setIsSubmitting(false);
                return;
            }

            // 2. Build the save payload from current header + line state.
            const master = selectedPurchaseOrderForInPassList[0];
            if (!master) {
                setSubmitError("Purchase order details haven't finished loading yet. Please wait a moment and try again.");
                setIsSubmitting(false);
                return;
            }

            const supplier = supplierJobWorkerList.find((s) => String(s.SupplierID) === supplierJobworker);
            const store =
                companyStoreList.find((s) => s.StoreName === receivedAt) ??
                userFormWiseStoreList.find((s) => s.StoreName === receivedAt);
            const doc = documentStartWithList.find((d) => d.DocumentName === documentType);
            if (!doc) {
                setSubmitError("Document type details haven't finished loading yet. Please wait a moment and try again.");
                setIsSubmitting(false);
                return;
            }
            const inPassDoc = inPassAgainstDocList[0];
            if (!inPassDoc) {
                setSubmitError('"Against" document details haven\'t finished loading yet. Please wait a moment and try again.');
                setIsSubmitting(false);
                return;
            }

            // Every line submitted must be one of the PO's actual detail lines —
            // its POTID has to match a real PurchaseOrderDetail row on the server,
            // or the backend can't resolve "entity" for that line and throws
            // "Value cannot be null. Parameter name: entity". A row added via
            // "Add Line Item" (not prefilled from the selected PO) carries a
            // locally-generated id instead of a real POTID, so catch that here
            // rather than letting it reach the API.
            const validPOTIDs = new Set((master.LstInPassDetails ?? []).map((d) => d.POTID));
            const invalidLine = validLines.find((l) => !validPOTIDs.has(l.id));
            if (invalidLine) {
                setSubmitError(
                    `"${invalidLine.item || "A manually added line"}" isn't one of the selected purchase order's items and can't be submitted.`
                );
                setIsSubmitting(false);
                return;
            }

            const now = new Date();
            const nowTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"

            const lstInPassDetails: SaveInPassDetailLine[] = validLines.map((l) => ({
                InPassTID: 0, // 0 = new line
                InPassMID: master?.InPassID ?? 0,
                InPassM: null,
                POTID: l.id,
                OrderedQty: Number(l.orderedQty) || 0,
                LandedQty: Number(l.landedQty) || 0,
                ExcessQty: Number(l.excessQty) || 0,
                RejectedQty: l.rejectedQty ? Number(l.rejectedQty) : null,
                Rate: Number(l.rate) || 0,
                Amount: l.amount || "0",
                Remarks: l.remarks || null,
                ItemID: Number(l.itemId) || 0,
                ItemM: null,
                // NOTE: the Bill Unit combobox stores the unit name, not an ID —
                // wire in the real UnitID here if/when the API exposes one per unit.
                UnitID: 0,
                ItemUnit: null,
                BatchID: 0,
                ItemBatchM: null,
                CompanyID: 1,
                BranchID: null,
                FinYearID: null,
                Status: true,
                UserID: 0,
                EntryDate: now.toISOString(),
                ModifiedUserID: null,
                ModifiedDate: null,
                POID: master?.POID ?? 0,
                StockInLedgerID: null,
                StockLedger: null,
                StockInID: null,
                ItemStock: null,
                SpecID: null,
                OutPassQty: null,
                BillQty: Number(l.billQty) || 0,
                BillUnitID: 0,
                BillUnit: l.billUnit,
                Damaged: false,
                StockRate: null,
                LstInpassOutDetails: null,
                ItemName: l.item,
                Unit: null,
                UnitMultiplier: 1,
                UnitName: l.billUnit,
                TotalLandedQty: Number(l.landedQty) || 0,
                Spec: null,
                ExactStockCheck: false,
                RemainingQty: l.remainQty,
                PrevLandedQty: 0,
                InpassQty: Number(l.landedQty) || 0,
                ShowRate: true,
                InsufficientStock: false,
                PhyStkDate: now.toISOString(),
                Area: "",
            }));

            const payload: SaveGoodsReceiptPayload = {
                AgainstDocumentName: inPassDoc?.DocumentName ?? documentType,
                BillNeeded: billNeeded,
                BillNo: billNo,
                // NOTE: this form doesn't currently collect a currency — wire these
                // in if/when a Currency field is added to the header section.
                Currency: "",
                CurrencyID: 0,
                DocumentID: doc?.DocumentID ?? 0,
                DocumentName: documentType,
                DocumentTypeName: inPassDoc?.DocumentTypeName ?? "",
                ExRate: 1,
                GrossAmount: totalAmount,
                InPassDate: grnDate,
                InPassDateStr: grnDate,
                InPassDateTimeStr: `${grnDate} ${time || nowTime}`,
                InPassDocument: null,
                InPassNo: grnNo,
                InPassTime: time || nowTime,
                InPassTimeStr: time || nowTime,
                InspectedDate: null,
                LocationName: master?.LocationName ?? null,
                LstInPass: [],
                LstInPassBOMTDetails: [],
                LstInPassDetails: lstInPassDetails,
                NetAmount: totalAmount,
                OtherAdditionalAmount: 0,
                OtherDeductionAmount: 0,
                PODocID: master?.PODocID ?? 0,
                POID: master?.POID ?? 0,
                PartyCode: master?.PartyCode ?? "",
                ProfNo: master?.ProfNo ?? "",
                SecurityInwardDate: null,
                SelectedDocNo: purchaseOrder,
                StoreID: store?.StoreID ?? 0,
                StoreName: receivedAt,
                SupplierID: Number(supplierJobworker),
                SupplierName: supplier?.SupplierName ?? "",
                SupplierStoreID: supplier?.SupplierStoreID ?? 0,
            };

            // 3. Save.
            // eslint-disable-next-line no-console
            console.debug("[GoodsReceipt] SaveChanges payload:", payload);
            await dispatch(saveGoodsReceipt({ payload })).unwrap();

            handleClear();
            onClose?.();
        } catch (err) {
            setSubmitError(typeof err === "string" ? err : "Failed to submit the goods receipt.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* ── Page Header ── */}
            <div className="p-4 flex items-center justify-between" style={{ background: "#004687" }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
                        <PackageCheck size={18} color="white" strokeWidth={2.2} />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-wide">Goods Receipt</h1>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                    Goods Receipt Detail
                </button>
            </div>
            <div className="px-2 py-3">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

                    {/* ── Page Container Content ── */}
                    <div className="p-5 bg-slate-50/30 space-y-4">

                        {/* ── Section 1: Goods Receipt Details ── */}
                        <SectionCard title="Goods Receipt Details" icon={Receipt}>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <FieldLabel icon={ClipboardList} label="Document" />
                                    <ComboboxWithClear value={documentType} onClear={() => setDocumentType("")}>
                                        <SearchableCombobox
                                            options={documentOptions}
                                            value={documentType}
                                            onValueChange={setDocumentType}
                                            placeholder="Select Document"
                                            searchPlaceholder="Search documents…"
                                        />
                                    </ComboboxWithClear>
                                </div>
                                <div>
                                    <FieldLabel icon={Hash} label="Goods Receipt No." />
                                    <input
                                        value={grnNo}
                                        onChange={(e) => setGrnNo(e.target.value)}
                                        className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all font-mono font-semibold text-[#004687]"
                                    />
                                </div>
                                <div>
                                    <FieldLabel icon={Calendar} label="Date" />
                                    <input
                                        type="date"
                                        value={grnDate}
                                        onChange={(e) => setGrnDate(e.target.value)}
                                        className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <FieldLabel icon={User} label="Supplier/Jobworker" />
                                    <ComboboxWithClear value={supplierJobworker} onClear={() => setSupplierJobworker("")}>
                                        <SearchableCombobox
                                            options={supplierJobworkerOptions}
                                            value={supplierJobworker}
                                            onValueChange={setSupplierJobworker}
                                            placeholder="Select Supplier/Jobworker"
                                            searchPlaceholder="Search suppliers…"
                                        />
                                    </ComboboxWithClear>
                                </div>

                                <div>
                                    <FieldLabel icon={Store} label="Received At" />
                                    <ComboboxWithClear value={receivedAt} onClear={() => setReceivedAt("")}>
                                        <SearchableCombobox
                                            options={receivedAtOptions}
                                            value={receivedAt}
                                            onValueChange={setReceivedAt}
                                            placeholder="Select Store"
                                            searchPlaceholder="Search stores…"
                                            onOpen={handleReceivedAtOpen}
                                        />
                                    </ComboboxWithClear>
                                </div>
                                <div>
                                    <FieldLabel icon={ArrowLeftRight} label="Through" />
                                    <ClearableInput value={through} onChange={setThrough} placeholder="Enter Details" />
                                </div>
                                <div>
                                    <FieldLabel icon={ShoppingCart} label="Purchase Order" />
                                    <ComboboxWithClear value={purchaseOrder} onClear={() => setPurchaseOrder("")}>
                                        <SearchableCombobox
                                            options={purchaseOrderOptions}
                                            value={purchaseOrder}
                                            onValueChange={handlePurchaseOrderSelect}
                                            placeholder="Select Order"
                                            searchPlaceholder="Search orders…"
                                            className="w-[320px]"
                                            onOpen={handlePurchaseOrderOpen}
                                        />
                                    </ComboboxWithClear>
                                </div>
                                <div>
                                    <FieldLabel icon={FileText} label="Bill No." />
                                    <ClearableInput value={billNo} onChange={setBillNo} placeholder="Enter Bill No." />
                                </div>

                                <div />
                                <div />
                                <div />
                                <div>
                                    <FieldLabel icon={Clock} label="Time" />
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="flex-1 h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                        />
                                        <label className="flex items-center gap-1.5 text-[13px] text-slate-600 whitespace-nowrap cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={billNeeded}
                                                onChange={(e) => setBillNeeded(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
                                            />
                                            Bill Needed
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Section 2: Line Items Table ── */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                        <Package size={11} className="text-[#004687]" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Receipt Items</span>
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[10px] font-bold">{lines.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Popover open={fieldsPopoverOpen} onOpenChange={setFieldsPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-[#004687] hover:bg-[#004687]/5 px-2 py-1 rounded-lg transition-all"
                                                title="Choose which columns are shown"
                                            >
                                                <Columns3 size={10} /> Select Fields
                                                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[9px] font-bold">
                                                    {selectedFieldKeys.length}/{allColumns.length}
                                                </span>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-64 p-0">
                                            <Command>
                                                <CommandInput placeholder="Search fields..." className="text-xs h-8" />
                                                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFieldKeys(allColumns.map((c) => c.key))}
                                                        className="text-[10px] font-semibold text-[#004687] hover:underline"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFieldKeys(allColumns.slice(0, DEFAULT_VISIBLE_FIELD_COUNT).map((c) => c.key))}
                                                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 hover:underline"
                                                    >
                                                        Reset to default
                                                    </button>
                                                </div>
                                                <CommandList className="max-h-72">
                                                    <CommandEmpty>No fields found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {allColumns.map((col) => {
                                                            const checked = selectedFieldKeys.includes(col.key);
                                                            return (
                                                                <CommandItem
                                                                    key={col.key}
                                                                    value={col.label}
                                                                    onSelect={() => toggleFieldKey(col.key)}
                                                                    className="flex items-center gap-2 text-[11px] cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        readOnly
                                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 pointer-events-none"
                                                                    />
                                                                    <col.icon size={11} className="opacity-60 shrink-0" />
                                                                    <span className="truncate">{col.label}</span>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <button
                                        type="button"
                                        onClick={() => setLines([newLineItem(1)])}
                                        className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                        title="Clear all rows"
                                    >
                                        <Trash2 size={10} /> Clear All
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                                    <colgroup>
                                        <col style={{ width: 36 }} />
                                        <col style={{ width: 30 }} />
                                        <col style={{ width: 30 }} />
                                        {visibleColumns.map((col) => (
                                            <col key={col.key} />
                                        ))}
                                    </colgroup>
                                    <thead>
                                        <tr style={{ background: "linear-gradient(135deg, #004687 0%, #6F8FAF 100%)" }}>
                                            {[
                                                { key: "si", label: "#", icon: null, center: true },
                                                { key: "chk", label: "", icon: null, center: true },
                                                { key: "del", label: "", icon: null, center: true },
                                                ...visibleColumns.map((col) => ({
                                                    key: col.key,
                                                    label: col.label,
                                                    icon: col.icon,
                                                    center: false,
                                                })),
                                            ].map((h) => (
                                                <th key={h.key} style={{
                                                    padding: "8px 10px",
                                                    fontSize: 9.5,
                                                    fontWeight: 700,
                                                    color: "rgba(255,255,255,0.9)",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.03em",
                                                    textAlign: h.center ? "center" : "left",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "middle",
                                                }}>
                                                    {h.icon ? (
                                                        <span className={cn("flex items-center gap-1", h.center ? "justify-center" : "justify-start")}>
                                                            <h.icon size={9} className="opacity-70 shrink-0" />
                                                            <span>{h.label}</span>
                                                        </span>
                                                    ) : h.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, idx) => (
                                            <LineItemRow
                                                key={line.id}
                                                line={line}
                                                idx={idx}
                                                visibleColumns={visibleColumns}
                                                updateLine={updateLine}
                                                updateExtraField={updateExtraField}
                                                toggleSelected={toggleSelected}
                                                removeLine={removeLine}
                                                itemOptions={itemOptions}
                                                itemDetailsList={itemDetailsList}
                                                onItemFieldOpen={handleItemFieldOpen}
                                                unitOptions={unitOptions}
                                                onBillUnitFieldOpen={handleBillUnitFieldOpen}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                type="button"
                                onClick={addLine}
                                className="w-full py-2.5 text-[11px] font-bold text-[#004687] hover:bg-[#004687]/5 border-t border-slate-100 flex items-center justify-center gap-2 transition-colors cursor-pointer group"
                            >
                                <span className="w-5 h-5 rounded-full border-2 border-dashed border-[#004687]/40 group-hover:border-[#004687] flex items-center justify-center transition-colors">
                                    <Plus size={10} />
                                </span>
                                Add Line Item
                            </button>
                        </div>

                        {/* ── Section 3: Remarks & Summary Stats ── */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                    <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                        <MessageSquare size={11} className="text-[#004687]" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Remarks</span>
                                </div>
                                <div className="p-4">
                                    <Textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter Remarks, If Any"
                                        className="text-[13px] text-slate-700 border border-slate-200 rounded-lg resize-none h-[72px] focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:border-sky-400 bg-white placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="rounded-xl border border-[#004687]/20 bg-gradient-to-br from-[#004687]/5 to-[#6F8FAF]/5 shadow-sm p-4 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <Check size={11} className="text-[#6F8FAF]" /> Bill Qty
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {netBillQty > 0 ? netBillQty.toLocaleString() : "—"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-slate-200/60 py-2">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <AlertTriangle size={11} className="text-rose-500" /> Rej. Qty
                                        </span>
                                        <span className="text-sm font-bold text-rose-600">
                                            {netRejectedQty > 0 ? netRejectedQty.toLocaleString() : "—"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <DollarSign size={11} className="text-[#004687]" /> Net Amount
                                        </span>
                                        <span className="text-lg font-extrabold text-[#004687]">
                                            {totalAmount > 0 ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
                        {submitError ? (
                            <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                <AlertTriangle size={10} /> {submitError}
                            </p>
                        ) : (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Info size={10} /> Complete all mandatory material entries before submitting
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="h-9 px-5 text-[13px] font-medium border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleClear}
                                className="h-9 px-6 text-[13px] font-semibold text-white rounded-lg shadow-none gap-1.5 transition-colors cursor-pointer"
                                style={{ background: "#f59e0b" }}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-9 px-6 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg shadow-none gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save size={12} />
                                {isSubmitting ? "Submitting…" : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
