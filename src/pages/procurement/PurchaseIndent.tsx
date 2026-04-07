"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchIndentOrders,
  fetchItems,
  fetchItemDetail,
  clearItemDetails,
  fetchSelectedIndent,    
  clearSelectedIndent,    
  type SelectedIndent,    
  type ItemDetail,
} from "@/store/features/inventory/procurement/procurementSlice";
import { TooltipProvider } from "@/components/ui/tooltip";
import { X, RefreshCcw, Package } from "lucide-react";
import type { Column } from "react-data-grid";

import { PageHeader } from "@/common/PageHeader";
import { PageFilters } from "@/common/PageFilters";
import {
  DataTable,
  FilterHeader,
  ActionsCell,
  StatusBadge,
} from "@/common/DataTable";
import { CreateIndentForm } from "@/components/CreateIndentform";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOneMonthAgo(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Item Details Modal ───────────────────────────────────────────────────────
interface ItemDetailsModalProps {
  open: boolean;
  onClose: () => void;
  indentNo: string;
  items: ItemDetail[];
  loading: boolean;
  error: string | null;
}

function ItemDetailsModal({ open, onClose, indentNo, items, loading, error }: ItemDetailsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{ minWidth: 560, maxWidth: 720, width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "#004687" }}
        >
          <span className="text-white font-bold text-sm tracking-widest uppercase">
            Item Details — {indentNo}
          </span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors rounded p-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <RefreshCcw size={22} className="text-slate-300 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading item details…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-1">
              <p className="text-sm font-semibold text-red-500">Error: {error}</p>
              <p className="text-xs text-slate-300">Please try again</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ background: "#004687" }}>
                  {["#", "Item", "Indent Quantity", "Ordered Qty", "Landed Qty"].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left text-white font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td className="px-4 py-2.5 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-slate-700 font-medium">{row.ItemName}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.Quantity}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.PurchaseOrdQty}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.InpassQty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PurchaseIndent() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    indentOrders,
    loading,
    error,
    items,
    itemsLoading,
    itemDetails,
    itemDetailsLoading,
    itemDetailsError,
    selectedIndent,
  } = useSelector((state: RootState) => state.procurement);

  const [fromDate, setFromDate] = useState(getOneMonthAgo());
  const [toDate, setToDate] = useState(getToday());
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [searched, setSearched] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Item Details Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalIndentNo, setItemModalIndentNo] = useState("");

  const handleViewItems = useCallback((indentID: number, indentNo: string) => {
    setItemModalIndentNo(indentNo);
    setItemModalOpen(true);
    dispatch(fetchItemDetail(indentID));
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setItemModalOpen(false);
    dispatch(clearItemDetails());
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    dispatch(
      fetchIndentOrders({
        from: fromDate,
        to: toDate,
        itemid: selectedItem ? Number(selectedItem) : 0,
        searchStr: "",
        companyId: 1,
        finYearId: 2,
      })
    );
    setSearched(true);
  }, [dispatch, fromDate, toDate, selectedItem]);

  const handleEditIndent = useCallback((row: any) => {
    dispatch(clearSelectedIndent());
    dispatch(
      fetchSelectedIndent({
        indentID: row.IndentID,
        companyId: 1,
        finYearId: 2,
      })
    );
    setIsEditMode(true);
    setShowCreateForm(true);
  }, [dispatch]);

  useEffect(() => {
    if (items.length === 0) dispatch(fetchItems());
  }, [dispatch, items.length]);

  useEffect(() => {
    dispatch(
      fetchIndentOrders({ from: fromDate, to: toDate, searchStr: "", companyId: 1, finYearId: 2 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshIndentList = useCallback(() => {
    dispatch(
      fetchIndentOrders({
        from: fromDate,
        to: toDate,
        itemid: selectedItem ? Number(selectedItem) : 0,
        searchStr: "",
        companyId: 1,
        finYearId: 2,
      })
    );
  }, [dispatch, fromDate, toDate, selectedItem]);

  // ── Indent orders column definitions ────────────────────────────────────────
  const indentColumns: Column<any>[] = useMemo(
    () => [
      {
        key: "actions",
        name: "Actions",
        width: 100,
        frozen: true,
        resizable: false,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={(r) => handleViewItems(r.IndentID, r.IndentNo)}
            onEdit={handleEditIndent}
            onDelete={() => {/* TODO */ }}
          />
        ),
      },
      {
        key: "IndentNo",
        name: "Indent No.",
        width: 110,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[#004687] font-semibold text-xs">{row.IndentNo}</span>
        ),
      },
      {
        key: "IndentDate",
        name: "Indent Date",
        width: 100,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "DocumentName",
        name: "Document",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "TotalQuantity",
        name: "Qty",
        width: 70,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-medium text-xs">{row.TotalQuantity}</span>
        ),
      },
      {
        key: "CategoryName",
        name: "Category",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "SubCategoryName",
        name: "Sub Category",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "Remarks",
        name: "Remarks",
        width: 150,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs text-slate-500 italic">{row.Remarks ?? "—"}</span>
        ),
      },
      {
        key: "EmpName",
        name: "Requested By",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "Approve",
        name: "Status",
        width: 100,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.Approve} />,
      },
      {
        key: "ApprovedBY",
        name: "Approved By",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "POStatus",
        name: "PO Status",
        width: 100,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => <StatusBadge label={row.POStatus} />,
      },
      {
        key: "SalesOrderNo",
        name: "Sales Order",
        width: 110,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-xs">{row.SalesOrderNo ?? "—"}</span>
        ),
      },
      {
        key: "CreatedDate",
        name: "Created Date",
        width: 100,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
      {
        key: "DepartmentName",
        name: "Created By",
        width: 120,
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={(props as any).filterValue ?? ""}
            onFilterChange={(props as any).onFilterChange ?? (() => { })}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <TooltipProvider>
      <div className="bg-slate-50 font-sans">
        <ItemDetailsModal
          open={itemModalOpen}
          onClose={handleCloseModal}
          indentNo={itemModalIndentNo}
          items={itemDetails}
          loading={itemDetailsLoading}
          error={itemDetailsError}
        />

        <PageHeader
          title="Purchase Indent"
          subtitle="Bizcare ERP · Procurement"
          icon={<Package size={16} className="text-white" />}
          createButtonLabel="Create New Purchase Indent"
          showCreateButton={!showCreateForm}
          onCreateClick={() => {
            setIsEditMode(false);
            setShowCreateForm(true);
          }}
        />

       {showCreateForm ? (
          <CreateIndentForm
            onClose={() => {
              setShowCreateForm(false);
              setIsEditMode(false);
              dispatch(clearSelectedIndent());
            }}
            onSuccess={refreshIndentList}
            isEditMode={isEditMode}
            editData={selectedIndent}
          />
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
              columns={indentColumns}
              rows={indentOrders}
              rowKey="IndentID"
              loading={loading}
              error={error}
              loadingLabel="Loading indent orders…"
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}