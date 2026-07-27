"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import { Wallet, ListFilter } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "../../../../common/PageHeader";
import { PageFilters } from "../../../../common/PageFilters";
import {
  DataTable,
  StatusBadge,
  ActionsCell,
  FilterHeader,
} from "../../../../common/DataTable";
import PaymentVoucher from "../../../../components/Paymentvoucher";
import {
  fetchVoucherList,
  type VoucherListItem,
} from "../../../../store/features/Accounts/accounts/paymentVoucherSlice";

// PaymentOrReceipt: 1 = Receipt, 2 = Payment (matches outgoing payment vouchers shown on this page)
const PAYMENT_OR_RECEIPT = 2;

// ─── Column definition ────────────────────────────────────────────────────────
function buildColumns(): Column<any>[] {
  const cols: Column<any>[] = [
    {
      key: "VoucherNo",
      name: "Voucher No",
      width: 110,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="font-semibold text-[#004687] text-xs">{row.VoucherNo}</span>
      ),
    },
    {
      key: "VoucherType",
      name: "Voucher Type",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-700">{row.VoucherType ?? "—"}</span>
      ),
    },
    {
      key: "VoucherMode",
      name: "Voucher",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.VoucherMode ?? "—"}</span>
      ),
    },
    {
      key: "VoucherAmount",
      name: "Amount",
      width: 130,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-800 tabular-nums">
          {row.VoucherAmount != null
            ? Number(row.VoucherAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "—"}
        </span>
      ),
    },
    {
      key: "Date",
      name: "Date",
      width: 110,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.Date ?? "—"}</span>
      ),
    },
    {
      key: "CreatedOn",
      name: "Created On",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.CreatedOn ?? "—"}</span>
      ),
    },
    {
      key: "UserName",
      name: "Created By",
      width: 130,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.UserName ?? "—"}</span>
      ),
    },
    {
      key: "Approve",
      name: "Status",
      width: 130,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => <StatusBadge label={row.Approve ?? "Not Approved"} />,
    },
    {
      key: "ApprovedBY",
      name: "Approved By",
      width: 130,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ApprovedBY || "—"}</span>
      ),
    },
    {
      key: "ApprovedDate",
      name: "Approved On",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ApprovedDate ?? "—"}</span>
      ),
    },
    {
      key: "HeadNames",
      name: "Head",
      width: 130,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.HeadNames ?? "—"}</span>
      ),
    },
    {
      key: "ChequeNo",
      name: "Cheque No",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ChequeNo ?? "—"}</span>
      ),
    },
    {
      key: "ChequeDate",
      name: "Cheque Date",
      width: 120,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.ChequeDate ?? "—"}</span>
      ),
    },
    {
      key: "OrderNos",
      name: "Order No",
      width: 110,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.OrderNos ?? "—"}</span>
      ),
    },
    {
      key: "Remarks",
      name: "Remarks",
      minWidth: 140,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500 truncate">{row.Remarks ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      name: "Actions",
      width: 100,
      resizable: false,
      renderHeaderCell: () => (
        <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Actions
        </div>
      ),
      renderCell: ({ row }) => (
        <ActionsCell row={row} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
      ),
    },
    {
      key: "UTRDate",
      name: "UTR Date",
      width: 110,
      renderHeaderCell: (p: any) => <FilterHeader {...p} />,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.UTRDate ?? "—"}</span>
      ),
    },
  ];

  return cols;
}

// ─── PaymentEntry ────────────────────────────────────────────────────────────
export default function PaymentEntry() {
  const columns = buildColumns();
  const dispatch = useDispatch<any>();

  const { voucherList, voucherListLoading } = useSelector(
    (state: any) => state.paymentVoucher
  );

  // ── View state: "list" | "create" ─────────────────────────────────────────
  const [view, setView] = useState<"list" | "create">("list");

  // ── Filters ──────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState("2024-04-01");
  const [toDate, setToDate] = useState("2026-06-29");
  const [selectedItem, setSelectedItem] = useState("");
  const [status, setStatus] = useState("Not Approved");

  const STATUS_OPTIONS = [
    { value: "Approved", label: "Approved" },
    { value: "Not Approved", label: "Not Approved" },
    { value: "all", label: "All" },
  ];

  const loadVouchers = (statusOverride?: string) => {
    const currentStatus = statusOverride ?? status;
    dispatch(
      fetchVoucherList({
        fromDate,
        toDate,
        paymentOrReceipt: PAYMENT_OR_RECEIPT,
        searchStr: currentStatus === "all" ? "" : currentStatus,
      })
    )
      .unwrap?.()
      .catch((err: string) => {
        toast.error(err || "Failed to load payment vouchers.");
      });
  };

  // Load on mount
  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render PaymentVoucher inline when view === "create" ────────────────────
  if (view === "create") {
    return (
      <PaymentVoucher
        onBack={() => {
          setView("list");
          loadVouchers();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Payment Entry"
        subtitle="Accounts · Outgoing Payments"
        icon={<Wallet size={16} className="text-white" />}
        createButtonLabel="Create New Payment"
        showCreateButton
        onCreateClick={() => setView("create")}
      />

      {/* Filters + Table */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <PageFilters
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              items={[]}
              itemsLoading={false}
              loading={voucherListLoading}
              onSearch={() => loadVouchers()}
            />
          </div>

          {/* Custom Status filter — PageFilters is a shared component and can't be modified */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ListFilter size={10} /> Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-[160px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={voucherList as VoucherListItem[]}
          rowKey="VoucherNo"
          rowHeight={36}
          headerRowHeight={58}
        />
      </div>
    </div>
  );
}
