import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store"; // adjust path as needed
import {
  fetchDocumentStartWith,
  fetchPaymentTypeStartWith,
  fetchDefaultStore,
  fetchAccHeadStartWith,
  fetchAllAccHeadStartWith,
  fetchInvoiceTaxTypeDetails,
  fetchPurchaseDetailsForReturn,
  fetchSelectedPurchaseForReturn,
  fetchAllSuppliers,
  setSelectedDocument,
  setSelectedPaymentType,
  setSelectedAccHead,
  setSelectedAllAccHead,
  setSelectedInvoiceTaxType,
  setSelectedPurchaseForReturn,
  setSelectedSupplier,
  clearPurchaseForReturnList,
  clearSupplierList,
  clearSelectedPurchaseDetail,
  resetPurchaseReturn,
  savePurchaseReturn,
  clearSaveResult,
} from "../store/features/inventory/procurement/purchaseReturnSlice";
import {
  ArrowLeftRight,
  ListOrdered,
  Hash,
  CalendarDays,
  Building2,
  FileText,
  ReceiptText,
  CreditCard,
  Warehouse,
  Landmark,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  Plus,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  PackageX,
  TrendingDown,
  Percent,
  Tag,
  ShieldCheck,
  ArrowLeft,
  Search,
  Loader2,
  ChevronsUpDown,
  Check,
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

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ReturnLineItem {
  id: number;
  itemCode: string;
  item: string;
  purQty: number;
  retQty: number;
  pRate: number;
  discPercent: number;
  discAmount: number;
  taxPercent: number;
  taxAmount: number;
  netAmount: number;
  sgst: number;
  cgst: number;
}

// ─── Searchable Dropdown (Payment Type) ────────────────────────────────────────

interface SearchableDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;         // displayed value (the label string)
  options: { value: string; label: string }[];
  onSelect: (value: string, label: string) => void;
  placeholder?: string;
  loading?: boolean;
}

function SearchableDropdown({
  label,
  icon,
  value,
  options,
  onSelect,
  placeholder = "Search…",
  loading = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        <span className="text-[#004687] dark:text-blue-400">{icon}</span>
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={loading}
        className="w-full h-9 px-3 pr-8 text-[13px] text-left text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {loading ? (
          <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Loader2 size={12} className="animate-spin" /> Loading…
          </span>
        ) : (
          <span className={value ? "text-slate-700 dark:text-slate-200" : "text-slate-300 dark:text-slate-500"}>
            {value || placeholder}
          </span>
        )}
        <ChevronDown
          size={13}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-[12px] text-slate-700 dark:text-slate-200 bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-[12px] text-slate-400 dark:text-slate-500 text-center">No results</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onSelect(o.value, o.label);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`px-3 py-2 text-[13px] cursor-pointer transition-colors
                    ${value === o.label
                      ? "bg-[#004687]/10 dark:bg-blue-900/30 text-[#004687] dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Field Components ──────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
}: SelectFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        <span className="text-[#004687] dark:text-blue-400">{icon}</span>
        {label}
      </label>
      <div className="relative">
        {loading ? (
          <div className="w-full h-9 px-3 flex items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
            <Loader2 size={12} className="animate-spin" /> Loading…
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-9 px-3 pr-8 text-[13px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
              appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        {!loading && (
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
}: InputFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        <span className="text-[#004687] dark:text-blue-400">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-[13px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
          placeholder:text-slate-300 dark:placeholder:text-slate-500 read-only:bg-slate-50 dark:read-only:bg-slate-800/50 read-only:text-slate-400 dark:read-only:text-slate-500 transition-all"
      />
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Format today as DD-MM-YYYY */
const getTodayFormatted = () =>
  new Date().toLocaleDateString("en-GB").split("/").join("-");

const emptyLine = (id: number): ReturnLineItem => ({
  id,
  itemCode: "",
  item: "",
  purQty: 0,
  retQty: 0,
  pRate: 0,
  discPercent: 0,
  discAmount: 0,
  taxPercent: 0,
  taxAmount: 0,
  netAmount: 0,
  sgst: 0,
  cgst: 0,
});

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PurchaseReturnDetails({
  setShowDetails,
}: {
  setShowDetails: (val: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state ──
  const {
    documentList,
    selectedDocument,
    documentLoading: docLoading,

    paymentTypeList,
    selectedPaymentType,
    paymentTypeLoading,

    defaultStore,
    storeLoading,

    accHeadList,
    selectedAccHead,
    accHeadLoading,

    allAccHeadList,
    selectedAllAccHead,
    allAccHeadLoading,

    invoiceTaxTypeList,
    selectedInvoiceTaxType,
    invoiceTaxTypeLoading,

    purchaseForReturnList,
    selectedPurchaseForReturn,
    purchaseForReturnLoading,
    purchaseForReturnError,

    supplierList,
    selectedSupplier,
    supplierLoading,

    selectedPurchaseDetail,
    selectedPurchaseDetailLoading,
    selectedPurchaseDetailError,

    saveLoading,
    saveError,
    saveResult,
  } = useSelector((state: RootState) => state.purchaseReturn);

  // ── Fetch everything on mount ──
  useEffect(() => {
    dispatch(fetchDocumentStartWith());
    dispatch(fetchPaymentTypeStartWith());
    dispatch(fetchDefaultStore());
    dispatch(fetchAccHeadStartWith());
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  // ── Once document is selected, fetch invoice tax types ──
  useEffect(() => {
    if (selectedDocument?.DocumentID) {
      dispatch(
        fetchInvoiceTaxTypeDetails({
          documentID: selectedDocument.DocumentID,
          startWith: "",
        })
      );
    }
  }, [dispatch, selectedDocument?.DocumentID]);

  // ── Pre-fill selectedAllAccHead from the default fetched on mount ──
  useEffect(() => {
    if (selectedAccHead && !selectedAllAccHead) {
      dispatch(setSelectedAllAccHead(selectedAccHead));
    }
  }, [dispatch, selectedAccHead, selectedAllAccHead]);

  // ── When selectedPurchaseDetail loads, sync InvoiceTaxType to match the
  //    purchase being returned so the payload is always consistent ──
  useEffect(() => {
    if (!selectedPurchaseDetail) return;

    // ✅ FIX: Sync InvoiceTaxType from the loaded purchase, not from the dropdown default
    if (
      selectedPurchaseDetail.InvoiceTaxTypeID &&
      invoiceTaxTypeList.length > 0
    ) {
      const matched = invoiceTaxTypeList.find(
        (t) => t.InvoiceTaxTypeID === selectedPurchaseDetail.InvoiceTaxTypeID
      );
      if (matched) dispatch(setSelectedInvoiceTaxType(matched));
    }

    // Populate table lines
    if (!selectedPurchaseDetail.LstPurchaseDetails?.length) return;

    const mapped: ReturnLineItem[] = selectedPurchaseDetail.LstPurchaseDetails.map(
      (item, idx) => {
        const gross = item.PurchaseRate * item.Quantity;
        const discAmt = gross * (item.DiscountPercentage / 100);
        const taxableAmt = gross - discAmt;
        const taxAmt = taxableAmt * (item.TaxPercentage / 100);
        const net = taxableAmt + taxAmt;
        return {
          id: idx + 1,
          itemCode: item.ItemCode,
          item: item.ItemName,
          purQty: item.Quantity,
          retQty: item.Quantity - item.ReturnQty,
          pRate: item.PurchaseRate,
          discPercent: item.DiscountPercentage,
          discAmount: parseFloat(discAmt.toFixed(3)),
          taxPercent: item.TaxPercentage,
          taxAmount: parseFloat(taxAmt.toFixed(3)),
          netAmount: parseFloat(net.toFixed(3)),
          sgst: item.TaxPercentage / 2,
          cgst: item.TaxPercentage / 2,
        };
      }
    );

    nextId.current = mapped.length + 1;
    setLines(mapped);
  }, [selectedPurchaseDetail, invoiceTaxTypeList, dispatch]);

  // ── Derived display values ──
  const documentOptions = documentList.map((d: any) => ({
    value: String(d.DocumentID),
    label: d.DocumentName,
  }));

  const returnNo = selectedDocument
    ? `${selectedDocument.Prefix}-${selectedDocument.StartingNo}`
    : "";

  const returnDate = getTodayFormatted();

  const paymentTypeOptions = paymentTypeList.map((p: any) => ({
    value: String(p.PaymentTypeID),
    label: p.PaymentTypeName,
  }));

  const storeValue = defaultStore?.StoreName ?? "";

  const accHeadOptions = accHeadList.map((a: any) => ({
    value: String(a.HeadID),
    label: a.HeadName,
  }));

  const allAccHeadOptions = allAccHeadList.map((a: any) => ({
    value: String(a.HeadID),
    label: a.HeadName,
  }));

  const taxTypeOptions = invoiceTaxTypeList.map((t: any) => ({
    value: String(t.InvoiceTaxTypeID),
    label: t.InvoiceTaxType,
  }));

  // ── Local header fields ──
  const [roundOff, setRoundOff] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [accHeadPopoverOpen, setAccHeadPopoverOpen] = useState(false);

  // ── Payment Type popover state ──
  const [paymentTypePopoverOpen, setPaymentTypePopoverOpen] = useState(false);
  const [paymentTypeSearchStr, setPaymentTypeSearchStr] = useState("");

  // ── Supplier popover state ──
  const [supplierPopoverOpen, setSupplierPopoverOpen] = useState(false);
  const [supplierSearchStr, setSupplierSearchStr] = useState("");

  // ── Purchase No. popover state ──
  const [purchasePopoverOpen, setPurchasePopoverOpen] = useState(false);
  const [purchaseSearchStr, setPurchaseSearchStr] = useState("");
  const purchaseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch purchase list whenever selectedSupplier changes ──
  useEffect(() => {
    if (selectedSupplier !== null) {
      dispatch(clearPurchaseForReturnList());
      dispatch(
        fetchPurchaseDetailsForReturn({
          supplierID: selectedSupplier.SupplierID,
          searchStr: "",
        })
      );
    }
  }, [dispatch, selectedSupplier]);

  // ── Debounced search when user types in the purchase dropdown ──
  const handlePurchaseSearch = (value: string) => {
    setPurchaseSearchStr(value);
    if (purchaseDebounceRef.current) clearTimeout(purchaseDebounceRef.current);
    if (selectedSupplier === null) return;
    purchaseDebounceRef.current = setTimeout(() => {
      dispatch(
        fetchPurchaseDetailsForReturn({
          supplierID: selectedSupplier.SupplierID,
          searchStr: value,
        })
      );
    }, 350);
  };

  // ── Lines ──
  const [lines, setLines] = useState<ReturnLineItem[]>([emptyLine(1)]);
  const nextId = React.useRef(2);

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine(nextId.current++)]);
  };

  const removeLine = (id: number) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = useCallback(
    <K extends keyof ReturnLineItem>(id: number, key: K, val: ReturnLineItem[K]) => {
      setLines((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const updated = { ...l, [key]: val };
          const gross = updated.pRate * updated.retQty;
          const discAmt = gross * (updated.discPercent / 100);
          const taxableAmt = gross - discAmt;
          const taxAmt = taxableAmt * (updated.taxPercent / 100);
          const net = taxableAmt + taxAmt;
          return {
            ...updated,
            discAmount: parseFloat(discAmt.toFixed(3)),
            taxAmount: parseFloat(taxAmt.toFixed(3)),
            netAmount: parseFloat(net.toFixed(3)),
            sgst: updated.taxPercent / 2,
            cgst: updated.taxPercent / 2,
          };
        })
      );
    },
    []
  );

  // ── Totals ──
  const grossAmount = lines.reduce((s, l) => s + l.pRate * l.retQty, 0);
  const totalTax = lines.reduce((s, l) => s + l.taxAmount, 0);
  const preNet = grossAmount - lines.reduce((s, l) => s + l.discAmount, 0);
  const roundOffAmt = roundOff
    ? Math.round(preNet + totalTax) - (preNet + totalTax)
    : 0;
  const netAmount = preNet + totalTax + roundOffAmt;

  const fmt = (n: number, d = 3) => n.toFixed(d);

  // ── Submit / Clear ──
  const saving = saveLoading;
  const saved  = saveResult?.Success === true;

  const handleSubmit = async () => {
    // Basic validation
    if (!selectedDocument)          return alert("Please select a Document.");
    if (!selectedSupplier)          return alert("Please select a Supplier.");
    if (!selectedPurchaseForReturn) return alert("Please select a Purchase Invoice.");
    if (!selectedPaymentType)       return alert("Please select a Payment Type.");
    if (!defaultStore)              return alert("Store information is not loaded yet.");

    const totalQty  = lines.reduce((s, l) => s + l.retQty, 0);
    const totalDisc = lines.reduce((s, l) => s + l.discAmount, 0);
    const totalSGST = lines.reduce((s, l) => s + l.taxAmount * (l.sgst / (l.sgst + l.cgst || 1)), 0);
    const totalCGST = lines.reduce((s, l) => s + l.taxAmount * (l.cgst / (l.sgst + l.cgst || 1)), 0);

    const detailItems = lines.map((l): import("../store/features/inventory/procurement/purchaseReturnSlice").PurchaseReturnDetailBody => {
      // Declare originalItem FIRST before using it
      const originalItem = selectedPurchaseDetail?.LstPurchaseDetails.find(
        (d) => d.ItemCode === l.itemCode
      );

      // Recalculate GST amounts based on actual return qty
      const taxableAmt = l.pRate * l.retQty - l.discAmount;
      const sgstAmt = taxableAmt * ((originalItem?.SGSTPer ?? 0) / 100);
      const cgstAmt = taxableAmt * ((originalItem?.CGSTPer ?? 0) / 100);

      return {
        PurchaseID:          selectedPurchaseForReturn!.PurchaseID,
        PurchaseMasterID:    originalItem?.PurchaseMasterID ?? 0,
        PurchaseM:           null,
        OrderDetailID:       null,
        PurchaseOrderT:      null,
        ItemID:              originalItem?.ItemID ?? 0,
        ItemName:            l.item,
        ItemCode:            l.itemCode,
        Quantity:            l.purQty,
        ReturnQty:           l.retQty,
        PurchaseRate:        l.pRate,
        DiscountPercentage:  l.discPercent,
        DiscountAmount:      l.discAmount,
        Amount:              l.pRate * l.retQty,
        NetPRate:            originalItem?.NetPRate ?? l.pRate,
        SGSTPer:             originalItem?.SGSTPer ?? null,
        CGSTPer:             originalItem?.CGSTPer ?? null,
        IGSTPer:             originalItem?.IGSTPer ?? null,
        UTGSTPer:            originalItem?.UTGSTPer ?? null,
        CESSPer:             originalItem?.CESSPer ?? null,
        VATPer:              originalItem?.VATPer ?? null,
        SGSTAmt:             parseFloat(sgstAmt.toFixed(2)),
        CGSTAmt:             parseFloat(cgstAmt.toFixed(2)),
        IGSTAmt:             originalItem?.IGSTAmt ?? 0,
        UTGSTAmt:            originalItem?.UTGSTAmt ?? 0,
        CESSAmt:             originalItem?.CESSAmt ?? 0,
        VATAmt:              originalItem?.VATAmt ?? 0,
        TaxPercentage:       l.taxPercent,
        TaxRate:             parseFloat(String(originalItem?.TaxRate ?? 0)),
        PurchaseUnitID:      originalItem?.PurchaseUnitID ?? 0,
        ItemUnitName:        originalItem?.ItemUnitName ?? "",
        UnitMultiplier:      originalItem?.UnitMultiplier ?? 1,
        SalesRate:           originalItem?.SalesRate ?? 0,
        MRP:                 originalItem?.MRP ?? 0,
        Free:                originalItem?.Free ?? 0,
        HeadID:              originalItem?.HeadID ?? 0,
        CreditOrDebit:       originalItem?.CreditOrDebit ?? 0,
        CreditOrDebitName:   originalItem?.CreditOrDebitName ?? "",
        Returned:            false,
        StockTypeID:         originalItem?.StockTypeID ?? 0,
        StoreID:             defaultStore!.StoreID,
        OrderedQty:          originalItem?.OrderedQty ?? 0,
        BatchNo:             originalItem?.BatchNo ?? null,
        BatchName:           originalItem?.BatchName ?? null,
        ManufactureDate:     originalItem?.ManufactureDate ?? null,
        ExpiaryDate:         originalItem?.ExpiaryDate ?? null,
        GstCategoryDesc:     originalItem?.GstCategoryDesc ?? null,
        PurchaseDate:        originalItem?.PurchaseDate ?? returnDate,
      };
    });

    const returnDateISO = new Date().toISOString();

    const body: import("../store/features/inventory/procurement/purchaseReturnSlice").SavePurchaseReturnBody = {
      ReturnDateStr:           returnDate,
      ReturnDate:              returnDateISO,
      ReturnNo:                returnNo,
      DocumentID:              selectedDocument!.DocumentID,
      DocumentName:            selectedDocument!.DocumentName,
      SupplierID:              selectedSupplier!.SupplierID,
      SupplierName:            selectedSupplier!.SupplierName,
      PurchaseID:              selectedPurchaseForReturn!.PurchaseID,
      PurchaseNo:              selectedPurchaseForReturn!.InvoiceNo,
      InvoiceTypeID:           selectedPurchaseDetail?.InvoiceTypeID ?? 0,
      // Always use the tax type from the loaded purchase detail, not the dropdown
      InvoiceTaxTypeID:        selectedPurchaseDetail?.InvoiceTaxTypeID ?? selectedInvoiceTaxType?.InvoiceTaxTypeID ?? 0,
      InvoiceTaxType:          selectedPurchaseDetail?.InvoiceTaxType   ?? selectedInvoiceTaxType?.InvoiceTaxType   ?? "",
      PaymentTypeID:           selectedPaymentType!.PaymentTypeID,
      PaymentTypeName:         selectedPaymentType!.PaymentTypeName,
      StoreID:                 defaultStore!.StoreID,
      StoreName:               defaultStore!.StoreName,
      HeadID:                  selectedAccHead?.HeadID ?? 0,
      PRAcHeadID:              selectedAllAccHead?.HeadID ?? 0,
      DebitHeadName:           selectedDocument!.DebitAccount,
      TaxMasterID:             selectedDocument!.TaxMasterID,
      IsGST:                   selectedDocument!.IsGST,
      GrossAmount:             grossAmount.toFixed(3),
      TotalDiscount:           totalDisc.toFixed(3),
      BillwiseDiscountPer:     0,
      BillwiseDiscountAmt:     "0.000",
      // Consistent 3-decimal formatting for all monetary string fields
      TotalTax:                totalTax.toFixed(3),
      TotalSGSTAmt:            parseFloat(totalSGST.toFixed(2)),
      TotalCGSTAmt:            parseFloat(totalCGST.toFixed(2)),
      TotalIGSTAmt:            0,
      TotalUTGSTAmt:           0,
      TotalCESSAmt:            0,
      TotalVATAmt:             0,
      TotalVATAmount:          0,
      OtherAdditionalAmount:   "0.000",
      OtherDeductionAmount:    "0.000",
      PreNetAmount:            preNet.toFixed(3),
      NetAmount:               netAmount.toFixed(3),
      NetAmountBase:           "0.00",
      NetTotal:                netAmount.toFixed(3),
      TotalQuantity:           totalQty.toFixed(3),
      RoundOff:                roundOff,
      // ✅ FIX: Include RoundOffAmount and RoundOffAmountBase that were missing
      RoundOffAmount:          roundOffAmt,
      RoundOffAmountBase:      0,
      TaxPercHead:             "Tax %",
      TaxAmountHead:           "Tax Amt",
      SupInvoiceDate:          selectedPurchaseDetail?.SupInvoiceDate ?? null,
      ChequeDate:              null,
      Remarks:                 remarks,
      LstPurchaseReturnDetails: detailItems,
    };

    dispatch(clearSaveResult());
    dispatch(savePurchaseReturn({ body }));
  };

  const handleClear = () => {
    setSupplierPopoverOpen(false);
    setSupplierSearchStr("");
    setPurchaseSearchStr("");
    setPurchasePopoverOpen(false);
    setRoundOff(false);
    setRemarks("");
    setLines([emptyLine(nextId.current++)]);
    // Reset Redux selections
    dispatch(resetPurchaseReturn());
    // Re-fetch defaults
    dispatch(fetchDocumentStartWith());
    dispatch(fetchPaymentTypeStartWith());
    dispatch(fetchDefaultStore());
    dispatch(fetchAccHeadStartWith());
    dispatch(fetchAllSuppliers());
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="font-[system-ui,sans-serif]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">

        {/* ── Top Header Bar ── */}
        <div className="bg-[#004687] dark:bg-blue-950 px-5 py-3 flex items-center justify-between border-b dark:border-blue-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <PackageX size={14} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">PURCHASE RETURN</p>
                <p className="text-white/60 text-[10px] tracking-wider uppercase">
                  Return Invoice Management
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(false)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={13} color="#fff" />
            Back to List
          </button>
        </div>

        {/* ── Success Banner ── */}
        {saved && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
              Purchase return saved successfully — {saveResult?.Info ?? returnNo}
            </span>
          </div>
        )}

        {/* ── Error Banner ── */}
        {saveError && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <AlertCircle size={14} className="text-red-500 dark:text-red-400 shrink-0" />
            <span className="text-[12px] font-semibold text-red-700 dark:text-red-300">
              {saveError}
            </span>
            <button
              onClick={() => dispatch(clearSaveResult())}
              className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="p-5 space-y-4 bg-slate-50/30 dark:bg-slate-950">

          {/* ── Form Card ── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 border-b border-[#004687]/20 dark:border-blue-800/50">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                <FileText size={13} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-white uppercase tracking-wide">
                General
              </span>
            </div>

            <div className="p-4 pt-4 pb-2">

              {/* Row 1: Document | Return No. | Return Date | Supplier */}
              <div className="grid grid-cols-4 gap-4 mb-4">

                {/* Document — driven by Redux */}
                <SelectField
                  label="Document"
                  icon={<FileText size={11} />}
                  value={
                    selectedDocument
                      ? String(selectedDocument.DocumentID)
                      : ""
                  }
                  onChange={(id) => {
                    const found = documentList.find(
                      (d) => String(d.DocumentID) === id
                    );
                    dispatch(setSelectedDocument(found ?? null));
                  }}
                  options={documentOptions}
                  placeholder="Select Document"
                  loading={docLoading}
                />

                {/* Purchase Return No. — auto-filled from Prefix-StartingNo */}
                <InputField
                  label="Purchase Return No."
                  icon={<Hash size={11} />}
                  value={returnNo}
                  readOnly
                />

                {/* Return Date — current date, read-only */}
                <InputField
                  label="Purchase Return Date"
                  icon={<CalendarDays size={11} />}
                  value={returnDate}
                  readOnly
                />

                {/* Supplier — shadcn searchable dropdown, driven by Redux */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><Building2 size={11} /></span>
                    Supplier
                  </label>
                  <Popover open={supplierPopoverOpen} onOpenChange={setSupplierPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={supplierPopoverOpen}
                        disabled={supplierLoading}
                        className="w-full h-9 px-3 text-[13px] text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                          transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {supplierLoading ? (
                          <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            <Loader2 size={12} className="animate-spin" /> Loading…
                          </span>
                        ) : (
                          <span className={selectedSupplier ? "text-slate-700 dark:text-slate-200 truncate" : "text-slate-300 dark:text-slate-500"}>
                            {selectedSupplier?.SupplierName ?? "Select Supplier"}
                          </span>
                        )}
                        <ChevronsUpDown size={13} className="text-slate-400 dark:text-slate-500 shrink-0 ml-1" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" align="start">
                      <Command
                        filter={(value, search) =>
                          supplierList
                            .find((s) => String(s.SupplierID) === value)
                            ?.SupplierName.toLowerCase()
                            .includes(search.toLowerCase())
                            ? 1
                            : 0
                        }
                      >
                        <CommandInput
                          placeholder="Search supplier…"
                          className="h-9 text-[13px] text-slate-700 dark:text-slate-200"
                          value={supplierSearchStr}
                          onValueChange={setSupplierSearchStr}
                        />
                        <CommandList className="max-h-52">
                          <CommandEmpty className="py-3 text-center text-[12px] text-slate-400 dark:text-slate-500">
                            No suppliers found.
                          </CommandEmpty>
                          <CommandGroup>
                            {supplierList
                              .filter((s) =>
                                s.SupplierName.toLowerCase().includes(
                                  supplierSearchStr.toLowerCase()
                                )
                              )
                              .map((s) => (
                                <CommandItem
                                  key={s.SupplierID}
                                  value={String(s.SupplierID)}
                                  onSelect={() => {
                                    dispatch(setSelectedSupplier(s));
                                    dispatch(setSelectedPurchaseForReturn(null));
                                    dispatch(clearPurchaseForReturnList());
                                    setSupplierPopoverOpen(false);
                                    setSupplierSearchStr("");
                                  }}
                                  className="text-[13px] cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 aria-selected:bg-slate-50 dark:aria-selected:bg-slate-700"
                                >
                                  <Check
                                    size={13}
                                    className={`mr-2 shrink-0 ${
                                      selectedSupplier?.SupplierID === s.SupplierID
                                        ? "opacity-100 text-[#004687] dark:text-blue-400"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">{s.SupplierName}</span>
                                    {s.SupplierCode && (
                                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{s.SupplierCode}</span>
                                    )}
                                  </div>
                                  {s.GSTIN && (
                                    <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{s.GSTIN}</span>
                                  )}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row 2: Purchase No. | Invoice Tax Type | Payment Type | Store */}
              <div className="grid grid-cols-4 gap-4 mb-4">

                {/* Purchase No. — shadcn Popover + Command, server-driven */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><ReceiptText size={11} /></span>
                    Purchase No.
                  </label>
                  <Popover open={purchasePopoverOpen} onOpenChange={setPurchasePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={purchasePopoverOpen}
                        onClick={() => {
                          setPurchasePopoverOpen(true);
                          setPurchaseSearchStr("");
                          dispatch(fetchPurchaseDetailsForReturn({
                            supplierID: selectedSupplier?.SupplierID ?? 0,
                            searchStr: "",
                          }));
                        }}
                        className="w-full h-9 px-3 text-[13px] text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                          transition-all flex items-center justify-between"
                      >
                        <span className={selectedPurchaseForReturn ? "text-slate-700 dark:text-slate-200" : "text-slate-300 dark:text-slate-500"}>
                          {selectedPurchaseForReturn?.InvoiceNo ?? "Select Purchase Invoice No."}
                        </span>
                        <ChevronsUpDown size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search invoice no…"
                          className="h-9 text-[13px] text-slate-700 dark:text-slate-200"
                          value={purchaseSearchStr}
                          onValueChange={handlePurchaseSearch}
                        />
                        <CommandList className="max-h-52">
                          <CommandEmpty className="py-3 text-center text-[12px] text-slate-400 dark:text-slate-500">
                            {purchaseForReturnLoading ? "Searching…" : "No purchase invoices found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {purchaseForReturnLoading ? (
                              <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-slate-400 dark:text-slate-500">
                                <Loader2 size={12} className="animate-spin" /> Loading…
                              </div>
                            ) : (
                              purchaseForReturnList.map((p) => (
                                <CommandItem
                                  key={p.PurchaseID}
                                  value={String(p.PurchaseID)}
                                  onSelect={() => {
                                    dispatch(setSelectedPurchaseForReturn(p));
                                    dispatch(clearSelectedPurchaseDetail());
                                    dispatch(
                                      fetchSelectedPurchaseForReturn({
                                        purchaseID: p.PurchaseID,
                                      })
                                    );
                                    setPurchasePopoverOpen(false);
                                    setPurchaseSearchStr("");
                                  }}
                                  className="text-[13px] cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 aria-selected:bg-slate-50 dark:aria-selected:bg-slate-700"
                                >
                                  <Check
                                    size={13}
                                    className={`mr-2 shrink-0 ${
                                      selectedPurchaseForReturn?.PurchaseID === p.PurchaseID
                                        ? "opacity-100 text-[#004687] dark:text-blue-400"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span className="font-medium">{p.InvoiceNo}</span>
                                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">{p.InvoiceDate}</span>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Invoice Tax Type — read-only, auto-synced from selected purchase */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><ShieldCheck size={11} /></span>
                    Invoice Tax Type
                  </label>
                  <input
                    readOnly
                    value={
                      selectedPurchaseDetail?.InvoiceTaxType
                        ?? selectedInvoiceTaxType?.InvoiceTaxType
                        ?? ""
                    }
                    placeholder="Auto-filled from purchase"
                    className="w-full h-9 px-3 text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-default"
                  />
                </div>

                {/* Payment Type — shadcn searchable dropdown, driven by Redux */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><CreditCard size={11} /></span>
                    Payment Type
                  </label>
                  <Popover open={paymentTypePopoverOpen} onOpenChange={setPaymentTypePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={paymentTypePopoverOpen}
                        disabled={paymentTypeLoading}
                        className="w-full h-9 px-3 text-[13px] text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                          transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentTypeLoading ? (
                          <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            <Loader2 size={12} className="animate-spin" /> Loading…
                          </span>
                        ) : (
                          <span className={selectedPaymentType ? "text-slate-700 dark:text-slate-200 truncate" : "text-slate-300 dark:text-slate-500"}>
                            {selectedPaymentType?.PaymentTypeName ?? "Select Payment Type"}
                          </span>
                        )}
                        <ChevronsUpDown size={13} className="text-slate-400 dark:text-slate-500 shrink-0 ml-1" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" align="start">
                      <Command
                        filter={(value, search) =>
                          paymentTypeList
                            .find((p) => String(p.PaymentTypeID) === value)
                            ?.PaymentTypeName.toLowerCase()
                            .includes(search.toLowerCase())
                            ? 1
                            : 0
                        }
                      >
                        <CommandInput
                          placeholder="Search payment type..."
                          className="h-9 text-[13px] text-slate-700 dark:text-slate-200"
                          value={paymentTypeSearchStr}
                          onValueChange={setPaymentTypeSearchStr}
                        />
                        <CommandList className="max-h-52">
                          <CommandEmpty className="py-3 text-center text-[12px] text-slate-400 dark:text-slate-500">
                            No payment types found.
                          </CommandEmpty>
                          <CommandGroup>
                            {paymentTypeList
                              .filter((p) =>
                                p.PaymentTypeName.toLowerCase().includes(
                                  paymentTypeSearchStr.toLowerCase()
                                )
                              )
                              .map((p) => (
                                <CommandItem
                                  key={p.PaymentTypeID}
                                  value={String(p.PaymentTypeID)}
                                  onSelect={() => {
                                    dispatch(setSelectedPaymentType(p));
                                    setPaymentTypePopoverOpen(false);
                                    setPaymentTypeSearchStr("");
                                  }}
                                  className="text-[13px] cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 aria-selected:bg-slate-50 dark:aria-selected:bg-slate-700"
                                >
                                  <Check
                                    size={13}
                                    className={`mr-2 shrink-0 ${
                                      selectedPaymentType?.PaymentTypeID === p.PaymentTypeID
                                        ? "opacity-100 text-[#004687] dark:text-blue-400"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span className="font-medium">{p.PaymentTypeName}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Store — read-only */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><Warehouse size={11} /></span>
                    Store
                  </label>
                  {storeLoading ? (
                    <div className="w-full h-9 px-3 flex items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <Loader2 size={12} className="animate-spin" /> Loading…
                    </div>
                  ) : (
                    <input
                      readOnly
                      value={storeValue}
                      className="w-full h-9 px-3 text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-default"
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Account Head | RoundOff */}
              <div className="grid grid-cols-4 gap-4 items-end">

                {/* Account Head — shadcn searchable dropdown, fetches on open */}
                <div className="col-span-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    <span className="text-[#004687] dark:text-blue-400"><Landmark size={11} /></span>
                    Account Head
                  </label>
                  <Popover
                    open={accHeadPopoverOpen}
                    onOpenChange={(open) => {
                      setAccHeadPopoverOpen(open);
                      if (open && allAccHeadList.length === 0) {
                        dispatch(fetchAllAccHeadStartWith());
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={accHeadPopoverOpen}
                        className="w-full h-9 px-3 pr-8 text-[13px] text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                          transition-all flex items-center justify-between disabled:opacity-50"
                        disabled={allAccHeadLoading || accHeadLoading}
                      >
                        {(allAccHeadLoading || accHeadLoading) ? (
                          <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            <Loader2 size={12} className="animate-spin" /> Loading…
                          </span>
                        ) : (
                          <span className={selectedAllAccHead ? "text-slate-700 dark:text-slate-200" : "text-slate-300 dark:text-slate-500"}>
                            {selectedAllAccHead?.HeadName ?? "Select Account Head"}
                          </span>
                        )}
                        <ChevronsUpDown size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search account head…"
                          className="h-9 text-[13px] text-slate-700 dark:text-slate-200"
                        />
                        <CommandList className="max-h-52">
                          <CommandEmpty className="py-3 text-center text-[12px] text-slate-400 dark:text-slate-500">
                            No results found.
                          </CommandEmpty>
                          <CommandGroup>
                            {allAccHeadOptions.map((opt) => (
                              <CommandItem
                                key={opt.value}
                                value={opt.label}
                                onSelect={() => {
                                  const found = allAccHeadList.find(
                                    (a) => String(a.HeadID) === opt.value
                                  );
                                  dispatch(setSelectedAllAccHead(found ?? null));
                                  setAccHeadPopoverOpen(false);
                                }}
                                className="text-[13px] cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 aria-selected:bg-slate-50 dark:aria-selected:bg-slate-700"
                              >
                                <Check
                                  size={13}
                                  className={`mr-2 shrink-0 ${
                                    selectedAllAccHead?.HeadID === Number(opt.value)
                                      ? "opacity-100 text-[#004687] dark:text-blue-400"
                                      : "opacity-0"
                                  }`}
                                />
                                {opt.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2 flex items-center gap-2 pb-1.5">
                  <div
                    onClick={() => setRoundOff((p) => !p)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all
                      ${roundOff
                        ? "bg-[#004687] border-[#004687] dark:bg-blue-600 dark:border-blue-600"
                        : "bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-400"
                      }`}
                  >
                    {roundOff && (
                      <svg
                        viewBox="0 0 12 12"
                        className="w-3 h-3 text-white fill-none stroke-white stroke-[2]"
                      >
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </div>
                  <label
                    onClick={() => setRoundOff((p) => !p)}
                    className="text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer select-none font-medium"
                  >
                    Round Off
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* ── Items Table Card ── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#004687] via-[#0062b8] to-[#0080eb] dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 border-b border-[#004687]/20 dark:border-blue-800/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <ArrowLeftRight size={13} className="text-white" />
                </div>
                <span className="text-[13px] font-semibold text-white uppercase tracking-wide">
                  Return Items
                </span>
              </div>
              <button
                onClick={addLine}
                className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-white/30 cursor-pointer"
              >
                <Plus size={11} /> Add Line
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#004687]/5 dark:bg-blue-900/20 border-b border-[#004687]/10 dark:border-blue-800/30">
                    {[
                      { label: "Sl.No.", w: "w-10", icon: <Hash size={9} /> },
                      { label: "Item Code", w: "w-24", icon: <Tag size={9} /> },
                      { label: "Item", w: "min-w-[180px]", icon: <PackageX size={9} /> },
                      { label: "Pur. Qty.", w: "w-20", icon: null },
                      { label: "Ret. Qty.", w: "w-20", icon: null },
                      { label: "P.Rate", w: "w-20", icon: null },
                      { label: "Disc %", w: "w-16", icon: <Percent size={9} /> },
                      { label: "Discount", w: "w-20", icon: <TrendingDown size={9} /> },
                      { label: "Tax %", w: "w-16", icon: <Percent size={9} /> },
                      { label: "Tax Amt", w: "w-20", icon: null },
                      { label: "Net Amount", w: "w-24", icon: null },
                      { label: "SGST %", w: "w-16", icon: null },
                      { label: "CGST %", w: "w-16", icon: null },
                      { label: "", w: "w-8", icon: null },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`${col.w} px-2 py-2.5 text-left font-bold tracking-wider text-[#004687]/70 dark:text-blue-300/80 whitespace-nowrap`}
                      >
                        <span className="flex items-center gap-1">
                          {col.icon && <span className="opacity-60">{col.icon}</span>}
                          {col.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!selectedPurchaseDetailLoading && lines.map((l, idx) => (
                    <tr
                      key={l.id}
                      className={`border-b border-slate-100 dark:border-slate-800 transition-colors group ${
                        idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/40 dark:bg-slate-800/50"
                      } hover:bg-sky-50/30 dark:hover:bg-blue-900/30`}
                    >
                      {/* Sl.No */}
                      <td className="px-2 py-1.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004687]/10 dark:bg-blue-900/30 text-[10px] font-bold text-[#004687] dark:text-blue-400">
                          {idx + 1}
                        </span>
                      </td>
                      {/* Item Code */}
                      <td className="px-1 py-1.5">
                        <input
                          value={l.itemCode}
                          onChange={(e) => updateLine(l.id, "itemCode", e.target.value)}
                          className="h-7 w-full px-2 text-[12px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="Code"
                        />
                      </td>
                      {/* Item */}
                      <td className="px-1 py-1.5">
                        <input
                          value={l.item}
                          onChange={(e) => updateLine(l.id, "item", e.target.value)}
                          className="h-7 w-full px-2 text-[12px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="Select item..."
                        />
                      </td>
                      {/* Pur Qty */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          value={l.purQty || ""}
                          onChange={(e) =>
                            updateLine(l.id, "purQty", parseFloat(e.target.value) || 0)
                          }
                          className="h-7 w-full px-2 text-[12px] text-right text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="0"
                        />
                      </td>
                      {/* Ret Qty */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          value={l.retQty || ""}
                          onChange={(e) =>
                            updateLine(l.id, "retQty", parseFloat(e.target.value) || 0)
                          }
                          className="h-7 w-full px-2 text-[12px] text-right text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="0"
                        />
                      </td>
                      {/* P.Rate */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          value={l.pRate || ""}
                          onChange={(e) =>
                            updateLine(l.id, "pRate", parseFloat(e.target.value) || 0)
                          }
                          className="h-7 w-full px-2 text-[12px] text-right text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="0.00"
                        />
                      </td>
                      {/* Disc % */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          value={l.discPercent || ""}
                          onChange={(e) =>
                            updateLine(l.id, "discPercent", parseFloat(e.target.value) || 0)
                          }
                          className="h-7 w-full px-2 text-[12px] text-right text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="0"
                        />
                      </td>
                      {/* Disc Amt (computed) */}
                      <td className="px-2 py-1.5 text-right text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {fmt(l.discAmount)}
                      </td>
                      {/* Tax % */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          value={l.taxPercent || ""}
                          onChange={(e) =>
                            updateLine(l.id, "taxPercent", parseFloat(e.target.value) || 0)
                          }
                          className="h-7 w-full px-2 text-[12px] text-right text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          placeholder="0"
                        />
                      </td>
                      {/* Tax Amt (computed) */}
                      <td className="px-2 py-1.5 text-right text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {fmt(l.taxAmount, 2)}
                      </td>
                      {/* Net Amount (computed) */}
                      <td className="px-2 py-1.5 text-right text-[12px] font-semibold text-[#004687] dark:text-blue-400 tabular-nums">
                        {fmt(l.netAmount, 2)}
                      </td>
                      {/* SGST % */}
                      <td className="px-2 py-1.5 text-right text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">
                        {l.sgst.toFixed(2)}
                      </td>
                      {/* CGST % */}
                      <td className="px-2 py-1.5 text-right text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">
                        {l.cgst.toFixed(2)}
                      </td>
                      {/* Delete */}
                      <td className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => removeLine(l.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 dark:text-slate-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Loading state while fetching selected purchase detail */}
                  {selectedPurchaseDetailLoading && (
                    <tr>
                      <td colSpan={14} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                          <Loader2 size={22} className="animate-spin text-[#004687]/60 dark:text-blue-400/60" />
                          <span className="text-[12px] font-medium">Loading purchase items…</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty state */}
                  {!selectedPurchaseDetailLoading && lines.length === 0 && (
                    <tr>
                      <td colSpan={14} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                          <PackageX size={28} />
                          <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">No items added yet</span>
                          <button
                            onClick={addLine}
                            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004687]/8 dark:bg-blue-900/30 text-[#004687] dark:text-blue-400 text-[11px] font-semibold hover:bg-[#004687]/15 dark:hover:bg-blue-900/50 transition-all"
                          >
                            <Plus size={11} />
                            Add first item
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Bottom Section: Remarks + Totals ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Remarks */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="w-6 h-6 rounded-md bg-[#004687]/10 dark:bg-blue-900/30 flex items-center justify-center">
                  <MessageSquare size={13} className="text-[#004687] dark:text-blue-400" />
                </div>
                <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  Remarks
                </span>
              </div>
              <div className="p-4">
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter Remarks, If Any"
                  rows={4}
                  className="w-full px-3 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg resize-none
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                    placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-[#004687]/20 dark:border-blue-800/30 bg-gradient-to-br from-[#004687]/5 to-sky-50/40 dark:from-blue-900/20 dark:to-blue-900/10 shadow-sm p-4 flex flex-col gap-2">
              {[
                { label: "Gross Amount", value: fmt(grossAmount), icon: <ReceiptText size={12} /> },
                { label: "Total Tax", value: fmt(totalTax, 3), icon: <Percent size={12} /> },
                { label: "Pre Net Amount", value: fmt(preNet, 3), icon: <TrendingDown size={12} /> },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/50"
                >
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="text-[#004687]/60 dark:text-blue-400/60">{row.icon}</span>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-6 justify-end">
                    <span className="text-[13px] font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-28 text-right">
                      {row.value}
                    </span>
                  </div>
                </div>
              ))}

              {/* Net Amount — highlighted */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004687]/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <Landmark size={18} className="text-[#004687] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Net Amount
                    </p>
                    <p className="text-2xl font-bold text-[#004687] dark:text-blue-400 tabular-nums">
                      ₹{fmt(netAmount, 3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <SlidersHorizontal size={10} /> Purchase Return Management
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="h-9 px-5 text-[13px] font-medium border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-800 rounded-lg gap-1.5 flex items-center transition-colors"
            >
              <RefreshCw size={13} /> Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="h-9 px-6 text-[13px] font-semibold bg-[#004687] dark:bg-blue-600 hover:bg-[#003a70] dark:hover:bg-blue-700 text-white rounded-lg shadow-none gap-1.5 flex items-center transition-colors disabled:opacity-70 cursor-pointer"
            >
              {saving ? (
                <>
                  <RotateCcw size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={13} /> Submit
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}