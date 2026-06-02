import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchQuotationDocuments,
  fetchAllInvoiceTaxTypes,
  fetchAllCustomers,
  fetchItemDetails,
  fetchBatchDetails,
  saveSalesQuotation,
  clearSaveState,
  type SalesQuotationDetailItem,
} from "../store/features/inventory/sales/salesQuotationSlice";
import {
  FileText,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Toast ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let _toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const colors: Record<ToastType, string> = {
          success: "bg-emerald-600 text-white",
          error: "bg-red-600 text-white",
          warning: "bg-amber-500 text-white",
        };
        const Icon = t.type === "success" ? CheckCircle2 : AlertCircle;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-[360px] text-[13px] font-medium animate-fade-in ${colors[t.type]}`}
          >
            <Icon size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: number;
  barcode: string;
  itemCode: string;
  item: string;
  itemId: number | null;
  batchId: number;
  quantity: number | string;
  sRate: number | string;
  netAmount: number;
  unitId: number | null;
  unitName: string | null;
  unitMultiplier: number;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SalesQuotationCreate({
  setShowCreateForm,
  onSaveSuccess,
}: {
  setShowCreateForm: Dispatch<SetStateAction<boolean>>;
  onSaveSuccess?: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    quotationDocuments,
    allInvoiceTaxTypes,
    customers,
    itemDetails,
    saveLoading,
    saveError,
    saveSuccess,
    savedQuotationNo,
  } = useSelector((state: RootState) => state.salesQuotation);

  // ─── Toast state ────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Item / batch dropdown state ────────────────────────────────────────
  const [itemDropdownOpenId, setItemDropdownOpenId] = useState<number | null>(null);
  const [itemSearchStr, setItemSearchStr] = useState("");
  const [selectedInvoiceTaxTypeId, setSelectedInvoiceTaxTypeId] = useState<number | null>(null);

  // ─── Header form state ───────────────────────────────────────────────────
  const [document_, setDocument_] = useState("");
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [taxMasterId, setTaxMasterId] = useState<number>(0);
  const [isGST, setIsGST] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const [currencyId, setCurrencyId] = useState<number>(1);
  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  });
  // ISO date for the payload (YYYY-MM-DD)
  const quotationDateISO = new Date().toISOString().split("T")[0];

  const [taxTypeOpen, setTaxTypeOpen] = useState(false);
  const [taxTypeSearch, setTaxTypeSearch] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [validTill, setValidTill] = useState("");
  const [taxType, setTaxType] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [refNo, setRefNo] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Credit");
  const [deliveryTime, setDeliveryTime] = useState("One Working Day After Confirmation");
  const [remarks, setRemarks] = useState("");
  const [discount, setDiscount] = useState(0);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, barcode: "", itemCode: "", item: "", itemId: null, batchId: 0, quantity: "", sRate: "", netAmount: 0, unitId: null, unitName: null, unitMultiplier: 1 },
  ]);

  // ─── Bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchQuotationDocuments());
    dispatch(fetchAllCustomers());
    return () => { dispatch(clearSaveState()); };
  }, [dispatch]);

  useEffect(() => {
    if (quotationDocuments.length === 0) return;
    const doc = quotationDocuments.find((d) => d.SetDefault) ?? quotationDocuments[0];
    setDocument_(doc.DocumentName);
    setDocumentId(doc.DocumentID);
    setQuotationNo(`${doc.Prefix}-${doc.StartingNo}`);
    setTaxMasterId(doc.TaxMasterID);
    setIsGST(doc.IsGST);
    setCurrency(doc.Currency);
    setCurrencyId(doc.CurrencyID);
    dispatch(fetchAllInvoiceTaxTypes({ taxMasterId: doc.TaxMasterID }));
  }, [quotationDocuments]);

  // ─── React to save result ───────────────────────────────────────────────
  useEffect(() => {
    if (saveSuccess && savedQuotationNo) {
      showToast("success", `Sales Quotation ${savedQuotationNo} saved successfully!`);
      setTimeout(() => {
        onSaveSuccess?.();      // ← trigger parent re-fetch first
        setShowCreateForm(false);
      }, 1500);
    }
  }, [saveSuccess, savedQuotationNo]);

  useEffect(() => {
    if (saveError) {
      showToast("error", saveError);
    }
  }, [saveError]);

  // ─── Line-item helpers ───────────────────────────────────────────────────
  const addRow = () => {
    setLineItems((prev) => [
      ...prev,
      { id: prev.length + 1, barcode: "", itemCode: "", item: "", itemId: null, batchId: 0, quantity: "", sRate: "", netAmount: 0, unitId: null, unitName: null, unitMultiplier: 1 },
    ]);
  };

  const removeRow = (id: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number | null) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value } as LineItem;
        const qty = parseFloat(String(updated.quantity)) || 0;
        const rate = parseFloat(String(updated.sRate)) || 0;
        updated.netAmount = qty * rate;
        return updated;
      })
    );
  };

  // ─── Totals ──────────────────────────────────────────────────────────────
  const grossAmount = lineItems.reduce((s, i) => s + i.netAmount, 0);
  const totalTax = 0;
  const billwiseDiscount = (grossAmount * discount) / 100;
  const netAmount = grossAmount + totalTax - billwiseDiscount;
  const totalQty = lineItems.reduce((s, i) => s + (parseFloat(String(i.quantity)) || 0), 0);

  const fmt = (n: number) => n.toFixed(3);

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    // ── Validation: zero quantity or zero net amount ─────────────────────
    const hasZeroQty = lineItems.some((li) => (parseFloat(String(li.quantity)) || 0) === 0);
    const hasZeroAmount = lineItems.some((li) => li.netAmount === 0);

    if (hasZeroQty || hasZeroAmount) {
      showToast("warning", "Net amount and quantity should not be zero.");
      return;
    }

    if (!customerId) {
      showToast("warning", "Please select a customer.");
      return;
    }

    if (!documentId) {
      showToast("warning", "Please select a document.");
      return;
    }

    const taxTypeId = selectedInvoiceTaxTypeId ?? allInvoiceTaxTypes[0]?.InvoiceTaxTypeID ?? 0;
    const taxTypeName = (taxType || allInvoiceTaxTypes[0]?.InvoiceTaxType) ?? "";

    // ── Build LstSalesQuotationDetails ───────────────────────────────────
    const LstSalesQuotationDetails: SalesQuotationDetailItem[] = lineItems
      .filter((li) => li.item && li.itemId)
      .map((li) => ({
        ItemID: li.itemId!,
        ItemCode: li.itemCode || null,
        ItemName: li.item,
        ItemDescription: null,
        BatchID: li.batchId,
        BatchNo: null,
        Barcode: li.barcode || null,
        Quantity: String(li.quantity),
        Rate: String(li.sRate),
        GrossAmount: fmt(li.netAmount),
        DiscountPer: "0",
        DiscountAmt: "0",
        NetAmount: fmt(li.netAmount),
        TaxAmount: "0",
        TotalAmount: fmt(li.netAmount),
        UnitMultiplier: li.unitMultiplier,
        UnitID: li.unitId ?? undefined,
        UnitName: li.unitName ?? null,
      }));

    dispatch(
      saveSalesQuotation({
        payload: {
          QuotationDateStr: quotationDateISO,
          QuotationDate: quotationDateISO,
          QuotationNo: quotationNo,
          DocumentID: documentId,
          DocumentName: document_,
          CustomerID: customerId,
          CustomerName: customer,
          InvoiceTaxType: taxTypeName,
          InvoiceTaxTypeID: taxTypeId,
          TaxMasterID: taxMasterId,
          IsGST: isGST,
          Currency: currency,
          CurrencyID: currencyId,
          ExchRate: 1,
          GrossAmount: fmt(grossAmount),
          TotalTax: fmt(totalTax),
          BillwiseDiscountPer: discount,
          BillwiseDiscountAmt: fmt(billwiseDiscount),
          NetAmount: fmt(netAmount),
          NetTotal: fmt(netAmount),
          TotalQuantity: fmt(totalQty),
          TaxPercHead: "",
          TaxAmountHead: "",
          PreNetAmount: fmt(grossAmount),
          ReferenceNo: refNo || null,
          Validity: validTill || null,
          PaymentTerms: paymentTerms || null,
          DeliveryTime: deliveryTime || null,
          Remarks: remarks || null,
          LstSalesQuotationDetails,
        },
      })
    );
  };

  // ─── Clear form ──────────────────────────────────────────────────────────
  const handleClear = () => {
    setCustomer(""); setCustomerId(null);
    setRefNo(""); setValidTill(""); setTaxType(""); setSelectedInvoiceTaxTypeId(null);
    setDiscount(0); setRemarks(""); setPaymentTerms("Credit");
    setDeliveryTime("One Working Day After Confirmation");
    setLineItems([{ id: 1, barcode: "", itemCode: "", item: "", itemId: null, batchId: 0, quantity: "", sRate: "", netAmount: 0, unitId: null, unitName: null, unitMultiplier: 1 }]);
    dispatch(clearSaveState());
  };

  // ─── Style constants ─────────────────────────────────────────────────────
  const fieldInputCls = "w-full h-9 px-3 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 transition-all";
  const fieldInputReadOnlyCls = "w-full h-9 px-3 text-[13px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed";
  const selectCls = "w-full h-9 px-3 pr-8 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 appearance-none transition-all";
  const labelCls = "block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5";
  const sectionCls = "border border-slate-200 rounded-xl bg-white shadow-sm h-full";
  const sectionHeaderCls = "px-5 py-3.5 bg-white border-b border-slate-100 flex items-center gap-2";
  const sectionBodyCls = "px-5 pt-5 pb-5";

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Page Header ── */}
      <div className="bg-[#004687] text-white flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <FileText size={16} />
          <div>
            <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Sales</p>
            <h1 className="text-[15px] font-semibold leading-tight">Create Sales Quotation</h1>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft size={13} color="#fff" />
          Back to List
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 max-w-[1400px] mx-auto space-y-4">

        {/* ── GENERAL INFORMATION ── */}
        <div className={sectionCls}>
          <div className={sectionHeaderCls}>
            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">General Information</span>
          </div>
          <div className={sectionBodyCls}>
            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Document</label>
                <div className="relative">
                  <select
                    value={document_}
                    onChange={(e) => {
                      const doc = quotationDocuments.find((d) => d.DocumentName === e.target.value);
                      if (doc) {
                        setDocument_(doc.DocumentName);
                        setDocumentId(doc.DocumentID);
                        setQuotationNo(`${doc.Prefix}-${doc.StartingNo}`);
                        setTaxMasterId(doc.TaxMasterID);
                        setIsGST(doc.IsGST);
                        setCurrency(doc.Currency);
                        setCurrencyId(doc.CurrencyID);
                        dispatch(fetchAllInvoiceTaxTypes({ taxMasterId: doc.TaxMasterID }));
                      }
                    }}
                    className={selectCls}
                  >
                    {quotationDocuments.map((doc) => (
                      <option key={doc.DocumentID} value={doc.DocumentName}>
                        {doc.DocumentName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Quotation No.</label>
                <input value={quotationNo} readOnly className={fieldInputReadOnlyCls} />
              </div>
              <div>
                <label className={labelCls}>Quotation Date</label>
                <input value={quotationDate} readOnly className={fieldInputReadOnlyCls} />
              </div>
              <div>
                <label className={labelCls}>Valid Till</label>
                <input
                  type="date"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  className={fieldInputCls}
                />
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Tax Type */}
              <div>
                <label className={labelCls}>Tax Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTaxTypeOpen((o) => !o)}
                    className={selectCls + " flex items-center justify-between text-left"}
                  >
                    <span className={taxType ? "text-slate-700" : "text-slate-300"}>
                      {taxType || "Select Tax Type"}
                    </span>
                    <ChevronDown size={13} className="text-slate-400 shrink-0" />
                  </button>
                  {taxTypeOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          autoFocus
                          value={taxTypeSearch}
                          onChange={(e) => setTaxTypeSearch(e.target.value)}
                          placeholder="Search..."
                          className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {allInvoiceTaxTypes
                          .filter((t) => t.InvoiceTaxType.toLowerCase().includes(taxTypeSearch.toLowerCase()))
                          .map((t) => (
                            <li
                              key={t.InvoiceTaxTypeID}
                              onClick={() => {
                                setTaxType(t.InvoiceTaxType);
                                setSelectedInvoiceTaxTypeId(t.InvoiceTaxTypeID);
                                setTaxTypeOpen(false);
                                setTaxTypeSearch("");
                              }}
                              className="px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50 cursor-pointer"
                            >
                              {t.InvoiceTaxType}
                            </li>
                          ))}
                        {allInvoiceTaxTypes.filter((t) =>
                          t.InvoiceTaxType.toLowerCase().includes(taxTypeSearch.toLowerCase())
                        ).length === 0 && (
                            <li className="px-3 py-2 text-[12px] text-slate-400">No results</li>
                          )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="md:col-span-2">
                <label className={labelCls}>Customer</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCustomerOpen((o) => !o)}
                    className={selectCls + " flex items-center justify-between text-left"}
                  >
                    <span className={customer ? "text-slate-700" : "text-slate-300"}>
                      {customer || "Select customer..."}
                    </span>
                    <ChevronDown size={13} className="text-slate-400 shrink-0" />
                  </button>
                  {customer && (
                    <button
                      onClick={() => { setCustomer(""); setCustomerId(null); }}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                  {customerOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          autoFocus
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Search..."
                          className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {customers
                          .filter((c) => c.CustomerName.toLowerCase().includes(customerSearch.toLowerCase()))
                          .map((c) => (
                            <li
                              key={c.CustomerID}
                              onClick={() => {
                                setCustomer(c.CustomerName);
                                setCustomerId(c.CustomerID);
                                setCustomerOpen(false);
                                setCustomerSearch("");
                              }}
                              className="px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50 cursor-pointer"
                            >
                              {c.CustomerName}
                            </li>
                          ))}
                        {customers.filter((c) =>
                          c.CustomerName.toLowerCase().includes(customerSearch.toLowerCase())
                        ).length === 0 && (
                            <li className="px-3 py-2 text-[12px] text-slate-400">No results</li>
                          )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference No */}
              <div className="md:col-span-2">
                <label className={labelCls}>Reference No.</label>
                <input
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="Enter reference number..."
                  className={fieldInputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── LINE ITEMS ── */}
        <div className={sectionCls}>
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
            <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">Line Items</span>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-[#004687] text-white hover:bg-[#003a73] rounded-lg transition-all"
            >
              <Plus size={13} />
              Add Row
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="rounded-lg border border-slate-200">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#004687] text-white">
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px] w-10">#</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px]">Barcode</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px]">Item Code</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px]">
                      Item <span className="text-red-300 ml-0.5">*</span>
                    </th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px] text-right">
                      Qty <span className="text-red-300 ml-0.5">*</span>
                    </th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px] text-right">
                      S.Rate <span className="text-red-300 ml-0.5">*</span>
                    </th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px] text-right">Net Amt</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap tracking-wide text-[11px] w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((row, idx) => (
                    <tr key={row.id} className="border-t border-slate-100 hover:bg-sky-50/30 transition-colors">
                      <td className="px-3 py-1 text-slate-500 font-medium text-center">{idx + 1}</td>
                      <td className="px-1 py-1 min-w-[100px]">
                        <input
                          value={row.barcode}
                          onChange={(e) => updateItem(row.id, "barcode", e.target.value)}
                          placeholder="Barcode"
                          className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                      </td>
                      <td className="px-1 py-1 min-w-[100px]">
                        <input
                          value={row.itemCode}
                          readOnly
                          placeholder="Code"
                          className="w-full h-7 px-2 border border-slate-100 rounded text-[12px] bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                      </td>
                      {/* Item search */}
                      <td className="px-1 py-1 min-w-[200px] relative">
                        <input
                          value={itemDropdownOpenId === row.id ? itemSearchStr : row.item}
                          onChange={(e) => {
                            setItemSearchStr(e.target.value);
                            dispatch(fetchItemDetails({ searchStr: e.target.value }));
                          }}
                          onFocus={() => {
                            setItemDropdownOpenId(row.id);
                            setItemSearchStr(row.item);
                            dispatch(fetchItemDetails({ searchStr: row.item }));
                          }}
                          onBlur={() => setTimeout(() => setItemDropdownOpenId(null), 150)}
                          placeholder="Select or search item..."
                          className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                        {itemDropdownOpenId === row.id && itemDetails.length > 0 && (
                          <div className="absolute left-1 right-1 top-full mt-0.5 z-50 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {itemDetails
                              .filter(
                                (it) =>
                                  it.ItemName.toLowerCase().includes(itemSearchStr.toLowerCase()) ||
                                  (it.ItemCode ?? "").toLowerCase().includes(itemSearchStr.toLowerCase())
                              )
                              .map((it) => (
                                <div
                                  key={it.ItemID}
                                  onMouseDown={async () => {
                                    const taxTypeId = selectedInvoiceTaxTypeId ?? allInvoiceTaxTypes[0]?.InvoiceTaxTypeID ?? 0;
                                    updateItem(row.id, "item", it.ItemName);
                                    updateItem(row.id, "itemCode", it.ItemCode ?? "");
                                    updateItem(row.id, "itemId", it.ItemID);
                                    setItemDropdownOpenId(null);
                                    setItemSearchStr("");
                                    const result = await dispatch(
                                      fetchBatchDetails({ invoiceTaxTypeId: taxTypeId, itemCode: it.ItemCode ?? "", itemId: it.ItemID })
                                    );
                                    if (fetchBatchDetails.fulfilled.match(result) && result.payload.length > 0) {
                                      const batch = result.payload[0];
                                      setLineItems((prev) =>
                                        prev.map((li) => {
                                          if (li.id !== row.id) return li;
                                          const qty = parseFloat(String(li.quantity)) || 0;
                                          const rate = batch.SalesRate;
                                          return {
                                            ...li,
                                            itemCode: it.ItemCode ?? "",
                                            item: it.ItemName,
                                            itemId: it.ItemID,
                                            batchId: batch.BatchID,
                                            sRate: rate,
                                            netAmount: qty * rate,
                                            unitId: batch.SalesUnitID,
                                            unitName: batch.SaleUnit,
                                            unitMultiplier: batch.UnitMultiplier,
                                          };
                                        })
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50 cursor-pointer flex flex-col"
                                >
                                  <span className="font-medium">{it.ItemName}</span>
                                  {it.ItemCode && <span className="text-[11px] text-slate-400">{it.ItemCode}</span>}
                                </div>
                              ))}
                            {itemDetails.filter(
                              (it) =>
                                it.ItemName.toLowerCase().includes(itemSearchStr.toLowerCase()) ||
                                (it.ItemCode ?? "").toLowerCase().includes(itemSearchStr.toLowerCase())
                            ).length === 0 && (
                                <div className="px-3 py-2 text-[12px] text-slate-400">No results</div>
                              )}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 min-w-[80px]">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateItem(row.id, "quantity", e.target.value)}
                          placeholder="0"
                          className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                      </td>
                      <td className="px-1 py-1 min-w-[100px]">
                        <input
                          type="number"
                          value={row.sRate}
                          onChange={(e) => updateItem(row.id, "sRate", e.target.value)}
                          placeholder="0.000"
                          className="w-full h-7 px-2 border border-slate-200 rounded text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                        />
                      </td>
                      <td className="px-1 py-1 min-w-[90px]">
                        <div className="w-full h-7 px-2 border border-slate-100 rounded text-[12px] text-right bg-slate-50 text-slate-500 flex items-center justify-end tabular-nums">
                          {fmt(row.netAmount)}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors mx-auto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── TERMS & SUMMARY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Left: Terms & Notes */}
          <div className={`lg:col-span-2 ${sectionCls}`}>
            <div className={sectionHeaderCls}>
              <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">Terms &amp; Notes</span>
            </div>
            <div className={sectionBodyCls + " space-y-4"}>
              <div>
                <label className={labelCls}>Payment Terms</label>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-none transition-all"
                />
              </div>
              <div>
                <label className={labelCls}>Delivery Time</label>
                <textarea
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-none transition-all"
                />
              </div>
              <div>
                <label className={labelCls}>Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks, if any..."
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-slate-300 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right: Amount Summary */}
          <div className={`lg:col-span-3 ${sectionCls}`}>
            <div className={sectionHeaderCls}>
              <span className="text-[13px] font-semibold text-[#004687] tracking-wide uppercase">Amount Summary</span>
            </div>
            <div className={sectionBodyCls + " space-y-2"}>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Gross Amount</span>
                <span className="text-[13px] font-medium text-slate-700 tabular-nums">{fmt(grossAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Total Tax</span>
                <span className="text-[13px] font-medium text-slate-700 tabular-nums">{fmt(totalTax)}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Billwise Discount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-14 h-7 px-2 text-[12px] text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                    min={0}
                    max={100}
                  />
                  <span className="text-[12px] text-slate-400">%</span>
                  <span className="text-[13px] font-medium text-slate-700 tabular-nums w-20 text-right">{fmt(billwiseDiscount)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Net Amount</span>
                <span className="text-[13px] font-medium text-slate-700 tabular-nums">{fmt(netAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Round Off Amount</span>
                <span className="text-[13px] font-medium text-slate-700 tabular-nums">0.000</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#004687] mt-3">
                <span className="text-[13px] font-semibold text-white uppercase tracking-wide">Net Amount</span>
                <span className="text-[18px] font-bold text-white tabular-nums">{fmt(netAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <button
            onClick={handleClear}
            disabled={saveLoading}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all disabled:opacity-50"
          >
            <RotateCcw size={13} />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold bg-[#004687] text-white hover:bg-[#003a73] rounded-lg shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {saveLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={13} />
                Submit
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
