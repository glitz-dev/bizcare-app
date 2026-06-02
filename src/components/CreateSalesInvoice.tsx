import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchDocumentMasters,
    fetchDefaultStore,
    fetchInvoiceTaxTypes,
    fetchPaymentTypes,
    fetchGSTTypes,
    fetchDefaultState,
    fetchBaseCurrency,
    fetchAllInvoiceTaxTypes,
    fetchCustomers,
    fetchCurrencies,
    fetchStates,
    fetchDeliveryNotes,
    fetchSalesOrders,
    fetchSelectedDNForRetailInvoice,
    fetchStores,
    fetchProducts,
    fetchProductDetails,
    saveSalesInvoice,
    DeliveryNote as SliceDeliveryNote,
    SelectedDNItem,
    Store as StoreItem,
    Currency as CurrencyItem,
    ProductItem as ProductItemType,
    ProductItemDetails,
    SaveSalesInvoicePayload,
    resetDeliveryNotes,
    resetSelectedDNItems,
} from "@/store/features/inventory/sales/salesInvoiceSlice";
import {
    Plus,
    X,
    Trash2,
    RefreshCcw,
    ChevronLeft,
    FileText,
    Hash,
    Calendar,
    ChevronsUpDown,
    Check,
    Save,
    Settings2,
    User,
    DollarSign,
    MapPin,
    MessageSquare,
    Info,
    Package,
    BarChart3,
    Percent,
    Receipt,
    Truck,
    Search,
    ChevronRight,
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
import { Calendar as CalendarUI } from "@/components/ui/calendar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesLineItem {
    id: number;
    itemId: number | null;
    itemCode: string;
    item: string;
    specification: string;
    currentStock: string;
    quantity: string;
    sRate: string;
    taxPercent: string;
    taxAmount: string;
    netAmount: string;
    vatPercent: string;
    cessPercent: string;
    vatAmount: string;
    cessAmount: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newLineItem(id: number): SalesLineItem {
    return {
        id,
        itemId: null,
        itemCode: "",
        item: "",
        specification: "",
        currentStock: "",
        quantity: "",
        sRate: "",
        taxPercent: "",
        taxAmount: "",
        netAmount: "",
        vatPercent: "",
        cessPercent: "",
        vatAmount: "",
        cessAmount: "",
    };
}

function getToday(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// ─── Combobox ─────────────────────────────────────────────────────────────────
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
    triggerClassName?: string;
    className?: string;
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
    triggerClassName,
    className,
    onOpen,
}: SearchableComboboxProps) {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find((o) => o.value === value)?.label || value;

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen && onOpen) onOpen();
        setOpen(nextOpen);
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
                        "disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300",
                        triggerClassName
                    )}
                >
                    <span className={cn("truncate", !selectedLabel && "text-slate-400")}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronsUpDown size={11} className="ml-1 shrink-0 text-slate-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent className={cn("p-0 w-[220px]", className)} align="start" sideOffset={4}>
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
                    <CommandList>
                        <CommandEmpty className="py-4 text-center text-xs text-slate-400">{emptyText}</CommandEmpty>
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

// ─── FieldLabel ───────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            <Icon size={12} className="text-[#004687]" />
            {label}
        </label>
    );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
function SectionCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
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

// ─── Line Item Row ────────────────────────────────────────────────────────────
const LineItemRow = memo(
    ({
        line,
        idx,
        updateLine,
        removeLine,
        products,
        productsLoading,
        onItemOpen,
        onItemSelect,
    }: {
        line: SalesLineItem;
        idx: number;
        updateLine: (id: number, field: keyof SalesLineItem, value: string) => void;
        removeLine: (id: number) => void;
        products: ProductItemType[];
        productsLoading: boolean;
        onItemOpen: () => void;
        onItemSelect: (lineId: number, product: ProductItemType) => void;
    }) => {
        const cellCls = "px-2 py-2";
        const inputCls =
            "h-7 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#6F8FAF]/60 w-full px-2 transition";

        const itemOptions: ComboboxOption[] = products.map((p) => ({
            value: String(p.ItemID),
            label: p.ItemName,
        }));

        return (
            <tr
                className={cn(
                    "border-b border-slate-100 transition-colors group",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                    "hover:bg-blue-50/30"
                )}
            >
                {/* # */}
                <td className="px-2 py-2 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004687]/10 text-[10px] font-bold text-[#004687]">
                        {idx + 1}
                    </span>
                </td>

                <td className={cellCls}>
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#004687] hover:bg-blue-50 transition-all mx-auto"
                    >
                        <Settings2 size={11} />
                    </button>
                </td>

                {/* Prof # */}
                <td className={cellCls}>
                    <input placeholder="Prof #" className={inputCls} />
                </td>

                {/* Item */}
                <td className={cellCls}>
                    <ComboboxWithClear
                        value={line.item}
                        onClear={() => {
                            updateLine(line.id, "item", "");
                            updateLine(line.id, "itemCode", "");
                            updateLine(line.id, "currentStock", "");
                            updateLine(line.id, "sRate", "");
                            updateLine(line.id, "taxPercent", "");
                            updateLine(line.id, "vatPercent", "");
                            updateLine(line.id, "cessPercent", "");
                        }}
                    >
                        <SearchableCombobox
                            options={itemOptions}
                            value={line.itemId != null ? String(line.itemId) : ""}
                            onValueChange={(v) => {
                                const found = products.find((p) => String(p.ItemID) === v);
                                if (found) onItemSelect(line.id, found);
                            }}
                            placeholder={productsLoading ? "Loading…" : line.item || "Select Item"}
                            searchPlaceholder="Search items…"
                            disabled={productsLoading}
                            onOpen={onItemOpen}
                            triggerClassName="h-7 text-[11px]"
                            className="w-[240px]"
                        />
                    </ComboboxWithClear>
                </td>

                {/* Specification */}
                <td className={cellCls}>
                    <ComboboxWithClear value={line.specification} onClear={() => updateLine(line.id, "specification", "")}>
                        <SearchableCombobox
                            options={[]}
                            value={line.specification}
                            onValueChange={(v) => updateLine(line.id, "specification", v)}
                            placeholder="Specification"
                            searchPlaceholder="Search specs…"
                            disabled={!line.item}
                            triggerClassName="h-7 text-[11px]"
                        />
                    </ComboboxWithClear>
                </td>

                {/* Current Stock */}
                <td className={cellCls}>
                    <input value={line.currentStock} onChange={(e) => updateLine(line.id, "currentStock", e.target.value)} placeholder="Stock" className={cn(inputCls, "text-center")} readOnly />
                </td>

                {/* Quantity */}
                <td className={cellCls}>
                    <input value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} placeholder="0" type="number" className={cn(inputCls, "text-center font-medium")} />
                </td>

                {/* S.Rate */}
                <td className={cellCls}>
                    <input value={line.sRate} onChange={(e) => updateLine(line.id, "sRate", e.target.value)} placeholder="0.00" type="number" className={cn(inputCls, "text-right")} />
                </td>

                {/* Tax % */}
                <td className={cellCls}>
                    <input value={line.taxPercent} onChange={(e) => updateLine(line.id, "taxPercent", e.target.value)} placeholder="0" type="number" className={cn(inputCls, "text-center")} />
                </td>

                {/* Tax Amt */}
                <td className={cellCls}>
                    <input value={line.taxAmount} onChange={(e) => updateLine(line.id, "taxAmount", e.target.value)} placeholder="0.00" className={cn(inputCls, "text-right")} readOnly />
                </td>

                {/* Net Amount */}
                <td className={cellCls}>
                    <input value={line.netAmount} onChange={(e) => updateLine(line.id, "netAmount", e.target.value)} placeholder="0.00" className={cn(inputCls, "text-right font-medium")} readOnly />
                </td>

                {/* VAT % */}
                <td className={cellCls}>
                    <input value={line.vatPercent} onChange={(e) => updateLine(line.id, "vatPercent", e.target.value)} placeholder="0" type="number" className={cn(inputCls, "text-center")} />
                </td>

                {/* CESS % */}
                <td className={cellCls}>
                    <input value={line.cessPercent} onChange={(e) => updateLine(line.id, "cessPercent", e.target.value)} placeholder="0" type="number" className={cn(inputCls, "text-center")} />
                </td>

                {/* VAT Amt */}
                <td className={cellCls}>
                    <input value={line.vatAmount} onChange={(e) => updateLine(line.id, "vatAmount", e.target.value)} placeholder="0.00" className={cn(inputCls, "text-right")} readOnly />
                </td>

                {/* CESS Amt */}
                <td className={cellCls}>
                    <input value={line.cessAmount} onChange={(e) => updateLine(line.id, "cessAmount", e.target.value)} placeholder="0.00" className={cn(inputCls, "text-right")} readOnly />
                </td>

                {/* Delete */}
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all mx-auto opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={12} />
                    </button>
                </td>
            </tr>
        );
    }
);
LineItemRow.displayName = "LineItemRow";

// ─── DatePickerField ──────────────────────────────────────────────────────────
function DatePickerField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const parseDate = (str: string): Date | undefined => {
        const [d, m, y] = str.split("-").map(Number);
        if (!d || !m || !y) return undefined;
        const date = new Date(y, m - 1, d);
        return isNaN(date.getTime()) ? undefined : date;
    };

    const formatDate = (date: Date): string => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    };

    const displayDate = (str: string): string => {
        const date = parseDate(str);
        if (!date) return str;
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const selected = parseDate(value);

    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="h-9 px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all w-[145px] text-left relative hover:border-slate-300"
                    >
                        <span>{displayDate(value)}</span>
                        <Calendar size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start" sideOffset={4}>
                    <CalendarUI
                        mode="single"
                        selected={selected}
                        onSelect={(date) => {
                            if (date) {
                                onChange(formatDate(date));
                                setOpen(false);
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

// ─── DeliveryNoteModal ────────────────────────────────────────────────────────
function DeliveryNoteModal({
    open,
    onClose,
    onSelect,
    invTaxTypeID,
    gstTypeID,
    deliveryNotes,
    deliveryNotesLoading,
    deliveryNotesTotalRecords,
    deliveryNotesCurrentPage,
    deliveryNotesRowsPerPage,
    onSearch,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (dnIds: number[], invTaxTypeID: number, gstTypeID: number) => void;
    invTaxTypeID: number;
    gstTypeID: number;
    deliveryNotes: SliceDeliveryNote[];
    deliveryNotesLoading: boolean;
    deliveryNotesTotalRecords: number;
    deliveryNotesCurrentPage: number;
    deliveryNotesRowsPerPage: number;
    onSearch: (startDate: string, endDate: string, searchStr: string) => void;
}) {
    const [filterBy] = useState("DN Date");
    const [startDate, setStartDate] = useState("07-08-2024");
    const [endDate, setEndDate] = useState(getToday());
    const [customerCode, setCustomerCode] = useState("");
    const [selected, setSelected] = useState<number[]>([]);

    if (!open) return null;

    const totalPages = Math.max(1, Math.ceil(deliveryNotesTotalRecords / deliveryNotesRowsPerPage));

    const toggleRow = (id: number) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const toggleAll = () =>
        setSelected((prev) =>
            prev.length === deliveryNotes.length ? [] : deliveryNotes.map((d) => d.DeliveryNoteID)
        );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-[860px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#004687] to-[#1a6ab5] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                            <Truck size={14} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-white tracking-wide">DeliveryNote Details</p>
                            <p className="text-[11px] text-white/60 font-medium">Select delivery notes to link to this invoice</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex items-end gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
                    {/* Filter By */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Filter By</label>
                        <div className="h-9 px-3 flex items-center text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg min-w-[130px] font-medium">
                            {filterBy}
                        </div>
                    </div>

                    {/* Start Date */}
                    <DatePickerField
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                    />

                    {/* End Date */}
                    <DatePickerField
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                    />

                    {/* Customer Code */}
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Customer Code</label>
                        <div className="relative">
                            <input
                                value={customerCode}
                                onChange={(e) => setCustomerCode(e.target.value)}
                                placeholder="Select Customer Code"
                                className="h-9 w-full px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                            />
                            <User size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Search */}
                    <Button
                        type="button"
                        onClick={() => onSearch(startDate, endDate, customerCode)}
                        className="h-9 px-5 bg-[#004687] hover:bg-[#003a72] text-white text-[13px] font-semibold rounded-lg gap-2 shadow-none transition-colors shrink-0"
                    >
                        <Search size={13} />
                        SEARCH
                    </Button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full text-[13px] border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#004687] text-white">
                                <th className="px-4 py-2.5 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={deliveryNotes.length > 0 && selected.length === deliveryNotes.length}
                                        onChange={toggleAll}
                                        className="w-3.5 h-3.5 rounded border-white/40 accent-white cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold tracking-wide text-[12px] uppercase">DN #</th>
                                <th className="px-4 py-2.5 text-left font-semibold tracking-wide text-[12px] uppercase">DN Date</th>
                                <th className="px-4 py-2.5 text-left font-semibold tracking-wide text-[12px] uppercase">Customer Code</th>
                                <th className="px-4 py-2.5 text-left font-semibold tracking-wide text-[12px] uppercase">Currency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryNotesLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCcw size={14} className="animate-spin text-[#004687]" />
                                            Loading delivery notes…
                                        </div>
                                    </td>
                                </tr>
                            ) : deliveryNotes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-slate-400">
                                        No delivery notes found. Adjust filters and click Search.
                                    </td>
                                </tr>
                            ) : (
                                deliveryNotes.map((dn, idx) => {
                                    const isSelected = selected.includes(dn.DeliveryNoteID);
                                    return (
                                        <tr
                                            key={dn.DeliveryNoteID}
                                            onClick={() => toggleRow(dn.DeliveryNoteID)}
                                            className={cn(
                                                "border-b border-slate-100 cursor-pointer transition-colors",
                                                isSelected
                                                    ? "bg-blue-50 hover:bg-blue-100/70"
                                                    : idx % 2 === 0
                                                        ? "bg-white hover:bg-slate-50"
                                                        : "bg-slate-50/50 hover:bg-slate-100/60"
                                            )}
                                        >
                                            <td className="px-4 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(dn.DeliveryNoteID)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-3.5 h-3.5 rounded accent-[#004687] cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5 font-semibold text-[#004687]">{dn.ProformaNo}</td>
                                            <td className="px-4 py-2.5 text-slate-600">{dn.ProformaDate}</td>
                                            <td className="px-4 py-2.5 text-slate-500">{dn.CustomerCode || dn.CustCode || "—"}</td>
                                            <td className="px-4 py-2.5 text-slate-600">{dn.Currency}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-200 shrink-0">
                    {/* Record count */}
                    <p className="text-[12px] text-slate-500 font-medium">
                        Showing <span className="text-slate-700 font-semibold">
                            {deliveryNotes.length === 0 ? 0 : (deliveryNotesCurrentPage - 1) * deliveryNotesRowsPerPage + 1}
                        </span> to{" "}
                        <span className="text-slate-700 font-semibold">
                            {Math.min(deliveryNotesCurrentPage * deliveryNotesRowsPerPage, deliveryNotesTotalRecords)}
                        </span> of{" "}
                        <span className="text-slate-700 font-semibold">{deliveryNotesTotalRecords}</span> records{" "}
                        <span className="text-slate-400">[p.{deliveryNotesCurrentPage}/{totalPages}]</span>
                    </p>

                    {/* Pagination */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#004687] hover:border-[#004687] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            disabled={deliveryNotesCurrentPage === 1}
                        >
                            <ChevronLeft size={13} />
                        </button>
                        <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#004687] text-white text-[12px] font-bold shadow-sm"
                        >
                            {deliveryNotesCurrentPage}
                        </button>
                        <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#004687] hover:border-[#004687] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            disabled={deliveryNotesCurrentPage >= totalPages}
                        >
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg shadow-none transition-colors"
                        >
                            BACK
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (selected.length > 0) {
                                    onSelect(selected, invTaxTypeID, gstTypeID);
                                    onClose();
                                }
                            }}
                            disabled={selected.length === 0}
                            className="h-8 px-4 bg-[#004687] hover:bg-[#003a72] text-white text-[12px] font-semibold rounded-lg shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            CREATE INVOICE
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateSalesInvoiceProps {
    onClose: () => void;
    onSuccess?: (saved: {
        invoiceNo: string;
        invoiceDate: string;
        customerName: string;
        netAmount: number;
        createdBy?: string;
    }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CreateSalesInvoice({ onClose, onSuccess }: CreateSalesInvoiceProps) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        documentMasters,
        defaultStore,
        documentMastersLoading,
        invoiceTaxTypes,
        paymentTypes,
        paymentTypesLoading,
        gstTypes,
        gstTypesLoading,
        defaultState,
        baseCurrency,
        allInvoiceTaxTypes,
        allInvoiceTaxTypesLoading,
        customers,
        customersLoading,
        states,
        statesLoading,
        deliveryNotes,
        deliveryNotesLoading,
        deliveryNotesTotalRecords,
        deliveryNotesCurrentPage,
        deliveryNotesRowsPerPage,
        selectedDNItems,
        selectedDNItemsLoading,
        stores,
        storesLoading,
        currencies,
        currenciesLoading,
        products,
        productsLoading,
        saveSalesInvoiceLoading,
    } = useSelector((state: RootState) => state.salesInvoice);

    const [showDNModal, setShowDNModal] = useState(false);

    // ── Header fields ──
    const [document, setDocument] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(getToday());
    const [invoiceTaxType, setInvoiceTaxType] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [store, setStore] = useState("");

    // ── Customer / financial ──
    const [customer, setCustomer] = useState("");
    const [currency, setCurrency] = useState("");
    const [exchangeRate, setExchangeRate] = useState("");
    const [gstType, setGstType] = useState("Inclusive");
    const [state, setState] = useState("");

    // ── Shipping / billing ──
    const [shippingGST, setShippingGST] = useState("");
    const [shippingPhone, setShippingPhone] = useState("");
    const [billingGST, setBillingGST] = useState("");
    const [billingPhone, setBillingPhone] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    // ── Bottom ──
    const [remarks, setRemarks] = useState("");
    const [directPurchase, setDirectPurchase] = useState(false);
    const [registered, setRegistered] = useState(false);

    // ── Line items ──
    const [lines, setLines] = useState<SalesLineItem[]>([newLineItem(1)]);

    const netAmount = lines.reduce((sum, l) => sum + (parseFloat(l.netAmount) || 0), 0);

    const grossAmount = lines.reduce(
        (sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.sRate) || 0),
        0
    );
    const totalTax = lines.reduce((sum, l) => sum + (parseFloat(l.taxAmount) || 0), 0);

    const updateLine = useCallback((id: number, field: keyof SalesLineItem, value: string) => {
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    }, []);

    const addLine = useCallback(() => {
        setLines((ls) => [...ls, newLineItem(ls.length > 0 ? Math.max(...ls.map((l) => l.id)) + 1 : 1)]);
    }, []);

    const removeLine = useCallback((id: number) => {
        setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));
    }, []);

    // ── Handle item selection in a line row ──
    // 1. Optimistically prefills item name/code on the row immediately.
    // 2. Dispatches fetchProductDetails; on fulfillment patches stock/rate/tax fields.
    const handleItemSelect = useCallback(
        (lineId: number, product: ProductItemType) => {
            // Optimistic update
            setLines((ls) =>
                ls.map((l) =>
                    l.id === lineId
                        ? {
                            ...l,
                            item: product.ItemName,
                            itemId: product.ItemID,
                            itemCode: product.ItemCode ?? "",
                            specification: product.SalesUnit,
                        }
                        : l
                )
            );

            // Resolve IDs needed for the details call
            const selectedCustomer = customers.find(
                (c) => String(c.CustomerID) === customer
            );
            const customerId = selectedCustomer?.CustomerID ?? 0;
            const invoiceTaxTypeId =
                invoiceTaxTypes.find((t) => t.InvoiceTaxType === invoiceTaxType)
                    ?.InvoiceTaxTypeID ?? 1;

            dispatch(
                fetchProductDetails({
                    itemId: product.ItemID,
                    itemCode: product.ItemCode ?? "",
                    customerId,
                    invoiceTaxTypeId,
                    customerCode: selectedCustomer?.CustomerCode ?? "",
                })
            ).then((action) => {
                if (fetchProductDetails.fulfilled.match(action)) {
                    const d: ProductItemDetails = action.payload;
                    setLines((ls) =>
                        ls.map((l) =>
                            l.id === lineId
                                ? {
                                    ...l,
                                    currentStock:
                                        d.CurrentQuantity != null
                                            ? String(d.CurrentQuantity)
                                            : "",
                                    sRate:
                                        d.SalesRate != null ? String(d.SalesRate) : "",
                                    taxPercent:
                                        d.TaxValue != null ? String(d.TaxValue) : "",
                                    vatPercent:
                                        d.VAT != null ? String(d.VAT) : "",
                                    cessPercent:
                                        d.CESS != null ? String(d.CESS) : "",
                                }
                                : l
                        )
                    );
                }
            });
        },
        [dispatch, customers, customer, invoiceTaxTypes, invoiceTaxType]
    );

    const handleSubmit = useCallback(async () => {
        // ── Validate required fields ──
        if (!document) { toast.error("Please select a Document."); return; }
        if (!invoiceNo) { toast.error("Invoice No. is required."); return; }
        if (!invoiceDate) { toast.error("Invoice Date is required."); return; }
        if (!customer) { toast.error("Please select a Customer."); return; }

        const hasValidLine = lines.some(
            (l) => l.item && parseFloat(l.quantity) > 0
        );
        if (!hasValidLine) {
            toast.error("At least one line item with an item and quantity is required.");
            return;
        }

        // ── Resolve lookup objects ──
        const selectedDoc = documentMasters.find((d) => d.DocumentName === document);
        const selectedCustomer = customers.find((c) => String(c.CustomerID) === customer);
        const selectedInvTaxType = invoiceTaxTypes.find((t) => t.InvoiceTaxType === invoiceTaxType);
        const selectedGSTType = gstTypes.find((g) => g.GSTType === gstType);
        const selectedPaymentType = paymentTypes.find((p) => p.PaymentTypeName === paymentType);
        const selectedStore = (stores.length > 0 ? stores : defaultStore ? [defaultStore] : []).find(
            (s) => String(s.StoreID) === store
        );
        const selectedCurrency = currencies.length > 0
            ? currencies.find((c) => c.Currency === currency)
            : null;
        const selectedState = states.length > 0
            ? states.find((s) => s.StateName === state)
            : defaultState?.StateName === state ? defaultState : null;

        // ── Convert DD-MM-YYYY → YYYY-MM-DD for API ──
        const toApiDate = (d: string) => {
            if (!d) return "";
            const parts = d.split("-");
            if (parts.length !== 3) return d;
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };

        const apiInvoiceDate = toApiDate(invoiceDate);

        // ── Build line details from current lines ──
        const lstSalesDetails = lines
            .filter((l) => l.item && parseFloat(l.quantity) > 0)
            .map((l) => {
                const qty = parseFloat(l.quantity) || 0;
                const sRate = parseFloat(l.sRate) || 0;
                const grossAmt = qty * sRate;
                const taxAmt = parseFloat(l.taxAmount) || 0;
                const netAmt = parseFloat(l.netAmount) || grossAmt + taxAmt;

                // Find matched selectedDNItem for additional fields (if came from DN)
                const dnItem = selectedDNItems.find((d) => d.ItemName === l.item);

                return {
                    Code: dnItem?.Code ?? "",
                    CompanyName: dnItem?.CompanyName ?? "",
                    DeliveryNoteTID: dnItem?.DeliveryNoteTID ?? 0,
                    DeliveryNoteMID: dnItem?.DeliveryNoteMID ?? 0,
                    CompanyID: dnItem?.CompanyID ?? 0,
                    CompanyName1: dnItem?.CompanyName1 ?? "",
                    ItemID: l.itemId ?? dnItem?.ItemID ?? 0,
                    ItemCode: l.itemCode ?? dnItem?.ItemCode ?? "",
                    ItemName: l.item,
                    ItemDescription: l.specification || null,
                    Quantity: qty,
                    SalesRate: sRate,
                    GrossAmount: grossAmt,
                    UnitMultiplier: dnItem?.UnitMultiplier ?? 1,
                    DiscountPercentage: dnItem?.DiscountPercentage ?? 0,
                    DiscountAmount: dnItem?.DiscountAmount ?? 0,
                    TaxPercentage: parseFloat(l.taxPercent) || 0,
                    Amount: netAmt,
                    SalesUnitID: dnItem?.SalesUnitID ?? 0,
                    UnitID: dnItem?.UnitID ?? 0,
                    SalesUnit: l.specification || dnItem?.SalesUnit || "",
                    ServiceTaxPercentage: dnItem?.ServiceTaxPercentage ?? null,
                    ServiceTaxID: dnItem?.ServiceTaxID ?? null,
                    DeliveryNoteNo: dnItem?.DeliveryNoteNo ?? "",
                    SGSTPer: dnItem?.SGSTPer ?? null,
                    CGSTPer: dnItem?.CGSTPer ?? null,
                    IGSTPer: dnItem?.IGSTPer ?? null,
                    IGSTPerLUT: dnItem?.IGSTPerLUT ?? null,
                    UTGSTPer: dnItem?.UTGSTPer ?? null,
                    CESSPer: parseFloat(l.cessPercent) || null,
                    VATPer: parseFloat(l.vatPercent) || null,
                    SGSTAmt: dnItem?.SGSTAmt ?? null,
                    CGSTAmt: dnItem?.CGSTAmt ?? null,
                    IGSTAmt: dnItem?.IGSTAmt ?? null,
                    IGSTAmtLUT: dnItem?.IGSTAmtLUT ?? null,
                    UTGSTAmt: dnItem?.UTGSTAmt ?? null,
                    VATAmt: parseFloat(l.vatAmount) || null,
                    SoldQuantity: dnItem?.SoldQuantity ?? 0,
                    SalesQuotationMID: dnItem?.SalesQuotationMID ?? 0,
                    CustomerID: selectedCustomer?.CustomerID ?? 0,
                    GrossWgt: dnItem?.GrossWgt ?? 0,
                    SalesQuotationTID: dnItem?.SalesQuotationTID ?? 0,
                    SQQty: dnItem?.SQQty ?? 0,
                    RateOn: dnItem?.RateOn ?? "",
                    PackNo: dnItem?.PackNo ?? 0,
                    Origin: dnItem?.Origin ?? "",
                    Percent: dnItem?.Percent ?? 0,
                    PrintSlNo: dnItem?.PrintSlNo ?? 0,
                    TaxCategoryId: dnItem?.TaxCategoryId ?? 0,
                    PaymentTypeID: selectedPaymentType?.PaymentTypeID ?? 0,
                    PaymentTypeName: paymentType,
                };
            });

        // ── Build proforms (from selectedDNItems linked delivery notes) ──
        const proforms = deliveryNotes
            .filter((dn) => selectedDNItems.some((item) => item.CustomerID === dn.CustomerID))
            .map((dn) => ({
                DeliveryNoteID: dn.DeliveryNoteID,
                ProformaNo: dn.ProformaNo,
                CustCode: dn.CustCode,
                ProformaDate: dn.ProformaDate,
                CurrencyExchRate: dn.CurrencyExchRate,
                Currency: dn.Currency,
                CurrencyID: dn.CurrencyID,
                CustomerID: dn.CustomerID,
                CustomerName: dn.CustomerName,
                CustomerCode: dn.CustomerCode,
                TotalRowCount: dn.TotalRowCount,
            }));

        // ── Totals ──
        const totalQuantity = lstSalesDetails.reduce((s, l) => s + l.Quantity, 0);
        const totalGross = lstSalesDetails.reduce((s, l) => s + l.GrossAmount, 0);
        const totalNet = lstSalesDetails.reduce((s, l) => s + l.Amount, 0);
        const totalTaxAmt = lstSalesDetails.reduce(
            (s, l) => s + (l.Amount - l.GrossAmount),
            0
        );
        const totalVAT = lstSalesDetails.reduce((s, l) => s + (l.VATAmt ?? 0), 0);
        const totalCESS = lstSalesDetails.reduce(
            (s, l) => s + ((l.CESSPer ?? 0) / 100) * l.GrossAmount,
            0
        );

        const payload: SaveSalesInvoicePayload = {
            RetInvDateStr: apiInvoiceDate,
            ReviewDateStr: apiInvoiceDate,
            StartDateStr: apiInvoiceDate,
            EndDateStr: apiInvoiceDate,
            SalesDate: apiInvoiceDate,
            ReviewDate: apiInvoiceDate,
            ReviewedOn: apiInvoiceDate,
            DocumentID: selectedDoc?.DocumentID ?? 0,
            DocumentName: document,
            SalesNo: invoiceNo,
            InvoiceTaxTypeID: selectedInvTaxType?.InvoiceTaxTypeID ?? 0,
            InvoiceTaxType: invoiceTaxType,
            GSTTypeID: selectedGSTType?.GSTTypeID ?? 0,
            GSTType: gstType,
            PaymentTypeID: selectedPaymentType?.PaymentTypeID ?? 0,
            PaymentTypeName: paymentType,
            StoreID: selectedStore?.StoreID ?? 0,
            StoreName: selectedStore?.StoreName ?? "",
            CustomerID: selectedCustomer?.CustomerID ?? 0,
            CustomerName: selectedCustomer?.CustomerName ?? "",
            CustomerCode: selectedCustomer?.CustomerCode ?? null,
            CustomerCodePopup: selectedCustomer?.CustomerCode ?? null,
            CurrencyID: selectedCurrency?.CurrencyID ?? baseCurrency?.CurrencyID ?? 0,
            Currency: currency,
            ExRate: parseFloat(exchangeRate) || 1,
            ExchRate: parseFloat(exchangeRate) || 1,
            StateID: selectedState?.StateID ?? 0,
            StateName: state,
            BillingAddress: billingAddress,
            ShippingID: null,
            SameShippingAddress: shippingAddress === billingAddress,
            DeliveryNoteID: proforms[0]?.DeliveryNoteID ?? 0,
            ProformaNo: proforms[0]?.ProformaNo ?? "",
            GrossAmount: totalGross.toFixed(2),
            GrossAmountBase: totalGross,
            NetAmount: totalNet.toFixed(2),
            PreNetAmount: totalNet.toFixed(2),
            PreNetAmountBase: totalNet.toFixed(2),
            TotalNetAmountWithOutRounding: totalNet.toFixed(2),
            TotalNetAmountWithOutTax: totalGross.toFixed(2),
            TotalQuantity: String(totalQuantity),
            TotalTax: totalTaxAmt,
            TotalTaxBase: totalTaxAmt.toFixed(2),
            TotalDiscount: "0",
            TotalDiscountBase: 0,
            TotalCGSTAmt: 0,
            TotalSGSTAmt: 0,
            TotalIGSTAmt: 0,
            TotalUTGSTAmt: 0,
            TotalCESSAmt: totalCESS,
            TotalVATAmount: totalVAT,
            OtherAdditionalAmount: "0",
            OtherAdditionalAmountBase: "0",
            OtherDeductionAmount: "0",
            OtherDeductionAmountBase: "0",
            TaxPercHead: invoiceTaxType,
            TaxAmountHead: totalTaxAmt.toFixed(2),
            TaxMasterID: selectedDoc?.TaxMasterID ?? 0,
            IsGST: selectedDoc?.IsGST ?? false,
            TaxInvoice: false,
            Intercompany: false,
            IsLocalOrder: false,
            ExpIncSalesOrderDocID: 0,
            CorrespondentID: null,
            CustRefDate: null,
            SalesRefDate: null,
            ChequeDate: null,
            ShipmentDate: null,
            ProbableAdvDate: null,
            ProdCompletionDate: null,
            ProjectedArrivalDate: null,
            DeliveryWeek: null,
            DateTypeList: { Id: 1, Name: "Invoice Date" },
            LstSalesDetails: lstSalesDetails,
            proforms,
        };

        const result = await dispatch(saveSalesInvoice(payload));

        if (saveSalesInvoice.fulfilled.match(result)) {
            toast.success("Sales invoice saved successfully!", {

                style: {
                    background: "#097969",
                    color: "white",
                    border: "1px solid #d97706",
                },

            });
            onSuccess?.({
                invoiceNo: payload.SalesNo,
                invoiceDate: payload.SalesDate,
                customerName: payload.CustomerName,
                netAmount: parseFloat(payload.NetAmount as string) || 0,
            });
        } else {
            toast.error(
                typeof result.payload === "string"
                    ? result.payload
                    : "Failed to save sales invoice.", {
                style: {
                    background: "#FF4433",
                    color: "white",
                    border: "1px solid #d97706",
                },
            }
            );
        }
    }, [
        document, invoiceNo, invoiceDate, invoiceTaxType, paymentType, store,
        customer, currency, exchangeRate, gstType, state,
        shippingAddress, billingAddress,
        lines, selectedDNItems, deliveryNotes,
        documentMasters, customers, invoiceTaxTypes, gstTypes, paymentTypes,
        stores, defaultStore, currencies, baseCurrency, states, defaultState,
        dispatch, onSuccess,
    ]);

    const handleClear = () => {
        setCustomer(""); setShippingGST(""); setShippingPhone(""); setBillingGST("");
        setBillingPhone(""); setShippingAddress(""); setBillingAddress(""); setRemarks("");
        setDirectPurchase(false); setRegistered(false);
        setLines([newLineItem(1)]);
    };

    // ── Fetch document masters on mount ──
    useEffect(() => {
        dispatch(fetchDocumentMasters());
        dispatch(fetchDefaultStore());
        dispatch(fetchGSTTypes());
        dispatch(fetchDefaultState());
        dispatch(fetchBaseCurrency());
    }, [dispatch]);

    // ── Prefill Document & Invoice No from default document; fetch tax types ──
    useEffect(() => {
        if (documentMasters.length === 0) return;
        const defaultDoc = documentMasters.find((d) => d.SetDefault) ?? documentMasters[0];
        setDocument(defaultDoc.DocumentName);
        const suffix = defaultDoc.Suffix ? `-${defaultDoc.Suffix}` : "";
        setInvoiceNo(`${defaultDoc.Prefix}${suffix}-${defaultDoc.StartingNo}`);
        dispatch(fetchInvoiceTaxTypes({ documentID: defaultDoc.DocumentID }));
    }, [documentMasters]);

    // ── Prefill Invoice Tax Type from API ──
    useEffect(() => {
        if (invoiceTaxTypes.length === 0) return;
        setInvoiceTaxType(invoiceTaxTypes[0].InvoiceTaxType);
    }, [invoiceTaxTypes]);

    // ── Prefill Store from defaultStore ──
    useEffect(() => {
        if (!defaultStore) return;
        setStore(String(defaultStore.StoreID));
    }, [defaultStore]);

    useEffect(() => {
        if (!defaultState) return;
        setState(defaultState.StateName);
    }, [defaultState]);

    // ── Fetch & prefill Payment Types ──
    useEffect(() => {
        dispatch(fetchPaymentTypes());
    }, [dispatch]);

    useEffect(() => {
        if (!baseCurrency) return;
        setCurrency(baseCurrency.Currency);
        setExchangeRate(String(baseCurrency.ExchRate));
    }, [baseCurrency]);

    useEffect(() => {
        if (paymentTypes.length === 0) return;
        setPaymentType(paymentTypes[0].PaymentTypeName);
    }, [paymentTypes]);

    // ── Resolve numeric IDs needed for fetchSelectedDNForRetailInvoice ──
    const resolvedInvTaxTypeID =
        invoiceTaxTypes.find((t) => t.InvoiceTaxType === invoiceTaxType)?.InvoiceTaxTypeID ?? 0;

    const resolvedGSTTypeID =
        gstTypes.find((g) => g.GSTType === gstType)?.GSTTypeID ?? 0;

    // ── Handle "Create Invoice" click inside the DN modal ──
    const handleDNSelect = useCallback(
        (dnIds: number[], invTaxTypeID: number, gstTypeID: number) => {
            dnIds.forEach((dnId) => {
                dispatch(
                    fetchSelectedDNForRetailInvoice({
                        salesOrderID: dnId,
                        invTaxTypeID,
                        GSTTypeID: gstTypeID,
                    })
                );
            });
        },
        [dispatch]
    );

    // ── Prefill line items table when selectedDNItems arrives from Redux ──
    useEffect(() => {
        if (selectedDNItems.length === 0) return;

        const mapped: SalesLineItem[] = selectedDNItems.map((item: SelectedDNItem, idx: number) => {
            const grossAmt = item.GrossAmount ?? 0;
            const taxAmt = (item.Amount ?? 0) - grossAmt;
            const cessAmt = item.CESSPer != null
                ? parseFloat(((item.CESSPer / 100) * grossAmt).toFixed(2))
                : 0;

            return {
                id: idx + 1,
                itemId: null,
                itemCode: "",
                item: item.ItemName,
                specification: item.ItemDescription ?? "",
                currentStock: "",
                quantity: String(item.Quantity),
                sRate: String(item.SalesRate),
                taxPercent: String(item.TaxPercentage),
                taxAmount: String(taxAmt.toFixed(2)),
                netAmount: String(item.Amount),
                vatPercent: String(item.VATPer ?? ""),
                cessPercent: String(item.CESSPer ?? ""),
                vatAmount: String(item.VATAmt ?? ""),
                cessAmount: String(cessAmt),
            };
        });

        setLines(mapped);
    }, [selectedDNItems]);

    // ── Document options from redux ──
    const documentOptions: ComboboxOption[] = documentMasters.map((d) => ({
        value: d.DocumentName,
        label: d.DocumentName,
    }));
    const taxTypeOptions: ComboboxOption[] = allInvoiceTaxTypes.map((t) => ({
        value: t.InvoiceTaxType,
        label: t.InvoiceTaxType,
    }));
    const paymentTypeOptions: ComboboxOption[] = paymentTypes.map((p) => ({
        value: p.PaymentTypeName,
        label: p.PaymentTypeName,
    }));
    const currencyOptions: ComboboxOption[] = currencies.length > 0
        ? currencies
            .filter((c: CurrencyItem) => c.Currency.trim() !== "")
            .map((c: CurrencyItem) => ({ value: c.Currency, label: c.Currency }))
        : baseCurrency
            ? [{ value: baseCurrency.Currency, label: baseCurrency.Currency }]
            : [];
    const gstTypeOptions: ComboboxOption[] = gstTypes.map((g) => ({
        value: g.GSTType,
        label: g.GSTType,
    }));
    const stateOptions: ComboboxOption[] = states.length > 0
        ? states.map((s) => ({ value: s.StateName, label: s.StateName }))
        : defaultState
            ? [{ value: defaultState.StateName, label: defaultState.StateName }]
            : [];
    const customerOptions: ComboboxOption[] = customers.map((c) => ({
        value: String(c.CustomerID),
        label: c.CustomerName,
    }));
    const storeOptions: ComboboxOption[] = stores.length > 0
        ? stores.map((s: StoreItem) => ({ value: String(s.StoreID), label: s.StoreName }))
        : defaultStore
            ? [{ value: String(defaultStore.StoreID), label: defaultStore.StoreName }]
            : [];

    const tableHeaders = [
        { label: "#", center: true },
        { label: "...", center: true },
        { label: "Prof #" },
        { label: "Item", icon: Package },
        { label: "Specification" },
        { label: "Current Stock" },
        { label: "Quantity", icon: BarChart3 },
        { label: "S.Rate" },
        { label: "Tax %", icon: Percent },
        { label: "Tax Amt.", icon: Receipt },
        { label: "Net Amount" },
        { label: "VAT %" },
        { label: "CESS %" },
        { label: "VAT Amt" },
        { label: "CESS Amt" },
        { label: "" },
    ];

    // ── Reset all local form state on mount ──
    useEffect(() => {
        setDocument("");
        setInvoiceNo("");
        setInvoiceDate(getToday());
        setInvoiceTaxType("");
        setPaymentType("");
        setStore("");
        setCustomer("");
        setCurrency("");
        setExchangeRate("");
        setGstType("Inclusive");
        setState("");
        setShippingGST("");
        setShippingPhone("");
        setBillingGST("");
        setBillingPhone("");
        setShippingAddress("");
        setBillingAddress("");
        setRemarks("");
        setDirectPurchase(false);
        setRegistered(false);
        setLines([newLineItem(1)]);
        setShowDNModal(false);
        dispatch(resetDeliveryNotes());
        dispatch(resetSelectedDNItems());
    }, []);

    return (
        <div>
            <div className="bg-white border border-slate-200 shadow-md overflow-hidden">

                {/* ── Page Header Bar ── */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#004687]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs font-semibold"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-white/80" />
                            <span className="text-[15px] font-bold text-white tracking-wide uppercase">Sales Invoice</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        type="button"
                        className="h-8 px-4 bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold rounded-lg border border-white/20 gap-2 transition-colors"
                    >
                        <FileText size={12} /> Sales Invoice Details
                    </Button>
                </div>

                <div className="p-5 space-y-4 bg-slate-50/30">

                    {/* ── Section 1: Document Info ── */}
                    <SectionCard title="Invoice Information" icon={FileText}>
                        {/* Row 1 */}
                        <div className="grid grid-cols-6 gap-3 mb-3">
                            <div>
                                <FieldLabel icon={FileText} label="Document" />
                                <ComboboxWithClear value={document} onClear={() => setDocument("")}>
                                    <SearchableCombobox
                                        options={documentOptions}
                                        value={document}
                                        onValueChange={(val) => {
                                            setDocument(val);
                                            const selected = documentMasters.find((d) => d.DocumentName === val);
                                            if (selected) {
                                                const suffix = selected.Suffix ? `-${selected.Suffix}` : "";
                                                setInvoiceNo(`${selected.Prefix}${suffix}-${selected.StartingNo}`);
                                            }
                                        }}
                                        placeholder={documentMastersLoading ? "Loading…" : "Document"}
                                        disabled={documentMastersLoading}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={Hash} label="Invoice No." />
                                <input
                                    value={invoiceNo}
                                    onChange={(e) => setInvoiceNo(e.target.value)}
                                    className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all font-mono font-semibold text-[#004687]"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Calendar} label="Invoice Date" />
                                <input
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Receipt} label="Invoice Tax Type" />
                                <ComboboxWithClear value={invoiceTaxType} onClear={() => setInvoiceTaxType("")}>
                                    <SearchableCombobox
                                        options={taxTypeOptions}
                                        value={invoiceTaxType}
                                        onValueChange={setInvoiceTaxType}
                                        placeholder={allInvoiceTaxTypesLoading ? "Loading…" : "Select Tax Type"}
                                        disabled={allInvoiceTaxTypesLoading}
                                        onOpen={() => dispatch(fetchAllInvoiceTaxTypes())}
                                        className="w-[260px]"
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={DollarSign} label="Payment Type" />
                                <ComboboxWithClear value={paymentType} onClear={() => setPaymentType("")}>
                                    <SearchableCombobox
                                        options={paymentTypeOptions}
                                        value={paymentType}
                                        onValueChange={setPaymentType}
                                        placeholder={paymentTypesLoading ? "Loading…" : "Select Payment Type"}
                                        searchPlaceholder="Search payment types…"
                                        disabled={paymentTypesLoading}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={Package} label="Store" />
                                <ComboboxWithClear value={store} onClear={() => setStore("")}>
                                    <SearchableCombobox
                                        options={storeOptions}
                                        value={store}
                                        onValueChange={setStore}
                                        placeholder={storesLoading ? "Loading…" : "Select Store"}
                                        searchPlaceholder="Search stores…"
                                        disabled={storesLoading}
                                        onOpen={() => dispatch(fetchStores())}
                                    />
                                </ComboboxWithClear>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-6 gap-3">
                            <div className="col-span-2">
                                <FieldLabel icon={User} label="Customer" />
                                <ComboboxWithClear value={customer} onClear={() => setCustomer("")}>
                                    <SearchableCombobox
                                        options={customerOptions}
                                        value={customer}
                                        onValueChange={setCustomer}
                                        placeholder={customersLoading ? "Loading…" : "Select Customer"}
                                        searchPlaceholder="Search customers…"
                                        disabled={customersLoading}
                                        onOpen={() => dispatch(fetchCustomers())}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={DollarSign} label="Currency" />
                                <ComboboxWithClear value={currency} onClear={() => setCurrency("")}>
                                    <SearchableCombobox
                                        options={currencyOptions}
                                        value={currency}
                                        onValueChange={setCurrency}
                                        placeholder={currenciesLoading ? "Loading…" : "Currency"}
                                        searchPlaceholder="Search currencies…"
                                        disabled={currenciesLoading}
                                        onOpen={() => dispatch(fetchCurrencies())}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={Hash} label="Exchange Rate" />
                                <input
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(e.target.value)}
                                    type="number"
                                    className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Percent} label="GST Type" />
                                <ComboboxWithClear value={gstType} onClear={() => setGstType("")}>
                                    <SearchableCombobox
                                        options={gstTypeOptions}
                                        value={gstType}
                                        onValueChange={setGstType}
                                        placeholder={gstTypesLoading ? "Loading…" : "GST Type"}
                                        disabled={gstTypesLoading}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={MapPin} label="State" />
                                <ComboboxWithClear value={state} onClear={() => setState("")}>
                                    <SearchableCombobox
                                        options={stateOptions}
                                        value={state}
                                        onValueChange={setState}
                                        placeholder={statesLoading ? "Loading…" : "Select State"}
                                        disabled={statesLoading}
                                        onOpen={() => dispatch(fetchStates())}
                                    />
                                </ComboboxWithClear>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Section 2: Shipping & Billing ── */}
                    <SectionCard title="Shipping & Billing Details" icon={MapPin}>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Shipping */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel icon={Hash} label="Shipping GST No." />
                                        <input
                                            value={shippingGST}
                                            onChange={(e) => setShippingGST(e.target.value)}
                                            placeholder="Enter Shipping GST No"
                                            className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Shipping Phone No." />
                                        <input
                                            value={shippingPhone}
                                            onChange={(e) => setShippingPhone(e.target.value)}
                                            placeholder="Enter Shipping Phone No."
                                            className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel icon={MapPin} label="Shipping Address" />
                                    <Textarea
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter Shipping Address"
                                        className="text-[13px] text-slate-700 border border-slate-200 rounded-lg resize-none h-[72px] focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:border-sky-400 bg-white placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Billing */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel icon={Hash} label="Billing GST No." />
                                        <input
                                            value={billingGST}
                                            onChange={(e) => setBillingGST(e.target.value)}
                                            placeholder="Enter Billing GST No."
                                            className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Billing Phone No." />
                                        <input
                                            value={billingPhone}
                                            onChange={(e) => setBillingPhone(e.target.value)}
                                            placeholder="Enter Billing Phone No."
                                            className="w-full h-9 px-3 text-[13px] text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel icon={MapPin} label="Billing Address" />
                                    <Textarea
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                        placeholder="Enter Billing Address"
                                        className="text-[13px] text-slate-700 border border-slate-200 rounded-lg resize-none h-[72px] focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:border-sky-400 bg-white placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Section 3: Remarks + Options ── */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                            <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                <MessageSquare size={11} className="text-[#004687]" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Remarks & Options</span>
                        </div>
                        <div className="p-4 flex items-start gap-6">
                            <div className="flex-1">
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter Remarks"
                                    className="text-[13px] text-slate-700 border border-slate-200 rounded-lg resize-none h-[72px] focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:border-sky-400 bg-white placeholder:text-slate-300 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-3 pt-1 shrink-0">
                                <Button
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                        if (!customer) {
                                            toast.warning(
                                                "Please select a customer before selecting a delivery note.",
                                                {
                                                    style: {
                                                        background: "#F54927",
                                                        color: "white",
                                                        border: "1px solid #d97706",
                                                    },
                                                }
                                            );
                                            return;
                                        }
                                        dispatch(fetchSalesOrders({ customerID: Number(customer) }));
                                        setShowDNModal(true);
                                    }}
                                    className="h-9 px-4 bg-[#6F8FAF] hover:bg-[#004687] text-white text-[13px] font-semibold rounded-lg gap-2 shadow-none transition-colors cursor-pointer"
                                >
                                    SELECT DN
                                </Button>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={directPurchase}
                                            onChange={(e) => setDirectPurchase(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 accent-[#004687]"
                                        />
                                        <span className="text-[12px] text-slate-600 font-medium">Direct Purchase</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={registered}
                                            onChange={(e) => setRegistered(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 accent-[#004687]"
                                        />
                                        <span className="text-[12px] text-slate-600 font-medium">Registered</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 4: Line Items Table ── */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                    <Package size={11} className="text-[#004687]" />
                                </div>
                                <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide">Line Items</span>
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[10px] font-bold">{lines.length}</span>
                                {selectedDNItemsLoading && (
                                    <span className="flex items-center gap-1 text-[10px] text-[#004687] animate-pulse ml-1">
                                        <RefreshCcw size={9} className="animate-spin" /> Loading DN items…
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="flex items-center gap-1 text-[11px] font-semibold text-[#004687] hover:text-[#004687] hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                                >
                                    <Settings2 size={11} /> Column Setting
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLines([newLineItem(1)])}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                >
                                    <Trash2 size={10} /> Clear All
                                </button>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", minWidth: 1200 }}>
                                <thead>
                                    <tr style={{ background: "linear-gradient(135deg, #004687 0%, #6F8FAF 100%)" }}>
                                        {tableHeaders.map((h, i) => (
                                            <th
                                                key={i}
                                                style={{
                                                    padding: "8px 8px",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: "rgba(255,255,255,0.9)",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em",
                                                    textAlign: h.center ? "center" : "left",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {h.icon ? (
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                        <h.icon size={9} style={{ opacity: 0.7 }} />
                                                        {h.label}
                                                    </span>
                                                ) : (
                                                    h.label
                                                )}
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
                                            updateLine={updateLine}
                                            removeLine={removeLine}
                                            products={products}
                                            productsLoading={productsLoading}
                                            onItemOpen={() => dispatch(fetchProducts())}
                                            onItemSelect={handleItemSelect}
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

                    {/* ── Section 5: Amount Summary ── */}
                    <div className="flex justify-end">
                        <div className="rounded-xl border border-[#004687]/20 bg-gradient-to-br from-[#004687]/5 to-[#6F8FAF]/5 shadow-sm px-6 py-4 min-w-[320px] space-y-2">

                            {/* Gross Amount */}
                            <div className="flex items-center justify-between gap-8">
                                <p className="text-[12px] font-medium text-slate-500 uppercase tracking-widest">Gross Amount</p>
                                <span className="text-slate-300 text-[12px]">:</span>
                                <p className="text-[14px] font-semibold text-slate-600 font-mono min-w-[90px] text-right">
                                    {grossAmount > 0 ? grossAmount.toFixed(2) : "0.00"}
                                </p>
                            </div>

                            {/* Total Tax */}
                            <div className="flex items-center justify-between gap-8">
                                <p className="text-[12px] font-medium text-slate-500 uppercase tracking-widest">Total Tax</p>
                                <span className="text-slate-300 text-[12px]">:</span>
                                <p className="text-[14px] font-semibold text-slate-600 font-mono min-w-[90px] text-right">
                                    {totalTax > 0 ? totalTax.toFixed(2) : "0.00"}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#004687]/15 pt-2">
                                {/* Net Amount */}
                                <div className="flex items-center justify-between gap-8">
                                    <p className="text-[13px] font-bold text-[#004687] uppercase tracking-widest">Net Amount</p>
                                    <span className="text-slate-400 text-[13px]">:</span>
                                    <p className="text-[20px] font-bold text-[#004687] font-mono min-w-[90px] text-right">
                                        {netAmount > 0 ? netAmount.toFixed(2) : "0.00"}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Info size={10} /> All required fields must be filled before submission
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
                            <RefreshCcw size={12} /> Clear
                        </Button>
                        <Button
                            size="sm"
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveSalesInvoiceLoading}
                            className="h-9 px-6 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg shadow-none gap-1.5 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saveSalesInvoiceLoading ? (
                                <><RefreshCcw size={12} className="animate-spin" /> Saving…</>
                            ) : (
                                <><Save size={12} /> Submit</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── DN Modal ── */}
            <DeliveryNoteModal
                open={showDNModal}
                onClose={() => setShowDNModal(false)}
                onSelect={handleDNSelect}
                invTaxTypeID={resolvedInvTaxTypeID}
                gstTypeID={resolvedGSTTypeID}
                deliveryNotes={deliveryNotes}
                deliveryNotesLoading={deliveryNotesLoading}
                deliveryNotesTotalRecords={deliveryNotesTotalRecords}
                deliveryNotesCurrentPage={deliveryNotesCurrentPage}
                deliveryNotesRowsPerPage={deliveryNotesRowsPerPage}
                onSearch={(startDate, endDate, searchStr) => {
                    const toApiDate = (d: string) => d.split("-").reverse().join("-");
                    dispatch(fetchDeliveryNotes({ startDate: toApiDate(startDate), endDate: toApiDate(endDate), searchStr, customerID: Number(customer) }));
                }}
            />
        </div>
    );
}
