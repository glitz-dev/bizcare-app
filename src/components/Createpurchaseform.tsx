import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchDocumentTypes,
    fetchDefaultAccountHead,
    fetchInvoiceTaxTypes,
    fetchDefaultStore,
    fetchAllSuppliers,
    fetchSupplierCurrentTotal,
    fetchCurrencyExRate,
    fetchPaymentTypes,
    fetchAccountHeads,
    fetchItemDetails,
    fetchSelectedItemForPR,
    clearSelectedItemForPR,
    fetchAccountHeadDefault,
    savePurchase,
    type SavePurchasePayload,
    type SavePurchaseLineDetail,
    type SavePurchaseAdditionalDetail,
} from "@/store/features/inventory/procurement/purchaseSlice";
import {
    FileText,
    Hash,
    Calendar,
    Building2,
    CreditCard,
    Store,
    Receipt,
    ClipboardCheck,
    Package,
    BarChart2,
    DollarSign,
    Percent,
    Calculator,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    ChevronDown,
    X,
    Info,
    ShoppingBag,
    ArrowUpCircle,
    ArrowDownCircle,
    BadgeIndianRupee,
    AlignJustify,
    ClipboardList,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import GoodsReceiptDialog from "./Goodsreceiptdialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PurchaseLineItem {
    id: number;
    itemId: number;        // numeric ItemID for the API
    barcode: string;
    itemCode: string;
    hsn: string;
    item: string;
    grNo: string;
    spec: string;
    rateOn: string;
    basedOn: string;
    poQty: number;
    qty: number;
    billUnit: string;
    purchaseRate: number;
    netRate: number;
    discPercent: number;
    discAmount: number;
    grossAmount: number;
    taxPercent: number;
    taxAmount: number;
    netAmount: number;
}

interface AdditionDeductionRow {
    id: number;
    ledger: string;
    amount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newLineItem(id: number): PurchaseLineItem {
    return {
        id,
        itemId: 0,
        barcode: "",
        itemCode: "",
        hsn: "",
        item: "",
        grNo: "",
        spec: "",
        rateOn: "",
        basedOn: "",
        poQty: 0,
        qty: 0,
        billUnit: "",
        purchaseRate: 0,
        netRate: 0,
        discPercent: 0,
        discAmount: 0,
        grossAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        netAmount: 0,
    };
}

function computeLine(item: PurchaseLineItem): PurchaseLineItem {
    const gross = item.qty * item.netRate;
    const discAmount = gross * (item.discPercent / 100);
    const grossAmount = gross - discAmount;
    const taxAmount = grossAmount * (item.taxPercent / 100);
    const netAmount = grossAmount + taxAmount;
    return { ...item, discAmount, grossAmount, taxAmount, netAmount };
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function buildInvoiceNo(prefix: string, startingNo: number): string {
    return `${prefix}-${startingNo}`;
}

// ─── Field Components ─────────────────────────────────────────────────────────

function FieldLabel({ icon: Icon, label, required }: { icon: React.ElementType; label: string; required?: boolean }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            <Icon size={12} className="text-[#004687]" />
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}

function FormInput({
    value,
    onChange,
    placeholder,
    type = "text",
    readOnly,
    className,
}: {
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    type?: string;
    readOnly?: boolean;
    className?: string;
}) {
    return (
        <input
            type={type}
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn(
                "w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400",
                "placeholder:text-slate-300 read-only:bg-slate-50 read-only:text-slate-400 transition-all",
                className
            )}
        />
    );
}

function FormSelect({
    value,
    onChange,
    placeholder,
    options,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full h-9 px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

function ClearableSelect({
    value,
    onChange,
    placeholder,
    options,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full h-9 px-3 pr-14 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X size={11} />
                    </button>
                )}
                <ChevronDown size={13} className="text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── Line Item Row ─────────────────────────────────────────────────────────────

const LINE_ITEM_COLUMNS = [
    { label: "SI#", width: 42 },
    { label: "Barcode", width: 110 },
    { label: "Item Code", width: 110 },
    { label: "HSN", width: 90 },
    { label: "Item", width: 180 },
    { label: "GR No", width: 100 },
    { label: "Specification", width: 120 },
    { label: "Rate On", width: 100 },
    { label: "Based On", width: 100 },
    { label: "PO Qty", width: 80 },
    { label: "Qty", width: 80 },
    { label: "Bill Unit", width: 90 },
    { label: "P. Rate", width: 90 },
    { label: "Net Rate", width: 90 },
    { label: "Disc %", width: 75 },
    { label: "Disc Amt", width: 90 },
    { label: "Gross Amt", width: 100 },
    { label: "Tax %", width: 75 },
    { label: "Tax Amt", width: 90 },
    { label: "Net Amt", width: 100 },
    { label: "", width: 42 },
];

function LineItemRow({
    line,
    idx,
    onChange,
    onRemove,
}: {
    line: PurchaseLineItem;
    idx: number;
    onChange: (id: number, field: keyof PurchaseLineItem, value: string | number) => void;
    onRemove: (id: number) => void;
}) {
    const cellCls = "px-1 py-1.5";
    const inputCls =
        "h-7 w-full px-2 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all";
    const readonlyCls =
        "h-7 w-full px-2 text-[12px] border border-slate-100 rounded-md bg-slate-50 text-slate-500 flex items-center tabular-nums";

    return (
        <tr className={cn(
            "border-b border-slate-100 transition-colors group",
            idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
            "hover:bg-sky-50/30"
        )}>
            <td className="px-2 py-1.5 text-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
                    {idx + 1}
                </span>
            </td>
            <td className={cellCls}><input className={inputCls} placeholder="Barcode" value={line.barcode} onChange={(e) => onChange(line.id, "barcode", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Item Code" value={line.itemCode} onChange={(e) => onChange(line.id, "itemCode", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="HSN" value={line.hsn} onChange={(e) => onChange(line.id, "hsn", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Item name" value={line.item} onChange={(e) => onChange(line.id, "item", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="GR No" value={line.grNo} onChange={(e) => onChange(line.id, "grNo", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Spec" value={line.spec} onChange={(e) => onChange(line.id, "spec", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Rate On" value={line.rateOn} onChange={(e) => onChange(line.id, "rateOn", e.target.value)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Based On" value={line.basedOn} onChange={(e) => onChange(line.id, "basedOn", e.target.value)} /></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0" value={line.poQty || ""} onChange={(e) => onChange(line.id, "poQty", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0" value={line.qty || ""} onChange={(e) => onChange(line.id, "qty", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><input className={inputCls} placeholder="Unit" value={line.billUnit} onChange={(e) => onChange(line.id, "billUnit", e.target.value)} /></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0.00" value={line.purchaseRate || ""} onChange={(e) => onChange(line.id, "purchaseRate", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0.00" value={line.netRate || ""} onChange={(e) => onChange(line.id, "netRate", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0" value={line.discPercent || ""} onChange={(e) => onChange(line.id, "discPercent", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><div className={readonlyCls}>{line.discAmount.toFixed(2)}</div></td>
            <td className={cellCls}><div className={readonlyCls}>{line.grossAmount.toFixed(2)}</div></td>
            <td className={cellCls}><input type="number" className={cn(inputCls, "text-right")} placeholder="0" value={line.taxPercent || ""} onChange={(e) => onChange(line.id, "taxPercent", parseFloat(e.target.value) || 0)} /></td>
            <td className={cellCls}><div className={readonlyCls}>{line.taxAmount.toFixed(2)}</div></td>
            <td className={cellCls}><div className={cn(readonlyCls, "font-semibold text-[#004687]")}>{line.netAmount.toFixed(2)}</div></td>
            <td className="px-1 py-1.5 text-center">
                <button
                    type="button"
                    onClick={() => onRemove(line.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={11} />
                </button>
            </td>
        </tr>
    );
}

// ─── Additions / Deductions Row ────────────────────────────────────────────────

function AdjRow({
    row,
    onChange,
    onRemove,
}: {
    row: AdditionDeductionRow;
    onChange: (id: number, field: keyof AdditionDeductionRow, value: string | number) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <div className="flex items-center gap-2 group">
            <input
                className="flex-1 h-8 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                placeholder="Ledger / Account head"
                value={row.ledger}
                onChange={(e) => onChange(row.id, "ledger", e.target.value)}
            />
            <input
                type="number"
                className="w-32 h-8 px-3 text-[13px] text-slate-700 text-right bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all tabular-nums"
                placeholder="0.00"
                value={row.amount || ""}
                onChange={(e) => onChange(row.id, "amount", parseFloat(e.target.value) || 0)}
            />
            <button
                type="button"
                onClick={() => onRemove(row.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            >
                <X size={12} />
            </button>
        </div>
    );
}

// ─── Accordion Section Header ─────────────────────────────────────────────────

function AccordionSectionTrigger({
    icon: Icon,
    title,
    badge,
    accent = false,
}: {
    icon: React.ElementType;
    title: string;
    badge?: string | number;
    accent?: boolean;
}) {
    return (
        <AccordionTrigger
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 w-full border-b border-slate-100 hover:no-underline rounded-none",
                "[&[data-state=open]]:rounded-b-none",
                accent
                    ? "bg-gradient-to-r from-[#004687]/8 to-sky-50/50"
                    : "bg-gradient-to-r from-slate-50 to-white"
            )}
        >
            <div className="flex items-center gap-2 flex-1">
                <div className="w-6 h-6 rounded-md bg-[#004687]/10 flex items-center justify-center">
                    <Icon size={13} className="text-[#004687]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">{title}</span>
                {badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[10px] font-bold">
                        {badge}
                    </span>
                )}
            </div>
        </AccordionTrigger>
    );
}

// ─── Document Searchable Combobox ─────────────────────────────────────────────

function DocumentCombobox({
    value,
    onChange,
    options,
    loading,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    loading?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "w-full h-9 px-3 pr-8 text-[13px] text-left bg-white border border-slate-200 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all",
                        "flex items-center justify-between",
                        !value && "text-slate-300"
                    )}
                >
                    <span className={cn("truncate", value ? "text-slate-700" : "text-slate-300")}>
                        {loading ? "Loading…" : value ? selectedLabel : "Select Document"}
                    </span>
                    <div className="absolute right-2 flex items-center gap-1">
                        {value && (
                            <span
                                role="button"
                                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                className="text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X size={11} />
                            </span>
                        )}
                        <ChevronDown size={13} className="text-slate-400 pointer-events-none" />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-64" align="start">
                <Command>
                    <CommandInput placeholder="Search document…" className="h-8 text-[13px]" />
                    <CommandList>
                        <CommandEmpty className="py-3 text-center text-[12px] text-slate-400">
                            No document found.
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((o) => (
                                <CommandItem
                                    key={o.value}
                                    value={o.label}
                                    onSelect={() => {
                                        onChange(o.value);
                                        setOpen(false);
                                    }}
                                    className="text-[13px] cursor-pointer"
                                >
                                    <Check
                                        size={13}
                                        className={cn(
                                            "mr-2 shrink-0",
                                            value === o.value ? "opacity-100 text-[#004687]" : "opacity-0"
                                        )}
                                    />
                                    {o.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// ─── Supplier Searchable Combobox ─────────────────────────────────────────────

function SupplierCombobox({
    value,
    onChange,
    options,
    loading,
    onOpen,
    creditLimitDays,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; subLabel?: string }[];
    loading?: boolean;
    onOpen?: () => void;
    creditLimitDays?: number | null;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    const handleOpenChange = (next: boolean) => {
        if (next) onOpen?.();
        setOpen(next);
    };

    return (
        <div>
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "w-full h-9 px-3 pr-8 text-[13px] text-left bg-white border border-slate-200 rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all",
                            "flex items-center justify-between relative"
                        )}
                    >
                        <span className={cn("truncate", value ? "text-slate-700" : "text-slate-300")}>
                            {loading ? "Loading…" : value ? selected?.label : "Select Supplier"}
                        </span>
                        <div className="absolute right-2 flex items-center gap-1">
                            {value && (
                                <span
                                    role="button"
                                    onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X size={11} />
                                </span>
                            )}
                            <ChevronDown size={13} className="text-slate-400 pointer-events-none" />
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80" align="start">
                    <Command>
                        <CommandInput placeholder="Search supplier…" className="h-8 text-[13px]" />
                        <CommandList className="max-h-56">
                            {loading ? (
                                <div className="py-4 text-center text-[12px] text-slate-400">Loading suppliers…</div>
                            ) : (
                                <>
                                    <CommandEmpty className="py-3 text-center text-[12px] text-slate-400">
                                        No supplier found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {options.map((o) => (
                                            <CommandItem
                                                key={o.value}
                                                value={o.label}
                                                onSelect={() => {
                                                    onChange(o.value);
                                                    setOpen(false);
                                                }}
                                                className="text-[13px] cursor-pointer flex items-start gap-2 py-2"
                                            >
                                                <Check
                                                    size={13}
                                                    className={cn(
                                                        "mt-0.5 shrink-0",
                                                        value === o.value ? "opacity-100 text-[#004687]" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-slate-700 truncate">{o.label}</span>
                                                    {o.subLabel && (
                                                        <span className="text-[11px] text-slate-400 truncate">{o.subLabel}</span>
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
            {value && creditLimitDays != null && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-500">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    Credit limit days: {creditLimitDays}
                </p>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CreatePurchaseFormProps {
    onClose: (invoiceNo?: string) => void;
}

export default function CreatePurchaseForm({ onClose }: CreatePurchaseFormProps) {
    // ── Redux ──
    const dispatch = useDispatch<AppDispatch>();
    const {
        documentTypes,
        documentTypesLoading,
        defaultAccountHead,
        defaultAccountHeadLoading,
        invoiceTaxTypes,
        invoiceTaxTypesLoading,
        defaultStores,
        defaultStoresLoading,
        suppliers,
        paymentTypes,
        paymentTypesLoading,
        suppliersLoading,
        supplierCurrentTotal,
        supplierCurrentTotalLoading,
        currencyExRate,
        currencyExRateLoading,
        accountHeads,
        accountHeadsLoading,
        accountHeadDefault,
        itemDetails,
        itemDetailsLoading,
        selectedItemForPR,
        selectedItemForPRLoading
    } = useSelector((state: RootState) => state.purchase);

    console.log('.....accountHeadDefault', accountHeadDefault)

    // Step 1 — fetch document types on mount
    useEffect(() => {
        dispatch(fetchDocumentTypes({ documentType: "Purchase" }));
    }, [dispatch]);

    useEffect(() => {
        if (documentTypes.length === 0) return;
        const defaultDoc =
            documentTypes.find((d) => d.SetDefault) ?? documentTypes[0];
        dispatch(fetchDefaultAccountHead({ documentID: defaultDoc.DocumentID }));
    }, [documentTypes, dispatch]);

    // Step 3 — prefill the Document field once the account head resolves
    useEffect(() => {
        if (defaultAccountHead.length > 0) {
            const head = defaultAccountHead[0];
            setDocument_(String(head.DocumentID));
        }
    }, [defaultAccountHead]);

    // Fetch default store on mount
    useEffect(() => {
        dispatch(fetchDefaultStore({}));
        dispatch(fetchPaymentTypes({}));
        dispatch(fetchAccountHeads());
        dispatch(fetchItemDetails({}));
    }, [dispatch]);

    // Prefill store when defaultStores loads
    useEffect(() => {
        if (defaultStores.length > 0) {
            setStore(String(defaultStores[0].StoreID));
        }
    }, [defaultStores]);

    // Prefill accountHead when default resolves
    useEffect(() => {
        if (accountHeadDefault) {
            setAccountHead(String(accountHeadDefault.HeadID));
        }
    }, [accountHeadDefault]);

    // ── Document type options derived from Redux state ──
    const documentTypeOptions = useMemo(
        () => documentTypes.map((d) => ({ value: String(d.DocumentID), label: d.DocumentName })),
        [documentTypes]
    );

    // ── General fields ──
    const [document_, setDocument_] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(getToday());
    const [invoiceTaxType, setInvoiceTaxType] = useState("");
    const [store, setStore] = useState("");
    const [supplierInvDate, setSupplierInvDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [supplierInvNo, setSupplierInvNo] = useState("");
    const [currentBalance, setCurrentBalance] = useState("0");
    const [exchRate, setExchRate] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [accountHead, setAccountHead] = useState("");
    const [goodsReceipt, setGoodsReceipt] = useState("");
    const [roundOff, setRoundOff] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [grDialogOpen, setGrDialogOpen] = useState(false);
    const [quickEntryItem, setQuickEntryItem] = useState("");
    const [quickEntryItemCode, setQuickEntryItemCode] = useState("");
    const [quickEntryHsn, setQuickEntryHsn] = useState("");
    const [quickEntryQty, setQuickEntryQty] = useState<number | "">("");
    const [quickEntryItemOpen, setQuickEntryItemOpen] = useState(false);
    const [quickEntryChecked, setQuickEntryChecked] = useState(false);

    // ── Line Items ──
    const [lines, setLines] = useState<PurchaseLineItem[]>([newLineItem(1)]);
    const nextId = useRef(2);

    const updateLine = useCallback((id: number, field: keyof PurchaseLineItem, value: string | number) => {
        setLines((prev) =>
            prev.map((l) => (l.id === id ? computeLine({ ...l, [field]: value }) : l))
        );
    }, []);
    const itemOptions = useMemo(
        () => itemDetails.map((item) => ({
            value: String(item.ItemID),
            label: item.ItemName,
            subLabel: item.ItemCode ?? undefined,
        })),
        [itemDetails]
    );

    // Step 4 — autofill Invoice No. whenever the selected document changes
    useEffect(() => {
        if (!document_) { setInvoiceNo(""); return; }
        const selected = documentTypes.find((d) => String(d.DocumentID) === document_);
        if (selected) {
            setInvoiceNo(buildInvoiceNo(selected.Prefix, selected.StartingNo));
        }
    }, [document_, documentTypes]);

    // Step 5 — fetch invoice tax types whenever document changes
    useEffect(() => {
        if (!document_) { setInvoiceTaxType(""); return; }
        dispatch(fetchInvoiceTaxTypes({ documentID: Number(document_) }));
    }, [document_, dispatch]);

    // Step 6 — prefill Invoice Tax Type with the first result
    useEffect(() => {
        if (invoiceTaxTypes.length > 0) {
            setInvoiceTaxType(String(invoiceTaxTypes[0].InvoiceTaxTypeID));
        } else {
            setInvoiceTaxType("");
        }
    }, [invoiceTaxTypes]);


    const removeLine = useCallback((id: number) => {
        setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
    }, []);

    // ── Additions / Deductions ──
    const [additions, setAdditions] = useState<AdditionDeductionRow[]>([]);
    const [deductions, setDeductions] = useState<AdditionDeductionRow[]>([]);
    const adjNextId = useRef(1);

    const addAddition = () => {
        setAdditions((prev) => [...prev, { id: adjNextId.current++, ledger: "", amount: 0 }]);
    };
    const addDeduction = () => {
        setDeductions((prev) => [...prev, { id: adjNextId.current++, ledger: "", amount: 0 }]);
    };

    const updateAdj = (
        setter: React.Dispatch<React.SetStateAction<AdditionDeductionRow[]>>,
        id: number,
        field: keyof AdditionDeductionRow,
        value: string | number
    ) => {
        setter((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const removeAdj = (
        setter: React.Dispatch<React.SetStateAction<AdditionDeductionRow[]>>,
        id: number
    ) => {
        setter((prev) => prev.filter((r) => r.id !== id));
    };

    // ── Totals ──
    const netAmount = useMemo(() => lines.reduce((sum, l) => sum + l.netAmount, 0), [lines]);
    const totalAdditions = useMemo(() => additions.reduce((s, r) => s + r.amount, 0), [additions]);
    const totalDeductions = useMemo(() => deductions.reduce((s, r) => s + r.amount, 0), [deductions]);
    const grandTotal =
        netAmount + totalAdditions - totalDeductions +
        (roundOff
            ? Math.round(netAmount + totalAdditions - totalDeductions) - (netAmount + totalAdditions - totalDeductions)
            : 0);

    // ── Submit / Clear ──
    const [saving, setSaving] = useState(false);

    // Helper: convert local "YYYY-MM-DD" date to the two formats the API needs
    const toIsoAndStr = (dateStr: string): { iso: string; str: string } => {
        if (!dateStr) {
            const now = new Date().toISOString();
            const [y, m, d] = now.split("T")[0].split("-");
            return { iso: now, str: `${d}-${m}-${y}` };
        }
        const [y, m, d] = dateStr.split("-");
        // Build a UTC noon timestamp so timezone drift can't shift the date
        const iso = new Date(`${y}-${m}-${d}T12:00:00.000Z`).toISOString();
        return { iso, str: `${d}-${m}-${y}` };
    };

    const handleSubmit = async () => {
        // ── Validation ──
        if (!invoiceNo) { toast.error("Invoice No. is required"); return; }
        if (!supplier) { toast.error("Supplier is required"); return; }
        if (!store) { toast.error("Store is required"); return; }
        if (lines.every((l) => !l.item)) { toast.error("Add at least one line item"); return; }

        // ── Resolve lookup objects ──
        const selectedDoc = documentTypes.find((d) => String(d.DocumentID) === document_);
        const selectedSupplier = suppliers.find((s) => String(s.SupplierID) === supplier);
        const selectedStore = defaultStores.find((s) => String(s.StoreID) === store);
        const selectedPayment = paymentTypes.find((p) => String(p.PaymentTypeID) === paymentType);
        const selectedTaxType = invoiceTaxTypes.find((t) => String(t.InvoiceTaxTypeID) === invoiceTaxType);
        const selectedAccountHead = accountHeads.find((h) => String(h.HeadID) === accountHead);
        const selectedDefaultHead = defaultAccountHead[0] ?? null;

        const { iso: invoiceDateIso, str: invoiceDateStr } = toIsoAndStr(invoiceDate);
        const { iso: supInvDateIso, str: supInvDateStr } = toIsoAndStr(supplierInvDate);

        // ── Build LstPurchaseDetails ──
        const lstPurchaseDetails: SavePurchaseLineDetail[] = lines
            .filter((l) => l.item)
            .map((l) => {
                const taxHalf = l.taxPercent / 2;
                const sgstAmt = l.grossAmount * (taxHalf / 100);
                const cgstAmt = sgstAmt;
                return {
                    TaxPercentage: l.taxPercent,
                    InPassID: null,
                    InPassMID: null,
                    InPassNo: l.grNo || null,
                    InPassTID: null,
                    OrderedQty: l.poQty,
                    ItemID: l.itemId || 0,
                    ItemCode: l.itemCode,
                    ItemName: l.item,
                    Hsn: l.hsn,
                    Barcode: l.barcode,
                    Spec: l.spec,
                    RateOn: l.rateOn,
                    BasedOn: l.basedOn,
                    Qty: l.qty,
                    BillUnitID: 0,
                    BillUnit: l.billUnit,
                    PurchaseRate: l.purchaseRate,
                    NetRate: l.netRate,
                    DiscountPercentage: l.discPercent,
                    DiscountAmount: l.discAmount,
                    GrossAmount: l.grossAmount,
                    TaxAmount: l.taxAmount,
                    NetAmount: l.netAmount,
                    GrossAmountBase: l.grossAmount,
                    TaxAmountBase: l.taxAmount,
                    NetAmountBase: l.netAmount,
                    SGST: taxHalf,
                    CGST: taxHalf,
                    IGST: 0,
                    UTGST: 0,
                    CESS: 0,
                    SGSTAmount: sgstAmt,
                    CGSTAmount: cgstAmt,
                    IGSTAmount: 0,
                    UTGSTAmount: 0,
                    CESSAmount: 0,
                    VATAmount: 0,
                    TaxCategoryCode: "",
                    TaxCategoryId: 0,
                    GSTCategoryMID: 0,
                    GSTCategoryTID: 0,
                    StockTypeID: 0,
                    PurchaseUnitID: 0,
                    UnitMultiplier: 1,
                };
            });

        // ── Build LstPurchaseAdditionalDetails ──
        const lstAdditional: SavePurchaseAdditionalDetail[] = [
            ...additions.map((r) => ({
                HeadID: 0,
                HeadName: r.ledger,
                Amount: r.amount,
                AmountBase: r.amount,
                IsDeduction: false,
            })),
            ...deductions.map((r) => ({
                HeadID: 0,
                HeadName: r.ledger,
                Amount: r.amount,
                AmountBase: r.amount,
                IsDeduction: true,
            })),
        ];

        // ── Compute aggregate totals ──
        const totalQty = lines.reduce((s, l) => s + l.qty, 0);
        const totalDisc = lines.reduce((s, l) => s + l.discAmount, 0);
        const totalGross = lines.reduce((s, l) => s + l.grossAmount, 0);
        const totalTaxAmt = lines.reduce((s, l) => s + l.taxAmount, 0);
        const totalSGSTAmt = lines.reduce((s, l) => s + l.grossAmount * ((l.taxPercent / 2) / 100), 0);
        const totalCGSTAmt = totalSGSTAmt;
        const roundOffAmt = roundOff ? Math.round(grandTotal) - grandTotal : 0;
        const fmt = (n: number, decimals = 3) => n.toFixed(decimals);

        // ── Assemble full payload ──
        const payload: SavePurchasePayload = {
            // Document
            DocumentID: Number(document_),
            DocumentName: selectedDoc?.DocumentName ?? "",
            DocumentTypeName: selectedDoc?.DocumentName ?? "",
            AgainstDocID: selectedDefaultHead?.DocumentID ?? 0,
            AgainstDocumentName: selectedDefaultHead?.DocumentName ?? "",
            InvoiceNo: invoiceNo,
            InvoiceDate: invoiceDateIso,
            InvoiceDateStr: invoiceDateStr,
            InvoiceTypeID: selectedDoc?.DocumentTypeID ?? 3,
            InvoiceTaxTypeID: Number(invoiceTaxType),
            InvoiceTaxType: selectedTaxType?.InvoiceTaxType ?? "",
            TaxMasterID: selectedDoc?.TaxMasterID ?? 1,
            TaxMasterName: "",
            TaxPercHead: "Tax %",
            TaxAmountHead: "Tax Amt",
            IsGST: selectedDoc?.IsGST ?? false,
            // Supplier
            SupplierID: Number(supplier),
            SupplierName: selectedSupplier?.SupplierName ?? "",
            SupInvoiceNo: supplierInvNo,
            SupInvoiceDate: supInvDateIso,
            SupInvoiceDateStr: supInvDateStr,
            PartyCreditLimitAmt: selectedSupplier?.PartyCreditLimitAmt ?? null,
            PartyCreditLimitDays: selectedSupplier?.PartyCreditLimitDays ?? 0,
            // Store / Payment
            StoreID: Number(store),
            StoreName: selectedStore?.StoreName ?? "",
            PaymentTypeID: Number(paymentType),
            PaymentTypeName: selectedPayment?.PaymentTypeName ?? "",
            DebitHeadID: selectedAccountHead?.HeadID ?? selectedDefaultHead?.HeadID ?? 0,
            DebitHeadName: selectedAccountHead?.HeadName ?? selectedDefaultHead?.HeadName ?? "",
            // Currency
            CurrencyID: selectedSupplier?.CurrencyID ?? 4,
            Currency: selectedSupplier?.Currency ?? "Rupees",
            CurrencyExchRate: parseFloat(exchRate) || 1,
            // Amounts
            CurrentTotal: parseFloat(currentBalance) || 0,
            GrossAmount: fmt(totalGross),
            GrossAmountBase: totalGross,
            NetAmount: fmt(netAmount, 2),
            NetAmountBase: fmt(netAmount, 2),
            PreNetAmount: fmt(netAmount, 3),
            PreNetAmountBase: fmt(netAmount, 3),
            NetTotal: fmt(grandTotal, 3),
            NetTotalBase: fmt(grandTotal, 3),
            TotalQuantity: fmt(totalQty),
            TotalDiscount: fmt(totalDisc),
            TotalDiscountBase: totalDisc,
            TotalTax: fmt(totalTaxAmt, 3),
            TotalTaxBase: fmt(totalTaxAmt, 3),
            BillwiseDiscountPer: 0,
            BillwiseDiscountAmt: "0.000",
            OtherAdditionalAmount: fmt(totalAdditions),
            OtherAdditionalAmountBase: fmt(totalAdditions),
            OtherDeductionAmount: fmt(totalDeductions),
            OtherDeductionAmountBase: fmt(totalDeductions),
            // Tax breakdown (SGST/CGST split; IGST for inter-state)
            TotalSGSTAmt: totalSGSTAmt,
            TotalCGSTAmt: totalCGSTAmt,
            TotalIGSTAmt: 0,
            TotalUTGSTAmt: 0,
            TotalCESSAmt: 0,
            TotalVATAmount: 0,
            TotalTCS: "0.000",
            TotalTCSAmt: "0.00",
            TotalTDS: "0.000",
            TotalTDSAmt: null,
            TCSApplicableOn: 0,
            TDSApplicableOn: 0,
            // Round-off
            RoundOff: roundOff,
            RoundOffAmount: roundOffAmt,
            RoundOffAmountBase: roundOffAmt,
            // Misc
            InPassNo: goodsReceipt,
            ChequeDate: null,
            // Lists
            LstPurchaseDetails: lstPurchaseDetails,
            LstPurchaseAdditionalDetails: lstAdditional,
        };

        setSaving(true);
        try {
            const result = await dispatch(savePurchase({ payload }));
            if (savePurchase.fulfilled.match(result)) {
                toast.success(`Purchase saved successfully — ${invoiceNo}`, {
                    duration: 5000,
                });
                onClose(result.payload.InvoiceNo ?? undefined);
            } else {
                const errMsg = typeof result.payload === "string"
                    ? result.payload
                    : "Failed to save purchase. Please try again.";
                toast.error(errMsg);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        // Restore the prefilled default document and its invoice number on clear
        const defaultDocId =
            defaultAccountHead.length > 0 ? String(defaultAccountHead[0].DocumentID) : "";
        setDocument_(defaultDocId);
        const defaultDoc = documentTypes.find((d) => String(d.DocumentID) === defaultDocId);
        setInvoiceNo(defaultDoc ? buildInvoiceNo(defaultDoc.Prefix, defaultDoc.StartingNo) : "");
        // Restore the autofilled tax type (Steps 5/6 will also re-run via document_ change)
        setInvoiceTaxType(invoiceTaxTypes.length > 0 ? String(invoiceTaxTypes[0].InvoiceTaxTypeID) : "");
        setSupplier("");
        setSupplierInvNo("");
        setSupplierInvDate("");
        setExchRate("");
        setGoodsReceipt("");
        setPaymentType("Credit");
        setAccountHead("");
        setRemarks("");
        setRoundOff(false);
        setLines([newLineItem(1)]);
        setAdditions([]);
        setDeductions([]);
        setStore(defaultStores.length > 0 ? String(defaultStores[0].StoreID) : "");
    };

    const handleQuickEntrySelect = useCallback(() => {
        if (!quickEntryItem || !selectedItemForPR) return;

        const newLine: PurchaseLineItem = computeLine({
            id: nextId.current++,
            itemId: selectedItemForPR.ItemID,
            barcode: "",
            itemCode: selectedItemForPR.ItemCode ?? "",
            hsn: selectedItemForPR.Hsn ?? "",
            item: selectedItemForPR.ItemName ?? "",
            grNo: "",
            spec: selectedItemForPR.Spec ?? "",
            rateOn: "",
            basedOn: "",
            poQty: 0,
            qty: typeof quickEntryQty === "number" ? quickEntryQty : 0,
            billUnit: selectedItemForPR.BillUnit ?? "",
            purchaseRate: selectedItemForPR.PurchaseRate ?? 0,
            netRate: selectedItemForPR.PurchaseRate ?? 0,
            discPercent: 0,
            discAmount: 0,
            grossAmount: 0,
            taxPercent: (selectedItemForPR.SGST ?? 0) + (selectedItemForPR.CGST ?? 0) + (selectedItemForPR.IGST ?? 0),
            taxAmount: 0,
            netAmount: 0,
        });

        setLines((prev) => [...prev, newLine]);

        // Reset quick entry row
        setQuickEntryItem("");
        setQuickEntryItemCode("");
        setQuickEntryHsn("");
        setQuickEntryQty("");
        setQuickEntryChecked(false);
        dispatch(clearSelectedItemForPR());
    }, [quickEntryItem, quickEntryQty, selectedItemForPR, dispatch]);

    // ── Options ──
    const taxTypeOptions = useMemo(
        () => invoiceTaxTypes.map((t) => ({
            value: String(t.InvoiceTaxTypeID),
            label: t.InvoiceTaxType,
        })),
        [invoiceTaxTypes]
    );
    const storeOptions = useMemo(
        () => defaultStores.map((s) => ({ value: String(s.StoreID), label: s.StoreName })),
        [defaultStores]
    );
    const supplierOptions = useMemo(
        () => suppliers.map((s) => ({
            value: String(s.SupplierID),
            label: s.SupplierName,
            subLabel: s.GSTIN ? `GSTIN: ${s.GSTIN}` : s.SupplierCode ?? undefined,
        })),
        [suppliers]
    );

    // Fetch suppliers lazily on first open — only once
    const suppliersFetched = useRef(false);
    const handleSupplierOpen = useCallback(() => {
        if (!suppliersFetched.current) {
            suppliersFetched.current = true;
            dispatch(fetchAllSuppliers());
        }
    }, [dispatch]);

    // Fetch current total whenever supplier selection changes
    useEffect(() => {
        if (!supplier) {
            setCurrentBalance("0");
            return;
        }
        dispatch(fetchSupplierCurrentTotal({ supplierID: Number(supplier) }));
    }, [supplier, dispatch]);

    // useEffect(() => {
    //     if (!quickEntryItem) {
    //         setQuickEntryItemCode("");
    //         setQuickEntryHsn("");
    //         return;
    //     }
    //     const selected = itemDetails.find((i) => String(i.ItemID) === quickEntryItem);
    //     if (selected) {
    //         setQuickEntryItemCode(selected.ItemCode ?? "");
    //         setQuickEntryHsn(selected.Hsn ?? "");
    //     }
    // }, [quickEntryItem, itemDetails]);

    // Dispatch fetchSelectedItemForPR when item changes
    useEffect(() => {
        if (!quickEntryItem || !invoiceTaxType) {
            setQuickEntryItemCode("");
            setQuickEntryHsn("");
            setQuickEntryChecked(false);
            dispatch(clearSelectedItemForPR());
            return;
        }
        setQuickEntryChecked(false);
        dispatch(fetchSelectedItemForPR({
            ItemID: Number(quickEntryItem),
            InvoiceTaxTypeID: Number(invoiceTaxType),
        }));
    }, [quickEntryItem, invoiceTaxType, dispatch]);

    // Autofill itemCode and hsn from API response
    useEffect(() => {
        if (selectedItemForPR) {
            setQuickEntryItemCode(selectedItemForPR.ItemCode ?? "");
            setQuickEntryHsn(selectedItemForPR.Hsn ?? "");
        }
    }, [selectedItemForPR]);

    // Fetch currency exchange rate whenever supplier or invoiceDate changes
    useEffect(() => {
        if (!supplier) {
            setExchRate("");
            return;
        }
        const selectedSupplier = suppliers.find((s) => String(s.SupplierID) === supplier);
        if (!selectedSupplier?.CurrencyID) {
            setExchRate("");
            return;
        }
        dispatch(fetchCurrencyExRate({
            currencyID: selectedSupplier.CurrencyID,
            date: invoiceDate || undefined,
        }));
    }, [supplier, invoiceDate, suppliers, dispatch]);

    // Prefill currentBalance once the API responds
    useEffect(() => {
        if (supplierCurrentTotal != null) {
            setCurrentBalance(supplierCurrentTotal.toFixed(2));
        }
    }, [supplierCurrentTotal]);

    // Prefill exchRate once the currency exchange rate API responds
    useEffect(() => {
        if (currencyExRate != null) {
            setExchRate(String(currencyExRate.ExchRate));
        }
    }, [currencyExRate]);

    const selectedSupplierCreditDays = useMemo(() => {
        if (!supplier) return null;
        return suppliers.find((s) => String(s.SupplierID) === supplier)?.PartyCreditLimitDays ?? null;
    }, [supplier, suppliers]);
    const paymentOptions = useMemo(
        () => paymentTypes.map((p) => ({ value: String(p.PaymentTypeID), label: p.PaymentTypeName })),
        [paymentTypes]
    );
    const accountOptions = useMemo(
        () => accountHeads.map((h) => ({ value: String(h.HeadID), label: h.HeadName })),
        [accountHeads]
    );

    function ItemCombobox({
        value,
        onChange,
        options,
        loading,
    }: {
        value: string;
        onChange: (v: string) => void;
        options: { value: string; label: string; subLabel?: string }[];
        loading?: boolean;
    }) {
        const [open, setOpen] = useState(false);
        const selected = options.find((o) => o.value === value);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="h-7 w-full px-2 pr-6 text-[12px] text-left bg-white border border-slate-200 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]/50
                        flex items-center justify-between relative transition-all"
                    >
                        <span className={cn("truncate", value ? "text-slate-700" : "text-slate-300")}>
                            {loading ? "Loading…" : value ? selected?.label : "Select Item"}
                        </span>
                        <div className="absolute right-1.5 flex items-center gap-1">
                            {value && (
                                <span
                                    role="button"
                                    onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X size={11} />
                                </span>
                            )}
                            <ChevronDown size={11} className="text-slate-400 pointer-events-none" />
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-72" align="start">
                    <Command>
                        <CommandInput placeholder="Search item…" className="h-8 text-[13px]" />
                        <CommandList className="max-h-56">
                            {loading ? (
                                <div className="py-4 text-center text-[12px] text-slate-400">Loading items…</div>
                            ) : (
                                <>
                                    <CommandEmpty className="py-3 text-center text-[12px] text-slate-400">
                                        No item found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {options.map((o) => (
                                            <CommandItem
                                                key={o.value}
                                                value={o.label}
                                                onSelect={() => { onChange(o.value); setOpen(false); }}
                                                className="text-[13px] cursor-pointer flex items-start gap-2 py-2"
                                            >
                                                <Check
                                                    size={13}
                                                    className={cn(
                                                        "mt-0.5 shrink-0",
                                                        value === o.value ? "opacity-100 text-[#004687]" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-slate-700 truncate">{o.label}</span>
                                                    {o.subLabel && (
                                                        <span className="text-[11px] text-slate-400 truncate">{o.subLabel}</span>
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
        );
    }

    return (
        <div>
            <div className="bg-white border border-slate-200 shadow-md overflow-hidden">

                {/* ── Page Header ── */}
                <div className="bg-[#004687] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                                <ShoppingBag size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm tracking-wide">PURCHASE</p>
                                <p className="text-white/60 text-[10px] tracking-wider uppercase">Purchase Invoice</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                        <X size={13} color="#fff" />
                        Purchase Details
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-5 space-y-4 bg-slate-50/30">

                    {/* ── Accordion: General + Direct Purchase ── */}
                    <Accordion
                        type="multiple"
                        defaultValue={["general", "direct-purchase"]}
                        className="space-y-3"
                    >
                        {/* ── Section 1: General ── */}
                        <AccordionItem
                            value="general"
                            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                        >
                            <AccordionSectionTrigger icon={FileText} title="General" accent />

                            <AccordionContent className="p-4 pt-4 pb-2 h-full">
                                {/* Row 1 */}
                                <div className="grid grid-cols-5 gap-4 mb-4">
                                    <div>
                                        <FieldLabel icon={FileText} label="Document" />
                                        <div className="relative">
                                            <DocumentCombobox
                                                value={document_}
                                                onChange={setDocument_}
                                                options={documentTypeOptions}
                                                loading={documentTypesLoading || defaultAccountHeadLoading}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Invoice No." required />
                                        <FormInput value={invoiceNo} onChange={setInvoiceNo} placeholder="Invoice No." className="font-mono font-semibold text-[#004687]" />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Calendar} label="Invoice Date" required />
                                        <FormInput type="date" value={invoiceDate} onChange={setInvoiceDate} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Receipt} label="Invoice Tax Type" />
                                        <ClearableSelect
                                            value={invoiceTaxType}
                                            onChange={setInvoiceTaxType}
                                            placeholder={invoiceTaxTypesLoading ? "Loading…" : "Select Tax Type"}
                                            options={taxTypeOptions}
                                            disabled={invoiceTaxTypesLoading}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Store} label="Store" />
                                        <ClearableSelect
                                            value={store}
                                            onChange={setStore}
                                            placeholder="Select Store"
                                            options={storeOptions}
                                        />
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-5 gap-4 mb-4">
                                    <div>
                                        <FieldLabel icon={Calendar} label="Supplier Inv. Date" />
                                        <FormInput type="date" value={supplierInvDate} onChange={setSupplierInvDate} />
                                    </div>
                                    <div className="col-span-1">
                                        <FieldLabel icon={Building2} label="Supplier" required />
                                        <SupplierCombobox
                                            value={supplier}
                                            onChange={setSupplier}
                                            options={supplierOptions}
                                            loading={suppliersLoading}
                                            onOpen={handleSupplierOpen}
                                            creditLimitDays={selectedSupplierCreditDays}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Supplier Inv. No." />
                                        <FormInput value={supplierInvNo} onChange={setSupplierInvNo} placeholder="Supplier Inv. No." />
                                    </div>
                                    <div>
                                        <FieldLabel icon={BadgeIndianRupee} label="Current A/C Balance" />
                                        <FormInput
                                            value={supplierCurrentTotalLoading ? "" : currentBalance}
                                            onChange={setCurrentBalance}
                                            placeholder={supplierCurrentTotalLoading ? "Loading…" : "0"}
                                            readOnly
                                            className="font-mono"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={DollarSign} label="Exch. Rate" />
                                        <FormInput
                                            value={currencyExRateLoading ? "" : exchRate}
                                            onChange={setExchRate}
                                            placeholder={currencyExRateLoading ? "Loading…" : "Enter Exch. Rate"}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-5 gap-4 items-end">
                                    <div>
                                        <FieldLabel icon={CreditCard} label="Payment Type" />
                                        <ClearableSelect
                                            value={paymentType}
                                            onChange={setPaymentType}
                                            placeholder={paymentTypesLoading ? "Loading…" : "Select Type"}
                                            options={paymentOptions}
                                            disabled={paymentTypesLoading}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={AlignJustify} label="Account Head" />
                                        <ClearableSelect
                                            value={accountHead}
                                            onChange={setAccountHead}
                                            placeholder={accountHeadsLoading ? "Loading…" : "Select Account"}
                                            options={accountOptions}
                                            disabled={accountHeadsLoading}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-9 px-5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] hover:from-[#003a70] hover:via-[#00519a] hover:to-[#006ecc] text-white text-[13px] font-semibold rounded-lg shadow-sm gap-2 transition-all w-full border-0 cursor-pointer"
                                            onClick={() => setGrDialogOpen(true)}
                                        >
                                            <ClipboardCheck size={14} />
                                            Select Goods Receipts
                                        </Button>
                                        <GoodsReceiptDialog
                                            open={grDialogOpen}
                                            onOpenChange={setGrDialogOpen}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={ClipboardList} label="Goods Receipt" />
                                        <FormInput value={goodsReceipt} onChange={setGoodsReceipt} placeholder="Selected Goods Receipt No." />
                                    </div>
                                    <div className="flex items-center gap-2 pb-1.5">
                                        <div
                                            onClick={() => setRoundOff((v) => !v)}
                                            className={cn(
                                                "w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all",
                                                roundOff ? "bg-[#004687] border-[#004687]" : "bg-white border-slate-300 hover:border-sky-400"
                                            )}
                                        >
                                            {roundOff && (
                                                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-none stroke-white stroke-[2]">
                                                    <polyline points="2,6 5,9 10,3" />
                                                </svg>
                                            )}
                                        </div>
                                        <label onClick={() => setRoundOff((v) => !v)} className="text-[13px] text-slate-600 cursor-pointer select-none font-medium">
                                            Round Off
                                        </label>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Section 2: Direct Purchase (Line Items) ── */}
                        <AccordionItem
                            value="direct-purchase"
                            className="rounded-xl border border-[#004687]/20 bg-white shadow-sm overflow-hidden"
                        >
                            {/* Custom trigger header */}
                            <div className="flex items-center justify-between border-b border-[#004687]/10 bg-gradient-to-r from-[#004687]/8 via-[#004687]/5 to-sky-50/40">
                                <AccordionTrigger className="flex items-center gap-2 px-4 py-3 flex-1 hover:no-underline rounded-none">
                                    <div className="flex items-center gap-2.5 flex-1">
                                        <div className="w-7 h-7 rounded-lg bg-[#004687] flex items-center justify-center shadow-sm">
                                            <Package size={14} className="text-white" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[13px] font-bold text-[#004687] uppercase tracking-wider">Direct Purchase</span>
                                            <span className="text-[10px] text-slate-400 font-normal tracking-wide">Item entry &amp; line details</span>
                                        </div>
                                        <span className="ml-1 px-2 py-0.5 rounded-full bg-[#004687] text-white text-[10px] font-bold shadow-sm">
                                            {lines.length} {lines.length === 1 ? "item" : "items"}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                            </div>

                            <AccordionContent className="px-3 h-full">
                                {/* ── Quick Entry Table (top row: Barcode, Item Code, Item, Qty, Hsn, Select) ── */}
                                <div className="border-b border-[#004687]/10 bg-gradient-to-r from-[#004687]/3 to-transparent">
                                    <div className="px-3 py-2 flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded bg-[#004687]/15 flex items-center justify-center">
                                            <BarChart2 size={10} className="text-[#004687]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#004687]/70 uppercase tracking-widest">Quick Entry</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 900 }}>
                                            <colgroup>
                                                <col style={{ width: 50 }} />
                                                <col style={{ width: 160 }} />
                                                <col style={{ width: 160 }} />
                                                <col style={{ width: "auto" }} />
                                                <col style={{ width: 110 }} />
                                                <col style={{ width: 110 }} />
                                                <col style={{ width: 60 }} />
                                            </colgroup>
                                            <thead>
                                                <tr style={{ background: "linear-gradient(90deg, #004687 0%, #0062b8 60%, #0080eb 100%)" }}>
                                                    {[
                                                        { label: "Sl.No", icon: Hash },
                                                        { label: "Barcode", icon: BarChart2 },
                                                        { label: "Item Code", icon: Hash },
                                                        { label: "Item", icon: Package },
                                                        { label: "Qty", icon: Calculator },
                                                        { label: "Hsn", icon: FileText },
                                                        { label: "Select", icon: Check },
                                                    ].map(({ label, icon: Icon }, i) => (
                                                        <th key={i} style={{
                                                            padding: "7px 8px",
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: "rgba(255,255,255,0.92)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.06em",
                                                            textAlign: i === 0 || i === 6 ? "center" : "left",
                                                            whiteSpace: "nowrap",
                                                        }}>
                                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                                <Icon size={9} style={{ opacity: 0.75 }} />
                                                                {label}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-sky-50/30 transition-colors">
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
                                                            {lines.length + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-1.5 py-1.5">
                                                        <input
                                                            className="h-7 w-full px-2 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]/50 transition-all placeholder:text-slate-300"
                                                            placeholder="Scan barcode…"
                                                        />
                                                    </td>
                                                    <td className="px-1.5 py-1.5">
                                                        <input
                                                            value={quickEntryItemCode}
                                                            readOnly
                                                            className="h-7 w-full px-2 text-[12px] border border-slate-200 rounded-md bg-slate-50 text-slate-500 focus:outline-none transition-all placeholder:text-slate-300"
                                                            placeholder="Item Code"
                                                        />
                                                    </td>
                                                    <td className="px-1.5 py-1.5">
                                                        <ItemCombobox
                                                            value={quickEntryItem}
                                                            onChange={setQuickEntryItem}
                                                            options={itemOptions}
                                                            loading={itemDetailsLoading}
                                                        />
                                                    </td>
                                                    <td className="px-1.5 py-1.5">
                                                        <input
                                                            type="number"
                                                            value={quickEntryQty}
                                                            onChange={(e) => setQuickEntryQty(parseFloat(e.target.value) || "")}
                                                            className="h-7 w-full px-2 text-right text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]/50 transition-all placeholder:text-slate-300"
                                                            placeholder="Quantity"
                                                        />
                                                    </td>
                                                    <td className="px-1.5 py-1.5">
                                                        <input
                                                            value={quickEntryHsn}
                                                            readOnly
                                                            className="h-7 w-full px-2 text-[12px] border border-slate-200 rounded-md bg-slate-50 text-slate-500 focus:outline-none transition-all placeholder:text-slate-300"
                                                            placeholder="Hsn"
                                                        />
                                                    </td>
                                                    <td className="px-1.5 py-1.5 text-center">
                                                        <div
                                                            onClick={() => {
                                                                if (!quickEntryItem || !selectedItemForPR || selectedItemForPRLoading) return;
                                                                if (!quickEntryChecked) {
                                                                    // Check: add item to second table
                                                                    setQuickEntryChecked(true);
                                                                    handleQuickEntrySelect();
                                                                }
                                                            }}
                                                            className={cn(
                                                                "inline-flex items-center justify-center w-6 h-6 rounded border-2 transition-all",
                                                                quickEntryItem && selectedItemForPR && !selectedItemForPRLoading
                                                                    ? "border-[#004687] bg-white cursor-pointer hover:bg-[#004687]/10"
                                                                    : "border-[#004687]/30 bg-white cursor-not-allowed opacity-50"
                                                            )}
                                                        >
                                                            {selectedItemForPRLoading
                                                                ? <RotateCcw size={11} className="text-[#004687] animate-spin" />
                                                                : <Check size={11} className={quickEntryChecked ? "text-[#004687]" : "text-transparent"} />
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ── Main Line Items Table ── */}
                                <div>
                                    <div className="px-3 py-2 flex items-center justify-between border-b border-[#004687]/8 bg-slate-50/50">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded bg-[#004687]/15 flex items-center justify-center">
                                                <ClipboardList size={10} className="text-[#004687]" />
                                            </div>
                                            <span className="text-[10px] font-bold text-[#004687]/70 uppercase tracking-widest">Line Items</span>
                                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[9px] font-bold">
                                                {lines.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-[#004687]/30 inline-block" />
                                                Net Amt: <span className="font-bold text-[#004687] ml-0.5">₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 1600 }}>
                                            <colgroup>
                                                {LINE_ITEM_COLUMNS.map((col, i) => (
                                                    <col key={i} style={{ width: col.width }} />
                                                ))}
                                            </colgroup>
                                            <thead>
                                                <tr style={{ background: "linear-gradient(90deg, #004687 0%, #0062b8 60%, #0080eb 100%)" }}>
                                                    {LINE_ITEM_COLUMNS.map((col, i) => (
                                                        <th key={i} style={{
                                                            padding: "8px 6px",
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: "rgba(255,255,255,0.92)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.06em",
                                                            textAlign: i === 0 ? "center" : "left",
                                                            whiteSpace: "nowrap",
                                                            borderRight: i < LINE_ITEM_COLUMNS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                                                        }}>
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                                {/* Column filter row */}
                                                <tr style={{ background: "#f0f5fc", borderBottom: "1px solid #e2ecf7" }}>
                                                    {LINE_ITEM_COLUMNS.map((col, i) => (
                                                        <th key={i} style={{ padding: "3px 4px" }}>
                                                            {col.label && i > 0 && i < LINE_ITEM_COLUMNS.length - 1 ? (
                                                                <div style={{ position: "relative" }}>
                                                                    <input
                                                                        style={{
                                                                            width: "100%",
                                                                            height: 22,
                                                                            padding: "0 6px",
                                                                            fontSize: 10,
                                                                            border: "1px solid #d0dff0",
                                                                            borderRadius: 4,
                                                                            background: "white",
                                                                            outline: "none",
                                                                            color: "#334155",
                                                                        }}
                                                                        placeholder="⌕"
                                                                    />
                                                                </div>
                                                            ) : null}
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
                                                        onChange={updateLine}
                                                        onRemove={removeLine}
                                                    />
                                                ))}
                                                {lines.length === 0 && (
                                                    <tr>
                                                        <td colSpan={LINE_ITEM_COLUMNS.length} className="py-10 text-center">
                                                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                                                <Package size={28} strokeWidth={1} />
                                                                <span className="text-[12px] font-medium">No line items added yet</span>
                                                                <span className="text-[11px]">Use Quick Entry above or click Add Row</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {lines.length > 0 && (
                                                <tfoot>
                                                    <tr style={{ background: "linear-gradient(90deg, #f0f5fc 0%, #e8f0fb 100%)", borderTop: "2px solid #d0dff0" }}>
                                                        {LINE_ITEM_COLUMNS.map((_, i) => {
                                                            if (i === 0) return <td key={i} style={{ padding: "6px 6px", fontSize: 10, fontWeight: 700, color: "#004687", textAlign: "center" }}>TOTAL</td>;
                                                            if (i === 16) return <td key={i} style={{ padding: "6px 6px", fontSize: 11, fontWeight: 700, color: "#004687", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{lines.reduce((s, l) => s + l.grossAmount, 0).toFixed(2)}</td>;
                                                            if (i === 18) return <td key={i} style={{ padding: "6px 6px", fontSize: 11, fontWeight: 700, color: "#004687", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{lines.reduce((s, l) => s + l.taxAmount, 0).toFixed(2)}</td>;
                                                            if (i === 19) return <td key={i} style={{ padding: "6px 6px", fontSize: 11, fontWeight: 800, color: "#004687", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>₹{netAmount.toFixed(2)}</td>;
                                                            return <td key={i} />;
                                                        })}
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* ── Section 3: Additions / Deductions / Net Amount ── */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Additions */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] border-b border-[#004687]/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                                        <ArrowUpCircle size={13} className="text-white" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-white uppercase tracking-wide">Additions</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={addAddition}
                                    className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-white/30 cursor-pointer"
                                >
                                    <Plus size={11} /> Add
                                </button>
                            </div>
                            <div className="p-3 space-y-2 min-h-[60px]">
                                {additions.length === 0 ? (
                                    <p className="text-[12px] text-slate-300 text-center py-2">No additions added</p>
                                ) : (
                                    additions.map((r) => (
                                        <AdjRow
                                            key={r.id}
                                            row={r}
                                            onChange={(id, field, val) => updateAdj(setAdditions, id, field, val)}
                                            onRemove={(id) => removeAdj(setAdditions, id)}
                                        />
                                    ))
                                )}
                                {additions.length > 0 && (
                                    <div className="flex justify-end pt-1 border-t border-slate-100">
                                        <span className="text-[12px] font-bold text-[#004687] tabular-nums">
                                            + ₹{totalAdditions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] border-b border-[#004687]/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                                        <ArrowDownCircle size={13} className="text-white" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-white uppercase tracking-wide">Deductions</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={addDeduction}
                                    className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-white/30 cursor-pointer"
                                >
                                    <Plus size={11} /> Less
                                </button>
                            </div>
                            <div className="p-3 space-y-2 min-h-[60px]">
                                {deductions.length === 0 ? (
                                    <p className="text-[12px] text-slate-300 text-center py-2">No deductions added</p>
                                ) : (
                                    deductions.map((r) => (
                                        <AdjRow
                                            key={r.id}
                                            row={r}
                                            onChange={(id, field, val) => updateAdj(setDeductions, id, field, val)}
                                            onRemove={(id) => removeAdj(setDeductions, id)}
                                        />
                                    ))
                                )}
                                {deductions.length > 0 && (
                                    <div className="flex justify-end pt-1 border-t border-slate-100">
                                        <span className="text-[12px] font-bold text-red-500 tabular-nums">
                                            − ₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* ── Net Amount Summary ── */}
                    <div className="rounded-xl border border-[#004687]/20 bg-gradient-to-br from-[#004687]/5 to-sky-50/40 shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#004687]/10 flex items-center justify-center">
                                <Calculator size={18} className="text-[#004687]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Amount</p>
                                <p className="text-2xl font-bold text-[#004687] tabular-nums">
                                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-[12px] text-slate-500 space-y-0.5">
                            <div className="flex items-center gap-6 justify-end">
                                <span className="text-slate-400">Items Total</span>
                                <span className="font-semibold tabular-nums text-slate-700 w-28 text-right">
                                    ₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {totalAdditions > 0 && (
                                <div className="flex items-center gap-6 justify-end text-emerald-600">
                                    <span>+ Additions</span>
                                    <span className="font-semibold tabular-nums w-28 text-right">
                                        ₹{totalAdditions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                            {totalDeductions > 0 && (
                                <div className="flex items-center gap-6 justify-end text-red-500">
                                    <span>− Deductions</span>
                                    <span className="font-semibold tabular-nums w-28 text-right">
                                        ₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Remarks ── */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="w-6 h-6 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                <AlignJustify size={13} className="text-[#004687]" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Remarks</span>
                        </div>
                        <div className="p-4">
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter Remarks, If Any"
                                rows={3}
                                className="text-[13px] text-slate-700 border border-slate-200 rounded-lg resize-none focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:border-sky-400 bg-white placeholder:text-slate-300 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Info size={10} /> Fields marked with * are required
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="h-9 px-5 text-[13px] font-medium border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 rounded-lg gap-1.5"
                        >
                            <RotateCcw size={13} /> Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="h-9 px-6 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg shadow-none gap-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                        >
                            {saving ? (
                                <><RotateCcw size={13} className="animate-spin" /> Saving…</>
                            ) : (
                                <><Save size={13} /> Submit</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}