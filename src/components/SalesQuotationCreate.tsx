import { useState } from "react";
import {
  FileText,
  Hash,
  Calendar,
  Clock,
  Tag,
  User,
  BookOpen,
  Barcode,
  Package,
  ShoppingCart,
  DollarSign,
  Percent,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CreditCard,
  Truck,
  MessageSquare,
  X,
  CheckCircle2,
} from "lucide-react";

interface LineItem {
  id: number;
  barcode: string;
  itemCode: string;
  item: string;
  quantity: number | string;
  sRate: number | string;
  netAmount: number;
}

export default function SalesQuotationCreate() {
  const [document_, setDocument_] = useState("Quotation");
  const [quotationNo] = useState("QN-14");
  const [quotationDate] = useState("12-05-2026");
  const [validTill, setValidTill] = useState("");
  const [taxType, setTaxType] = useState("");
  const [customer, setCustomer] = useState("");
  const [refNo, setRefNo] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Credit");
  const [deliveryTime, setDeliveryTime] = useState("One Working Day After Confirmation");
  const [remarks, setRemarks] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, barcode: "", itemCode: "", item: "", quantity: "", sRate: "", netAmount: 0 },
  ]);

  const addRow = () => {
    setLineItems([
      ...lineItems,
      { id: lineItems.length + 1, barcode: "", itemCode: "", item: "", quantity: "", sRate: "", netAmount: 0 },
    ]);
  };

  const removeRow = (id: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        const qty = parseFloat(String(updated.quantity)) || 0;
        const rate = parseFloat(String(updated.sRate)) || 0;
        updated.netAmount = qty * rate;
        return updated;
      })
    );
  };

  const grossAmount = lineItems.reduce((s, i) => s + i.netAmount, 0);
  const totalTax = 0;
  const billwiseDiscount = (grossAmount * discount) / 100;
  const netAmount = grossAmount + totalTax - billwiseDiscount;

  const fmt = (n: number) => n.toFixed(3);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #003a70 0%, #004687 50%, #0066cc 100%)" }}>
        <div className="text-center text-white p-12">
          <CheckCircle2 className="w-24 h-24 mx-auto mb-6 text-emerald-400 animate-bounce" />
          <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Quotation Submitted!</h2>
          <p className="text-blue-200 text-lg mb-8">QN-14 has been saved successfully.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
          >
            Create New Quotation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "linear-gradient(135deg, #002d57 0%, #003d78 40%, #004687 70%, #005ba3 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap');
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
        .glass-light { background: rgba(255,255,255,0.10); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); }
        .field-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; transition: all 0.2s; }
        .field-input:focus { outline: none; background: rgba(255,255,255,0.13); border-color: rgba(100,180,255,0.5); box-shadow: 0 0 0 3px rgba(100,180,255,0.12); }
        .field-input::placeholder { color: rgba(255,255,255,0.35); }
        .field-input option { background: #004687; color: white; }
        .table-row-hover:hover { background: rgba(255,255,255,0.06); }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%); }
      `}</style>

      {/* Top Header Bar */}
      <div className="sticky top-0 z-50" style={{ background: "rgba(0,30,60,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0066cc, #004687)" }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Sales Quotation</h1>
              <p className="text-blue-300 text-xs">Create &amp; Manage Quotations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">{quotationNo}</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm">{quotationDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Section: General Info */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0099ff44, #004687aa)" }}>
              <FileText className="w-4 h-4 text-blue-300" />
            </div>
            <h2 className="text-white font-semibold text-base tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>General Information</h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.15), transparent)" }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Document */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <BookOpen className="w-3 h-3" /> Document
              </label>
              <div className="relative">
                <select
                  value={document_}
                  onChange={(e) => setDocument_(e.target.value)}
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm appearance-none pr-8"
                >
                  <option value="Quotation">Quotation</option>
                  <option value="Proforma">Proforma</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
              </div>
            </div>

            {/* Quotation No */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <Hash className="w-3 h-3" /> Quotation No.
              </label>
              <input
                value={quotationNo}
                readOnly
                className="field-input w-full px-3 py-2.5 rounded-xl text-sm opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Quotation Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> Quotation Date
              </label>
              <input
                value={quotationDate}
                readOnly
                className="field-input w-full px-3 py-2.5 rounded-xl text-sm opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Valid Till */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <Clock className="w-3 h-3" /> Valid Till
              </label>
              <input
                type="date"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
                className="field-input w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Tax Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <Tag className="w-3 h-3" /> Tax Type
              </label>
              <div className="relative">
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm appearance-none pr-8"
                >
                  <option value="">Select Tax Type</option>
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                  <option value="None">None</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Customer & Ref Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <User className="w-3 h-3" /> Customer
              </label>
              <div className="relative">
                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Select or type customer name..."
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm pr-8"
                />
                {customer && (
                  <button onClick={() => setCustomer("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <BookOpen className="w-3 h-3" /> Reference No.
              </label>
              <input
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="Enter reference number..."
                className="field-input w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section: Line Items */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00cc8844, #004687aa)" }}>
                <ShoppingCart className="w-4 h-4 text-emerald-300" />
              </div>
              <h2 className="text-white font-semibold text-base tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>Line Items</h2>
              <span className="glass px-2.5 py-0.5 rounded-full text-blue-200 text-xs">{lineItems.length} items</span>
            </div>
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0066cc, #004687)" }}
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="shimmer">
                  <th className="text-left px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Barcode className="w-3 h-3" /> Barcode</div>
                  </th>
                  <th className="text-left px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Item Code</div>
                  </th>
                  <th className="text-left px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Package className="w-3 h-3" /> Item</div>
                  </th>
                  <th className="text-right px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">Qty</th>
                  <th className="text-right px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">S.Rate</th>
                  <th className="text-right px-4 py-3 text-blue-200 font-medium text-xs uppercase tracking-wider">Net Amt</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {lineItems.map((row, idx) => (
                  <tr key={row.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3 text-blue-300 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        value={row.barcode}
                        onChange={(e) => updateItem(row.id, "barcode", e.target.value)}
                        placeholder="Barcode"
                        className="field-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.itemCode}
                        onChange={(e) => updateItem(row.id, "itemCode", e.target.value)}
                        placeholder="Code"
                        className="field-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.item}
                        onChange={(e) => updateItem(row.id, "item", e.target.value)}
                        placeholder="Select or search item..."
                        className="field-input w-full px-2.5 py-1.5 rounded-lg text-xs min-w-[200px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => updateItem(row.id, "quantity", e.target.value)}
                        placeholder="0"
                        className="field-input w-full px-2.5 py-1.5 rounded-lg text-xs text-right max-w-[80px] ml-auto"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.sRate}
                        onChange={(e) => updateItem(row.id, "sRate", e.target.value)}
                        placeholder="0.000"
                        className="field-input w-full px-2.5 py-1.5 rounded-lg text-xs text-right max-w-[100px] ml-auto"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-medium text-xs">{fmt(row.netAmount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Terms + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Terms */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-300" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Terms &amp; Notes</h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                  <CreditCard className="w-3 h-3" /> Payment Terms
                </label>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={2}
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                  <Truck className="w-3 h-3" /> Delivery Time
                </label>
                <textarea
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  rows={2}
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-blue-200 text-xs font-medium uppercase tracking-wider">
                  <MessageSquare className="w-3 h-3" /> Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks, if any..."
                  rows={3}
                  className="field-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-5 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Amount Summary</h3>
              </div>

              <div className="space-y-3 flex-1">
                {/* Gross */}
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-blue-200 text-sm">Gross Amount</span>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 opacity-30" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <span className="text-white font-medium tabular-nums text-sm">{fmt(grossAmount)}</span>
                  </div>
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-blue-200 text-sm">Total Tax</span>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 opacity-30" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <span className="text-white font-medium tabular-nums text-sm">{fmt(totalTax)}</span>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between py-2 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-200 text-sm">Billwise Discount</span>
                    <Percent className="w-3 h-3 text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="field-input w-16 px-2 py-1 rounded-lg text-xs text-right"
                      min={0}
                      max={100}
                    />
                    <span className="text-blue-300 text-xs">%</span>
                    <div className="h-px w-8 opacity-30" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <span className="text-white font-medium tabular-nums text-sm">{fmt(billwiseDiscount)}</span>
                  </div>
                </div>

                {/* Net Amount */}
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-blue-200 text-sm">Net Amount</span>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 opacity-30" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <span className="text-white font-medium tabular-nums text-sm">{fmt(netAmount)}</span>
                  </div>
                </div>

                {/* Round Off */}
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-blue-200 text-sm">Round Off Amount</span>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 opacity-30" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <span className="text-white font-medium tabular-nums text-sm">0.000</span>
                  </div>
                </div>
              </div>

              {/* NET AMOUNT Total */}
              <div
                className="mt-4 rounded-2xl p-5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, rgba(0,102,204,0.4) 0%, rgba(0,70,135,0.6) 100%)", border: "1px solid rgba(100,180,255,0.25)" }}
              >
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-widest mb-0.5">Net Amount</p>
                  <p className="text-white text-3xl font-bold tabular-nums" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {fmt(netAmount)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0099ff, #004687)" }}>
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => {
              setCustomer(""); setRefNo(""); setValidTill(""); setTaxType(""); setDiscount(0); setRemarks("");
              setLineItems([{ id: 1, barcode: "", itemCode: "", item: "", quantity: "", sRate: "", netAmount: 0 }]);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-blue-200 border transition-all hover:bg-white/10 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={() => setSubmitted(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(135deg, #0099ff, #004687)", boxShadow: "0 4px 20px rgba(0,102,204,0.4)" }}
          >
            <Save className="w-4 h-4" />
            Submit Quotation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}