"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    FileText, Hash, Calendar, Store, Truck,
    StickyNote, Layers, Boxes, RefreshCw, Save,
    Trash2, ChevronsUpDown, ArrowLeftRight, Eye,
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchDocumentMasters,
    fetchStoreStartWith,
    fetchItemsBySearch,
    fetchItemSpecifications,
    saveMaterialIssue,
    clearItemSpecifications,
    clearSaveState,
    type ItemSpecification,
    type MaterialIssuePayload,
} from "@/store/features/inventory/stockManagement/materialIssueDetailSlice";
import { toast } from "sonner";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ─────────────────────────────────────────────────────────────────────
type LineItem = {
    id: number;
    itemID: number | null;
    item: string;
    specification: string;
    size: string;
    design: string;
    unit: string;
    stock: string;
    reqQty: string;
    issuedQty: string;
    rate: string;
};

function makeEmptyRow(id: number): LineItem {
    return {
        id,
        itemID: null,
        item: "",
        specification: "",
        size: "",
        design: "",
        unit: "",
        stock: "",
        reqQty: "",
        issuedQty: "",
        rate: "",
    };
}

// ─── FieldLabel ────────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5" style={{ color: BRAND }}>
            <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
            {label}
        </label>
    );
}

// ─── InputField ────────────────────────────────────────────────────────────────
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
                    readOnly
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-gray-700"
                )}
                style={
                    !readOnly
                        ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }
                        : undefined
                }
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
            <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}
            >
                {icon}
            </span>
        </div>
    );
}

// ─── SearchableCombobox ────────────────────────────────────────────────────────
function SearchableCombobox({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    icon,
    onOpen,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    icon: React.ReactNode;
    onOpen?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

    const handleOpenChange = (next: boolean) => {
        if (next && onOpen) onOpen();
        setOpen(next);
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
                        boxShadow: open
                            ? `0 0 0 2px ${BRAND}22`
                            : "0 1px 3px rgba(0,70,135,0.05)",
                        color: value ? "#374151" : "#9ca3af",
                    }}
                >
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#93b8d8" }}
                    >
                        {icon}
                    </span>
                    <span className="flex-1 truncate">{selectedLabel || placeholder}</span>
                    {value ? (
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 transition-colors text-base leading-none"
                            style={{ color: "#93b8d8" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                                setOpen(false);
                            }}
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
            <PopoverContent
                className="p-0 w-[var(--radix-popover-trigger-width)]"
                style={{ zIndex: 50 }}
                align="start"
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
                    <CommandList>
                        <CommandEmpty className="py-4 text-center text-sm text-gray-400">
                            {emptyText}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className="text-sm cursor-pointer"
                                >
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

// ─── CellInput  ──────────────────────────────────────
function CellInput({
    placeholder,
    value,
    onChange,
    readOnly,
    align = "left",
    type = "text",
}: {
    placeholder: string;
    value: string;
    onChange?: (v: string) => void;
    readOnly?: boolean;
    align?: "left" | "right";
    type?: string;
}) {
    return (
        <input
            type={type} //  FIXED: Bind the dynamic type variable here
            readOnly={readOnly}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn(
                "w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none transition-all",
                align === "right" && "text-right",
                readOnly
                    ? "bg-gray-50 text-gray-900 cursor-not-allowed border-slate-200"
                    : "bg-white text-gray-700"
            )}
            style={!readOnly ? { borderColor: "#d1dff0" } : undefined}
            onFocus={(e) => {
                if (!readOnly) {
                    e.currentTarget.style.borderColor = BRAND;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`;
                }
            }}
            onBlur={(e) => {
                if (!readOnly) {
                    e.currentTarget.style.borderColor = "#d1dff0";
                    e.currentTarget.style.boxShadow = "none";
                }
            }}
        />
    );
}


// ─── LineItemCombobox (item search inside table cells) ────────────────────────
function LineItemCombobox({
    displayLabel,
    options,
    loading,
    onChange,
    onOpen,
}: {
    value: string;
    displayLabel: string;
    options: { label: string; value: string }[];
    loading: boolean;
    onChange: (value: string, label: string) => void;
    onOpen: () => void;
}) {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (next: boolean) => {
        if (next) onOpen();
        setOpen(next);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none transition-all text-left"
                    style={{
                        borderColor: open ? BRAND : "#d1dff0",
                        boxShadow: open ? `0 0 0 2px ${BRAND}22` : undefined,
                        color: displayLabel ? "#374151" : "#9ca3af",
                        minWidth: 0,
                    }}
                >
                    <span className="truncate flex-1">
                        {displayLabel || "Select Item"}
                    </span>
                    <ChevronsUpDown size={11} className="ml-1 shrink-0" style={{ color: "#93b8d8" }} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                style={{ width: 260, zIndex: 9999 }}
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search item…" className="h-8 text-xs" />
                    <CommandList>
                        {loading ? (
                            <div className="py-4 text-center text-xs text-gray-400">
                                Loading…
                            </div>
                        ) : (
                            <>
                                <CommandEmpty className="py-4 text-center text-xs text-gray-400">
                                    No items found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {options.map((opt) => (
                                        <CommandItem
                                            key={opt.value}
                                            value={opt.label}
                                            onSelect={() => {
                                                onChange(opt.value, opt.label);
                                                setOpen(false);
                                            }}
                                            className="text-xs cursor-pointer"
                                        >
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

// ─── SpecificationCombobox ────────────────────────────────────────────────────
function SpecificationCombobox({
    value,
    options,
    loading,
    onChange,
    onOpen,
}: {
    value: string;
    options: ItemSpecification[];
    loading: boolean;
    onChange: (v: string) => void;
    onOpen: () => boolean; // returns false if item not selected (caller shows toast)
}) {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (next: boolean) => {
        if (next) {
            const canOpen = onOpen();
            if (!canOpen) return; // blocked — toast already fired by caller
        }
        setOpen(next);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border bg-white outline-none transition-all text-left"
                    style={{
                        borderColor: open ? BRAND : "#d1dff0",
                        boxShadow: open ? `0 0 0 2px ${BRAND}22` : undefined,
                        color: value ? "#374151" : "#9ca3af",
                        minWidth: 0,
                    }}
                >
                    <span className="truncate flex-1">{value || "Specification"}</span>
                    <ChevronsUpDown size={11} className="ml-1 shrink-0" style={{ color: "#93b8d8" }} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                style={{ width: 240, zIndex: 9999 }}
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search specification…" className="h-8 text-xs" />
                    <CommandList>
                        {loading ? (
                            <div className="py-4 text-center text-xs text-gray-400">Loading…</div>
                        ) : (
                            <>
                                <CommandEmpty className="py-4 text-center text-xs text-gray-400">
                                    No specifications found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {options.map((spec) => (
                                        <CommandItem
                                            key={spec.SpecID}
                                            value={spec.Spec}
                                            onSelect={() => {
                                                onChange(spec.Spec);
                                                setOpen(false);
                                            }}
                                            className="text-xs cursor-pointer"
                                        >
                                            {spec.Spec}
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

// ─── Items Table ───────────────────────────────────────────────────────────────
function ItemsTable({
    rows,
    onAdd,
    onRemove,
    onUpdate,
    onItemSelect,
    itemOptions,
    itemsLoading,
    onItemOpen,
    specOptions,
    specsLoading,
    onSpecOpen,
}: {
    rows: LineItem[];
    onAdd: () => void;
    onRemove: (id: number) => void;
    onUpdate: (id: number, field: keyof LineItem, value: string) => void;
    onItemSelect: (rowId: number, itemID: string, itemName: string, unit: string) => void;
    itemOptions: { label: string; value: string; unit: string }[];
    itemsLoading: boolean;
    onItemOpen: () => void;
    specOptions: ItemSpecification[];
    specsLoading: boolean;
    onSpecOpen: (rowId: number) => boolean;
}) {
    const thClass =
        "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-white whitespace-nowrap";

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: BRAND_MID }}
        >
            {/* Table header bar */}
            <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: BRAND }}
            >
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-white/80" />
                    <span className="text-xs font-bold tracking-widest uppercase text-white">
                        Line Items
                    </span>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: BRAND_LIGHT, color: BRAND }}
                >
                    + Add Row
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr style={{ background: BRAND }}>
                            <th className={thClass} style={{ width: 52 }}>Sl.No.</th>
                            <th className={thClass} style={{ width: 180 }}>Item</th>
                            <th className={thClass} style={{ width: 170 }}>Specification</th>
                            <th className={thClass} style={{ width: 130 }}>Size</th>
                            <th className={thClass} style={{ width: 160 }}>Design</th>
                            <th className={thClass} style={{ width: 100 }}>Unit</th>
                            <th className={thClass} style={{ width: 90, textAlign: "right" }}>Req. Qty</th>
                            <th className={thClass} style={{ width: 100, textAlign: "right" }}>Issued Qty</th>
                            <th className={thClass} style={{ width: 90, textAlign: "right" }}>Rate</th>
                            <th className={thClass} style={{ width: 80, textAlign: "right" }}>Stock</th>
                            <th className={thClass} style={{ width: 80, textAlign: "center" }}>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr
                                key={row.id}
                                className="border-b transition-colors hover:bg-blue-50/40"
                                style={{ borderColor: BRAND_MID }}
                            >
                                {/* Sl.No. */}
                                <td className="px-3 py-1.5 align-middle">
                                    <span className="text-xs font-semibold text-slate-500">
                                        {idx + 1}
                                    </span>
                                </td>

                                {/* Item — searchable combobox */}
                                <td className="px-2 py-1.5 align-middle">
                                    <LineItemCombobox
                                        value={row.itemID ? String(row.itemID) : ""}
                                        displayLabel={row.item}
                                        options={itemOptions}
                                        loading={itemsLoading}
                                        onOpen={onItemOpen}
                                        onChange={(itemID, itemName) => {
                                            const matched = itemOptions.find((o) => o.value === itemID);
                                            onItemSelect(row.id, itemID, itemName, matched?.unit ?? "");
                                        }}
                                    />
                                </td>

                                {/* Specification */}
                                <td className="px-2 py-1.5 align-middle">
                                    <SpecificationCombobox
                                        value={row.specification}
                                        options={specOptions}
                                        loading={specsLoading}
                                        onChange={(v) => onUpdate(row.id, "specification", v)}
                                        onOpen={() => onSpecOpen(row.id)}
                                    />
                                </td>

                                {/* Size */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Size"
                                        value={row.size}
                                        onChange={(v) => onUpdate(row.id, "size", v)}
                                    />
                                </td>

                                {/* Design */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Design"
                                        value={row.design}
                                        onChange={(v) => onUpdate(row.id, "design", v)}
                                    />
                                </td>

                                {/* Unit — read-only, auto-filled */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Unit"
                                        value={row.unit}
                                        readOnly
                                    />
                                </td>

                                {/* Req. Qty — editable */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Quantity"
                                        value={row.reqQty}
                                        onChange={(v) => onUpdate(row.id, "reqQty", v)}
                                        type="number"
                                        align="right"
                                    />
                                </td>

                                {/* Issued Qty — editable */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Quantity"
                                        value={row.issuedQty}
                                        onChange={(v) => onUpdate(row.id, "issuedQty", v)}
                                        type="number"
                                        align="right"
                                    />
                                </td>

                                {/* Rate — manually enterable */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="0.00"
                                        value={row.rate}
                                        onChange={(v) => onUpdate(row.id, "rate", v)}
                                        type="number"
                                        align="right"
                                    />
                                </td>

                                {/* Stock — read-only */}
                                <td className="px-2 py-1.5 align-middle">
                                    <CellInput
                                        placeholder="Stock"
                                        value={row.stock}
                                        readOnly
                                        align="right"
                                    />
                                </td>

                                {/* Options */}
                                <td className="px-2 py-1.5 align-middle">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            title="View stock details"
                                        >
                                            <Eye size={13} className="text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => onRemove(row.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Remove row"
                                        >
                                            <Trash2 size={13} className="text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={11}
                                    className="py-10 text-center text-xs text-slate-300"
                                >
                                    No line items. Click "+ Add Row" to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const CreateMaterialIssueDetail: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Redux state ───────────────────────────────────────────────────────────
    const {
        documentMasters,
        documentMastersLoading,
        storesStartWith,
        storesStartWithLoading,
        itemsBySearch,
        itemsBySearchLoading,
        itemSpecifications,
        itemSpecificationsLoading,
        saveLoading,
        savedDocumentNo,
    } = useSelector((state: RootState) => state.materialIssueDetail);

    const itemOptions = itemsBySearch.map((i) => ({
        label: i.ItemName,
        value: String(i.ItemID),
        unit: i.ItemUnit,
    }));

    // ── Derived option lists ──────────────────────────────────────────────────
    const documentOptions = documentMasters.map((d) => ({
        label: d.DocumentName,
        value: String(d.DocumentID),
    }));

    const storeOptions = storesStartWith.map((s) => ({
        label: s.StoreName,
        value: String(s.StoreID),
    }));

    // ── Fetch on mount ────────────────────────────────────────────────────────
    const mountedRef = useRef(false);
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        dispatch(fetchDocumentMasters());
        dispatch(fetchStoreStartWith());
    }, [dispatch]);

    // ── Prefill Document + Document No. when documentMasters loads ────────────
    useEffect(() => {
        if (documentMasters.length === 0) return;
        const defaultDoc =
            documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
        setDocument_(String(defaultDoc.DocumentID));
        const suffix = defaultDoc.Suffix ?? "";
        setDocumentNo(`${defaultDoc.Prefix}${defaultDoc.StartingNo}${suffix}`);
    }, [documentMasters]);

    // ── Header fields ─────────────────────────────────────────────────────────
    const [document_, setDocument_] = useState("");
    const [documentNo, setDocumentNo] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [fromStore, setFromStore] = useState("");
    const [toStore, setToStore] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [remarks, setRemarks] = useState("");

    // ── Line items ────────────────────────────────────────────────────────────
    const [rows, setRows] = useState<LineItem[]>([makeEmptyRow(1)]);
    let nextId = rows.length + 1;

    const handleAddRow = () => {
        setRows((prev) => [...prev, makeEmptyRow(nextId++)]);
    };

    const handleRemoveRow = (id: number) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const handleUpdateRow = (id: number, field: keyof LineItem, value: string) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    // ── Derived totals ────────────────────────────────────────────────────────
    const totalIssuedQty = rows.reduce(
        (sum, r) => sum + (parseFloat(r.issuedQty) || 0),
        0
    );

    // ── Clear ─────────────────────────────────────────────────────────────────
    const handleClear = () => {
        // Re-derive defaults from Redux state
        if (documentMasters.length > 0) {
            const defaultDoc =
                documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
            setDocument_(String(defaultDoc.DocumentID));
            const suffix = defaultDoc.Suffix ?? "";
            setDocumentNo(`${defaultDoc.Prefix}${defaultDoc.StartingNo}${suffix}`);
        } else {
            setDocument_("");
            setDocumentNo("");
        }
        setDate(new Date().toISOString().split("T")[0]);
        setFromStore("");
        setToStore("");
        setVehicleNo("");
        setRemarks("");
        setRows([makeEmptyRow(1)]);
    };

    const handleItemSelect = (
        rowId: number,
        itemID: string,
        itemName: string,
        unit: string
    ) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === rowId
                    ? { ...r, itemID: Number(itemID), item: itemName, unit, specification: "" }
                    : r
            )
        );
        // Clear stale specs when item changes
        dispatch(clearItemSpecifications());
    };

    // Returns true if open is allowed; false if blocked (with toast).
    const handleSpecOpen = (rowId: number): boolean => {
        const row = rows.find((r) => r.id === rowId);
        if (!row?.itemID) {
            toast.error("Please select item", {
                style: {
                    background: "#FF4433",
                    color: "white",
                    border: "1px solid #d97706",
                },
            });
            return false;
        }
        dispatch(fetchItemSpecifications({ itemID: row.itemID }))
            .unwrap()
            .then((specs) => {
                if (specs.length === 0) {
                    toast.warning("No specifications for the selected item", {
                        style: {
                            background: "#4C5C2D",
                            color: "white",
                            border: "1px solid #d97706",
                        }
                    });
                }
            })
            .catch(() => {
                // network/API errors are already captured in Redux; nothing extra needed
            });
        return true;
    };

    // ── Post-save: show success toast and navigate back ───────────────────────
    useEffect(() => {
        if (!savedDocumentNo) return;
        toast.success(`Material Issue saved — ${savedDocumentNo}`, {
            style: {
                background: "#097969",
                color: "white",
                border: "1px solid #003560",
            },
        });
        dispatch(clearSaveState());
        onBack?.();
    }, [savedDocumentNo]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        // Validate: every row that has an item must have issuedQty and rate
        const filledRows = rows.filter((r) => r.itemID !== null && r.item !== "");

        if (filledRows.length === 0) {
            toast.error("Please add at least one line item before saving.", {
                style: { background: "#FF4433", color: "white", border: "1px solid #d97706" },
            });
            return;
        }

        const invalidRow = filledRows.find(
            (r) => !r.issuedQty || parseFloat(r.issuedQty) <= 0 || !r.rate || r.rate.trim() === ""
        );

        if (invalidRow) {
            toast.error("Please enter issued quantity and rate for all line items.", {
                style: { background: "#FF4433", color: "white", border: "1px solid #d97706" },
            });
            return;
        }

        // Resolve selected document master
        const selectedDocMaster = documentMasters.find(
            (d) => String(d.DocumentID) === document_
        );
        const selectedFromStore = storesStartWith.find(
            (s) => String(s.StoreID) === fromStore
        );
        const selectedToStore = storesStartWith.find(
            (s) => String(s.StoreID) === toStore
        );

        const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const dateStr = date || new Date().toISOString().split("T")[0];

        const payload: MaterialIssuePayload = {
            DocumentID: selectedDocMaster?.DocumentID ?? 0,
            DocumentName: selectedDocMaster?.DocumentName ?? "",
            FromCompanyID: 0, // resolved from auth in thunk
            FromStoreID: selectedFromStore?.StoreID ?? 0,
            FromStoreName: selectedFromStore?.StoreName ?? "",
            ToCompanyID: 0,
            ToStoreID: selectedToStore?.StoreID ?? 0,
            ToStoreName: selectedToStore?.StoreName ?? "",
            MaterialIssueDate: isoDate,
            MaterialIssueDateStr: dateStr,
            MaterialIssueNo: documentNo,
            StockStatus: false,
            VehicleNo: vehicleNo,
            Remarks: remarks,
            LstMaterialIssueDetails: filledRows.map((r) => ({
                Status: true,
                ItemName: r.item,
                ItemID: r.itemID!,
                UnitID: 0,
                StockUnit: r.unit,
                IssuedQty: parseFloat(r.issuedQty) || 0,
                ReqQty: parseFloat(r.reqQty) || 0,
                Rate: parseFloat(r.rate) || 0,
                Specification: r.specification,
                Size: r.size,
                Design: r.design,
                Stock: parseFloat(r.stock) || 0,
            })),
        };

        dispatch(saveMaterialIssue(payload));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">

            {/* ── Sticky page header ─────────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between gap-4 px-5 py-3"
                style={{ background: BRAND }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                        <ArrowLeftRight size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm tracking-wide truncate">
                            Material Issue
                        </h1>
                        <p className="text-blue-200 text-[10px] tracking-widest uppercase">
                            Inventory · Stock Issue
                        </p>
                    </div>
                </div>

                <button
                    onClick={onBack}
                    className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{ color: BRAND }}
                >
                    <Layers size={13} />
                    Material Issue Detail
                </button>
            </div>

            {/* ── Form body ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5 p-5 flex-1 overflow-auto">

                {/* ── Header Fields Card ─────────────────────────────────────────── */}
                <div
                    className="bg-white rounded-2xl shadow-sm border p-6"
                    style={{ borderColor: BRAND_MID }}
                >
                    {/* Card title */}
                    <div className="flex items-center gap-2.5 mb-5">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: BRAND_LIGHT }}
                        >
                            <FileText size={15} strokeWidth={2.2} style={{ color: BRAND }} />
                        </div>
                        <span
                            className="text-sm font-bold tracking-widest uppercase"
                            style={{ color: BRAND }}
                        >
                            Issue Details
                        </span>
                        <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
                    </div>

                    {/* Row 1 — Document · Document No. · Date · From Store · To Store */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {/* Document */}
                        <div>
                            <FieldLabel icon={FileText} label="Document" />
                            <SearchableCombobox
                                value={document_}
                                onChange={setDocument_}
                                options={documentOptions}
                                placeholder={documentMastersLoading ? "Loading…" : "Select Document"}
                                searchPlaceholder="Search document…"
                                emptyText="No documents found."
                                icon={<FileText size={14} />}
                            />
                        </div>

                        {/* Document No. */}
                        <div>
                            <FieldLabel icon={Hash} label="Document No." />
                            <InputField
                                icon={<Hash size={14} />}
                                placeholder="Document No."
                                value={documentNo}
                                readOnly
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <FieldLabel icon={Calendar} label="Date" />
                            <InputField
                                icon={<Calendar size={14} />}
                                placeholder="Date"
                                value={date}
                                onChange={setDate}
                                type="date"
                            />
                        </div>

                        {/* From Store */}
                        <div>
                            <FieldLabel icon={Store} label="From Store" />
                            <SearchableCombobox
                                value={fromStore}
                                onChange={setFromStore}
                                options={storeOptions}
                                placeholder={storesStartWithLoading ? "Loading…" : "Select Store"}
                                searchPlaceholder="Search store…"
                                emptyText="No stores found."
                                icon={<Store size={14} />}
                            />
                        </div>

                        {/* To Store */}
                        <div>
                            <FieldLabel icon={Store} label="To Store" />
                            <SearchableCombobox
                                value={toStore}
                                onChange={setToStore}
                                options={storeOptions}
                                placeholder={storesStartWithLoading ? "Loading…" : "Select Store"}
                                searchPlaceholder="Search store…"
                                emptyText="No stores found."
                                icon={<Store size={14} />}
                            />
                        </div>
                    </div>

                    {/* Row 2 — Vehicle No. · Remarks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                        {/* Vehicle No. */}
                        <div>
                            <FieldLabel icon={Truck} label="Vehicle No." />
                            <InputField
                                icon={<Truck size={14} />}
                                placeholder="Enter Vehicle Details"
                                value={vehicleNo}
                                onChange={setVehicleNo}
                            />
                        </div>

                        {/* Remarks — spans remaining columns */}
                        <div className="lg:col-span-3">
                            <FieldLabel icon={StickyNote} label="Remarks" />
                            <div className="relative">
                                <textarea
                                    rows={3}
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
                                        e.currentTarget.style.boxShadow =
                                            "0 1px 3px rgba(0,70,135,0.05)";
                                    }}
                                />
                                <StickyNote
                                    size={14}
                                    className="absolute left-3 top-3.5 pointer-events-none"
                                    style={{ color: "#93b8d8" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Items Table ────────────────────────────────────────────────── */}
                <ItemsTable
                    rows={rows}
                    onAdd={handleAddRow}
                    onRemove={handleRemoveRow}
                    onUpdate={handleUpdateRow}
                    onItemSelect={handleItemSelect}
                    itemOptions={itemOptions}
                    itemsLoading={itemsBySearchLoading}
                    onItemOpen={() => dispatch(fetchItemsBySearch())}
                    specOptions={itemSpecifications}
                    specsLoading={itemSpecificationsLoading}
                    onSpecOpen={handleSpecOpen}
                />

                {/* ── Footer summary card ────────────────────────────────────────── */}
                <div
                    className="bg-white rounded-2xl shadow-sm border p-6"
                    style={{ borderColor: BRAND_MID }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2" style={{ color: BRAND }}>
                                <Boxes size={15} />
                                <span className="text-sm font-bold tracking-wide">
                                    Total Issued Qty
                                </span>
                            </div>
                            <span className="text-slate-300">:</span>
                            <span className="text-2xl font-bold text-gray-800 tabular-nums">
                                {totalIssuedQty.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ─────────────────────────────────────────────── */}
                <div className="flex justify-end gap-3 pb-8">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
                        style={{ borderColor: BRAND, color: BRAND, background: "white" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = BRAND_LIGHT;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                        }}
                    >
                        <RefreshCw size={15} />
                        Clear
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={saveLoading}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: BRAND }}
                    >
                        <Save size={15} />
                        {saveLoading ? "Saving…" : "Submit"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateMaterialIssueDetail;
