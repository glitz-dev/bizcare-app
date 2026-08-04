"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
    FileText, Hash, Calendar, Tag, Store, GitBranch,
    StickyNote, Layers, Boxes, RefreshCw, Save, Trash2,
    ChevronsUpDown, ArrowLeftRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchDocumentMasters,
    fetchDefaultStore,
    fetchStoreStartWith,
    fetchTransferRequestStartWith,
    fetchSelectedTransferRequest,
    saveChanges,
    resetSaveChangesState,
    type ItemRequestToApprove,
} from "../store/features/inventory/stockManagement/itemTransferApprovalSlice";
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

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ApprovalLineItem = {
    id: number;
    barcode: string;
    itemCode: string;
    item: string;
    reqQty: string;
    aprQty: string;
};

function makeEmptyRow(id: number): ApprovalLineItem {
    return { id, barcode: "", itemCode: "", item: "", reqQty: "", aprQty: "" };
}

// ─── Mock options ──────────────────────────────────────────────────────────────
const MOCK_TYPES = [{ label: "Internal Transfer", value: "internal" }];

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
    icon, placeholder, value, onChange, type = "text", readOnly,
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
                style={!readOnly ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" } : undefined}
                onFocus={(e) => { if (!readOnly) { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; } }}
                onBlur={(e) => { if (!readOnly) { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; } }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}>
                {icon}
            </span>
        </div>
    );
}

// ─── SearchableCombobox ────────────────────────────────────────────────────────
function SearchableCombobox({
    value, onChange, options, placeholder, searchPlaceholder, emptyText, icon, onOpen,
}: {
    value: string | number;
    onChange: (v: string) => void;
    options: { label: string; value: string | number }[];
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 transition-colors text-base leading-none"
                            style={{ color: "#93b8d8" }}
                            onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }}
                        >
                            ×
                        </span>
                    ) : (
                        <ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#93b8d8" }} />
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
                                    onSelect={() => { onChange(String(opt.value)); setOpen(false); }}
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

// ─── Items Table ───────────────────────────────────────────────────────────────
function ItemsTable({
    rows,
    onAdd,
    onRemove,
    onUpdate,
}: {
    rows: ApprovalLineItem[];
    onAdd: () => void;
    onRemove: (id: number) => void;
    onUpdate: (id: number, field: keyof ApprovalLineItem, value: string) => void;
}) {
    const thClass = "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-white whitespace-nowrap";
    const tdClass = "px-2 py-1.5 align-middle";

    return (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: BRAND_MID }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: BRAND }}>
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-white/80" />
                    <span className="text-xs font-bold tracking-widest uppercase text-white">Line Items</span>
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
                            <th className={thClass} style={{ width: 52 }}>SI.No.</th>
                            <th className={thClass} style={{ width: 140 }}>Barcode</th>
                            <th className={thClass} style={{ width: 150 }}>Item Code</th>
                            <th className={thClass}>Item</th>
                            <th className={thClass} style={{ width: 120, textAlign: "right" }}>Req. Qty</th>
                            <th className={thClass} style={{ width: 120, textAlign: "right" }}>Apr. Qty</th>
                            <th className={thClass} style={{ width: 70, textAlign: "center" }}>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr
                                key={row.id}
                                className="border-b transition-colors hover:bg-blue-50/40"
                                style={{ borderColor: BRAND_MID }}
                            >
                                <td className={tdClass}>
                                    <span className="text-xs font-semibold text-slate-500 pl-1">{idx + 1}</span>
                                </td>
                                <td className={tdClass}>
                                    <input
                                        readOnly
                                        value={row.barcode}
                                        placeholder="Barcode"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                        style={{ borderColor: "#e2e8f0" }}
                                    />
                                </td>
                                <td className={tdClass}>
                                    <input
                                        readOnly
                                        value={row.itemCode}
                                        placeholder="Item Code"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                        style={{ borderColor: "#e2e8f0" }}
                                    />
                                </td>
                                <td className={tdClass}>
                                    <input
                                        readOnly
                                        value={row.item}
                                        placeholder="Item"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                        style={{ borderColor: "#e2e8f0" }}
                                    />
                                </td>
                                <td className={tdClass}>
                                    <input
                                        readOnly
                                        value={row.reqQty}
                                        placeholder="Quantity"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-gray-50 text-gray-400 cursor-not-allowed outline-none text-right"
                                        style={{ borderColor: "#e2e8f0" }}
                                    />
                                </td>
                                <td className={tdClass}>
                                    <input
                                        type="number"
                                        value={row.aprQty}
                                        onChange={(e) => onUpdate(row.id, "aprQty", e.target.value)}
                                        placeholder="Qty"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white text-gray-700 outline-none text-right transition-all"
                                        style={{ borderColor: "#d1dff0" }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND}22`; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </td>
                                <td className={tdClass} style={{ textAlign: "center" }}>
                                    <button
                                        onClick={() => onRemove(row.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Remove row"
                                    >
                                        <Trash2 size={13} className="text-red-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-xs text-slate-300">
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
const CreateItemTransferApproval: React.FC<{ onBack?: () => void; editRow?: ItemRequestToApprove }> = ({ onBack, editRow }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        documentMasters,
        defaultStores,
        storesStartWith,
        transferRequestsStartWith,
        selectedTransferRequests,
        saveChangesLoading,
        saveChangesSuccess,
        saveChangesError,
    } = useSelector((s: RootState) => s.itemTransferApproval);
    const companyId = useSelector((s: RootState) => (s.auth.userData as any)?.companyId ?? 1);

    // Header fields
    const [document_, setDocument_] = useState("");
    const [refNo, setRefNo] = useState("");
    const [approvalDate, setApprovalDate] = useState(new Date().toISOString().split("T")[0]);
    const [transferType, setTransferType] = useState("internal");
    const [reqFromStore, setReqFromStore] = useState<number | "">("");

    // Row 2
    const [requestedNo, setRequestedNo] = useState("");
    const [requestedToStore, setRequestedToStore] = useState("");
    const [requestedBranch, setRequestedBranch] = useState("");

    const defaultStoreId = useRef<number | null>(null);

    // ── Mount: fetch document masters + default store + transfer requests ─────
    // In edit mode the parent already dispatched all 3 APIs before navigating here,
    // so we skip the fetches and let the prefill effect below handle the fields.
    useEffect(() => {
        if (editRow) return; // data already in Redux — prefill effect handles it

        dispatch(fetchDocumentMasters()).then((action) => {
            if (fetchDocumentMasters.fulfilled.match(action)) {
                const doc = action.payload[0];
                if (doc) {
                    setDocument_(doc.DocumentName);
                    setRefNo(`${doc.Prefix}${doc.StartingNo}`);
                }
            }
        });

        dispatch(fetchDefaultStore()).then((action) => {
            if (fetchDefaultStore.fulfilled.match(action)) {
                const store = action.payload[0];
                if (store) {
                    defaultStoreId.current = store.StoreID;
                    setReqFromStore(store.StoreID);
                    dispatch(fetchStoreStartWith());
                }
            }
        });

        dispatch(fetchTransferRequestStartWith({ branchId: companyId }));
    }, [dispatch]);

    // ── Edit prefill: runs once when editRow is present and Redux data has landed ──
    useEffect(() => {
        if (!editRow) return;
        if (!documentMasters.length || !defaultStores.length || !selectedTransferRequests.length) return;

        // Document
        const doc = documentMasters[0];
        setDocument_(doc.DocumentName);
        setRefNo(`${doc.Prefix}${doc.StartingNo}`);

        // Store
        const store = defaultStores[0];
        defaultStoreId.current = store.StoreID;
        setReqFromStore(store.StoreID);
        dispatch(fetchStoreStartWith());

        // Transfer requests dropdown
        dispatch(fetchTransferRequestStartWith({ branchId: companyId }));

        // Requested No — use the MId from the table row
        setRequestedNo(String(editRow.ItemTransferRequestMId));

        // Prefill fields from the first SelectedTransferRequest record
        const master = selectedTransferRequests[0];
        setRequestedToStore(String(master.RequestToStoreID));
        setRequestedBranch(String(master.RequestToBranchID));

        // Transfer type
        const isInternal = editRow.TransferType?.toLowerCase().includes("internal");
        setTransferType(isInternal ? "internal" : "external");

        // Deduplicate and build rows
        const seen = new Set<number>();
        const uniqueItems = selectedTransferRequests.filter((item) => {
            if (seen.has(item.ItemTransferRequestTId)) return false;
            seen.add(item.ItemTransferRequestTId);
            return true;
        });

        setRows(
            uniqueItems.map((item, idx) => ({
                id: idx + 1,
                barcode: item.Barcode,
                itemCode: item.Itemcode,
                item: item.ItemName,
                reqQty: String(item.Quantity),
                aprQty: "",
            }))
        );
    }, [editRow, documentMasters, defaultStores, selectedTransferRequests]);

    // ── Handler: select a Transfer Request No. → fetch detail + prefill ──────
    const handleRequestedNoChange = (value: string) => {
        setRequestedNo(value);

        if (!value) {
            setRequestedToStore("");
            setRequestedBranch("");
            setRows([makeEmptyRow(1)]);
            return;
        }

        dispatch(fetchSelectedTransferRequest({ transferRequestId: value })).then((action) => {
            if (fetchSelectedTransferRequest.fulfilled.match(action)) {
                const data = action.payload;
                if (!data.length) return;

                const master = data[0];
                setRequestedToStore(String(master.RequestToStoreID));
                setRequestedBranch(String(master.RequestToBranchID));

                // Deduplicate by ItemTransferRequestTId to prevent duplicate rows
                const seen = new Set<number>();
                const uniqueItems = data.filter((item) => {
                    if (seen.has(item.ItemTransferRequestTId)) return false;
                    seen.add(item.ItemTransferRequestTId);
                    return true;
                });

                setRows(
                    uniqueItems.map((item, idx) => ({
                        id: idx + 1,
                        barcode: item.Barcode,
                        itemCode: item.Itemcode,
                        item: item.ItemName,
                        reqQty: String(item.Quantity),
                        aprQty: "",
                    }))
                );
            }
        });
    };

    // Line items
    const [rows, setRows] = useState<ApprovalLineItem[]>([makeEmptyRow(1)]);
    const nextId = () => Math.max(0, ...rows.map((r) => r.id)) + 1;

    const handleAddRow = () => setRows((prev) => [...prev, makeEmptyRow(nextId())]);
    const handleRemoveRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));
    const handleUpdateRow = (id: number, field: keyof ApprovalLineItem, value: string) =>
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

    const [remarks, setRemarks] = useState("");

    const netQuantity = rows.reduce((sum, r) => sum + (parseFloat(r.aprQty) || 0), 0);

    // Keep fields evaluating to an empty string on layout mount so placeholders display correctly
    const requestedToStoreLabel = requestedNo ? requestedToStore : "";
    const requestedBranchLabel = requestedNo ? requestedBranch : "";

    // ── Toast feedback on save state changes ──────────────────────────────────
    useEffect(() => {
        if (saveChangesSuccess) {
            toast.success("Transfer approval saved successfully.", {
                style: {
                    background: "#097969",
                    color: "white",
                    border: "1px solid #d97706",
                }
            });
            dispatch(resetSaveChangesState());
        }
    }, [saveChangesSuccess]);

    useEffect(() => {
        if (saveChangesError) {
            toast.error(saveChangesError,  {
                style: {
                    background: "#FF4433",
                    color: "white",
                    border: "1px solid #d97706",
                },
            });
            dispatch(resetSaveChangesState());
        }
    }, [saveChangesError]);

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = () => {
        const master = selectedTransferRequests[0];
        const now = new Date();
        const transferDateISO = now.toISOString(); // "2026-06-17T22:50:06.802Z"
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const yyyy = now.getFullYear();
        const transferDateStr = `${mm}/${dd}/${yyyy}`;

        const selectedDoc = documentMasters[0];

        const itemTransferApprovalT = rows
            .filter((r) => r.aprQty !== "")
            .map((row) => {
                // Find the matching SelectedTransferRequest line by itemCode/barcode
                const matchedLine = selectedTransferRequests.find(
                    (sr) => sr.Barcode === row.barcode && sr.Itemcode === row.itemCode
                ) ?? selectedTransferRequests[0];

                return {
                    ItemID: matchedLine?.ItemID ?? 0,
                    BatchID: matchedLine?.BatchID ?? 0,
                    Barcode: row.barcode,
                    ItemCode: row.itemCode,
                    ItemName: row.item,
                    Quantity: parseFloat(row.reqQty) || 0,
                    ApprovedQuantity: parseFloat(row.aprQty) || 0,
                    ItemTransferRequestMId: matchedLine?.ItemTransferRequestMId ?? 0,
                    ItemTransferRequestTId: matchedLine?.ItemTransferRequestTId ?? 0,
                    Status: true,
                    StockTypeID: matchedLine?.StockTypeID ?? 0,
                    UnitId: matchedLine?.UnitId ?? 0,
                    UnitMultiplier: matchedLine?.UnitMultiplier ?? 1,
                };
            });

        const payload = {
            BranchName: master?.ReqFromBranch ?? "",
            DocumentID: selectedDoc?.DocumentID ?? 0,
            DocumentName: selectedDoc?.DocumentName ?? document_,
            IsInternalTransfer: transferType === "internal",
            ItemTransferApprovalT: itemTransferApprovalT,
            ItemTransferRefNo: refNo,
            ItemTransferRequestMId: master?.ItemTransferRequestMId ?? Number(requestedNo),
            ItemTransferRequestRefNo: master?.ItemTransferRequestRefNo ?? "",
            RequestFromBranchID: master?.RequestFromBranchID ?? companyId,
            RequestFromStoreID: master?.RequestFromStoreID ?? (reqFromStore as number),
            RequestToBranchID: master?.RequestToBranchID ?? 0,
            RequestToStoreID: master?.RequestToStoreID ?? 0,
            StcokStoreID: reqFromStore as number,
            StockBranchID: companyId,
            StoreName: storesStartWith.find((s) => s.StoreID === reqFromStore)?.StoreName ?? "",
            TotalQuantity: netQuantity,
            TransferDate: transferDateISO,
            TransferDateStr: transferDateStr,
            TransferType: transferType === "internal",
            branchStoreName: master?.ReqFromBranch ?? "",
        };

        dispatch(saveChanges(payload));
    };

    // ── Clear handler ─────────────────────────────────────────────────────────
    const handleClear = () => {
        setDocument_("");
        setRefNo("");
        setApprovalDate(new Date().toISOString().split("T")[0]);
        setTransferType("internal");
        setReqFromStore("");
        setRequestedNo("");
        setRequestedToStore("");
        setRequestedBranch("");
        setRows([makeEmptyRow(1)]);
        setRemarks("");
        dispatch(resetSaveChangesState());
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">

            {/* ── Sticky header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 px-5 py-3" style={{ background: BRAND }}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <ArrowLeftRight size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm tracking-wide truncate">Item Transfer Approval</h1>
                        <p className="text-blue-200 text-[10px] tracking-widest uppercase">Inventory · Transfers</p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{ color: BRAND }}
                >
                    <Layers size={13} />
                    Item Transfer Approval Details
                </button>
            </div>

            {/* ── Form body ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5 p-5 flex-1 overflow-auto">

                {/* ── Header Fields Card ─────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>

                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
                            <FileText size={15} strokeWidth={2.2} style={{ color: BRAND }} />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
                            Approval Details
                        </span>
                        <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        <div>
                            <FieldLabel icon={FileText} label="Document" />
                            <InputField
                                placeholder="Document Name"
                                value={document_}
                                onChange={setDocument_}
                                icon={<FileText size={14} />}
                                readOnly
                            />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="Ref. No." />
                            <InputField
                                icon={<Hash size={14} />}
                                placeholder="Ref. No."
                                value={refNo}
                                onChange={setRefNo}
                                readOnly
                            />
                        </div>
                        <div>
                            <FieldLabel icon={Calendar} label="Approval Date" />
                            <InputField
                                icon={<Calendar size={14} />}
                                placeholder="Approval Date"
                                value={approvalDate}
                                onChange={setApprovalDate}
                                type="date"
                                readOnly
                            />
                        </div>
                        <div>
                            <FieldLabel icon={Tag} label="Transfer Type" />
                            <InputField
                                icon={<Tag size={14} />}
                                placeholder="Transfer Type"
                                value={MOCK_TYPES.find((t) => t.value === transferType)?.label ?? ""}
                                readOnly
                            />
                        </div>
                        <div>
                            <FieldLabel icon={Store} label="Requested From Store" />
                            <SearchableCombobox
                                value={reqFromStore}
                                onChange={(v) => setReqFromStore(v === "" ? "" : Number(v))}
                                options={storesStartWith.map((s) => ({
                                    label: s.StoreName,
                                    value: s.StoreID,
                                }))}
                                placeholder="Select Store"
                                searchPlaceholder="Search store…"
                                emptyText="No stores found."
                                icon={<Store size={14} />}
                                onOpen={() => dispatch(fetchStoreStartWith())}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                        <div>
                            <FieldLabel icon={Hash} label="Requested No." />
                            <SearchableCombobox
                                value={requestedNo}
                                onChange={handleRequestedNoChange}
                                options={transferRequestsStartWith.map((r) => ({
                                    label: r.ItemTransferRequestRefNo,
                                    value: String(r.ItemTransferRequestMId),
                                }))}
                                placeholder="Select Transfer Req. No."
                                searchPlaceholder="Search req. no…"
                                emptyText="No requests found."
                                icon={<Hash size={14} />}
                            />
                        </div>
                        <div>
                            <FieldLabel icon={Store} label="Requested To Store" />
                            <InputField
                                icon={<Store size={14} />}
                                placeholder="Store name"
                                value={requestedToStoreLabel}
                                readOnly
                            />
                        </div>
                        <div>
                            <FieldLabel icon={GitBranch} label="Requested Branch" />
                            <InputField
                                icon={<GitBranch size={14} />}
                                placeholder="Branch name"
                                value={requestedBranchLabel}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* ── Items Table ────────────────────────────────────────────────── */}
                <ItemsTable
                    rows={rows}
                    onAdd={handleAddRow}
                    onRemove={handleRemoveRow}
                    onUpdate={handleUpdateRow}
                />

                {/* ── Footer Card ────────────────────────────────────────────────── */}
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
                                    style={{ borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = "#d1dff0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)"; }}
                                />
                                <StickyNote size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: "#93b8d8" }} />
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

                {/* ── Action Buttons ──────────────────────────────────────────────── */}
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
                        disabled={saveChangesLoading}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: BRAND }}
                    >
                        <Save size={15} />
                        {saveChangesLoading ? "Saving…" : "Submit"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateItemTransferApproval;
