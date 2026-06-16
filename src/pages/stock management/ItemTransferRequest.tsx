"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchTransferRequests } from "../../store/features/inventory/stockManagement/itemTransferRequestSlice";
import { type Column } from "react-data-grid";
import { ArrowLeftRight } from "lucide-react";
import CreateItemTransferRequest from "../../components/CreateItemtransferrequest";

import { PageHeader } from "../../common/PageHeader";
import { PageFilters } from "../../common/PageFilters";
import { DataTable, FilterHeader, StatusBadge, ActionsCell } from "../../common/DataTable";
import { Badge } from "@/components/ui/badge";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ItemTransferRow {
  id: number;
  refNo: string;
  date: string;
  type: string;
  branchFrom: string;
  branchTo: string;
  storeFrom: string;
  storeTo: string;
  status: string;
}

// ─── ItemTransferRequest ───────────────────────────────────────────────────────

export default function ItemTransferRequest() {

  // ── Redux
  const dispatch = useDispatch<AppDispatch>();
  const { transferRequests, transferRequestsLoading } = useSelector(
    (state: RootState) => state.itemTransferRequest
  );

  // ── Filter state
  const [fromDate, setFromDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedItem, setSelectedItem] = useState("");

  // ── View toggle
  const [view, setView] = useState<"list" | "create">("list");

  // ── Convert YYYY-MM-DD (date input value) → DD-MM-YYYY (API format)
  const toApiDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  // ── Fetch on mount and whenever view returns to list
  useEffect(() => {
    if (view === "list") {
      dispatch(fetchTransferRequests({ fromDate: toApiDate(fromDate), toDate: toApiDate(toDate) }));
    }
  }, [view]);

  // ── Search handler
  const handleSearch = useCallback(() => {
    dispatch(fetchTransferRequests({ fromDate: toApiDate(fromDate), toDate: toApiDate(toDate) }));
  }, [dispatch, fromDate, toDate]);

  // ── Map API rows → table rows
  const rows: ItemTransferRow[] = useMemo(
    () =>
      transferRequests.map((r) => ({
        id:         r.ItemTransferRequestMId,
        refNo:      r.ItemTransferRequestRefNo,
        date:       r.RequestDate,
        type:       r.TransferType,
        branchFrom: r.ReqFromBranch,
        branchTo:   r.ReqToBranch,
        storeFrom:  r.RequestFromStore,
        storeTo:    r.RequestToStore,
        status:     r.Approved ? "Approved" : "Pending",
      })),
    [transferRequests]
  );

  // ── Action handlers
  const handleView = useCallback((row: ItemTransferRow) => {
    console.log("View", row);
  }, []);

  const handleEdit = useCallback((row: ItemTransferRow) => {
    console.log("Edit", row);
  }, []);

  const handleDelete = useCallback((row: ItemTransferRow) => {
    console.log("Delete", row);
  }, []);

  // ── Columns
  const columns: Column<ItemTransferRow>[] = useMemo(
    () => [
      {
        key: "refNo",
        name: "Ref. No",
        width: 140,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs font-semibold text-[#004687]">{row.refNo}</span>
        ),
      },
      {
        key: "date",
        name: "Date",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.date}</span>
        ),
      },
      {
        key: "type",
        name: "Type",
        width: 140,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-[10px] font-semibold text-violet-600 border-violet-200 bg-violet-50 px-2 py-0 h-5"
          >
            {row.type}
          </Badge>
        ),
      },
      {
        key: "branchFrom",
        name: "Branch From",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.branchFrom}</span>
        ),
      },
      {
        key: "branchTo",
        name: "Branch To",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.branchTo}</span>
        ),
      },
      {
        key: "storeFrom",
        name: "Store From",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.storeFrom}</span>
        ),
      },
      {
        key: "storeTo",
        name: "Store To",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.storeTo}</span>
        ),
      },
      {
        key: "status",
        name: "Status",
        width: 140,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => {})}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 122,
        renderHeaderCell: () => (
          <div className="flex items-center h-full px-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </span>
          </div>
        ),
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleView, handleEdit, handleDelete]
  );
  if (view === "create") {
    return <CreateItemTransferRequest onBack={() => setView("list")} />;
  }
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Item Transfer"
        subtitle="Inventory · Stock Transfer"
        icon={<ArrowLeftRight size={15} className="text-white" />}
        createButtonLabel="New Item Transfer Request"
        showCreateButton
        onCreateClick={() => setView("create")}
      />

      <div className="flex flex-col gap-4 p-4 flex-1 overflow-auto">
        {/* ── Filters ──────────────────────────────────────────────────── */}
        <PageFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={[]}
          itemsLoading={false}
          loading={transferRequestsLoading}
          onSearch={handleSearch}
        />

        {/* ── Results summary ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[#004687]" />
          <span className="text-xs font-semibold text-slate-600 tracking-wide">
            Transfer Requests
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-medium text-[#004687] border-blue-200 bg-blue-50 px-2 py-0 h-5"
          >
            {rows.length} {rows.length === 1 ? "record" : "records"}
          </Badge>
        </div>

        {/* ── Data Table ───────────────────────────────────────────────── */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={transferRequestsLoading}
          loadingLabel="Fetching transfer requests…"
          rowHeight={38}
          headerRowHeight={58}
        />
      </div>
    </div>
  );
}
