"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchAllServiceBillSales,
    ServiceBillSale,
} from "../../store/features/inventory/sales/salesServiceBillSlice";
import { type Column } from "react-data-grid";
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import { PageHeader } from "../../common/PageHeader";
import {
    FileText,
    User,
    FileDown,
    Search,
    ChevronsUpDown,
    Check,
    CreditCard,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import CreateSalesServiceBill from "../../components/CreateSalesServiceBill";

// ─── Types ────────────────────────────────────────────────────────────────────
type ServiceBillRow = {
    id: number;
    docNo: string;
    docDate: string;
    customer: string;
    custRefDate: string;
    custRefNo: string;
    paymentType: string;
    amount: number;
    status: string;
    approvedBy: string;
    createdDate: string;
    createdBy: string;
    approvedDate: string;
};

// ─── Customer Combobox ────────────────────────────────────────────────────────

function CustomerCombobox({
    selectedId,
    onSelect,
    customers,
}: {
    selectedId: number | null;
    onSelect: (id: number | null) => void;
    customers: { label: string; value: number }[];
}) {
    const [open, setOpen] = useState(false);
    const selectedLabel = customers.find((c) => c.value === selectedId)?.label ?? null;

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Customer
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-56 justify-between h-9 text-[12px] font-normal border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                        <span className="truncate">
                            {selectedLabel ?? <span className="text-slate-400">All customers</span>}
                        </span>
                        <ChevronsUpDown size={13} className="ml-2 shrink-0 text-slate-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search customer..." className="text-[12px] h-9" />
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-[12px] text-slate-400">
                                No customer found.
                            </CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    value="__all__"
                                    onSelect={() => { onSelect(null); setOpen(false); }}
                                    className="text-[12px]"
                                >
                                    <Check size={13} className={cn("mr-2", selectedId === null ? "opacity-100" : "opacity-0")} />
                                    All customers
                                </CommandItem>
                                {customers.map((c) => (
                                    <CommandItem
                                        key={c.value}
                                        value={c.label}
                                        onSelect={() => { onSelect(c.value === selectedId ? null : c.value); setOpen(false); }}
                                        className="text-[12px]"
                                    >
                                        <Check size={13} className={cn("mr-2 shrink-0", selectedId === c.value ? "opacity-100" : "opacity-0")} />
                                        {c.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────
function FiltersBar({
    fromDate, setFromDate,
    toDate, setToDate,
    selectedCustomerId, setSelectedCustomerId,
    customers,
}: {
    fromDate: string; setFromDate: (v: string) => void;
    toDate: string;   setToDate: (v: string) => void;
    selectedCustomerId: number | null;
    setSelectedCustomerId: (id: number | null) => void;
    customers: { label: string; value: number }[];
}) {
    return (
        <div className="flex flex-wrap items-end gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From</Label>
                <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-9 w-40 text-[12px] border-slate-200"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To</Label>
                <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-9 w-40 text-[12px] border-slate-200"
                />
            </div>
            <CustomerCombobox selectedId={selectedCustomerId} onSelect={setSelectedCustomerId} customers={customers} />
            <Button className="h-9 px-4 bg-[#004687] hover:bg-[#003a73] text-white text-[12px] font-semibold gap-2 cursor-pointer">
                <Search size={13} /> Search
            </Button>
        </div>
    );
}

// ─── PDF Action Button ────────────────────────────────────────────────────────
function PdfCell({ row }: { row: any }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-[#004687]/10 text-[#004687] cursor-pointer"
                >
                    <FileDown size={13} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Download PDF</TooltipContent>
        </Tooltip>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesServiceBill = () => {
    const today = new Date().toISOString().split("T")[0];
    const oneMonthAgo = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0]; })();

    const [showCreate, setShowCreate] = useState(false);
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { serviceBillSales, serviceBillSalesLoading } = useSelector(
        (state: RootState) => state.salesServiceBill
    );

    // Format yyyy-mm-dd → dd-mm-yyyy for the API
    const formatForApi = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${d}-${m}-${y}`;
    };

    useEffect(() => {
        dispatch(
            fetchAllServiceBillSales({
                fromDate: formatForApi(fromDate),
                toDate: formatForApi(toDate),
            })
        );
    }, [fromDate, toDate]);

    const rows: ServiceBillRow[] = useMemo(() =>
        serviceBillSales.map((b: ServiceBillSale) => ({
            id: b.ServiceBillID,
            docNo: b.InvoiceNo,
            docDate: b.InvoiceDate,
            customer: b.Customer,
            custRefDate: b.CustRefDate ?? "",
            custRefNo: b.CustRefNo,
            paymentType: b.PaymentType,
            amount: b.TotalAmt,
            status: b.Cancelled ? "Cancelled" : b.Approve,
            approvedBy: b.ApprovedBy,
            createdDate: b.CreatedDate,
            createdBy: b.Username,
            approvedDate: b.ApprovedDate,
        })),
        [serviceBillSales]
    );

    // Derive unique customers from loaded data for the filter combobox
    const customerOptions = useMemo(() => {
        const seen = new Set<string>();
        return serviceBillSales
            .filter((b) => { if (seen.has(b.Customer)) return false; seen.add(b.Customer); return true; })
            .map((b) => ({ label: b.Customer, value: b.ServiceBillID }));
    }, [serviceBillSales]);

    const filteredRows = useMemo(() =>
        selectedCustomerId === null
            ? rows
            : rows.filter((r) => r.id === selectedCustomerId || customerOptions.find(c => c.value === selectedCustomerId)?.label === r.customer),
        [rows, selectedCustomerId, customerOptions]
    );
    // ── Columns ─────────────────────────────────────────────────────────────────
    const columns: Column<ServiceBillRow>[] = useMemo(() => [
        {
            key: "docNo",
            name: "Doc No",
            width: 160,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="font-mono text-[12px] font-bold text-[#004687]">{row.docNo}</span>
            ),
        },
        {
            key: "docDate",
            name: "Date",
            width: 120,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] text-slate-500">{row.docDate}</span>
            ),
        },
        {
            key: "customer",
            name: "Customer",
            width: 200,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#004687]/10 flex items-center justify-center shrink-0">
                        <User size={11} className="text-[#004687]" />
                    </div>
                    <span className="text-[12px] font-medium text-slate-700 truncate">{row.customer}</span>
                </div>
            ),
        },
        {
            key: "custRefDate",
            name: "Cust Ref Date",
            width: 140,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] text-slate-500">
                    {row.custRefDate || <span className="text-slate-300">—</span>}
                </span>
            ),
        },
        {
            key: "custRefNo",
            name: "Cust Ref No",
            width: 120,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] font-mono text-slate-600">
                    {row.custRefNo || <span className="text-slate-300">—</span>}
                </span>
            ),
        },
        {
            key: "paymentType",
            name: "Payment Type",
            width: 130,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <CreditCard size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[12px] text-slate-600">{row.paymentType}</span>
                </div>
            ),
        },
        {
            key: "amount",
            name: "Amount",
            width: 130,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
                    ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 4 })}
                </span>
            ),
        },
        {
            key: "status",
            name: "Status",
            width: 120,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => <StatusBadge label={row.status} />,
        },
        {
            key: "approvedBy",
            name: "Approved By",
            width: 120,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] font-medium text-slate-700">
                    {row.approvedBy || <span className="text-slate-300">—</span>}
                </span>
            ),
        },
        {
            key: "createdDate",
            name: "Created Date",
            width: 130,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] text-slate-500">{row.createdDate}</span>
            ),
        },
        {
            key: "createdBy",
            name: "Created By",
            width: 120,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] text-slate-600 font-medium">{row.createdBy}</span>
            ),
        },
        {
            key: "approvedDate",
            name: "Approved Date",
            width: 130,
            renderHeaderCell: (props: any) => (
                <FilterHeader column={props.column} filterValue={props.filterValue ?? ""} onFilterChange={props.onFilterChange} />
            ),
            renderCell: ({ row }) => (
                <span className="text-[12px] text-slate-500">
                    {row.approvedDate || <span className="text-slate-300">—</span>}
                </span>
            ),
        },
        {
            key: "actions",
            name: "Actions",
            width: 130,
            renderCell: ({ row }) => (
                <div className="flex items-center">
                    <ActionsCell row={row} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
                    <PdfCell row={row} />
                </div>
            ),
        },
    ], []);

    if (showCreate) {
        return <CreateSalesServiceBill
            onBack={() => setShowCreate(false)}
            onSaved={() => {
                const todayStr = new Date().toISOString().split("T")[0];
                const fmt = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}-${m}-${y}`; };
                dispatch(fetchAllServiceBillSales({
                    fromDate: fmt(fromDate),
                    toDate: fmt(todayStr),
                }));
                setToDate(todayStr);
                setShowCreate(false);
            }}
        />;
    }

    return (
        <>
            <Toaster richColors position="top-right" />
            <PageHeader
                title="SERVICE BILL"
                subtitle="Overview"
                icon={<FileText size={16} className="text-white" />}
                createButtonLabel="CREATE NEW SERVICE BILL"
                onCreateClick={() => setShowCreate(true)}
            />

            <div className="min-h-screen bg-slate-50 p-6 space-y-6">
                <FiltersBar
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={setSelectedCustomerId}
                    customers={customerOptions}
                />

                <DataTable
                    columns={columns}
                    rows={filteredRows}
                    rowKey="id"
                    rowHeight={40}
                    headerRowHeight={60}
                    loading={serviceBillSalesLoading}
                />
            </div>
        </>
    );
};

export default SalesServiceBill;
