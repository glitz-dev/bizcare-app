import { useState, useCallback, useMemo, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PurchaseLineItem {
    id: number;
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
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-9 px-3 pr-14 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          appearance-none transition-all"
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

// ─── Main Component ───────────────────────────────────────────────────────────

interface CreatePurchaseFormProps {
    onClose: () => void;
}

export default function CreatePurchaseForm({ onClose }: CreatePurchaseFormProps) {
    // ── General fields ──
    const [document_, setDocument_] = useState("PURCHASE");
    const [invoiceNo, setInvoiceNo] = useState("PNV-42");
    const [invoiceDate, setInvoiceDate] = useState(getToday());
    const [invoiceTaxType, setInvoiceTaxType] = useState("");
    const [store, setStore] = useState("");
    const [supplierInvDate, setSupplierInvDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [supplierInvNo, setSupplierInvNo] = useState("");
    const [currentBalance, setCurrentBalance] = useState("0");
    const [exchRate, setExchRate] = useState("");
    const [paymentType, setPaymentType] = useState("Credit");
    const [accountHead, setAccountHead] = useState("Purchase Trading");
    const [goodsReceipt, setGoodsReceipt] = useState("");
    const [roundOff, setRoundOff] = useState(false);
    const [remarks, setRemarks] = useState("");

    // ── Line Items ──
    const [lines, setLines] = useState<PurchaseLineItem[]>([newLineItem(1)]);
    const nextId = useRef(2);

    const updateLine = useCallback((id: number, field: keyof PurchaseLineItem, value: string | number) => {
        setLines((prev) =>
            prev.map((l) => (l.id === id ? computeLine({ ...l, [field]: value }) : l))
        );
    }, []);

    const removeLine = useCallback((id: number) => {
        setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
    }, []);

    const addLine = () => {
        setLines((prev) => [...prev, newLineItem(nextId.current++)]);
    };

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

    const handleSubmit = async () => {
        if (!invoiceNo) { toast.error("Invoice No. is required"); return; }
        if (!supplier) { toast.error("Supplier is required"); return; }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        toast.success("Purchase invoice saved successfully");
        onClose();
    };

    const handleClear = () => {
        setDocument_("PURCHASE");
        setSupplier("");
        setSupplierInvNo("");
        setSupplierInvDate("");
        setGoodsReceipt("");
        setPaymentType("Credit");
        setAccountHead("Purchase Trading");
        setRemarks("");
        setRoundOff(false);
        setLines([newLineItem(1)]);
        setAdditions([]);
        setDeductions([]);
    };

    // ── Options ──
    const taxTypeOptions = [
        { value: "kerala-intrastate", label: "[KERALA] - Intrastate-GST" },
        { value: "inter-state", label: "Interstate-GST" },
        { value: "import", label: "Import" },
    ];
    const storeOptions = [
        { value: "xxxx", label: "XXXX" },
        { value: "main", label: "Main Store" },
    ];
    const supplierOptions = [
        { value: "supplier1", label: "Supplier 1" },
        { value: "supplier2", label: "Supplier 2" },
        { value: "supplier5", label: "SUPPLIER5" },
    ];
    const paymentOptions = [
        { value: "Credit", label: "Credit" },
        { value: "Cash", label: "Cash" },
        { value: "Bank", label: "Bank Transfer" },
    ];
    const accountOptions = [
        { value: "Purchase Trading", label: "Purchase Trading" },
        { value: "Purchase Capital", label: "Purchase Capital" },
    ];

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

                            <AccordionContent className="p-4 pt-4 pb-2">
                                {/* Row 1 */}
                                <div className="grid grid-cols-5 gap-4 mb-4">
                                    <div>
                                        <FieldLabel icon={FileText} label="Document" />
                                        <div className="relative">
                                            <FormInput value={document_} onChange={setDocument_} placeholder="Document" />
                                            {document_ && (
                                                <button onClick={() => setDocument_("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                                    <X size={11} />
                                                </button>
                                            )}
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
                                            placeholder="Select Tax Type"
                                            options={taxTypeOptions}
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
                                        <ClearableSelect
                                            value={supplier}
                                            onChange={setSupplier}
                                            placeholder="Select Supplier"
                                            options={supplierOptions}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Supplier Inv. No." />
                                        <FormInput value={supplierInvNo} onChange={setSupplierInvNo} placeholder="Supplier Inv. No." />
                                    </div>
                                    <div>
                                        <FieldLabel icon={BadgeIndianRupee} label="Current A/C Balance" />
                                        <FormInput value={currentBalance} onChange={setCurrentBalance} placeholder="0" readOnly className="font-mono" />
                                    </div>
                                    <div>
                                        <FieldLabel icon={DollarSign} label="Exch. Rate" />
                                        <FormInput value={exchRate} onChange={setExchRate} placeholder="Enter Exch. Rate" />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-5 gap-4 items-end">
                                    <div>
                                        <FieldLabel icon={CreditCard} label="Payment Type" />
                                        <ClearableSelect
                                            value={paymentType}
                                            onChange={setPaymentType}
                                            placeholder="Select Type"
                                            options={paymentOptions}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={AlignJustify} label="Account Head" />
                                        <ClearableSelect
                                            value={accountHead}
                                            onChange={setAccountHead}
                                            placeholder="Select Account"
                                            options={accountOptions}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-9 px-5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] hover:from-[#003a70] hover:via-[#00519a] hover:to-[#006ecc] text-white text-[13px] font-semibold rounded-lg shadow-sm gap-2 transition-all w-full border-0 cursor-pointer"
                                        >
                                            <ClipboardCheck size={14} />
                                            Select Goods Receipts
                                        </Button>
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
                            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                        >
                            {/* Custom trigger header with "Clear All" on the right */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <AccordionTrigger className="flex items-center gap-2 px-4 py-2.5 flex-1 hover:no-underline rounded-none">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="w-6 h-6 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                            <Package size={13} className="text-[#004687]" />
                                        </div>
                                        <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Direct Purchase</span>
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[10px] font-bold">
                                            {lines.length}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <button
                                    type="button"
                                    onClick={() => setLines([newLineItem(1)])}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-all mr-2"
                                >
                                    <Trash2 size={10} /> Clear All
                                </button>
                            </div>

                            <AccordionContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 1600 }}>
                                        <colgroup>
                                            {LINE_ITEM_COLUMNS.map((col, i) => (
                                                <col key={i} style={{ width: col.width }} />
                                            ))}
                                        </colgroup>
                                        <thead>
                                            <tr style={{ background: "linear-gradient(135deg, #004687 0%, #6F8FAF 100%)" }}>
                                                {LINE_ITEM_COLUMNS.map((col, i) => (
                                                    <th key={i} style={{
                                                        padding: "8px 6px",
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: "rgba(255,255,255,0.9)",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                        textAlign: i === 0 ? "center" : "left",
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                        {col.label}
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
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add line */}
                                <button
                                    type="button"
                                    onClick={addLine}
                                    className="w-full py-2.5 text-[11px] font-bold text-[#004687] hover:bg-[#004687]/5 border-t border-slate-100 flex items-center justify-center gap-2 transition-colors group cursor-pointer"
                                >
                                    <span className="w-5 h-5 rounded-full border-2 border-dashed border-[#004687]/40 group-hover:border-[#004687] flex items-center justify-center transition-colors">
                                        <Plus size={10} />
                                    </span>
                                    Add Line Item
                                </button>
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
                            onClick={onClose}
                            className="h-9 px-5 text-[13px] font-medium border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </Button>
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
                            className="h-9 px-6 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg shadow-none gap-1.5 transition-colors disabled:opacity-70"
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