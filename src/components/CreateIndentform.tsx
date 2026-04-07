import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
    fetchBasicItemDetails,
    fetchDocumentTypes,
    fetchItemCategories,
    fetchItemSubCategories,
    fetchItemsForIndent,
    fetchSalesOrders,
    fetchItemSpecs,
    fetchEmployees,
    fetchDepartments,
    saveIndent,
    type ItemSpec,
    type SelectedIndent,
} from "@/store/features/inventory/procurement/procurementSlice";
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
    RefreshCcw,
    ExternalLink,
    ChevronLeft,
    FileText,
    Hash,
    Calendar,
    Tag,
    Layers,
    User,
    Building2,
    GitBranch,
    MessageSquare,
    Package,
    Ruler,
    ClipboardList,
    BarChart3,
    Info,
    Save,
    ChevronsUpDown,
    Check,
    CalendarDays,

} from "lucide-react";
import { cn } from "@/lib/utils";
import { SalesOrderModal } from "@/components/SalesOrderModal";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
    id: number;
    itemId: string;
    itemCode?: string;
    item: string;
    spec: string;
    specs?: ItemSpec[];
    unit: string;
    qty: string;
    reqDate: string;
    stock: string;
    desc: string;
    hsn: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newLineItem(id: number): LineItem {
    return {
        id,
        itemId: "",
        itemCode: "",
        item: "",
        spec: "",
        specs: [],
        unit: "",
        qty: "",
        reqDate: "",
        stock: "",
        desc: "",
        hsn: ""
    };
}

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

function formatDateStr(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

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
}: SearchableComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedLabel = options.find((o) => o.value === value)?.label || value;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        "flex items-center justify-between w-full h-8 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50/60",
                        "focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/40 transition",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:border-[#6F8FAF]/60",
                        triggerClassName
                    )}
                >
                    <span className={cn("truncate", !selectedLabel && "text-slate-400")}>
                        {selectedLabel ?? placeholder}
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
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-8 text-xs"
                    />
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
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            <Icon size={10} className="text-[#6F8FAF]" />
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
                    <Icon size={11} className="text-[#004687]" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{title}</span>
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
                className={cn("w-full h-8 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/40 transition pr-7", className)}
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
// Wrapper that adds an inline clear (×) button outside the combobox trigger
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

const LineItemRow = memo(
    ({
        line,
        idx,
        updateLine,
        removeLine,
        indentItems,
        onItemSelected,
    }: {
        line: LineItem;
        idx: number;
        updateLine: (id: number, field: keyof LineItem, value: string) => void;
        removeLine: (id: number) => void;
        indentItems: { ItemID: number; ItemName: string }[];
        onItemSelected: (lineId: number, itemId: number) => void;
    }) => {
        const cellCls = "px-2 py-2";
        const inputCls = "h-7 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#004687]/30 focus:border-[#6F8FAF]/60 w-full px-2 transition";

        const itemOptions: ComboboxOption[] = indentItems.map((i) => ({
            value: i.ItemName,
            label: i.ItemName,
        }));

        // FIXED: Use SpecID as key (unique) + Spec as display value
        const specOptions: ComboboxOption[] = (line.specs ?? []).map((s) => ({
            value: s.Spec,           // what gets selected & stored
            label: s.Spec,
            key: String(s.SpecID),   // unique key for React
        }));

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

                {/* Item - unchanged */}
                <td className={cellCls}>
                    <ComboboxWithClear value={line.item} onClear={() => { /* ... */ }}>
                        <SearchableCombobox
                            options={itemOptions}
                            value={line.item}
                            onValueChange={(v) => {
                                updateLine(line.id, "item", v);
                                const selected = indentItems.find((i) => i.ItemName === v);
                                if (selected) onItemSelected(line.id, selected.ItemID);
                            }}
                            placeholder="Select Item"
                            searchPlaceholder="Search items…"
                            triggerClassName="h-7 text-[11px]"
                        />
                    </ComboboxWithClear>
                </td>

                {/* Spec - FIXED */}
                <td className={cellCls}>
                    <ComboboxWithClear
                        value={line.spec}
                        onClear={() => updateLine(line.id, "spec", "")}
                    >
                        <SearchableCombobox
                            options={specOptions}
                            value={line.spec}
                            onValueChange={(v) => updateLine(line.id, "spec", v)}
                            placeholder="Spec"
                            searchPlaceholder="Search specs…"
                            disabled={!line.item || specOptions.length === 0}
                            triggerClassName="h-7 text-[11px]"
                        />
                    </ComboboxWithClear>
                </td>

                {/* Rest of the columns remain exactly the same */}
                {/* Unit, Qty, Req. Date, Stock, Desc, HSN, Delete - unchanged */}
                <td className={cellCls}>
                    <input value={line.unit} onChange={(e) => updateLine(line.id, "unit", e.target.value)} placeholder="Unit" className={inputCls} />
                </td>

                <td className={cellCls}>
                    <input value={line.qty} onChange={(e) => updateLine(line.id, "qty", e.target.value)} placeholder="0" type="number" className={cn(inputCls, "text-center font-medium")} />
                </td>

                <td className={cellCls}>
                    <input
                        type="date"
                        value={line.reqDate}
                        onChange={(e) => updateLine(line.id, "reqDate", e.target.value)}
                        className={cn(inputCls)}
                    />
                </td>

                <td className={cellCls}>
                    <input value={line.stock} onChange={(e) => updateLine(line.id, "stock", e.target.value)} placeholder="0" className={cn(inputCls, "text-center")} />
                </td>

                <td className={cellCls}>
                    <input value={line.desc} onChange={(e) => updateLine(line.id, "desc", e.target.value)} placeholder="Description" className={inputCls} />
                </td>

                <td className={cellCls}>
                    <input value={line.hsn} onChange={(e) => updateLine(line.id, "hsn", e.target.value)} placeholder="HSN" className={inputCls} />
                </td>

                <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeLine(line.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all mx-auto opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} />
                    </button>
                </td>
            </tr>
        );
    }
);
LineItemRow.displayName = "LineItemRow";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateIndentFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    isEditMode?: boolean;
    editData?: SelectedIndent[] | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CreateIndentForm({ onClose, onSuccess, isEditMode = false,
    editData = null }: CreateIndentFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        documentTypes, itemCategories, itemSubCategories, itemSubCategoriesLoading,
        salesOrders, indentItems, salesOrdersLoading, salesOrdersError, employees, departments, saveIndentLoading
    } = useSelector((state: RootState) => state.procurement);

    const [indentDate, setIndentDate] = useState(getToday());
    const [document, setDocument] = useState(documentTypes[0]?.DocumentName ?? "");
    const [indentNo, setIndentNo] = useState(`${documentTypes[0]?.Prefix ?? "PI"}-${documentTypes[0]?.StartingNo ?? "001"}`);
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [salesOrderNo, setSalesOrderNo] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [salesOrderId, setSalesOrderId] = useState<number | null>(null);
    const [requestedBy, setRequestedBy] = useState("");
    const [department, setDepartment] = useState("");
    const [subDept, setSubDept] = useState("");
    const [remarks, setRemarks] = useState("");
    const [lines, setLines] = useState<LineItem[]>([newLineItem(1)]);
    const [salesOrderModalOpen, setSalesOrderModalOpen] = useState(false);

    const netQty = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0), 0);

    useEffect(() => {
        dispatch(fetchItemCategories({ companyId: 1, finYearId: 2024 }));
        dispatch(fetchDocumentTypes({ companyId: 1, finYearId: 2 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchSalesOrders({ rowsPerPage: 10, currentPage: 1, searchStr: "", companyId: 1, finYearId: 2024 }));
    }, [dispatch]);

    useEffect(() => {
        if (documentTypes.length > 0 && !isEditMode) {
            const d = documentTypes.find((d) => d.SetDefault) || documentTypes[0];
            setDocument(d?.DocumentName || "");
            setIndentNo(`${d?.Prefix || "PI"}-${d?.StartingNo || "001"}`);
        }
    }, [documentTypes]);

    useEffect(() => {
        if (itemCategories?.length > 0 && !category && !isEditMode) setCategory(String(itemCategories[0].CategoryID));
    }, [itemCategories, category]);

    useEffect(() => {
    if (category) {
        dispatch(fetchItemSubCategories({ 
            categoryId: Number(category), 
            companyId: 1, 
            finYearId: 2024 
        }));

        if (!isEditMode) {
            setSubCategory("");
        }
    }
}, [category, dispatch, isEditMode]); 

    useEffect(() => {
        dispatch(fetchItemsForIndent({ itemCategoryID: 0, searchStr: "", companyId: 1, finYearId: 2024 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchDepartments());
    }, [dispatch]);

    useEffect(() => {
    if (isEditMode && editData && editData.length > 0) {
      const master = editData[0];

      setIndentNo(master.IndentNo || "");
      setIndentDate(
        master.IndentDate ? master.IndentDate.split("T")[0] : getToday()
      );
      setDocument(master.DocumentName || "");
      setCategory(String(master.CategoryID || ""));
      setSubCategory(String(master.SubCategoryID || ""));
      setDepartment(master.Department || "");
      setRequestedBy(master.EmpName || "");
      setRemarks(master.Remarks || "");
      setSalesOrderId(master.SalesOrderID ?? null);
      setSalesOrderNo(master.InvoiceNo || "");
      setInvoiceNo(master.InvoiceNo || "");

      // Prefill all line items
      const prefilledLines: LineItem[] = editData.map((detail, index) => ({
        id: index + 1,
        itemId: String(detail.ItemID),
        itemCode: detail.ItemCode || undefined,
        item: detail.ItemName,
        spec: detail.Spec || "",
        specs: [], // specs will load if user re-selects the item
        unit: detail.Unit || "",
        qty: String(detail.Quantity || 0),
        reqDate: detail.RequiredDate ? detail.RequiredDate.split("T")[0] : getToday(),
        stock: "0",
        desc: detail.Description || "",
        hsn: detail.Hsn || "",
      }));

      setLines(prefilledLines.length > 0 ? prefilledLines : [newLineItem(1)]);
    }
  }, [isEditMode, editData]);

    const handleItemSelect = useCallback(async (lineId: number, itemId: number) => {
        if (!itemId) return;
        try {
            const basicDetails = await dispatch(fetchBasicItemDetails({ itemId })).unwrap();
            const specs = await dispatch(fetchItemSpecs({ itemId, companyId: 1, finYearId: 2024 })).unwrap();

            setLines((prev) => prev.map((line) =>
                line.id === lineId
                    ? {
                        ...line,
                        itemId: String(itemId),
                        itemCode: basicDetails.ItemCode || "",
                        unit: basicDetails.PurchaseUnit || "",
                        desc: basicDetails.Description || "",
                        hsn: basicDetails.Hsn || "",
                        specs,
                        spec: ""
                    }
                    : line
            ));
        } catch (err) {
            console.error("Failed to fetch item details:", err);
        }
    }, [dispatch]);

    const handleSubmit = useCallback(async () => {
        if (!document || !category || !department || !requestedBy || lines.length === 0) {
            alert("Please fill all required fields (Document, Category, Department, Requested By, and at least one line item).");
            return;
        }

        const selectedDoc = documentTypes.find((d) => d.DocumentName === document);
        const selectedEmp = employees.find((e) => e.EmpName === requestedBy);
        const selectedDept = departments.find((d) => d.DepartmentName === department);
        const selectedCat = itemCategories.find((c) => String(c.CategoryID) === category);
        const selectedSubCat = itemSubCategories.find((s) => String(s.SubCategoryID) === subCategory);

        if (!selectedDoc || !selectedEmp || !selectedDept || !selectedCat) {
            alert("Please select valid Document, Employee, Department and Category.");
            return;
        }

        const lstIndentDetails = lines.map((line) => {
            const reqDate = line.reqDate || getToday();
            return {
                DesignID: 0,
                Hsn: line.hsn || "",
                ItemCode: line.itemCode || "",
                ItemID: Number(line.itemId),
                ItemName: line.item,
                Quantity: line.qty || "0",
                RequiredDate: new Date(reqDate).toISOString(),
                SalesUnit: line.unit || "NOS",
                SalesUnitID: 4,
                SizeID: 0,
                Spec: line.spec || "",
                SpecID: 0,
                StoreID: 1,
                Unit: line.unit || "NOS",
                UnitID: 4,
                UnitMultiplier: 1,
            };
        });

        const payload = {
            CategoryID: Number(category),
            CategoryName: selectedCat.CategoryName,
            Department: department,
            DepartmentID: selectedDept.DepartmentID,
            DocumentID: selectedDoc.DocumentID,
            DocumentName: document,
            EmpName: requestedBy,
            EmployeeID: selectedEmp.EmployeeID,
            IndentDate: new Date(indentDate).toISOString(),
            IndentDateStr: formatDateStr(indentDate),
            IndentNo: indentNo,
            InvoiceNo: invoiceNo || null,
            ItemTypeID: 0,
            LstIndentDetails: lstIndentDetails,
            SubCategoryID: subCategory ? Number(subCategory) : 0,
            SubCategoryName: selectedSubCat?.SubCategoryName || "",
            TotalQuantity: netQty.toFixed(3),
            SalesOrderID: salesOrderId ?? null,
        };

        try {
            const result = await dispatch(saveIndent({ payload })).unwrap();
            const action = isEditMode ? "updated" : "saved";
            toast.success("Purchase Indent saved successfully!", {
                description: `Indent No: ${result.Server.MessageId}`,
                duration: 5000,
                position: "bottom-right",
                style: {
                    background: "green",
                    color: "white",
                },
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error("Save error:", err);
            toast.error("Failed to save Purchase Indent", {
                description: err?.message || "Please try again.",
                duration: 6000,
                style: {
                    background: "red",
                    color: "white",
                },
            });
        }
    }, [
        document, indentNo, indentDate, category, subCategory, department, requestedBy,
        salesOrderNo, lines, netQty, documentTypes, employees, departments,
        itemCategories, itemSubCategories, dispatch, onClose, onSuccess,
    ]);
    const handleClear = () => {
        const d = documentTypes.find((d) => d.SetDefault) || documentTypes[0];
        setDocument(d?.DocumentName || "PURCHASE INDENT");
        setIndentNo(`${d?.Prefix || "PI"}-${d?.StartingNo || "001"}`);
        setIndentDate(getToday());
        setCategory(""); setSubCategory(""); setSalesOrderNo(""); setInvoiceNo("");
        setRequestedBy(""); setDepartment(""); setSubDept(""); setRemarks("");
        setLines([newLineItem(1)]);
    };

    const updateLine = useCallback((id: number, field: keyof LineItem, value: string) => {
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    }, []);

    const addLine = useCallback(() => {
        setLines((ls) => [...ls, newLineItem(ls.length > 0 ? Math.max(...ls.map((l) => l.id)) + 1 : 1)]);
    }, []);

    const removeLine = useCallback((id: number) => {
        setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));
    }, []);

    // ── Option arrays ──
    const categoryOptions: ComboboxOption[] = (itemCategories ?? []).map((cat) => ({
        value: String(cat.CategoryID),
        label: cat.CategoryName,
    }));

    const subCategoryOptions: ComboboxOption[] = (itemSubCategories ?? []).map((sub) => ({
        value: String(sub.SubCategoryID),
        label: sub.SubCategoryName,
    }));

    const employeeOptions: ComboboxOption[] = (employees ?? []).map((emp) => ({
        value: emp.EmpName,
        label: emp.EmpName,
    }));

    const departmentOptions: ComboboxOption[] = (departments ?? []).map((dept) => ({
        value: dept.DepartmentName,
        label: dept.DepartmentName,
    }));

    const subDeptOptions: ComboboxOption[] = [
        { value: "qa", label: "QA" },
        { value: "packing", label: "Packing" },
        { value: "mixing", label: "Mixing" },
    ];

    return (
        <div className="px-2 py-3">
            <SalesOrderModal
                open={salesOrderModalOpen}
                onClose={() => setSalesOrderModalOpen(false)}
                onSelect={(no: string) => {
                    setSalesOrderNo(no);

                    // Resolve full sales order object so we get both ID and InvoiceNo
                    const selectedOrder = salesOrders.find((o) => o.OrderNo === no);
                    setInvoiceNo(selectedOrder?.InvoiceNo || no);   // ← this is what becomes InvoiceNo in payload
                    setSalesOrderId(selectedOrder?.SalesOrderID ?? null);
                }}
                salesOrders={salesOrders}
                loading={salesOrdersLoading}
                error={salesOrdersError}
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

                {/* ── Page Header ── */}
                <div className="p-5 space-y-1 bg-slate-50/30">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 cursor-pointer hover:text-black bg-white/10 hover:bg-white/20 px-3 py-0 rounded-lg transition-all text-xs font-semibold"
                    >
                        <ChevronLeft size={14} /> Back
                    </button>

                    {/* ── Section 1: Document Info ── */}
                    <SectionCard title="Document Information" icon={FileText}>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <FieldLabel icon={FileText} label="Document" />
                                <ClearableInput value={document} onChange={(v) => setDocument(v)} placeholder="Document type" />
                            </div>
                            <div>
                                <FieldLabel icon={Hash} label="Indent No." />
                                <input
                                    value={indentNo}
                                    onChange={(e) => setIndentNo(e.target.value)}
                                    className="w-full h-8 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/40 transition font-mono font-semibold text-[#004687]"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Calendar} label="Indent Date" />
                                <input
                                    type="date"
                                    value={indentDate}
                                    onChange={(e) => setIndentDate(e.target.value)}
                                    className="w-full h-8 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/40 transition"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Tag} label="Category" />
                                <SearchableCombobox
                                    options={categoryOptions}
                                    value={category}
                                    onValueChange={setCategory}
                                    placeholder="Select Category"
                                    searchPlaceholder="Search categories…"
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Layers} label="Sub Category" />
                                <ComboboxWithClear value={subCategory} onClear={() => setSubCategory("")}>
                                    <SearchableCombobox
                                        options={subCategoryOptions}
                                        value={subCategory}
                                        onValueChange={setSubCategory}
                                        placeholder={
                                            !category
                                                ? "Select Category First"
                                                : itemSubCategoriesLoading
                                                    ? "Loading…"
                                                    : "Select Sub Category"
                                        }
                                        searchPlaceholder="Search sub categories…"
                                        disabled={!category || itemSubCategoriesLoading}
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div className="col-span-1">
                                <FieldLabel icon={Hash} label="Sales Order No." />
                                <ClearableInput value={salesOrderNo} onChange={setSalesOrderNo} placeholder="Enter or select sales order" />
                            </div>
                            <div className="mt-5">
                                <Button
                                    size="sm"
                                    type="button"
                                    onClick={() => setSalesOrderModalOpen(true)}
                                    className="h-8 px-4 bg-[#6F8FAF] hover:bg-[#004687] text-white text-[11px] font-bold rounded-lg tracking-wider shadow-none gap-2 cursor-pointer transition-colors"
                                >
                                    <ExternalLink size={12} /> Sales Orders
                                </Button>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Section 3: Line Items ── */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                    <Package size={11} className="text-[#004687]" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Line Items</span>
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004687]/10 text-[#004687] text-[10px] font-bold">{lines.length}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLines([newLineItem(1)])}
                                className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                title="Clear all rows"
                            >
                                <Trash2 size={10} /> Clear All
                            </button>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 900 }}>
                                <colgroup>
                                    <col style={{ width: 40 }} />
                                    <col style={{ width: "18%" }} />
                                    <col style={{ width: "13%" }} />
                                    <col style={{ width: "8%" }} />
                                    <col style={{ width: "7%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "8%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: 40 }} />
                                </colgroup>
                                <thead>
                                    <tr style={{ background: "linear-gradient(135deg, #004687 0%, #6F8FAF 100%)" }}>
                                        {[
                                            { label: "SI#", icon: null, center: true },
                                            { label: "Item", icon: Package },
                                            { label: "Spec", icon: Layers },
                                            { label: "Unit", icon: Ruler },
                                            { label: "Qty", icon: BarChart3 },
                                            { label: "Req. Date", icon: Calendar },
                                            { label: "Stock", icon: Tag },
                                            { label: "Description", icon: Info },
                                            { label: "HSN", icon: Hash },
                                            { label: "", center: true },
                                        ].map((h, i) => (
                                            <th key={i} style={{
                                                padding: "8px 8px",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: "rgba(255,255,255,0.9)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                textAlign: h.center ? "center" : "left",
                                                whiteSpace: "nowrap",
                                            }}>
                                                {h.icon ? (
                                                    <span className="flex items-center gap-1">
                                                        <h.icon size={9} className="opacity-70" />
                                                        {h.label}
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
                                            updateLine={updateLine}
                                            removeLine={removeLine}
                                            indentItems={indentItems}
                                            onItemSelected={handleItemSelect}
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

                    {/* ── Section 4: Requestor Info ── */}
                    <SectionCard title="Requestor Details" icon={User}>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <FieldLabel icon={User} label="Requested By" />
                                <ComboboxWithClear value={requestedBy} onClear={() => setRequestedBy("")}>
                                    <SearchableCombobox
                                        options={employeeOptions}
                                        value={requestedBy}
                                        onValueChange={setRequestedBy}
                                        placeholder="Select Employee"
                                        searchPlaceholder="Search employees…"
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={Building2} label="Department" />
                                <ComboboxWithClear value={department} onClear={() => setDepartment("")}>
                                    <SearchableCombobox
                                        options={departmentOptions}
                                        value={department}
                                        onValueChange={setDepartment}
                                        placeholder="Select Department"
                                        searchPlaceholder="Search departments…"
                                    />
                                </ComboboxWithClear>
                            </div>
                            <div>
                                <FieldLabel icon={GitBranch} label="Sub Department" />
                                <ComboboxWithClear value={subDept} onClear={() => setSubDept("")}>
                                    <SearchableCombobox
                                        options={subDeptOptions}
                                        value={subDept}
                                        onValueChange={setSubDept}
                                        placeholder="Select Sub Dept."
                                        searchPlaceholder="Search sub departments…"
                                    />
                                </ComboboxWithClear>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Section 5: Remarks + Net Qty ── */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                <div className="w-5 h-5 rounded-md bg-[#004687]/10 flex items-center justify-center">
                                    <MessageSquare size={11} className="text-[#004687]" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Remarks</span>
                            </div>
                            <div className="p-4">
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any remarks or special instructions…"
                                    className="text-xs border border-slate-200 rounded-lg resize-none h-[72px] focus-visible:ring-1 focus-visible:ring-[#004687]/30 focus-visible:border-[#6F8FAF]/60 bg-slate-50/60"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Net Qty card */}
                            <div className="rounded-xl border border-[#004687]/20 bg-gradient-to-br from-[#004687]/5 to-[#6F8FAF]/5 shadow-sm p-4 flex-1 flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <BarChart3 size={10} className="text-[#6F8FAF]" /> Net Quantity
                                </p>
                                <p className="text-2xl font-bold text-[#004687]">
                                    {netQty > 0 ? netQty.toLocaleString() : <span className="text-slate-300">—</span>}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">across {lines.length} line{lines.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Info size={10} /> All fields marked are required before submission
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 px-5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 px-5 text-xs font-semibold border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 rounded-lg gap-1.5"
                        >
                            <RefreshCcw size={12} /> Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={saveIndentLoading}
                            className="h-8 px-6 text-xs font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg shadow-none gap-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                        >
                            {saveIndentLoading ? (
                                <>
                                    <RefreshCcw size={12} className="animate-spin" />
                                    {isEditMode ? "Updating..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    <Save size={12} /> 
                                    {isEditMode ? "Update Indent" : "Submit Indent"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}