"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import { PageHeader } from "../../common/PageHeader";
import { FileText, User, FileDown, Search, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
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
import CreateRetailInvoice from "../../components/CreateRetailInvoice";
import {
    fetchRetailInvoices,
    fetchCustomers,
    clearRetailInvoiceList,
} from "../../store/features/inventory/sales/retailInvoiceSlice";
import type { RetailInvoiceListItem } from "../../store/features/inventory/sales/retailInvoiceSlice";
import type { AppDispatch, RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────
type RetailInvoiceRow = {
    id: number;
    invoiceNo: string;
    invoiceDate: string;
    customer: string;
    amount: number;
    createdBy: string;
    status: string;
    approvedBy: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

function getOneMonthAgo(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
}

// ─── Customer Combobox ────────────────────────────────────────────────────────
interface CustomerComboboxProps {
    customers: { label: string; value: number }[];
    loading: boolean;
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}

function CustomerCombobox({ customers, loading, selectedId, onSelect }: CustomerComboboxProps) {
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
                            {selectedLabel ?? (
                                <span className="text-slate-400">All customers</span>
                            )}
                        </span>
                        <ChevronsUpDown size={13} className="ml-2 shrink-0 text-slate-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search customer..."
                            className="text-[12px] h-9"
                        />
                        <CommandList>
                            {loading ? (
                                <div className="py-6 text-center text-[12px] text-slate-400">
                                    Loading…
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty className="py-6 text-center text-[12px] text-slate-400">
                                        No customer found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {/* "All" option to clear the filter */}
                                        <CommandItem
                                            value="__all__"
                                            onSelect={() => {
                                                onSelect(null);
                                                setOpen(false);
                                            }}
                                            className="text-[12px]"
                                        >
                                            <Check
                                                size={13}
                                                className={cn(
                                                    "mr-2",
                                                    selectedId === null
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            All customers
                                        </CommandItem>

                                        {customers.map((c) => (
                                            <CommandItem
                                                key={c.value}
                                                value={c.label}
                                                onSelect={() => {
                                                    onSelect(c.value === selectedId ? null : c.value);
                                                    setOpen(false);
                                                }}
                                                className="text-[12px]"
                                            >
                                                <Check
                                                    size={13}
                                                    className={cn(
                                                        "mr-2 shrink-0",
                                                        selectedId === c.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {c.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

// ─── Inline Filters Bar ───────────────────────────────────────────────────────
interface FiltersBarProps {
    fromDate: string;
    setFromDate: (v: string) => void;
    toDate: string;
    setToDate: (v: string) => void;
    customers: { label: string; value: number }[];
    customersLoading: boolean;
    selectedCustomerId: number | null;
    setSelectedCustomerId: (id: number | null) => void;
    loading: boolean;
    onSearch: () => void;
}

function FiltersBar({
    fromDate, setFromDate,
    toDate, setToDate,
    customers, customersLoading,
    selectedCustomerId, setSelectedCustomerId,
    loading, onSearch,
}: FiltersBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            {/* From Date */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    From
                </Label>
                <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-9 w-40 text-[12px] border-slate-200"
                />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    To
                </Label>
                <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-9 w-40 text-[12px] border-slate-200"
                />
            </div>

            {/* Customer Combobox */}
            <CustomerCombobox
                customers={customers}
                loading={customersLoading}
                selectedId={selectedCustomerId}
                onSelect={setSelectedCustomerId}
            />

            {/* Search Button */}
            <Button
                onClick={onSearch}
                disabled={loading}
                className="h-9 px-4 bg-[#004687] hover:bg-[#003a73] text-white text-[12px] font-semibold gap-2"
            >
                <Search size={13} />
                {loading ? "Searching…" : "Search"}
            </Button>
        </div>
    );
}

// ─── PDF Action Button ────────────────────────────────────────────────────────
function PdfCell({ row, onPdf }: { row: any; onPdf?: (row: any) => void }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-[#004687]/10 text-[#004687] cursor-pointer"
                    onClick={() => onPdf?.(row)}
                >
                    <FileDown size={13} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
                Download PDF
            </TooltipContent>
        </Tooltip>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const RetailInvoice = () => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Redux State ─────────────────────────────────────────────────────────────
    const {
        retailInvoiceList,
        retailInvoiceListLoading,
        retailInvoiceListError,
        customers,
        customersLoading,
    } = useSelector((state: RootState) => state.retailInvoice);

    // ── View Toggle ─────────────────────────────────────────────────────────────
    const [showCreate, setShowCreate] = useState(false);

    // ── Optimistic prepend for newly saved invoice ──────────────────────────────
    const [pendingInvoice, setPendingInvoice] = useState<RetailInvoiceListItem | null>(null);


    // ── Filter State ────────────────────────────────────────────────────────────
    const [fromDate, setFromDate] = useState<string>(getOneMonthAgo());
    const [toDate, setToDate] = useState<string>(getToday());
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const handleSaveSuccess = useCallback((newInvoice: RetailInvoiceListItem) => {
        setPendingInvoice(newInvoice);
        setShowCreate(false);
        dispatch(fetchRetailInvoices({ fromDate, toDate }));
    }, [dispatch, fromDate, toDate]);

    // ── Fetch on mount ──────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchRetailInvoices({ fromDate, toDate }));
        dispatch(fetchCustomers());

        return () => {
            dispatch(clearRetailInvoiceList());
        };
    // fromDate and toDate are only read once on mount (stable initial values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Customer options for the combobox ───────────────────────────────────────
    const customerOptions = useMemo(
        () =>
            customers.map((c) => ({
                label: c.CustomerName,
                value: c.CustomerID,
            })),
        [customers]
    );

    // ── Map API response → table rows ───────────────────────────────────────────
    const rows: RetailInvoiceRow[] = useMemo(() => {
        const baseList = pendingInvoice
            ? [pendingInvoice, ...retailInvoiceList.filter((i) => i.SalesID !== pendingInvoice.SalesID)]
            : retailInvoiceList;
        return baseList.map((item) => ({
            id: item.SalesID,
            invoiceNo: item.SalesNo,
            invoiceDate: item.SalesDate,
            customer: item.CustomerName,
            amount: item.NetAmount,
            createdBy: item.CreatedBy,
            status: item.Approve,
            approvedBy: item.ApprovedBY,
        }));
    }, [retailInvoiceList, pendingInvoice]);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleSearch = useCallback(() => {
        dispatch(
            fetchRetailInvoices({
                fromDate,
                toDate,
                ...(selectedCustomerId !== null && { customerId: selectedCustomerId }),
            })
        );
    }, [dispatch, fromDate, toDate, selectedCustomerId]);

    const handleEdit = useCallback((row: RetailInvoiceRow) => {
        console.log("Edit invoice", row);
    }, []);

    const handleDelete = useCallback((row: RetailInvoiceRow) => {
        console.log("Delete invoice", row);
    }, []);

    const handlePdf = useCallback((row: RetailInvoiceRow) => {
        console.log("Download PDF for invoice", row);
    }, []);

    const handleView = useCallback((row: RetailInvoiceRow) => {
        console.log("View invoice items", row);
    }, []);

    // ── Columns ─────────────────────────────────────────────────────────────────
    const columns: Column<RetailInvoiceRow>[] = useMemo(
        () => [
            {
                key: "invoiceNo",
                name: "Invoice No.",
                width: 160,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <span className="font-mono text-[12px] font-bold text-[#004687]">
                        {row.invoiceNo}
                    </span>
                ),
            },
            {
                key: "invoiceDate",
                name: "Invoice Date",
                width: 150,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <span className="text-[12px] text-slate-500">{row.invoiceDate}</span>
                ),
            },
            {
                key: "customer",
                name: "Customer",
                width: 230,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#004687]/10 flex items-center justify-center shrink-0">
                            <User size={11} className="text-[#004687]" />
                        </div>
                        <span className="text-[12px] font-medium text-slate-700">
                            {row.customer}
                        </span>
                    </div>
                ),
            },
            {
                key: "amount",
                name: "Amount",
                width: 150,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
                        ₹{row.amount.toLocaleString("en-IN")}
                    </span>
                ),
            },
            {
                key: "createdBy",
                name: "Created By",
                width: 150,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <span className="text-[12px] text-slate-600 font-medium">
                        {row.createdBy}
                    </span>
                ),
            },
            {
                key: "status",
                name: "Status",
                width: 120,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => <StatusBadge label={row.status} />,
            },
            {
                key: "approvedBy",
                name: "Approved By",
                width: 130,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue ?? ""}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }) => (
                    <span className="text-[12px] font-medium text-slate-700">
                        {row.approvedBy || <span className="text-slate-300">—</span>}
                    </span>
                ),
            },
            {
                key: "actions",
                name: "Actions",
                width: 160,
                renderCell: ({ row }) => (
                    <div className="flex items-center">
                        <ActionsCell
                            row={row}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                        <PdfCell row={row} onPdf={handlePdf} />
                    </div>
                ),
            },
        ],
        [handleView, handleEdit, handleDelete, handlePdf]
    );

    if (showCreate) {
        return (
            <CreateRetailInvoice
                onBack={() => setShowCreate(false)}
                onSaveSuccess={handleSaveSuccess}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="RETAIL INVOICE"
                subtitle="Overview"
                icon={<FileText size={16} className="text-white" />}
                createButtonLabel="CREATE RETAIL INVOICE"
                onCreateClick={() => setShowCreate(true)}
            />

            <div className="min-h-screen bg-slate-50 p-6 space-y-6">
                <FiltersBar
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    customers={customerOptions}
                    customersLoading={customersLoading}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={setSelectedCustomerId}
                    loading={retailInvoiceListLoading}
                    onSearch={handleSearch}
                />

                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey="id"
                    loading={retailInvoiceListLoading}
                    error={retailInvoiceListError}
                    rowHeight={40}
                    headerRowHeight={60}
                />
            </div>
        </>
    );
};

export default RetailInvoice;
