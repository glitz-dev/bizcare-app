// Updated PurchaseIndent.tsx (uses the 3 new components)
"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchIndentOrders,
  fetchItems,
} from "@/store/features/inventory/procurement/procurementSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Plus,
  X,
  Trash,
  RefreshCcw,
  ExternalLink,
  ChevronLeft,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/common/PageHeader";
import { DataTable } from "@/common/DataTable";
import { PageFilters } from "@/common/PageFilters";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LineItem {
  id: number;
  item: string;
  spec: string;
  unit: string;
  qty: string;
  reqDate: string;
  stock: string;
  desc: string;
  hsn: string;
}

// ─── Inline Create Indent Form ───────────────────────────────────
function newLineItem(id: number): LineItem {
  return { id, item: "", spec: "", unit: "", qty: "", reqDate: "", stock: "", desc: "", hsn: "" };
}

function CreateIndentForm({ onClose }: { onClose: () => void }) {
  const [document, setDocument] = useState("PURCHASE INDENT");
  const [indentNo, setIndentNo] = useState("PI-59");
  const [indentDate, setIndentDate] = useState("27-03-2026");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [salesOrderNo, setSalesOrderNo] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [department, setDepartment] = useState("");
  const [subDept, setSubDept] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState<LineItem[]>([newLineItem(1)]);

  const updateLine = useCallback((id: number, field: keyof LineItem, value: string) => {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }, []);

  const addLine = useCallback(() => {
    setLines((ls) => [...ls, newLineItem(ls.length > 0 ? Math.max(...ls.map((l) => l.id)) + 1 : 1)]);
  }, []);

  const removeLine = useCallback((id: number) => {
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));
  }, []);

  const netQty = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0), 0);

  const handleClear = () => {
    setDocument("PURCHASE INDENT");
    setIndentNo("PI-59");
    setIndentDate("27-03-2026");
    setCategory("");
    setSubCategory("");
    setSalesOrderNo("");
    setRequestedBy("");
    setDepartment("");
    setSubDept("");
    setRemarks("");
    setLines([newLineItem(1)]);
  };

  const inp = "h-8 text-xs border-slate-300 rounded focus-visible:ring-1 focus-visible:ring-[#004687]/40 bg-white";
  const sel = "h-8 text-xs border-slate-300 rounded focus:ring-1 focus:ring-[#004687]/40 bg-white";
  const lbl = "block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1";

  return (
    <div className="px-1 py-2">
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="bg-white px-5 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-white/70 transition-colors flex gap-1 items-center cursor-pointer rounded hover:bg-[#004687]/10 px-2 py-1"
            title="Back to list"
          >
            <ChevronLeft size={18} className="text-[#004687]" />
            <h2 className="text-[#004687] font-bold text-sm tracking-widest">Back to list</h2>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="bg-white px-6 py-4 space-y-4">
          {/* Row 1 — Document · Indent No. · Indent Date · Category */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={lbl}>Document</label>
              <div className="relative">
                <Input value={document} onChange={(e) => setDocument(e.target.value)} className={cn(inp, "pr-7")} />
                {document && (
                  <button onClick={() => setDocument("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={lbl}>Indent No.</label>
              <Input value={indentNo} onChange={(e) => setIndentNo(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Indent Date</label>
              <Input value={indentDate} onChange={(e) => setIndentDate(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <div className="relative">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={sel}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw Material</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="spare">Spare Parts</SelectItem>
                  </SelectContent>
                </Select>
                {category && (
                  <button onClick={() => setCategory("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 — Sub Category · Sales Order No. · Sales Orders button */}
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className={lbl}>Sub Category</label>
              <div className="relative">
                <Select value={subCategory} onValueChange={setSubCategory}>
                  <SelectTrigger className={sel}>
                    <SelectValue placeholder="Select SubCategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="plastics">Plastics</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
                {subCategory && (
                  <button onClick={() => setSubCategory("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className={lbl}>Sales Order No.</label>
              <Input
                value={salesOrderNo}
                onChange={(e) => setSalesOrderNo(e.target.value)}
                placeholder="Sales Order No."
                className={inp}
              />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-[11px] font-bold rounded tracking-wider shadow-none gap-1.5"
              >
                <ExternalLink size={11} /> Sales Orders
              </Button>
            </div>
          </div>

          {/* Line items table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 860 }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: 36 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#004687" }}>
                    {[
                      { label: "SI#", center: true },
                      { label: "Item" },
                      { label: "Spec" },
                      { label: "Unit" },
                      { label: "Qty" },
                      { label: "Req. Date" },
                      { label: "Stock" },
                      { label: "Desc." },
                      { label: "Hsn" },
                      { label: "", center: true, isAction: true },
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "6px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.9)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          textAlign: h.center ? "center" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.isAction ? (
                          <button
                            onClick={() => setLines([newLineItem(1)])}
                            style={{
                              color: "rgba(255,255,255,0.6)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                            }}
                            title="Clear all rows"
                          >
                            <Trash size={11} />
                          </button>
                        ) : (
                          h.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr
                      key={line.id}
                      style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}
                    >
                      <td style={{ padding: "6px 8px", textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <div className="relative">
                          <Select value={line.item} onValueChange={(v) => updateLine(line.id, "item", v)}>
                            <SelectTrigger className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full">
                              <SelectValue placeholder="Select Item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="item1">Item A</SelectItem>
                              <SelectItem value="item2">Item B</SelectItem>
                              <SelectItem value="item3">Item C</SelectItem>
                            </SelectContent>
                          </Select>
                          {line.item && (
                            <button
                              onClick={() => updateLine(line.id, "item", "")}
                              className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 z-10"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <div className="relative">
                          <Select value={line.spec} onValueChange={(v) => updateLine(line.id, "spec", v)}>
                            <SelectTrigger className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full">
                              <SelectValue placeholder="Select Spec" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="s1">Spec 1</SelectItem>
                              <SelectItem value="s2">Spec 2</SelectItem>
                            </SelectContent>
                          </Select>
                          {line.spec && (
                            <button
                              onClick={() => updateLine(line.id, "spec", "")}
                              className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 z-10"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          value={line.unit}
                          onChange={(e) => updateLine(line.id, "unit", e.target.value)}
                          placeholder="Unit"
                          className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full"
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          value={line.qty}
                          onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                          placeholder="Qty"
                          type="number"
                          className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full"
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          value={line.reqDate}
                          onChange={(e) => updateLine(line.id, "reqDate", e.target.value)}
                          placeholder="dd-mm-yyyy"
                          className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full"
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          value={line.stock}
                          onChange={(e) => updateLine(line.id, "stock", e.target.value)}
                          placeholder="Stock"
                          className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full"
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          value={line.desc}
                          onChange={(e) => updateLine(line.id, "desc", e.target.value)}
                          placeholder="Description"
                          className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full"
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <div className="relative">
                          <Select value={line.hsn} onValueChange={(v) => updateLine(line.id, "hsn", v)}>
                            <SelectTrigger className="h-7 text-[11px] border-slate-200 rounded bg-slate-50 w-full">
                              <SelectValue placeholder="Hsn" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="h1">HSN-001</SelectItem>
                              <SelectItem value="h2">HSN-002</SelectItem>
                            </SelectContent>
                          </Select>
                          {line.hsn && (
                            <button
                              onClick={() => updateLine(line.id, "hsn", "")}
                              className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 z-10"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "4px 6px", textAlign: "center" }}>
                        <button
                          onClick={() => removeLine(line.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors mx-auto"
                        >
                          <Trash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addLine}
              className="w-full py-2 text-[11px] font-semibold text-[#004687] hover:bg-blue-50/50 border-t border-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={12} /> Add Row
            </button>
          </div>

          {/* Bottom fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Requested By</label>
              <div className="relative">
                <Select value={requestedBy} onValueChange={setRequestedBy}>
                  <SelectTrigger className={sel}>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arjun">Arjun Nair</SelectItem>
                    <SelectItem value="sneha">Sneha Pillai</SelectItem>
                    <SelectItem value="vinod">Vinod R</SelectItem>
                    <SelectItem value="meera">Meera S</SelectItem>
                  </SelectContent>
                </Select>
                {requestedBy && (
                  <button onClick={() => setRequestedBy("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={lbl}>Department</label>
              <div className="relative">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className={sel}>
                    <SelectValue placeholder="Select Dept." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">Production</SelectItem>
                    <SelectItem value="store">Stores</SelectItem>
                    <SelectItem value="maint">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {department && (
                  <button onClick={() => setDepartment("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={lbl}>Sub Department</label>
              <div className="relative">
                <Select value={subDept} onValueChange={setSubDept}>
                  <SelectTrigger className={sel}>
                    <SelectValue placeholder="Select Sub Dept." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="packing">Packing</SelectItem>
                    <SelectItem value="mixing">Mixing</SelectItem>
                  </SelectContent>
                </Select>
                {subDept && (
                  <button onClick={() => setSubDept("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Remarks + Net Quantity */}
          <div className="grid grid-cols-3 gap-4 items-start">
            <div className="col-span-2">
              <label className={lbl}>Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter Remarks, If Any"
                className="text-xs border-slate-300 rounded resize-none h-20 focus-visible:ring-1 focus-visible:ring-[#004687]/40"
              />
            </div>
            <div className="flex flex-col justify-end h-full pb-1">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#004687]">Net Quantity</span>
                <span className="text-sm font-bold text-slate-700">
                  {netQty > 0 ? netQty : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-5 text-xs font-semibold border-slate-300 text-slate-600 hover:bg-slate-100 rounded gap-1.5"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-8 px-5 text-xs font-semibold border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 rounded gap-1.5"
          >
            <RefreshCcw size={12} /> Clear
          </Button>
          <Button
            size="sm"
            className="h-8 px-6 text-xs font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded shadow-none gap-1.5"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────
function toApiDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("-");
  return `${y}-${m}-${d}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PurchaseIndent() {
  const dispatch = useDispatch<AppDispatch>();
  const { indentOrders, loading, error } = useSelector((state: RootState) => state.procurement);
  const { items, itemsLoading } = useSelector((state: RootState) => state.procurement);

  const [fromDate, setFromDate] = useState("2026-03-22");
  const [toDate, setToDate] = useState("2026-03-24");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [searched, setSearched] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSearch = () => {
    dispatch(
      fetchIndentOrders({
        from: fromDate,
        to: toDate,
        itemid: selectedItem ? Number(selectedItem) : 0,
        searchStr: "",
      })
    );
    setSearched(true);
  };

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchItems());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    dispatch(
      fetchIndentOrders({
        from: fromDate,
        to: toDate,
        searchStr: "",
      })
    );
  }, []);


  const columns = [
    "Actions",
    "Indent No.",
    "Indent Date",
    "Document",
    "Qty",
    "Category",
    "Sub Category",
    "Remarks",
    "Requested By",
    "Status",
    "Approved By",
    "PO Status",
    "Sales Order",
    "Created Date",
    "Created By",
  ];

  return (
    <TooltipProvider>
      <div className="bg-slate-50 font-sans">
        <PageHeader
          title="Purchase Indent"
          subtitle="Bizcare ERP · Procurement"
          icon={<Package size={16} className="text-white" />}
          createButtonLabel="Create New Purchase Indent"
          showCreateButton={!showCreateForm}
          onCreateClick={() => setShowCreateForm(true)}
        />

        {showCreateForm ? (
          <CreateIndentForm onClose={() => setShowCreateForm(false)} />
        ) : (
          <div className="p-4 space-y-3 min-w-0">
            <PageFilters
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              items={items}
              itemsLoading={itemsLoading}
              loading={loading}
              onSearch={handleSearch}
            />

            <DataTable
              columns={columns}
              indentOrders={indentOrders}
              loading={loading}
              error={error}
              searched={searched}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}