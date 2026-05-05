import { useState, useCallback } from "react";
import {
    Search,
    X,
    Package,
    CalendarDays,
    Hash,
    FileText,
    Building2,
    ShoppingCart,
    ChevronRight,
    ReceiptText,
    BadgeCheck,
    Clock,
    Filter,
    RefreshCw,
    Plus,
    CheckCircle2,
    CircleDot,
    Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoodsReceiptRow {
    id: number;
    grNo: string;
    date: string;
    grAmount: number;
    billNo: string;
    orderNo: string;
    orderDate: string;
    supplier: string;
    against: string;
    orderStatus: "Pending" | "Partial" | "Completed";
}

interface GoodsReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (row: GoodsReceiptRow) => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: GoodsReceiptRow[] = [
    { id: 1, grNo: "GR/2526/001", date: "27-04-2026", grAmount: 45200.0, billNo: "BILL-2301", orderNo: "PO/2526/101", orderDate: "20-04-2026", supplier: "Kottayam Steel Works", against: "Purchase Order", orderStatus: "Pending" },
    { id: 2, grNo: "GR/2526/002", date: "26-04-2026", grAmount: 128750.5, billNo: "BILL-2302", orderNo: "PO/2526/102", orderDate: "18-04-2026", supplier: "Kerala Cement Traders", against: "Purchase Order", orderStatus: "Partial" },
    { id: 3, grNo: "GR/2526/003", date: "25-04-2026", grAmount: 9800.0, billNo: "BILL-2303", orderNo: "JW/2526/045", orderDate: "15-04-2026", supplier: "Thrissur Metal Fab", against: "Job Work", orderStatus: "Completed" },
    { id: 4, grNo: "GR/2526/004", date: "24-04-2026", grAmount: 67500.0, billNo: "BILL-2304", orderNo: "PO/2526/104", orderDate: "10-04-2026", supplier: "Ernakulam Hardware Co.", against: "Purchase Order", orderStatus: "Pending" },
    { id: 5, grNo: "GR/2526/005", date: "23-04-2026", grAmount: 22300.75, billNo: "BILL-2305", orderNo: "PO/2526/105", orderDate: "08-04-2026", supplier: "Calicut Pipes & Fittings", against: "Purchase Order", orderStatus: "Partial" },
    { id: 6, grNo: "GR/2526/006", date: "22-04-2026", grAmount: 315000.0, billNo: "BILL-2306", orderNo: "PO/2526/106", orderDate: "05-04-2026", supplier: "Trivandrum Electricals", against: "Purchase Order", orderStatus: "Completed" },
];

function getToday() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GoodsReceiptRow["orderStatus"] }) {
    const map = {
        Pending: {
            label: "Pending",
            icon: Clock,
            cls: "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-400",
        },
        Partial: {
            label: "Partial",
            icon: CircleDot,
            cls: "bg-sky-50 text-sky-700 border-sky-200",
            dot: "bg-sky-400",
        },
        Completed: {
            label: "Completed",
            icon: BadgeCheck,
            cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-400",
        },
    };
    const cfg = map[status];
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", cfg.cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoodsReceiptDialog({
    open,
    onOpenChange,
    onSelect,
}: GoodsReceiptDialogProps) {
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rows, setRows] = useState<GoodsReceiptRow[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            const filtered = MOCK_DATA.filter((r) => {
                if (search.trim()) {
                    const q = search.toLowerCase();
                    return (
                        r.grNo.toLowerCase().includes(q) ||
                        r.supplier.toLowerCase().includes(q) ||
                        r.billNo.toLowerCase().includes(q) ||
                        r.orderNo.toLowerCase().includes(q)
                    );
                }
                return true;
            });
            setRows(filtered);
            setSearched(true);
            setLoading(false);
        }, 500);
    }, [search]);

    const handleSelect = useCallback(() => {
        const row = rows.find((r) => r.id === selectedId);
        if (row) {
            onSelect?.(row);
            onOpenChange(false);
        }
    }, [rows, selectedId, onSelect, onOpenChange]);

    const handleReset = () => {
        setStartDate(getToday());
        setEndDate(getToday());
        setSearch("");
        setRows([]);
        setSearched(false);
        setSelectedId(null);
    };

    const totalAmount = rows.reduce((s, r) => s + r.grAmount, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
    className="max-w-[95vw] xl:max-w-[1000px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
    style={{ maxHeight: "94vh" }}
>
                {/* ── Header ── */}
                <DialogHeader className="p-0">
                    <div className="bg-gradient-to-r from-[#004687] via-[#005da8] to-[#0074cc] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/20 shadow-inner">
                                <ReceiptText size={18} className="text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white text-[16px] font-bold tracking-wide leading-tight">
                                    Goods Receipt Details
                                </DialogTitle>
                                <p className="text-white/60 text-[11px] mt-0.5">
                                    Select a goods receipt to link to this purchase
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 transition-colors flex items-center justify-center border border-white/20 cursor-pointer"
                        >
                            <X size={14} className="text-white" />
                        </button>
                    </div>
                </DialogHeader>

                {/* ── Filters ── */}
                <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Start Date */}
                        <div className="flex-1 min-w-[140px]">
                            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                <CalendarDays size={10} className="text-[#004687]" />
                                Start Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-9 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg px-3 pr-3 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/60 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="flex-1 min-w-[140px]">
                            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                <CalendarDays size={10} className="text-[#004687]" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-9 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/60 transition-all shadow-sm"
                            />
                        </div>

                        {/* Search */}
                        <div className="flex-[2] min-w-[200px]">
                            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                <Search size={10} className="text-[#004687]" />
                                Search
                            </label>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="GR No, Supplier, Bill No…"
                                    className="w-full h-9 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-[#004687]/20 focus:border-[#004687]/60 transition-all shadow-sm placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pb-0.5">
                            <Button
                                size="sm"
                                onClick={handleSearch}
                                disabled={loading}
                                className="h-9 px-5 bg-[#004687] hover:bg-[#003a70] text-white text-[13px] font-semibold rounded-lg gap-2 shadow-none transition-colors"
                            >
                                {loading ? (
                                    <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                    <Search size={13} />
                                )}
                                Search
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleReset}
                                className="h-9 px-3 border-slate-200 text-slate-500 hover:bg-slate-100 rounded-lg"
                                title="Reset filters"
                            >
                                <RefreshCw size={13} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="overflow-auto flex-1" style={{ maxHeight: "calc(90vh - 260px)" }}>
                    {!searched && !loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-[#004687]/8 flex items-center justify-center">
                                <Filter size={28} className="text-[#004687]/40" />
                            </div>
                            <p className="text-[14px] font-semibold text-slate-500">Set filters and click Search</p>
                            <p className="text-[12px] text-slate-400">Goods receipt records will appear here</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#004687]/10 flex items-center justify-center">
                                <RefreshCw size={22} className="text-[#004687] animate-spin" />
                            </div>
                            <p className="text-[13px] text-slate-500">Loading records…</p>
                        </div>
                    )}

                    {searched && !loading && rows.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Package size={28} className="text-slate-400" />
                            </div>
                            <p className="text-[14px] font-semibold text-slate-500">No Records Found</p>
                            <p className="text-[12px] text-slate-400">Try adjusting the date range or search query</p>
                        </div>
                    )}

                    {!loading && rows.length > 0 && (
                        <table className="w-full text-[13px] border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#004687]">
                                    {[
                                        { icon: Hash, label: "Sl.No." },
                                        { icon: ReceiptText, label: "GR No." },
                                        { icon: CalendarDays, label: "Date" },
                                        { icon: null, label: "GR Amount" },
                                        { icon: FileText, label: "Bill No." },
                                        { icon: Layers, label: "Order No." },
                                        { icon: CalendarDays, label: "Order Date" },
                                        { icon: Building2, label: "Supplier / Job Worker" },
                                        { icon: ShoppingCart, label: "Against" },
                                        { icon: BadgeCheck, label: "Order Status" },
                                    ].map(({ icon: Icon, label }) => (
                                        <th
                                            key={label}
                                            className="px-3 py-2.5 text-left text-[11px] font-semibold text-white/90 uppercase tracking-wide whitespace-nowrap border-r border-white/10 last:border-r-0"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {Icon && <Icon size={11} className="opacity-70" />}
                                                {label}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => {
                                    const isSelected = selectedId === row.id;
                                    return (
                                        <tr
                                            key={row.id}
                                            onClick={() => setSelectedId(row.id)}
                                            className={cn(
                                                "cursor-pointer border-b border-slate-100 transition-all duration-100",
                                                isSelected
                                                    ? "bg-[#004687]/8 ring-1 ring-inset ring-[#004687]/20"
                                                    : idx % 2 === 0
                                                        ? "bg-white hover:bg-sky-50/50"
                                                        : "bg-slate-50/60 hover:bg-sky-50/50"
                                            )}
                                        >
                                            <td className="px-3 py-2.5 text-slate-500 text-center font-mono text-[12px]">
                                                <div className="flex items-center gap-1.5">
                                                    {isSelected ? (
                                                        <CheckCircle2 size={14} className="text-[#004687]" />
                                                    ) : (
                                                        <span className="w-4 text-slate-400">{idx + 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={cn(
                                                    "font-semibold",
                                                    isSelected ? "text-[#004687]" : "text-slate-700"
                                                )}>
                                                    {row.grNo}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.date}</td>
                                            <td className="px-3 py-2.5 text-right font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                                                ₹{row.grAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.billNo}</td>
                                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.orderNo}</td>
                                            <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.orderDate}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-md bg-[#004687]/8 flex items-center justify-center shrink-0">
                                                        <Building2 size={11} className="text-[#004687]" />
                                                    </div>
                                                    <span className="text-slate-700 font-medium">{row.supplier}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.against}</td>
                                            <td className="px-3 py-2.5">
                                                <StatusBadge status={row.orderStatus} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
                    {/* Summary stats */}
                    {rows.length > 0 ? (
                        <div className="flex items-center gap-5 text-[12px]">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Layers size={13} className="text-[#004687]" />
                                <span>{rows.length} record{rows.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="font-semibold text-slate-700 tabular-nums">
                                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                                <span>total value</span>
                            </div>
                            {selectedId && (
                                <>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-[#004687]">
                                        <CheckCircle2 size={13} />
                                        <span className="font-medium">
                                            {rows.find(r => r.id === selectedId)?.grNo} selected
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="text-[12px] text-slate-400 flex items-center gap-1.5">
                            <Filter size={12} />
                            Use filters above to search for goods receipts
                        </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-9 px-5 text-[13px] font-medium border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSelect}
                            disabled={!selectedId}
                            className="h-9 px-5 text-[13px] font-semibold bg-[#004687] hover:bg-[#003a70] text-white rounded-lg gap-2 shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={14} />
                            Select GR
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
