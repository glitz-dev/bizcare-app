"use client";

import { useState, useEffect, useMemo } from "react";
import type { Column } from "react-data-grid";
import { ArrowLeftRight, Search, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDefaultStore,
  fetchDocumentMasters,
  fetchAllItemRequestsToApprove,
  fetchSelectedTransferRequest,
  type ItemRequestToApprove,
} from "../../store/features/inventory/stockManagement/itemTransferApprovalSlice";

import { PageHeader } from "../../common/PageHeader";
import {
  DataTable,
  FilterHeader,
  ActionsCell,
} from "../../common/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CreateItemTransferApproval from "../../components/CreateItemTransferApproval";

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ItemTransferApproval() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    defaultStores,
    itemRequestsToApprove,
    itemRequestsToApproveLoading,
  } = useSelector((s: RootState) => s.itemTransferApproval);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [editRow, setEditRow] = useState<ItemRequestToApprove | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // On mount: fetch the default store, then use its StoreID to load the table
  useEffect(() => {
    dispatch(fetchDefaultStore()).then((action) => {
      if (fetchDefaultStore.fulfilled.match(action)) {
        const store = action.payload[0];
        if (store) {
          setSelectedStore(String(store.StoreID));
          dispatch(fetchAllItemRequestsToApprove({ storeId: 0 }));
        }
      }
    });
  }, [dispatch]);

  // Fire all 3 APIs in parallel, then open the form with the selected row
  const handleEdit = async (row: ItemRequestToApprove) => {
    setEditLoading(true);
    await Promise.all([
      dispatch(fetchDocumentMasters()),
      dispatch(fetchDefaultStore()),
      dispatch(fetchSelectedTransferRequest({ transferRequestId: row.ItemTransferRequestMId })),
    ]);
    setEditRow(row);
    setEditLoading(false);
    setShowCreate(true);
  };

  // Re-fetch when the user picks a different store and hits Search
  const handleSearch = () => {};

  const columns: Column<ItemRequestToApprove>[] = useMemo(() => [
    {
      key: "ItemTransferRequestRefNo", name: "Ref No", width: 160, frozen: true,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="font-semibold text-[#004687] text-xs">{row.ItemTransferRequestRefNo}</span>,
    },
    {
      key: "RequestDate", name: "Date", width: 140,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="text-xs text-slate-600">{row.RequestDate}</span>,
    },
    {
      key: "TransferType", name: "Type", width: 250,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="text-xs text-slate-600">{row.TransferType}</span>,
    },
    {
      key: "ReqFromBranch", name: "Branch From", width: 170,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="text-xs text-slate-600">{row.ReqFromBranch}</span>,
    },
    {
      key: "RequestFromStore", name: "Store From", width: 170,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="text-xs text-slate-600">{row.RequestFromStore}</span>,
    },
    {
      key: "RequestToStore", name: "Store To", width: 230,
      renderHeaderCell: (props) => <FilterHeader column={props.column} filterValue={(props as any).filterValue ?? ""} onFilterChange={(props as any).onFilterChange ?? (() => {})} />,
      renderCell: ({ row }) => <span className="text-xs text-slate-600">{row.RequestToStore}</span>,
    },
    {
      key: "actions", name: "Actions", width: 150,
      renderHeaderCell: () => (
        <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</div>
      ),
      renderCell: ({ row }) => (
        <ActionsCell
          row={row}
          onEdit={() => handleEdit(row)}
          onDelete={() => {}}
        />
      ),
    },
  ], []);

  if (showCreate) {
    return (
      <CreateItemTransferApproval
        onBack={() => { setShowCreate(false); setEditRow(null); }}
        editRow={editRow ?? undefined}
      />
    );
  }

  if (editLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#004687]/20 border-t-[#004687] animate-spin" />
          <span className="text-sm font-semibold text-[#004687]">Loading approval…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Item Transfer Approval"
        subtitle="Inventory · Transfers"
        icon={<ArrowLeftRight size={16} className="text-white" />}
        showCreateButton={true}
        createButtonLabel="Item Transfer Approval"
        onCreateClick={() => setShowCreate(true)}
      />

      <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">
        {/* Store Filter */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1 w-72">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Store
              </label>
              <div className="relative">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                    <SelectValue placeholder="Select Store" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultStores.map((s) => (
                      <SelectItem key={s.StoreID} value={String(s.StoreID)}>
                        {s.StoreName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStore && (
                  <button
                    onClick={() => setSelectedStore("")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!selectedStore || itemRequestsToApproveLoading}
              className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none"
            >
              <Search size={12} />
              {itemRequestsToApproveLoading ? "Loading…" : "Search"}
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={itemRequestsToApprove}
          rowKey="ItemTransferRequestMId"
          rowHeight={38}
          headerRowHeight={58}
        />
      </div>
    </div>
  );
}
