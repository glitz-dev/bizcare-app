"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Package,
    Eye,
    RefreshCw,
    Plus,
    Save,
    Search,
    CalendarDays,
    Layers,
    Tag,
    FolderOpen,
    Warehouse,
    BoxesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toaster } from "sonner";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type OpeningStockRow = {
    id: number;
    itemCode: string;
    item: string;
    spec: string;
    design: string;
    size: string;
    store: string;
    unit: string;
    openingStock: number;
    purchaseRate: number | null;
    salesRate: number | null;
};

// ─── Mock data — replace with real Redux state ────────────────────────────────

const MOCK_ROWS: OpeningStockRow[] = [
    { id: 1,  itemCode: "CTSPH",  item: "Cashew 1",  spec: "",        design: "",  size: "",  store: "XXXX", unit: "KG",  openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 2,  itemCode: "CTSGE",  item: "Cashew 2",  spec: "",        design: "",  size: "",  store: "XXXX", unit: "KG",  openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 3,  itemCode: "LABAGE", item: "Cashew 3",  spec: "A-Grade", design: "",  size: "",  store: "XXXX", unit: "KG",  openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 4,  itemCode: "RUBSBL", item: "Cashew 4",  spec: "",        design: "",  size: "L", store: "XXXX", unit: "KG",  openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 5,  itemCode: "COTTR",  item: "Cashew 5",  spec: "",        design: "",  size: "M", store: "XXXX", unit: "KG",  openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 6,  itemCode: "COMP1",  item: "COMP1",     spec: "",        design: "V1",size: "",  store: "XXXX", unit: "NOS", openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 7,  itemCode: "COMP2",  item: "COMP2",     spec: "",        design: "V2",size: "",  store: "XXXX", unit: "NOS", openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 8,  itemCode: "IT567",  item: "ITEM567",   spec: "",        design: "",  size: "S", store: "XXXX", unit: "PCS", openingStock: 0, purchaseRate: null, salesRate: null },
    { id: 9,  itemCode: "I6898",  item: "ITEM6898",  spec: "",        design: "",  size: "",  store: "XXXX", unit: "PCS", openingStock: 0, purchaseRate: null, salesRate: null },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const OpeningStock = () => {
    const today = new Date().toISOString().split("T")[0];

    const [date, setDate] = useState(today);
    const [itemType, setItemType] = useState("");
    const [itemCategory, setItemCategory] = useState("");
    const [itemGroup, setItemGroup] = useState("");
    const [item, setItem] = useState("");
    const [store, setStore] = useState("XXXX");

    const [tableVisible, setTableVisible] = useState(false);
    const [rows, setRows] = useState<OpeningStockRow[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleShow = useCallback(async () => {
        setLoading(true);
        // TODO: replace with real dispatch
        // await dispatch(fetchOpeningStock({ date, itemType, itemCategory, itemGroup, item, store })).unwrap();
        await new Promise((r) => setTimeout(r, 400)); // simulate network
        setRows(MOCK_ROWS.map((r) => ({ ...r })));
        setTableVisible(true);
        setLoading(false);
    }, [date, itemType, itemCategory, itemGroup, item, store]);

    const handleReset = useCallback(() => {
        setDate(today);
        setItemType("");
        setItemCategory("");
        setItemGroup("");
        setItem("");
        setStore("XXXX");
        setTableVisible(false);
        setRows([]);
    }, [today]);

    const handleCellChange = useCallback(
        (id: number, field: keyof OpeningStockRow, value: string) => {
            setRows((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, [field]: value === "" ? null : parseFloat(value) } : r
                )
            );
        },
        []
    );

    const handleSave = useCallback(() => {
        // TODO: dispatch saveOpeningStock(rows)
        toast.success("Opening stock saved successfully.");
    }, [rows]);

    // ── Format date for display ───────────────────────────────────────────────
    const formatDisplay = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${d}-${m}-${y}`;
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <Toaster richColors position="top-right" />

            {/* Page Header */}
            <div className="bg-[#004687] px-6 py-3.5 flex items-center justify-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <Package size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-white uppercase tracking-widest leading-tight">
                            Opening Stock
                        </p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                            Inventory — Stock Management
                        </p>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-slate-50 p-6 space-y-6">

                {/* Filter Card */}
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">

                    {/* Row 1 */}
                    <div className="flex flex-wrap gap-4 items-end mb-4">

                        {/* Date */}
                        <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <CalendarDays size={12} className="text-slate-400" />
                                Date
                            </Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-9 text-[12px] border-slate-200"
                            />
                        </div>

                        {/* Item Type */}
                        <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Layers size={12} className="text-slate-400" />
                                Item Type
                            </Label>
                            <Select value={itemType} onValueChange={setItemType}>
                                <SelectTrigger className="h-9 text-[12px] border-slate-200 w-full">
                                    <SelectValue placeholder="Select Item Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="raw" className="text-[12px]">Raw Material</SelectItem>
                                    <SelectItem value="finished" className="text-[12px]">Finished Goods</SelectItem>
                                    <SelectItem value="wip" className="text-[12px]">WIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Item Category */}
                        <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Tag size={12} className="text-slate-400" />
                                Item Category
                            </Label>
                            <Select value={itemCategory} onValueChange={setItemCategory}>
                                <SelectTrigger className="h-9 text-[12px] border-slate-200 w-full">
                                    <SelectValue placeholder="Select Item Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashew" className="text-[12px]">Cashew</SelectItem>
                                    <SelectItem value="composite" className="text-[12px]">Composite</SelectItem>
                                    <SelectItem value="electronics" className="text-[12px]">Electronics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Item Group */}
                        <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <FolderOpen size={12} className="text-slate-400" />
                                Item Group
                            </Label>
                            <Select value={itemGroup} onValueChange={setItemGroup}>
                                <SelectTrigger className="h-9 text-[12px] border-slate-200 w-full">
                                    <SelectValue placeholder="Select Item Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="a" className="text-[12px]">Group A</SelectItem>
                                    <SelectItem value="b" className="text-[12px]">Group B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Store */}
                        <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Warehouse size={12} className="text-slate-400" />
                                Store
                            </Label>
                            <Select value={store} onValueChange={setStore}>
                                <SelectTrigger className="h-9 text-[12px] border-slate-200 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="XXXX" className="text-[12px]">XXXX</SelectItem>
                                    <SelectItem value="main" className="text-[12px]">Main Store</SelectItem>
                                    <SelectItem value="sub" className="text-[12px]">Sub Store</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1.5 min-w-[280px] w-[340px]">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <BoxesIcon size={12} className="text-slate-400" />
                                Item
                            </Label>
                            <Select value={item} onValueChange={setItem}>
                                <SelectTrigger className="h-9 text-[12px] border-slate-200 w-full">
                                    <SelectValue placeholder="Select Item" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashew1" className="text-[12px]">Cashew 1</SelectItem>
                                    <SelectItem value="cashew2" className="text-[12px]">Cashew 2</SelectItem>
                                    <SelectItem value="cashew3" className="text-[12px]">Cashew 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Divider + Actions */}
                    <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#004687] border-[#004687] hover:bg-blue-50 gap-1.5 cursor-pointer"
                            onClick={() => toast.info("Add Stock clicked")}
                        >
                            <Plus size={13} />
                            Add Stock
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 px-4 bg-[#004687] hover:bg-[#003a73] text-white text-[12px] font-semibold uppercase tracking-wider gap-1.5 cursor-pointer"
                            onClick={handleShow}
                            disabled={loading}
                        >
                            <Eye size={13} />
                            {loading ? "Loading..." : "Show"}
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold uppercase tracking-wider gap-1.5 cursor-pointer"
                            onClick={handleReset}
                        >
                            <RefreshCw size={13} />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Stock Table */}
                {tableVisible && (
                    <div>
                        {/* Table header row */}
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Stock Records
                            </p>
                            <span className="bg-[#004687]/10 text-[#004687] text-[12px] font-semibold px-3 py-0.5 rounded-full">
                                {rows.length} items
                            </span>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-[12px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#004687]">
                                            {[
                                                "Item Code", "Item", "Spec", "Design", "Size",
                                                "Store", "Unit", "Opening Stock", "Purchase Rate", "Sales Rate",
                                            ].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-3 py-2.5 text-left text-[10px] font-medium text-white uppercase tracking-widest whitespace-nowrap border-r border-white/10 last:border-r-0"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr
                                                key={row.id}
                                                className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                                                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                                } hover:bg-blue-50/40`}
                                            >
                                                {/* Item Code */}
                                                <td className="px-3 py-2">
                                                    <span className="font-mono text-[12px] font-bold text-[#004687]">
                                                        {row.itemCode}
                                                    </span>
                                                </td>

                                                {/* Item */}
                                                <td className="px-3 py-2 font-medium text-slate-800">
                                                    {row.item}
                                                </td>

                                                {/* Spec */}
                                                <td className="px-3 py-2 text-slate-500">
                                                    {row.spec || <span className="text-slate-300">—</span>}
                                                </td>

                                                {/* Design */}
                                                <td className="px-3 py-2 text-slate-500">
                                                    {row.design || <span className="text-slate-300">—</span>}
                                                </td>

                                                {/* Size */}
                                                <td className="px-3 py-2 text-slate-500">
                                                    {row.size || <span className="text-slate-300">—</span>}
                                                </td>

                                                {/* Store */}
                                                <td className="px-3 py-2">
                                                    <span className="bg-[#004687]/10 text-[#004687] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                        {row.store}
                                                    </span>
                                                </td>

                                                {/* Unit */}
                                                <td className="px-3 py-2">
                                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                        {row.unit}
                                                    </span>
                                                </td>

                                                {/* Opening Stock */}
                                                <td className="px-2 py-1.5">
                                                    <Input
                                                        type="number"
                                                        value={row.openingStock ?? ""}
                                                        onChange={(e) =>
                                                            handleCellChange(row.id, "openingStock", e.target.value)
                                                        }
                                                        className="h-7 w-24 text-right text-[12px] font-mono border-slate-200 focus:border-[#004687] bg-white px-2"
                                                    />
                                                </td>

                                                {/* Purchase Rate */}
                                                <td className="px-2 py-1.5">
                                                    <Input
                                                        type="number"
                                                        value={row.purchaseRate ?? ""}
                                                        placeholder="0.00"
                                                        onChange={(e) =>
                                                            handleCellChange(row.id, "purchaseRate", e.target.value)
                                                        }
                                                        className="h-7 w-24 text-right text-[12px] font-mono border-slate-200 focus:border-[#004687] bg-white px-2"
                                                    />
                                                </td>

                                                {/* Sales Rate */}
                                                <td className="px-2 py-1.5">
                                                    <Input
                                                        type="number"
                                                        value={row.salesRate ?? ""}
                                                        placeholder="0.00"
                                                        onChange={(e) =>
                                                            handleCellChange(row.id, "salesRate", e.target.value)
                                                        }
                                                        className="h-7 w-24 text-right text-[12px] font-mono border-slate-200 focus:border-[#004687] bg-white px-2"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className="bg-[#004687] px-4 py-2.5 flex items-center justify-between">
                                <p className="text-[11px] text-white/70">
                                    Showing {rows.length} records · {formatDisplay(date)}
                                </p>
                                <Button
                                    size="sm"
                                    className="h-8 px-4 bg-white text-[#004687] hover:bg-blue-50 text-[12px] font-semibold gap-1.5 cursor-pointer"
                                    onClick={handleSave}
                                >
                                    <Save size={12} />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OpeningStock;
