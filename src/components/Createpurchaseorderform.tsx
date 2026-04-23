import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { AppDispatch, RootState } from "@/store";
import {
    X,
    Plus,
    Trash2,
    ClipboardList,
    Save,
    RotateCcw,
    ChevronDown,
    FileText,
    ShoppingCart,
    CalendarDays,
    Star,
    BarChart2,
    AtSign,
    MapPin,
    Receipt,
    MessageSquare,
    ScrollText,
    CheckSquare,
} from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { DataTable } from "../common/DataTable";
import type { Column } from "react-data-grid";
import {
    fetchAllInvoiceTaxTypes,
    fetchAllSuppliers,
    fetchBaseCurrency,
    fetchDefaultStore,
    fetchImportInvoiceTaxTypeDetails,
    fetchInvoiceTaxTypeDetails,
    fetchPurchaseOrderDocuments,
    fetchRemainingIndentsForPO,
    fetchSelectedIndentItems,
    fetchSelectedIndentForPR,
    fetchStores,
    RemainingIndent,
    SelectedIndentItem,
    SelectedIndentForPR,
    fetchItemDetailsForOpeningStock,
    clearSelectedItemForPR,
    SelectedItemForPR,
    savePurchaseOrder,
    updatePurchaseOrder,
    fetchSelectedPO,
    clearSelectedPO,
    fetchItemUnits,
    type ItemUnit,
    SelectedPO,
} from "@/store/features/inventory/procurement/purchaseOrderSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchItemCategories,
    fetchItemSubCategories,
} from "@/store/features/inventory/procurement/procurementSlice";
import { toast } from "sonner";
import POIndentTable from "./POIndentTable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IndentItem {
    id: number;
    itemCode: string;
    item: string;
    spec: string;
    indQty: number;
    pendingQty: number;
    unit: string;
    reqDate: string;
    indentNo: string;
}

// ─── Mock indent data keyed by indent number ──────────────────────────────────
const INDENT_DATA: Record<string, IndentItem[]> = {
    "IND-001": [
        { id: 1, itemCode: "ITM-101", item: "Hex Bolt M10", spec: "SS 304", indQty: 200, pendingQty: 200, unit: "PCS", reqDate: "2025-05-01", indentNo: "IND-001" },
        { id: 2, itemCode: "ITM-102", item: "Flat Washer M10", spec: "GI", indQty: 400, pendingQty: 300, unit: "PCS", reqDate: "2025-05-01", indentNo: "IND-001" },
        { id: 3, itemCode: "ITM-103", item: "Hex Nut M10", spec: "SS 304", indQty: 200, pendingQty: 150, unit: "PCS", reqDate: "2025-05-02", indentNo: "IND-001" },
    ],
    "IND-002": [
        { id: 4, itemCode: "ITM-201", item: "PVC Pipe 1\"", spec: "IS 4985", indQty: 50, pendingQty: 50, unit: "MTR", reqDate: "2025-05-10", indentNo: "IND-002" },
        { id: 5, itemCode: "ITM-202", item: "Ball Valve 1\"", spec: "PN16", indQty: 10, pendingQty: 10, unit: "NOS", reqDate: "2025-05-10", indentNo: "IND-002" },
    ],
};


// ─── Complete POItem interface matching all 36 table columns ─────────────────

interface POItem {
    id: number;
    // Column 2–5
    barcode: string;
    ItemCode: string;
    Hsn: string;
    ItemName: string;
    spec: string;
    // Column 6–9
    IndentQty: number;
    Quantity: number;
    billQty: number;
    PurchaseRate: number;
    // Column 10–13
    RequiredDate: string;
    Unit: string;
    BillUnit: string;
    um: string;
    // Column 14–15
    sales: string;
    mrp: number;
    // Column 16–19 (some are computed)
    netPriceRate: number;
    discountPercent: number;
    discountAmount: number;
    grossAmount: number;
    // Column 20–23
    gstCategory: string;
    taxPercent: number;
    taxRate: number;
    netAmount: number;
    // Column 24–27 (tax split percentages)
    cgstPercent: number;
    sgstPercent: number;
    igstPercent: number;
    utgstPercent: number;
    // Column 28–30 (other taxes)
    vat: number;
    cessPercent: number;
    // Column 31–36 (computed amounts)
    sgstAmount: number;
    cgstAmount: number;
    igstAmount: number;
    utgstAmount: number;
    vatAmount: number;
    cessAmount: number;
    // Column 36
    previousPurchases: string;
    ItemID: number;
    // ── Indent linkage fields (FIX: stored per-item so multi-indent works) ──
    IndentDetailID: number | null;
    IndentMasterID: number | null;
    IndentNo: string;
    BatchID: number;
}

// ─── Helper: derive computed fields ──────────────────────────────────────────

function computeItem(item: POItem): POItem {
    const baseAmount = (item.Quantity || 0) * (item.netPriceRate || 0);
    const discountAmount = baseAmount * ((item.discountPercent || 0) / 100);
    const grossAmount = baseAmount - discountAmount;
    const taxRate = grossAmount * ((item.taxPercent || 0) / 100);
    const netAmount = grossAmount + taxRate;
    const sgstAmount = grossAmount * ((item.sgstPercent || 0) / 100);
    const cgstAmount = grossAmount * ((item.cgstPercent || 0) / 100);
    const igstAmount = grossAmount * ((item.igstPercent || 0) / 100);
    const utgstAmount = grossAmount * ((item.utgstPercent || 0) / 100);
    const vatAmount = grossAmount * ((item.vat || 0) / 100);
    const cessAmount = grossAmount * ((item.cessPercent || 0) / 100);

    return {
        ...item,
        discountAmount,
        grossAmount,
        taxRate,
        netAmount,
        sgstAmount,
        cgstAmount,
        igstAmount,
        utgstAmount,
        vatAmount,
        cessAmount,
    };
}

// ─── Field Components ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            {children}
        </label>
    );
}

function Input({
    placeholder,
    value,
    onChange,
    readOnly,
    type = "text",
    className = "",
}: {
    placeholder?: string;
    value?: string;
    onChange?: (v: string) => void;
    readOnly?: boolean;
    type?: string;
    className?: string;
}) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
            className={`w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
        placeholder:text-slate-300 read-only:bg-slate-50 read-only:text-slate-400
        transition-all ${className}`}
        />
    );
}

function SelectField({
    placeholder,
    options,
    value,
    onChange,
}: {
    placeholder: string;
    options?: string[];
    value?: string;
    onChange?: (v: string) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full h-9 px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          appearance-none transition-all"
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options?.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
        </div>
    );
}

// ─── Reusable cell components ─────────────────────────────────────────────────

function TextCell({
    value,
    placeholder,
    onChange,
    minWidth = "min-w-[90px]",
}: {
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
    minWidth?: string;
}) {
    return (
        <td className={`px-1 py-1 ${minWidth}`}>
            <input
                className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </td>
    );
}

function NumberCell({
    value,
    onChange,
    readOnly = false,
    minWidth = "min-w-[70px]",
}: {
    value: number;
    onChange?: (v: number) => void;
    readOnly?: boolean;
    minWidth?: string;
}) {
    return (
        <td className={`px-1 py-1 ${minWidth}`}>
            <input
                type="number"
                readOnly={readOnly}
                className={`w-full h-7 px-2 border border-slate-200 rounded text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-sky-400 ${readOnly ? "bg-slate-50 text-slate-500 cursor-default" : "bg-white"}`}
                placeholder="0"
                value={value || ""}
                onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            />
        </td>
    );
}

function ReadonlyCell({
    value,
    minWidth = "min-w-[80px]",
}: {
    value: string | number;
    minWidth?: string;
}) {
    const display =
        typeof value === "number"
            ? value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value;
    return (
        <td className={`px-1 py-1 ${minWidth}`}>
            <div className="w-full h-7 px-2 border border-slate-100 rounded text-[12px] text-right bg-slate-50 text-slate-500 flex items-center justify-end tabular-nums">
                {display}
            </div>
        </td>
    );
}

function BillUnitCell({
    value,
    itemUnits,
    onChange,
}: {
    value: string;
    itemUnits: ItemUnit[];
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        setSearch(value);
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleFocus = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 2,
                left: rect.left,
                width: rect.width < 140 ? 140 : rect.width,
                zIndex: 9999,
            });
        }
        setOpen(true);
    };

    const filtered = itemUnits.filter((u) =>
        u.ItemUnitName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <td className="px-1 py-1 min-w-[90px]">
            <input
                ref={inputRef}
                className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                placeholder="Bill Unit"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setOpen(true);
                }}
                onFocus={handleFocus}
            />
            {open && filtered.length > 0 && createPortal(
                <div
                    style={dropdownStyle}
                    className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                    {filtered.map((u) => (
                        <div
                            key={u.UnitID}
                            className="px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50 cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(u.ItemUnitName);
                                setSearch(u.ItemUnitName);
                                setOpen(false);
                            }}
                        >
                            {u.ItemUnitName}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </td>
    );
}

// ─── Table header definitions ─────────────────────────────────────────────────

const PO_COLUMNS: { label: string; required?: boolean }[] = [
    { label: "SI No." },
    { label: "Barcode" },
    { label: "Item Code" },
    { label: "Hsn" },
    { label: "Item", required: true },
    { label: "Spec" },
    { label: "IND. Qty" },
    { label: "Quantity", required: true },
    { label: "Bill Qty" },
    { label: "P.Rate", required: true },
    { label: "Req Date" },
    { label: "P.Unit" },
    { label: "Bill Unit" },
    { label: "UM" },
    { label: "Sales" },
    { label: "MRP" },
    { label: "Net P.Rate" },
    { label: "Discount %" },
    { label: "Discount Amt" },   // computed
    { label: "Gross Amount" },   // computed
    { label: "GST Category" },
    { label: "Tax %" },
    { label: "Tax Rate" },       // computed
    { label: "Net Amount" },     // computed
    { label: "CGST %" },
    { label: "SGST %" },
    { label: "IGST %" },
    { label: "UTGST %" },
    { label: "VAT %" },
    { label: "CESS %" },
    { label: "SGST Amt" },       // computed
    { label: "CGST Amt" },       // computed
    { label: "IGST Amt" },       // computed
    { label: "UTGST Amt" },      // computed
    { label: "VAT Amt" },        // computed
    { label: "CESS Amt" },       // computed
    { label: "Previous Purchases" },
    { label: "" },               // delete action
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface CreatePurchaseOrderFormProps {
    onClose: () => void;
    onSubmit?: (data: any) => void;
    editData?: SelectedPO | null;
}

export default function CreatePurchaseOrderForm({
    onClose,
    onSubmit,
    editData,
}: CreatePurchaseOrderFormProps) {
    const [openSections, setOpenSections] = useState<string[]>([
        "general",
        "poFromIndent",
        "po",
        "forwarding",
    ]);

    const {
        purchaseOrderDocuments,
        invoiceTaxTypes,
        allInvoiceTaxTypes,
        defaultStore,
        stores,
        baseCurrency,
        suppliers,
        remainingIndents,
        selectedIndentItems,
        remainingIndentsId,
        remainingIndentsTotalCount,
        remainingIndentsLoading,
        remainingIndentsError,
        selectedIndentItemsLoading,
        selectedIndentItemsError,
        selectedItemForPR,
        selectedIndentForPR,
        selectedItemForPRLoading,
        itemUnits,
    } = useSelector((state: RootState) => state.purchaseOrder);

    const { itemCategories, itemSubCategories } = useSelector(
        (state: RootState) => state.procurement
    );

    const isEditMode = !!editData;

    // General fields
    const [orderNo, setOrderNo] = useState(editData?.OrderNo ?? "LPO-64");

    const [orderDate] = useState(() =>
        editData?.OrderDate
            ? editData.OrderDate.split("T")[0]
            : new Date().toISOString().split("T")[0]
    );

    const [invoiceTaxType, setInvoiceTaxType] = useState(
        editData?.InvoiceTaxType ?? invoiceTaxTypes[0]?.InvoiceTaxType ?? ""
    );

    const [store, setStore] = useState(editData?.StoreName ?? defaultStore[0]?.StoreName ?? "");
    const [supplier, setSupplier] = useState(editData?.SupplierName ?? "");
    const [currency, setCurrency] = useState(editData?.Currency ?? baseCurrency[0]?.Currency ?? "Currency not specified");
    const [exchangeRate, setExchangeRate] = useState(editData?.ExRate ?? purchaseOrderDocuments[0]?.ExchRate ?? 0);
    const [category, setCategory] = useState(editData?.CategoryName ?? "");
    const [subCategory, setSubCategory] = useState(editData?.SubCategoryName ?? "");
    const [indentNo, setIndentNo] = useState("");
    const [roundOff, setRoundOff] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // Forwarding Details state
    const [expectedDate, setExpectedDate] = useState(
        editData?.ExpectedDate ? editData.ExpectedDate.split("T")[0] : ""
    );
    const [supplierQualityIndexCE, setSupplierQualityIndexCE] = useState(0);
    const [supplierQualityIndexPC, setSupplierQualityIndexPC] = useState(10);
    const [attention, setAttention] = useState(editData?.Attention ?? "");
    const [shippingAddress, setShippingAddress] = useState(editData?.ShippingAddress ?? "");
    const [billingAddress, setBillingAddress] = useState(editData?.BillingAddress ?? "");
    const [remarks, setRemarks] = useState(editData?.Remarks ?? "");
    const [conditions, setConditions] = useState(editData?.Conditions ?? "");
    const [completed, setCompleted] = useState(editData?.Completed ?? false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchPurchaseOrderDocuments());
        dispatch(
            fetchImportInvoiceTaxTypeDetails({
                documentID: purchaseOrderDocuments[0]?.DocumentID,
            })
        );
        dispatch(
            fetchInvoiceTaxTypeDetails({
                documentID: purchaseOrderDocuments[0]?.DocumentID,
                startWith: "",
            })
        );
        dispatch(
            fetchAllInvoiceTaxTypes({
                taxMasterId: invoiceTaxTypes[0]?.InvoiceTaxTypeID,
            })
        );
        dispatch(fetchDefaultStore());
        dispatch(fetchStores());
        dispatch(fetchBaseCurrency());
        dispatch(fetchAllSuppliers());
        dispatch(fetchItemCategories({ companyId: 1, finYearId: 2 }));
        dispatch(fetchRemainingIndentsForPO());
        dispatch(fetchItemDetailsForOpeningStock());
        dispatch(fetchItemUnits());
    }, [dispatch]);

    useEffect(() => {
        if (!category) return;
        const selectedCategory = itemCategories.find(
            (c) => c.CategoryName === category
        );
        if (selectedCategory?.CategoryID) {
            setSubCategory("");
            dispatch(
                fetchItemSubCategories({
                    categoryId: Number(selectedCategory.CategoryID),
                    companyId: 1,
                    finYearId: 2024,
                })
            );
        }
    }, [category, dispatch, itemCategories]);

    useEffect(() => {
        if (itemCategories.length > 0 && !category) {
            const firstCategoryName = itemCategories[0].CategoryName;
            setCategory(firstCategoryName);
        }
    }, [itemCategories, category]);


    // Auto-add item to main PO table when fetchSelectedItemForPR returns data
    const buildItemsFromEditData = (po: SelectedPO): POItem[] =>
        po.LstPurchaseOrderDetails.map((d, idx) =>
            computeItem({
                id: Date.now() + idx,
                barcode: d.BarCode ?? "",
                ItemCode: d.ItemCode ?? "",
                Hsn: d.Hsn ?? "",
                ItemName: d.ItemName ?? "",
                spec: d.Spec ?? "",
                IndentQty: d.IndentQty ?? 0,
                Quantity: d.Quantity ?? 0,
                billQty: d.BillQty ?? 0,
                PurchaseRate: d.PurchaseRate ?? 0,
                RequiredDate: d.RequiredDate ? d.RequiredDate.split("T")[0] : "",
                Unit: d.Unit ?? "",
                BillUnit: d.BillUnit ?? "",
                um: d.Unit ?? "",
                sales: String(d.SalesRate ?? ""),
                mrp: d.Mrp ?? 0,
                netPriceRate: d.NetPRate ?? 0,
                discountPercent: d.DiscountPercentage ?? 0,
                discountAmount: d.DiscountAmount ?? 0,
                grossAmount: d.Amount ?? 0,
                gstCategory: d.GstCategoryDesc ?? "",
                taxPercent: d.TaxPercentage ?? 0,
                taxRate: d.TaxRate ?? 0,
                netAmount: d.Amount ?? 0,
                cgstPercent: d.CGSTPer ?? 0,
                sgstPercent: d.SGSTPer ?? 0,
                igstPercent: d.IGSTPer ?? 0,
                utgstPercent: d.UTGSTPer ?? 0,
                vat: d.VATPer ?? 0,
                cessPercent: d.CESSPer ?? 0,
                sgstAmount: d.SGSTAmt ?? 0,
                cgstAmount: d.CGSTAmt ?? 0,
                igstAmount: d.IGSTAmt ?? 0,
                utgstAmount: d.UTGSTAmt ?? 0,
                vatAmount: d.VATAmt ?? 0,
                cessAmount: d.CESSAmt ?? 0,
                previousPurchases: "",
                ItemID: d.ItemID ?? 0,
                IndentDetailID: d.IndentDetailID ?? null,
                IndentMasterID: d.IndentMasterID ?? null,
                IndentNo: "",
                BatchID: d.BatchID ?? 0,
            })
        );

    const [checkedIndentIds, setCheckedIndentIds] = useState<Set<number>>(
        new Set()
    );
    const toggleIndentChecked = (id: number) => {
        setCheckedIndentIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const [indentModalOpen, setIndentModalOpen] = useState(false);
    const [selectedIndentRow, setSelectedIndentRow] =
        useState<RemainingIndent | null>(null);

    const showSelectedIndentDetails = (row: RemainingIndent) => {
        setSelectedIndentRow(row);
        setIndentModalOpen(true);
        dispatch(
            fetchSelectedIndentItems({
                indentID: row.IndentMasterID,
                purchaseOrderID: remainingIndentsId,
            })
        );
    };

    const handleSelectIndentItem = (row: RemainingIndent) => {
        toast.success(`Indent ${row.IndentNo} added to PO`);
    };


    // ─── Indent Details Modal ─────────────────────────────────────────────────

    interface IndentDetailsModalProps {
        open: boolean;
        onClose: () => void;
        indentNo: string;
        items: SelectedIndentItem[];
        loading: boolean;
        error: string | null;
    }

    function IndentDetailsModal({
        open,
        onClose,
        indentNo,
        items,
        loading,
        error,
    }: IndentDetailsModalProps) {
        if (!open) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        minWidth: 560,
                        maxWidth: 780,
                        width: "90%",
                        maxHeight: "85vh",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ background: "#1565C0" }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center rounded-lg flex-shrink-0"
                                style={{
                                    width: 32,
                                    height: 32,
                                    background: "rgba(255,255,255,0.15)",
                                }}
                            >
                                <ClipboardList size={16} color="#fff" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-[13px] tracking-widest uppercase">
                                    Selected Indent Details
                                </p>
                                {indentNo && (
                                    <p className="text-white/60 text-[11px] mt-0.5">
                                        {indentNo} · {items.length} item
                                        {items.length !== 1 ? "s" : ""}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center rounded-lg transition-colors"
                            style={{
                                width: 28,
                                height: 28,
                                background: "rgba(255,255,255,0.12)",
                            }}
                        >
                            <X size={13} color="#fff" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-2.5">
                                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-[13px] text-slate-400 font-medium">
                                    Loading item details…
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-1.5">
                                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center mb-1">
                                    <X size={16} color="#E24B4A" />
                                </div>
                                <p className="text-[13px] font-medium text-red-500">
                                    Something went wrong
                                </p>
                                <p className="text-[12px] text-slate-400">{error}</p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-[12px]">
                                <thead>
                                    <tr style={{ background: "#E6F1FB" }}>
                                        {[
                                            { label: "#", icon: null },
                                            {
                                                label: "Particulars",
                                                icon: <FileText size={11} color="#185FA5" />,
                                            },
                                            {
                                                label: "Specifications",
                                                icon: <ClipboardList size={11} color="#185FA5" />,
                                            },
                                            {
                                                label: "Quantity",
                                                icon: <Plus size={11} color="#185FA5" />,
                                            },
                                            {
                                                label: "Stock",
                                                icon: <ShoppingCart size={11} color="#185FA5" />,
                                            },
                                            { label: "Add", icon: null },
                                        ].map(({ label, icon }, i) => (
                                            <th
                                                key={i}
                                                className="px-4 py-2.5 text-left font-medium whitespace-nowrap"
                                                style={{
                                                    fontSize: 10,
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                    color: "#185FA5",
                                                    borderBottom: "0.5px solid #B5D4F4",
                                                }}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {icon}
                                                    {label}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-10 text-slate-400 text-[12px]"
                                            >
                                                No items found for this indent.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((row, idx) => (
                                            <tr
                                                key={idx}
                                                className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors"
                                            >
                                                <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-800 font-medium">
                                                    {row.ItemName}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {row.Spec ? (
                                                        <span className="inline-block text-[11px] text-slate-500 rounded px-2 py-0.5 bg-slate-50 border border-slate-200">
                                                            {row.Spec}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 text-[11px]">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className="flex items-center gap-1.5 text-slate-700 tabular-nums">
                                                        <ShoppingCart size={12} color="#185FA5" />
                                                        {row.Quantity ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                                                    —
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 cursor-pointer rounded"
                                                        style={{ accentColor: "#1565C0" }}
                                                        onChange={async () => {
                                                            const result = await dispatch(
                                                                fetchSelectedIndentForPR({
                                                                    indentID: row.IndentMasterID,
                                                                    invoiceTaxTypeID:
                                                                        invoiceTaxTypes[0]?.InvoiceTaxTypeID ?? 0,
                                                                    indentTID: 0,
                                                                    orderID: 0,
                                                                })
                                                            );

                                                            if (fetchSelectedIndentForPR.fulfilled.match(result)) {
                                                                const data = result.payload as SelectedIndentForPR[];
                                                                if (data && data.length > 0) {
                                                                    const newItems: POItem[] = data.map((pr, idx) =>
                                                                        computeItem({
                                                                            id: Date.now() + idx,
                                                                            barcode: pr.BarCode ?? "",
                                                                            ItemCode: pr.ItemCode ?? "",
                                                                            Hsn: pr.Hsn ?? "",
                                                                            ItemName: pr.ItemName ?? "",
                                                                            spec: pr.Spec ?? "",
                                                                            IndentQty: pr.IndentQty ?? 0,
                                                                            Quantity: pr.Quantity ?? 0,
                                                                            billQty: pr.Quantity ?? 0,
                                                                            PurchaseRate: pr.PurchaseRate ?? 0,
                                                                            RequiredDate: pr.RequiredDate ?? "",
                                                                            Unit: pr.Unit ?? "",
                                                                            BillUnit: pr.BillUnit ?? "",
                                                                            um: pr.Unit ?? "",
                                                                            sales: String(pr.SalesRate ?? ""),
                                                                            mrp: pr.Mrp ?? 0,
                                                                            netPriceRate: pr.NetPurchaseRate ?? 0,
                                                                            discountPercent: 0,
                                                                            discountAmount: 0,
                                                                            grossAmount: 0,
                                                                            gstCategory: pr.GstCategoryDesc ?? "",
                                                                            taxPercent: pr.TaxValue ?? 0,
                                                                            taxRate: 0,
                                                                            netAmount: 0,
                                                                            cgstPercent: pr.CGST ?? 0,
                                                                            sgstPercent: pr.SGST ?? 0,
                                                                            igstPercent: pr.IGST ?? 0,
                                                                            utgstPercent: pr.UTGST ?? 0,
                                                                            vat: pr.VAT ?? 0,
                                                                            cessPercent: pr.CESS ?? 0,
                                                                            sgstAmount: 0,
                                                                            cgstAmount: 0,
                                                                            igstAmount: 0,
                                                                            utgstAmount: 0,
                                                                            vatAmount: 0,
                                                                            cessAmount: 0,
                                                                            previousPurchases: "",
                                                                            ItemID: pr.ItemID ?? 0,
                                                                            IndentDetailID: pr.IndentDetailID ?? null,
                                                                            IndentMasterID: pr.IndentMasterID ?? null,
                                                                            IndentNo: pr.IndentNo ?? "",
                                                                            BatchID: pr.BatchID ?? 0,
                                                                        })
                                                                    );
                                                                    setItems((prev) => {
                                                                        const hasOnlyEmptyRow =
                                                                            prev.length === 1 && !prev[0].ItemName && !prev[0].ItemCode;
                                                                        return hasOnlyEmptyRow ? newItems : [...prev, ...newItems];
                                                                    });
                                                                    toast.success(`${data.length} item(s) added to PO`);
                                                                } else {
                                                                    toast.warning("No items available for this indent item.");
                                                                }
                                                            } else {
                                                                toast.error("Failed to fetch item details. Please try again.");
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <FileText size={12} />
                            Select items to add to the purchase order
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-[12px] font-medium text-white rounded-lg transition-all cursor-pointer"
                            style={{ background: "#1565C0" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Remaining Indents DataTable columns ──────────────────────────────────

    const indentColumns: Column<RemainingIndent>[] = useMemo(
        () => [
            {
                key: "slNo",
                name: "SI.No.",
                minWidth: 70,
                width: 70,
                renderHeaderCell: () => (
                    <div className="flex items-center justify-center font-semibold">
                        SI.No.
                    </div>
                ),
                renderCell: ({ rowIdx }) => (
                    <div className="flex items-center justify-center text-slate-600 font-medium">
                        {rowIdx + 1}
                    </div>
                ),
            },
            {
                key: "IndentNo",
                name: "Indent No",
                minWidth: 130,
                renderHeaderCell: (props) => (
                    <div className="flex items-center font-semibold">
                        {props.column.name}
                    </div>
                ),
            },
            {
                key: "IndentDate",
                name: "Indent Date",
                minWidth: 120,
                renderHeaderCell: (props) => (
                    <div className="flex items-center font-semibold">
                        {props.column.name}
                    </div>
                ),
            },
            {
                key: "DepartmentName",
                name: "Department",
                minWidth: 140,
                renderHeaderCell: (props) => (
                    <div className="flex items-center font-semibold">
                        {props.column.name}
                    </div>
                ),
            },
            {
                key: "EmpName",
                name: "Employee",
                minWidth: 140,
                renderHeaderCell: (props) => (
                    <div className="flex items-center font-semibold">
                        {props.column.name}
                    </div>
                ),
            },
            {
                key: "TotalQuantity",
                name: "Total Qty",
                minWidth: 100,
                renderHeaderCell: (props) => (
                    <div className="flex items-center justify-center font-semibold">
                        {props.column.name}
                    </div>
                ),
                renderCell: ({ row }) => (
                    <div className="flex items-center justify-center tabular-nums">
                        {row.TotalQuantity}
                    </div>
                ),
            },
            {
                key: "addAll",
                name: "Add All",
                minWidth: 90,
                renderHeaderCell: () => (
                    <div className="flex items-center justify-center gap-1.5 font-semibold">
                        Add All
                    </div>
                ),
                renderCell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={checkedIndentIds.has(row.IndentMasterID)}
                            className="w-4 h-4 rounded border-slate-300 accent-sky-500 cursor-pointer"
                            onChange={async () => {
                                toggleIndentChecked(row.IndentMasterID);
                                if (!checkedIndentIds.has(row.IndentMasterID)) {
                                    const result = await dispatch(
                                        fetchSelectedIndentForPR({
                                            indentID: row.IndentMasterID,
                                            invoiceTaxTypeID: invoiceTaxTypes[0]?.InvoiceTaxTypeID ?? 0,
                                            indentTID: 0,
                                            orderID: 0,
                                        })
                                    );

                                    if (fetchSelectedIndentForPR.fulfilled.match(result)) {
                                        const data = result.payload as SelectedIndentForPR[];
                                        if (data && data.length > 0) {
                                            // FIX: store IndentDetailID, IndentMasterID, IndentNo, BatchID
                                            // on each POItem so multi-indent payload is built correctly
                                            const newItems: POItem[] = data.map((pr, idx) =>
                                                computeItem({
                                                    id: Date.now() + idx,
                                                    barcode: pr.BarCode ?? "",
                                                    ItemCode: pr.ItemCode ?? "",
                                                    Hsn: pr.Hsn ?? "",
                                                    ItemName: pr.ItemName ?? "",
                                                    spec: pr.Spec ?? "",
                                                    IndentQty: pr.IndentQty ?? 0,
                                                    Quantity: pr.Quantity ?? 0,
                                                    billQty: pr.Quantity ?? 0,
                                                    PurchaseRate: pr.PurchaseRate ?? 0,
                                                    RequiredDate: pr.RequiredDate ?? "",
                                                    Unit: pr.Unit ?? "",
                                                    BillUnit: pr.BillUnit ?? "",
                                                    um: pr.Unit ?? "",
                                                    sales: String(pr.SalesRate ?? ""),
                                                    mrp: pr.Mrp ?? 0,
                                                    netPriceRate: pr.NetPurchaseRate ?? 0,
                                                    discountPercent: 0,
                                                    discountAmount: 0,
                                                    grossAmount: 0,
                                                    gstCategory: pr.GstCategoryDesc ?? "",
                                                    taxPercent: pr.TaxValue ?? 0,
                                                    taxRate: 0,
                                                    netAmount: 0,
                                                    cgstPercent: pr.CGST ?? 0,
                                                    sgstPercent: pr.SGST ?? 0,
                                                    igstPercent: pr.IGST ?? 0,
                                                    utgstPercent: pr.UTGST ?? 0,
                                                    vat: pr.VAT ?? 0,
                                                    cessPercent: pr.CESS ?? 0,
                                                    sgstAmount: 0,
                                                    cgstAmount: 0,
                                                    igstAmount: 0,
                                                    utgstAmount: 0,
                                                    vatAmount: 0,
                                                    cessAmount: 0,
                                                    previousPurchases: "",
                                                    ItemID: pr.ItemID ?? 0,
                                                    IndentDetailID: pr.IndentDetailID ?? null,
                                                    IndentMasterID: pr.IndentMasterID ?? null,
                                                    IndentNo: pr.IndentNo ?? "",
                                                    BatchID: pr.BatchID ?? 0,
                                                })
                                            );
                                            setItems((prev) => {
                                                const hasOnlyEmptyRow =
                                                    prev.length === 1 && !prev[0].ItemName && !prev[0].ItemCode;
                                                return hasOnlyEmptyRow ? newItems : [...prev, ...newItems];
                                            });
                                            toast.success(`${data.length} item(s) from ${row.IndentNo} added to PO`);
                                        } else {
                                            toast.warning(`No items available for indent ${row.IndentNo}`);
                                            toggleIndentChecked(row.IndentMasterID);
                                        }
                                    } else {
                                        toast.error("Failed to fetch indent items. Please try again.");
                                        toggleIndentChecked(row.IndentMasterID);
                                    }
                                } else {
                                    // User unchecked — optionally remove those rows from PO table
                                }
                            }}
                        />
                    </div>
                ),
            },
            {
                key: "selectItems",
                name: "Select Items",
                minWidth: 110,
                renderHeaderCell: () => (
                    <div className="flex items-center justify-center font-semibold">
                        Select Items
                    </div>
                ),
                renderCell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <button
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                            title="Select Items"
                            onClick={() => showSelectedIndentDetails(row)}
                        >
                            <ShoppingCart size={16} />
                        </button>
                    </div>
                ),
            },
        ],
        [checkedIndentIds, invoiceTaxTypes]
    );

    // ─── Pagination ───────────────────────────────────────────────────────────

    const INDENT_ROWS_PER_PAGE = 10;
    const [indentCurrentPage, setIndentCurrentPage] = useState(1);
    const indentTotalPages = Math.ceil(
        remainingIndentsTotalCount / INDENT_ROWS_PER_PAGE
    );

    const handleIndentPageChange = (page: number) => {
        setIndentCurrentPage(page);
        dispatch(
            fetchRemainingIndentsForPO({
                CategoryID: 0,
                SubCategoryID: 0,
                rowsPerPage: INDENT_ROWS_PER_PAGE,
                currentPage: page,
                searchStr: "",
                documentID:
                    purchaseOrderDocuments[0]?.DocumentID ?? "undefined",
                purchaseOrderID: 0,
                itemid: 0,
                companyId: 1,
                finYearId: 2024,
            })
        );
    };

    // ─── PO Items state ───────────────────────────────────────────────────────

    const emptyItem = (): POItem =>
        computeItem({
            id: Date.now(),
            barcode: "",
            ItemCode: "",
            Hsn: "",
            ItemName: "",
            spec: "",
            IndentQty: 0,
            Quantity: 0,
            billQty: 0,
            PurchaseRate: 0,
            RequiredDate: "",
            Unit: "",
            BillUnit: "",
            um: "",
            sales: "",
            mrp: 0,
            netPriceRate: 0,
            discountPercent: 0,
            discountAmount: 0,
            grossAmount: 0,
            gstCategory: "",
            taxPercent: 0,
            taxRate: 0,
            netAmount: 0,
            cgstPercent: 0,
            sgstPercent: 0,
            igstPercent: 0,
            utgstPercent: 0,
            vat: 0,
            cessPercent: 0,
            sgstAmount: 0,
            cgstAmount: 0,
            igstAmount: 0,
            utgstAmount: 0,
            vatAmount: 0,
            cessAmount: 0,
            previousPurchases: "",
            ItemID: 0,
            // FIX: empty item has no indent linkage
            IndentDetailID: null,
            IndentMasterID: null,
            IndentNo: "",
            BatchID: 0,
        });

    const [items, setItems] = useState<POItem[]>(() =>
        editData ? buildItemsFromEditData(editData) : [{ ...emptyItem(), id: 1 }]
    );

    const addItem = () => setItems((prev) => [...prev, emptyItem()]);

    const removeItem = (id: number) =>
        setItems((prev) => prev.filter((i) => i.id !== id));

    /** Update a field and recompute derived fields */
    const updateItem = (
        id: number,
        field: keyof POItem,
        value: string | number
    ) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === id ? computeItem({ ...i, [field]: value }) : i
            )
        );
    };

    // ─── Footer totals ────────────────────────────────────────────────────────

    const totalNetQty = items.reduce((s, i) => s + (i.Quantity || 0), 0);
    const totalGrossAmount = items.reduce((s, i) => s + (i.grossAmount || 0), 0);
    const totalTaxAmount = items.reduce((s, i) => s + (i.taxRate || 0), 0);
    const totalNetAmount = items.reduce((s, i) => s + (i.netAmount || 0), 0);

    const handleClear = () => {
        setSupplier("");
        setCurrency(baseCurrency[0]?.Currency || "Currency not specified");
        setCategory("");
        setSubCategory("");
        setIndentNo("");
        setItems([{ ...emptyItem(), id: 1 }]);
        setExpectedDate("");
        setSupplierQualityIndexCE(0);
        setSupplierQualityIndexPC(10);
        setAttention("");
        setShippingAddress("");
        setBillingAddress("");
        setRemarks("");
        setConditions("");
        setCompleted(false);
    };


    // ─── Submit purchase order ────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!supplier) {
            toast.error("Please select a supplier");
            return;
        }

        // ─── Resolve IDs from Redux data ─────────────────────────────────────
        const selectedSupplier = suppliers.find((s) => s.SupplierName === supplier);
        // FIX: fall back to defaultStore if stores[] lookup misses
        const selectedStore =
            stores.find((s) => s.StoreName === store) ||
            defaultStore.find((s) => s.StoreName === store);
        const selectedCategory = itemCategories.find((c) => c.CategoryName === category);
        const selectedSubCategory = itemSubCategories.find(
            (sc) => sc.SubCategoryName === subCategory
        );
        // FIX: use allInvoiceTaxTypes for both lookup and fallback (same array)
        const selectedTaxType =
            allInvoiceTaxTypes.find((t) => t.InvoiceTaxType === invoiceTaxType) ??
            allInvoiceTaxTypes[0];

        const document = purchaseOrderDocuments[0];

        // ─── Calculate totals ────────────────────────────────────────────────
        const totalQty = items.reduce((sum, i) => sum + (i.Quantity || 0), 0);
        const grossAmt = items.reduce((sum, i) => sum + (i.grossAmount || 0), 0);
        const taxAmt = items.reduce((sum, i) => sum + (i.taxRate || 0), 0);
        const netAmt = items.reduce((sum, i) => sum + (i.netAmount || 0), 0);

        const totalCGST = items.reduce((sum, i) => sum + (i.cgstAmount || 0), 0);
        const totalSGST = items.reduce((sum, i) => sum + (i.sgstAmount || 0), 0);
        const totalIGST = items.reduce((sum, i) => sum + (i.igstAmount || 0), 0);
        const totalUTGST = items.reduce((sum, i) => sum + (i.utgstAmount || 0), 0);
        const totalVAT = items.reduce((sum, i) => sum + (i.vatAmount || 0), 0);
        const totalCESS = items.reduce((sum, i) => sum + (i.cessAmount || 0), 0);
        const totalDiscount = items.reduce((sum, i) => sum + (i.discountAmount || 0), 0);

        // ─── FIX: derive all indent-related fields from items array ──────────
        // This correctly handles multiple indents by reading IndentNo stored
        // on each POItem at the time it was added from the indent table.
        const indentItems = items.filter(
            (i) => i.IndentMasterID !== null && (i.IndentMasterID ?? 0) > 0
        );
        // Unique IndentNos in insertion order → "PI-80, PI-78, PI-75, "
        const uniqueIndentNos = [
            ...new Set(indentItems.map((i) => i.IndentNo).filter(Boolean)),
        ];
        const indentNoStr =
            uniqueIndentNos.length > 0 ? uniqueIndentNos.join(", ") + ", " : "";

        // Unique IndentMasterIDs → for InpassDocumentID
        const uniqueIndentMasterIDs = [
            ...new Set(indentItems.map((i) => i.IndentMasterID as number)),
        ];
        const inpassDocumentID =
            uniqueIndentMasterIDs.length > 0
                ? uniqueIndentMasterIDs.join(", ") + ", "
                : "";

        // First IndentMasterID used as the header-level IndentID / IndentMasterID
        const firstIndentMasterID = uniqueIndentMasterIDs[0] ?? null;

        // ─── FIX: OrderDate as ISO string, OrderDateStr as "dd-mm-yyyy" ──────
        const orderDateISO = new Date(orderDate).toISOString();
        const orderDateStr = orderDate.split("-").reverse().join("-"); // "21-04-2026"

        // ─── FIX: ExpectedDate as ISO string, ExpectedDateStr as "dd-mm-yyyy"
        const expectedDateISO = expectedDate ? new Date(expectedDate).toISOString() : "";
        const expectedDateStr = expectedDate
            ? expectedDate.split("-").reverse().join("-")
            : "";

        // ─── Build detail rows for API ───────────────────────────────────────
        // FIX: IndentDetailID, IndentMasterID, BatchID now come from each item
        const LstPurchaseOrderDetails = items.map((item) => ({
            ItemID: item.ItemID || 0,
            ItemCode: item.ItemCode || "",
            ItemName: item.ItemName || "",
            Hsn: item.Hsn || "",
            Spec: item.spec || "",
            IndentQty: item.IndentQty || 0,
            Quantity: item.Quantity || 0,
            BillQty: item.billQty || 0,
            PurchaseRate: item.PurchaseRate || 0,
            RequiredDate: item.RequiredDate || "",
            Unit: item.Unit || "",
            BillUnit: item.BillUnit || "",
            SalesRate: parseFloat(item.sales) || 0,
            Mrp: item.mrp || 0,
            NetPurchaseRate: item.netPriceRate || 0,
            DiscountPercent: item.discountPercent || 0,
            DiscountAmount: item.discountAmount || 0,
            GrossAmount: item.grossAmount || 0,
            TaxPercent: item.taxPercent || 0,
            TaxAmount: item.taxRate || 0,
            NetAmount: item.netAmount || 0,
            CGSTPercent: item.cgstPercent || 0,
            SGSTPercent: item.sgstPercent || 0,
            IGSTPercent: item.igstPercent || 0,
            UTGSTPercent: item.utgstPercent || 0,
            VATPercent: item.vat || 0,
            CESSPercent: item.cessPercent || 0,
            CGSTAmount: item.cgstAmount || 0,
            SGSTAmount: item.sgstAmount || 0,
            IGSTAmount: item.igstAmount || 0,
            UTGSTAmount: item.utgstAmount || 0,
            VATAmount: item.vatAmount || 0,
            CESSAmount: item.cessAmount || 0,
            GstCategoryDesc: item.gstCategory || "",
            IndentDetailID: item.IndentDetailID ?? null,
            IndentMasterID: item.IndentMasterID ?? null,
            BatchID: item.BatchID ?? 0,
        }));

        const payload: any = {
            // FIX: correct date formats
            OrderDate: orderDateISO,
            OrderDateStr: orderDateStr,
            ExpectedDate: expectedDateISO,
            ExpectedDateStr: expectedDateStr,

            TaxPercHead: "0",
            TaxAmountHead: "0",
            SupQtyIndexCE: supplierQualityIndexCE.toString(),
            SupQtyIndexPC: supplierQualityIndexPC,
            Attention: attention,
            BillingAddress: billingAddress,
            BillwiseDiscountAmt: "0",
            BillwiseDiscountPer: 0,
            CategoryID: selectedCategory?.CategoryID ?? null,
            CategoryName: category || null,
            Conditions: conditions,
            // FIX: currency is supplier-aware (updated on supplier change)
            Currency: currency,
            CurrencyID: selectedSupplier?.CurrencyID ?? baseCurrency[0]?.CurrencyID ?? 0,
            DocumentID: document?.DocumentID ?? 0,
            DocumentName: document?.DocumentName ?? "",
            ExRate: exchangeRate,
            ExchRate: exchangeRate,
            GrossAmount: grossAmt.toFixed(2),
            GrossAmountBase: grossAmt,
            // FIX: all indent fields derived from items array
            IndentID: firstIndentMasterID,
            IndentMasterID: firstIndentMasterID,
            IndentNo: indentNoStr,
            IndentTID: null,
            InpassDocumentID: inpassDocumentID,
            InvoiceTaxType: invoiceTaxType,
            // FIX: InvoiceTaxTypeID from allInvoiceTaxTypes only
            InvoiceTaxTypeID: selectedTaxType?.InvoiceTaxTypeID ?? 0,
            IsGST: document?.IsGST ?? false,
            IsLocal: selectedSupplier?.IsLocal ?? false,
            IsVAT: document?.IsVAT ?? false,
            LstPurchaseOrderDetails,
            LstporderDetails: [],
            NetAmount: netAmt.toFixed(2),
            NetAmountBase: netAmt.toFixed(2),
            NetTotal: netAmt.toFixed(2),
            NetTotalBase: netAmt.toFixed(2),
            OrderID: 0,
            OrderNo: orderNo,
            OtherAdditionalAmount: "0",
            OtherAdditionalAmountBase: "0",
            OtherDeductionAmount: "0",
            OtherDeductionAmountBase: "0",
            PackingIndent: false,
            PreNetAmount: netAmt.toFixed(2),
            PreNetAmountBase: netAmt.toFixed(2),
            Quantity: totalQty.toString(),
            SearchItemID: 0,
            ShippingAddress: shippingAddress,
            // FIX: fall back to defaultStore if stores[] is empty
            StoreID: selectedStore?.StoreID ?? 0,
            StoreName: store || "",
            SubCategoryID: selectedSubCategory?.SubCategoryID ?? null,
            SubCategoryName: subCategory || null,
            SupplierID: selectedSupplier?.SupplierID ?? 0,
            SupplierName: supplier || "",
            TaxMasterID: document?.TaxMasterID ?? 0,
            TaxMasterName: "",
            TaxPayerType: selectedSupplier?.TaxPayerType ?? "",
            TotalCESSAmt: totalCESS,
            TotalCGSTAmt: totalCGST,
            TotalDiscount: totalDiscount.toFixed(2),
            TotalDiscountBase: totalDiscount,
            TotalIGSTAmt: totalIGST,
            TotalQuantity: totalQty.toString(),
            TotalSGSTAmt: totalSGST,
            TotalTax: taxAmt.toFixed(2),
            TotalTaxBase: taxAmt.toFixed(2),
            TotalUTGSTAmt: totalUTGST,
            TotalVATAmount: totalVAT,
            ValidDate: null,
            ValidDays: 0,
        };
        setIsSaving(true);
        try {
            // Replace:
            //   const result = await dispatch(savePurchaseOrder(payload)).unwrap();
            // with:

            const result = isEditMode
                ? await dispatch(updatePurchaseOrder({ ...payload, OrderID: editData!.OrderID })).unwrap()
                : await dispatch(savePurchaseOrder(payload)).unwrap();

            if (result.Success) {
                toast.success(
                    isEditMode
                        ? "Purchase Order updated successfully!"
                        : "Purchase Order saved successfully!"
                );
                dispatch(clearSelectedPO());
                onSubmit?.({
                    OrderID: isEditMode ? editData!.OrderID : result.Id,
                    orderNo: payload.OrderNo,
                    orderDate: payload.OrderDateStr,
                    document: payload.DocumentName,
                    party: payload.SupplierName,
                    store: payload.StoreName,
                    amount: payload.NetAmount,
                    indentNos: payload.IndentNo,
                    salesOrder: "",
                    status: "Pending",
                    custCod: "",
                    createdD: new Date().toLocaleDateString("en-GB"),
                    approved: "",
                    complete: "",
                    prepared: "",
                    approved2: "",
                });
                handleClear();
                onClose();
            } else {
                toast.error(result.Message || "Failed to save purchase order");
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to save purchase order");
        } finally {
            setIsSaving(false);
        }
    };

    const triggerCls =
        "px-5 py-3.5 hover:bg-slate-50 hover:no-underline [&>svg]:text-slate-400 [&>svg]:shrink-0 cursor-pointer";

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Page Header */}
            <div className="bg-[#004687] text-white flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <ClipboardList size={16} />
                    <div>
                        <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">
                            Purchase Order
                        </p>
                        <h1 className="text-[15px] font-semibold leading-tight">
                            Create New Purchase Order
                        </h1>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-[12px] font-medium bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                    <X size={13} />
                    Purchase Order List
                </button>
            </div>

            {/* Body */}
            <div className="p-6 max-w-[1400px] mx-auto">
                <Accordion
                    type="multiple"
                    value={openSections}
                    onValueChange={setOpenSections}
                    className="space-y-4"
                >

                    {/* ── GENERAL ── */}
                    <AccordionItem
                        value="general"
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                        <AccordionTrigger className={triggerCls}>
                            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">
                                General
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-slate-100 px-5 pt-5 pb-5">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <Label>Document</Label>
                                    <Input
                                        placeholder="Select Document"
                                        value={purchaseOrderDocuments[0]?.DocumentName}
                                    />
                                </div>
                                <div>
                                    <Label>Order No.</Label>
                                    <Input value={orderNo} readOnly />
                                </div>
                                <div>
                                    <Label>Order Date</Label>
                                    {/* FIX: display formatted dd-mm-yyyy but store as ISO */}
                                    <Input value={orderDate.split("-").reverse().join("-")} readOnly />
                                </div>
                                <div>
                                    <Label>Invoice Tax Type</Label>
                                    <SelectField
                                        placeholder="Select Invoice Tax Type"
                                        options={allInvoiceTaxTypes.map((t) => t.InvoiceTaxType)}
                                        value={invoiceTaxType}
                                        onChange={setInvoiceTaxType}
                                    />
                                </div>
                            </div>
                            {/* Row 2 */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                <div>
                                    <Label>Store</Label>
                                    <SelectField
                                        placeholder="Select Store"
                                        options={stores?.map((s) => s.StoreName) || []}
                                        value={store}
                                        onChange={setStore}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Supplier</Label>
                                    {/* FIX: update currency when supplier changes */}
                                    <SelectField
                                        placeholder="Select Supplier"
                                        options={suppliers?.map((s) => s.SupplierName) || []}
                                        value={supplier}
                                        onChange={(v) => {
                                            setSupplier(v);
                                            const sup = suppliers.find((s) => s.SupplierName === v);
                                            if (sup) {
                                                setCurrency(sup.Currency);
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label>Currency</Label>
                                    <Input placeholder="Currency" value={currency} readOnly />
                                </div>
                                <div>
                                    <Label>Exchange Rate</Label>
                                    <Input
                                        value={exchangeRate.toString()}
                                        type="number"
                                        onChange={(v) => setExchangeRate(parseFloat(v) || 0)}
                                        readOnly
                                    />
                                </div>
                            </div>
                            {/* Row 3 */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                <div>
                                    <Label>Category</Label>
                                    <SelectField
                                        placeholder="Select Category"
                                        options={itemCategories.map((c) => c.CategoryName)}
                                        value={category}
                                        onChange={setCategory}
                                    />
                                </div>
                                <div>
                                    <Label>Sub Category</Label>
                                    <SelectField
                                        placeholder="Select SubCategory"
                                        options={itemSubCategories.map(
                                            (sc) => sc.SubCategoryName || ""
                                        )}
                                        value={subCategory}
                                        onChange={setSubCategory}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Indent No.</Label>
                                    <SelectField
                                        placeholder="Select Indent No."
                                        options={Object.keys(INDENT_DATA)}
                                        value={indentNo}
                                        onChange={setIndentNo}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pb-1">
                                    <input
                                        id="roundoff"
                                        type="checkbox"
                                        checked={roundOff}
                                        onChange={(e) => setRoundOff(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 accent-sky-500 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="roundoff"
                                        className="text-[12px] text-slate-600 cursor-pointer select-none"
                                    >
                                        Round Off
                                    </label>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ── PO FROM INDENT ── */}
                    <AccordionItem
                        value="poFromIndent"
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                        <AccordionTrigger className={triggerCls}>
                            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">
                                PO From Indent
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-slate-100 px-5 pt-5 pb-5 h-full">
                            <div className="w-full overflow-x-auto">
                                <DataTable
                                    columns={indentColumns}
                                    rows={remainingIndents}
                                    rowKey="IndentMasterID"
                                    loading={remainingIndentsLoading}
                                    error={remainingIndentsError}
                                    loadingLabel="Loading remaining indents..."
                                    rowHeight={42}
                                    headerRowHeight={58}
                                />
                            </div>
                            {remainingIndents.length === 0 &&
                                !remainingIndentsLoading &&
                                !remainingIndentsError && (
                                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                        <p className="text-slate-400 text-sm">
                                            No remaining indents found
                                        </p>
                                    </div>
                                )}

                            {indentTotalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 px-1">
                                    <p className="text-[12px] text-slate-500">
                                        Showing page{" "}
                                        <span className="font-semibold text-slate-700">
                                            {indentCurrentPage}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-slate-700">
                                            {indentTotalPages}
                                        </span>{" "}
                                        ·{" "}
                                        <span className="font-semibold text-slate-700">
                                            {remainingIndentsTotalCount}
                                        </span>{" "}
                                        total records
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                handleIndentPageChange(indentCurrentPage - 1)
                                            }
                                            disabled={
                                                indentCurrentPage === 1 || remainingIndentsLoading
                                            }
                                            className="h-8 px-3 text-[12px] font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                        >
                                            ‹ Prev
                                        </button>
                                        {Array.from(
                                            { length: indentTotalPages },
                                            (_, i) => i + 1
                                        )
                                            .filter(
                                                (p) =>
                                                    p === 1 ||
                                                    p === indentTotalPages ||
                                                    Math.abs(p - indentCurrentPage) <= 1
                                            )
                                            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                                                    acc.push("…");
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) =>
                                                p === "…" ? (
                                                    <span
                                                        key={`ellipsis-${idx}`}
                                                        className="px-1.5 text-slate-400 text-[12px] select-none"
                                                    >
                                                        …
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() =>
                                                            handleIndentPageChange(p as number)
                                                        }
                                                        disabled={remainingIndentsLoading}
                                                        className={`h-8 min-w-[32px] px-2 text-[12px] font-medium rounded-lg border transition-all ${indentCurrentPage === p
                                                            ? "bg-[#004687] text-white border-[#004687] shadow-sm"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                            } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        <button
                                            onClick={() =>
                                                handleIndentPageChange(indentCurrentPage + 1)
                                            }
                                            disabled={
                                                indentCurrentPage === indentTotalPages ||
                                                remainingIndentsLoading
                                            }
                                            className="h-8 px-3 text-[12px] font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                        >
                                            Next ›
                                        </button>
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* ── PO ITEMS TABLE ── */}
                    <AccordionItem
                        value="po"
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                        <AccordionTrigger className={triggerCls}>
                            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">
                                PO
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-slate-100 px-5 pt-5 pb-5  h-full">
                            <POIndentTable
                                onItemsSelected={(data: any[]) => {
                                    const newItems = data.map((pr: any, idx: number) =>
                                        computeItem({
                                            id: Date.now() + idx,
                                            barcode: pr.BarCode ?? "",
                                            ItemCode: pr.ItemCode ?? "",
                                            Hsn: pr.Hsn ?? "",
                                            ItemName: pr.ItemName ?? "",
                                            spec: pr.Spec ?? "",
                                            IndentQty: pr.IndentQty ?? 0,
                                            Quantity: pr.Quantity ?? 0,
                                            billQty: pr.Quantity ?? 0,
                                            PurchaseRate: pr.PurchaseRate ?? 0,
                                            RequiredDate: pr.RequiredDate ?? "",
                                            Unit: pr.Unit ?? "",
                                            BillUnit: pr.BillUnit ?? "",
                                            um: pr.Unit ?? "",
                                            sales: String(pr.SalesRate ?? ""),
                                            mrp: pr.Mrp ?? 0,
                                            netPriceRate: pr.NetPurchaseRate ?? pr.NetPRate ?? 0,
                                            discountPercent: 0,
                                            discountAmount: 0,
                                            grossAmount: 0,
                                            gstCategory: pr.GstCategoryDesc ?? pr.GstCategoryDesc1 ?? "",
                                            taxPercent: pr.TaxValue ?? pr.TaxPercentage ?? 0,
                                            taxRate: 0,
                                            netAmount: 0,
                                            cgstPercent: pr.CGST ?? pr.CGSTPer ?? 0,
                                            sgstPercent: pr.SGST ?? pr.SGSTPer ?? 0,
                                            igstPercent: pr.IGST ?? pr.IGSTPer ?? 0,
                                            utgstPercent: pr.UTGST ?? pr.UTGSTPer ?? 0,
                                            vat: pr.VAT ?? pr.VATPer ?? 0,
                                            cessPercent: pr.CESS ?? pr.CESSPer ?? 0,
                                            sgstAmount: 0,
                                            cgstAmount: 0,
                                            igstAmount: 0,
                                            utgstAmount: 0,
                                            vatAmount: 0,
                                            cessAmount: 0,
                                            previousPurchases: "",
                                            ItemID: pr.ItemID ?? 0,
                                            IndentDetailID: pr.IndentDetailID ?? null,
                                            IndentMasterID: pr.IndentMasterID ?? null,
                                            IndentNo: pr.IndentNo ?? "",
                                            BatchID: pr.BatchID ?? 0,
                                        })
                                    );
                                    setItems((prev) => {
                                        const hasOnlyEmptyRow =
                                            prev.length === 1 && !prev[0].ItemName && !prev[0].ItemCode;
                                        return hasOnlyEmptyRow ? newItems : [...prev, ...newItems];
                                    });
                                    toast.success(`${data.length} item(s) added to PO`);
                                }}
                            />
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-[12px] text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#004687] text-white">
                                            {PO_COLUMNS.map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px]"
                                                >
                                                    {col.label}
                                                    {col.required && (
                                                        <span className="text-red-300 ml-0.5">*</span>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((row, idx) => (
                                            <tr
                                                key={row.id}
                                                className="border-t border-slate-100 hover:bg-sky-50/30 transition-colors"
                                            >
                                                {/* 1. SI No */}
                                                <td className="px-3 py-1 text-slate-500 font-medium min-w-[44px] text-center">
                                                    {idx + 1}
                                                </td>

                                                {/* 2. Barcode */}
                                                <TextCell
                                                    value={row.barcode}
                                                    placeholder="Barcode"
                                                    onChange={(v) => updateItem(row.id, "barcode", v)}
                                                    minWidth="min-w-[100px]"
                                                />

                                                {/* 3. Item Code */}
                                                <TextCell
                                                    value={row.ItemCode}
                                                    placeholder="Item Code"
                                                    onChange={(v) => updateItem(row.id, "ItemCode", v)}
                                                    minWidth="min-w-[100px]"
                                                />

                                                {/* 3.1. HSN */}
                                                <TextCell
                                                    value={row.Hsn}
                                                    placeholder="Hsn"
                                                    onChange={(v) => updateItem(row.id, "Hsn", v)}
                                                    minWidth="min-w-[100px]"
                                                />

                                                {/* 4. Item */}
                                                <TextCell
                                                    value={row.ItemName}
                                                    placeholder="Select Item"
                                                    onChange={(v) => updateItem(row.id, "ItemName", v)}
                                                    minWidth="min-w-[160px]"
                                                />

                                                {/* 5. Spec */}
                                                <TextCell
                                                    value={row.spec}
                                                    placeholder="Spec"
                                                    onChange={(v) => updateItem(row.id, "spec", v)}
                                                    minWidth="min-w-[80px]"
                                                />

                                                {/* 6. IND. Qty */}
                                                <NumberCell
                                                    value={row.IndentQty}
                                                    onChange={(v) => updateItem(row.id, "IndentQty", v)}
                                                />

                                                {/* 7. Quantity */}
                                                <NumberCell
                                                    value={row.Quantity}
                                                    onChange={(v) => updateItem(row.id, "Quantity", v)}
                                                />

                                                {/* 8. Bill Qty */}
                                                <NumberCell
                                                    value={row.billQty}
                                                    onChange={(v) => updateItem(row.id, "billQty", v)}
                                                />

                                                {/* 9. P.Rate */}
                                                <NumberCell
                                                    value={row.PurchaseRate}
                                                    onChange={(v) => updateItem(row.id, "PurchaseRate", v)}
                                                />

                                                {/* 10. Req Date */}
                                                <td className="px-1 py-1 min-w-[110px]">
                                                    <input
                                                        type="textbox"
                                                        placeholder="required date"
                                                        className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                                                        value={row.RequiredDate}
                                                        readOnly
                                                    />
                                                </td>

                                                {/* 11. P.Unit */}
                                                <TextCell
                                                    value={row.Unit}
                                                    placeholder="Unit"
                                                    onChange={(v) => updateItem(row.id, "Unit", v)}
                                                    minWidth="min-w-[70px]"
                                                />

                                                {/* 12. Bill Unit */}
                                                <BillUnitCell
                                                    value={row.BillUnit}
                                                    itemUnits={itemUnits}
                                                    onChange={(v) => updateItem(row.id, "BillUnit", v)}
                                                />

                                                {/* 13. UM */}
                                                <TextCell
                                                    value={row.um}
                                                    placeholder="UM"
                                                    onChange={(v) => updateItem(row.id, "um", v)}
                                                    minWidth="min-w-[60px]"
                                                />

                                                {/* 14. Sales */}
                                                <TextCell
                                                    value={row.sales}
                                                    placeholder="Sales"
                                                    onChange={(v) => updateItem(row.id, "sales", v)}
                                                    minWidth="min-w-[70px]"
                                                />

                                                {/* 15. MRP */}
                                                <NumberCell
                                                    value={row.mrp}
                                                    onChange={(v) => updateItem(row.id, "mrp", v)}
                                                />

                                                {/* 16. Net P.Rate */}
                                                <NumberCell
                                                    value={row.netPriceRate}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "netPriceRate", v)
                                                    }
                                                />

                                                {/* 17. Discount % */}
                                                <NumberCell
                                                    value={row.discountPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "discountPercent", v)
                                                    }
                                                />

                                                {/* 18. Discount Amt — computed */}
                                                <ReadonlyCell value={row.discountAmount} />

                                                {/* 19. Gross Amount — computed */}
                                                <ReadonlyCell value={row.grossAmount} />

                                                {/* 20. GST Category */}
                                                <TextCell
                                                    value={row.gstCategory}
                                                    placeholder="GST Cat."
                                                    onChange={(v) =>
                                                        updateItem(row.id, "gstCategory", v)
                                                    }
                                                    minWidth="min-w-[90px]"
                                                />

                                                {/* 21. Tax % */}
                                                <NumberCell
                                                    value={row.taxPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "taxPercent", v)
                                                    }
                                                />

                                                {/* 22. Tax Rate — computed */}
                                                <ReadonlyCell value={row.taxRate} />

                                                {/* 23. Net Amount — computed */}
                                                <ReadonlyCell value={row.netAmount} />

                                                {/* 24. CGST % */}
                                                <NumberCell
                                                    value={row.cgstPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "cgstPercent", v)
                                                    }
                                                />

                                                {/* 25. SGST % */}
                                                <NumberCell
                                                    value={row.sgstPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "sgstPercent", v)
                                                    }
                                                />

                                                {/* 26. IGST % */}
                                                <NumberCell
                                                    value={row.igstPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "igstPercent", v)
                                                    }
                                                />

                                                {/* 27. UTGST % */}
                                                <NumberCell
                                                    value={row.utgstPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "utgstPercent", v)
                                                    }
                                                />

                                                {/* 28. VAT % */}
                                                <NumberCell
                                                    value={row.vat}
                                                    onChange={(v) => updateItem(row.id, "vat", v)}
                                                />

                                                {/* 29. CESS % */}
                                                <NumberCell
                                                    value={row.cessPercent}
                                                    onChange={(v) =>
                                                        updateItem(row.id, "cessPercent", v)
                                                    }
                                                />

                                                {/* 30. SGST Amt — computed */}
                                                <ReadonlyCell value={row.sgstAmount} />

                                                {/* 31. CGST Amt — computed */}
                                                <ReadonlyCell value={row.cgstAmount} />

                                                {/* 32. IGST Amt — computed */}
                                                <ReadonlyCell value={row.igstAmount} />

                                                {/* 33. UTGST Amt — computed */}
                                                <ReadonlyCell value={row.utgstAmount} />

                                                {/* 34. VAT Amt — computed */}
                                                <ReadonlyCell value={row.vatAmount} />

                                                {/* 35. CESS Amt — computed */}
                                                <ReadonlyCell value={row.cessAmount} />

                                                {/* 36. Previous Purchases */}
                                                <TextCell
                                                    value={row.previousPurchases}
                                                    placeholder="Prev. Purchases"
                                                    onChange={(v) =>
                                                        updateItem(row.id, "previousPurchases", v)
                                                    }
                                                    minWidth="min-w-[120px]"
                                                />

                                                {/* Delete */}
                                                <td className="px-2 py-1 sticky right-0 bg-white border-l border-slate-100">
                                                    <button
                                                        onClick={() => removeItem(row.id)}
                                                        disabled={items.length === 1}
                                                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors cursor-pointer"
                                                        title="Remove row"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    {/* Summary footer row */}
                                    <tfoot>
                                        <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-[12px]">
                                            <td colSpan={6} className="px-3 py-2 text-slate-500 text-right">
                                                Totals
                                            </td>
                                            {/* Qty total */}
                                            <td className="px-1 py-2 text-right pr-3 tabular-nums text-slate-700">
                                                {totalNetQty}
                                            </td>
                                            {/* Bill Qty — blank */}
                                            <td />
                                            {/* P.Rate — blank */}
                                            <td />
                                            {/* Req Date — blank */}
                                            <td />
                                            {/* P.Unit, Bill Unit, UM, Sales, MRP, Net P.Rate, Disc% — blank */}
                                            <td colSpan={7} />
                                            {/* Discount Amt — blank */}
                                            <td />
                                            {/* Gross Amount */}
                                            <td className="px-1 py-2 text-right pr-2 tabular-nums text-slate-700">
                                                {totalGrossAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            {/* GST Category, Tax%, Tax Rate — blanks */}
                                            <td colSpan={2} />
                                            {/* Tax Rate */}
                                            <td className="px-1 py-2 text-right pr-2 tabular-nums text-slate-700">
                                                {totalTaxAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            {/* Net Amount */}
                                            <td className="px-1 py-2 text-right pr-2 tabular-nums text-[#004687]">
                                                {totalNetAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            {/* Remaining columns */}
                                            <td colSpan={13} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Add Row */}
                            <div className="flex items-center justify-between mt-3">
                                <button
                                    onClick={addItem}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-sky-600 hover:text-sky-700 border border-sky-200 hover:border-sky-400 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <Plus size={13} />
                                    Add Row
                                </button>

                                <div className="flex items-center gap-6 text-[13px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-medium">
                                            Net Quantity
                                        </span>
                                        <span className="text-slate-300">:</span>
                                        <span className="font-semibold text-slate-700 tabular-nums min-w-[40px] text-right">
                                            {totalNetQty}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-medium">
                                            Gross Amount
                                        </span>
                                        <span className="text-slate-300">:</span>
                                        <span className="font-semibold text-slate-700 tabular-nums min-w-[90px] text-right">
                                            ₹{" "}
                                            {totalGrossAmount.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-medium">
                                            Net Amount
                                        </span>
                                        <span className="text-slate-300">:</span>
                                        <span className="font-bold text-[#004687] tabular-nums min-w-[90px] text-right">
                                            ₹{" "}
                                            {totalNetAmount.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ── FORWARDING DETAILS ── */}
                    <AccordionItem
                        value="forwarding"
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                        <AccordionTrigger className={triggerCls}>
                            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">
                                Forwarding Details
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-slate-100 px-5 pt-5 pb-6">

                            {/* Row 1 — Expected Date | SQI CE | SQI PC | Attention */}
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {/* Expected Date */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <CalendarDays size={12} className="text-[#004687]" />
                                        Expected Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={expectedDate}
                                            onChange={(e) => setExpectedDate(e.target.value)}
                                            className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Supplier Quality Index (CE) */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <Star size={12} className="text-[#004687]" />
                                        Supplier Quality Index (CE)
                                    </label>
                                    <input
                                        type="number"
                                        value={supplierQualityIndexCE}
                                        onChange={(e) => setSupplierQualityIndexCE(Number(e.target.value))}
                                        className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                    />
                                </div>

                                {/* Supplier Quality Index (PC) */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <BarChart2 size={12} className="text-[#004687]" />
                                        Supplier Quality Index (PC)
                                    </label>
                                    <input
                                        type="number"
                                        value={supplierQualityIndexPC}
                                        onChange={(e) => setSupplierQualityIndexPC(Number(e.target.value))}
                                        className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                    />
                                </div>

                                {/* Attention */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <AtSign size={12} className="text-[#004687]" />
                                        Attention
                                    </label>
                                    <input
                                        type="text"
                                        value={attention}
                                        onChange={(e) => setAttention(e.target.value)}
                                        placeholder="Enter Attention"
                                        className="w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Row 2 — Shipping Address | Billing Address */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <MapPin size={12} className="text-[#004687]" />
                                        Shipping Address
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter Shipping Address"
                                        className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 resize-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <Receipt size={12} className="text-[#004687]" />
                                        Billing Address
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                        placeholder="Enter Billing Address"
                                        className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Row 3 — Remarks | Conditions */}
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <MessageSquare size={12} className="text-[#004687]" />
                                        Remarks
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter Remarks, If Any"
                                        className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 resize-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                        <ScrollText size={12} className="text-[#004687]" />
                                        Conditions
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={conditions}
                                        onChange={(e) => setConditions(e.target.value)}
                                        placeholder="Enter Conditions, If Any"
                                        className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Row 4 — Completed checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <div
                                    onClick={() => setCompleted((v) => !v)}
                                    className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all ${completed
                                        ? "bg-[#004687] border-[#004687]"
                                        : "bg-white border-slate-300 hover:border-sky-400"
                                        }`}
                                >
                                    {completed && <CheckSquare size={12} color="white" strokeWidth={3} />}
                                </div>
                                <label
                                    onClick={() => setCompleted((v) => !v)}
                                    className="text-[13px] text-slate-600 cursor-pointer select-none font-medium"
                                >
                                    Completed
                                </label>
                            </div>

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 pb-8">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all"
                    >
                        <RotateCcw size={13} />
                        Clear
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold bg-[#004687] text-white hover:bg-[#003a73] rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                        <Save size={13} />
                        {isSaving ? "Saving..." : "Submit"}
                    </button>
                </div>
            </div>

            {/* Indent Details Modal */}
            <IndentDetailsModal
                open={indentModalOpen}
                onClose={() => setIndentModalOpen(false)}
                indentNo={selectedIndentRow?.IndentNo ?? ""}
                items={selectedIndentItems}
                loading={selectedIndentItemsLoading}
                error={selectedIndentItemsError}
            />
        </div>
    );
}