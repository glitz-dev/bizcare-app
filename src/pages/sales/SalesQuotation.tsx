"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import {
  DataTable,
  ActionsCell,
  FilterHeader,
} from "../../common/DataTable";
import { PageFilters } from "../../common/PageFilters";
import { PageHeader } from "../../common/PageHeader";
import { User, ClipboardList } from "lucide-react";
import SalesQuotationCreate from "@/components/SalesQuotationCreate";
import { AppDispatch, RootState } from "@/store";
import {
  fetchSalesQuotationList,
  clearQuotationList,
  type SalesQuotationListItem,
} from "../../store/features/inventory/sales/salesQuotationSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

// Table row is derived directly from the slice's SalesQuotationListItem
type SalesQuotationRow = {
  id: number;
  quotationNo: string;
  quotationDate: string;
  customer: string;
  referenceNo: string;
  amount: number;
};

type SelectedSQ = SalesQuotationRow;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTwoYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/** Map API item → flat row the table understands */
function toRow(item: SalesQuotationListItem): SalesQuotationRow {
  return {
    id: item.SalesQuotationID,
    quotationNo: item.QuotationNo,
    quotationDate: item.QuotationDate,
    customer: item.Customer,
    referenceNo: item.ReferenceNo ?? "",
    amount: item.NetAmount,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesQuotation = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ─── Redux state ────────────────────────────────────────────────────────
  const {
    quotationList,
    quotationListLoading,
    quotationListError,
  } = useSelector((state: RootState) => state.salesQuotation);

  // ─── View state ─────────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSQ, setEditingSQ] = useState<SelectedSQ | null>(null);

  // ─── Filter state ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());
  const [selectedItem, setSelectedItem] = useState("");

  // ─── Derived rows ───────────────────────────────────────────────────────
  // Convert the raw API list to the shape our columns expect.
  const rows: SalesQuotationRow[] = useMemo(
    () => quotationList.map(toRow),
    [quotationList]
  );

  // ─── Fetch on mount & whenever the date range changes via Search ─────────
  // Initial load uses the default date range already in state.
  useEffect(() => {
    dispatch(fetchSalesQuotationList({ fromDate, toDate }));

    // Clean up the list when this page unmounts so stale data
    // doesn't flash the next time the page is opened.
    return () => {
      dispatch(clearQuotationList());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // ─── Handlers ───────────────────────────────────────────────────────────

  /** Called by the Search button in PageFilters */
  const handleSearch = useCallback(() => {
    dispatch(fetchSalesQuotationList({ fromDate, toDate }));
  }, [dispatch, fromDate, toDate]);

  const handleEdit = useCallback((row: any) => {
    if (!row.id) {
      console.warn("No id on row", row);
      return;
    }
    // TODO: dispatch(fetchSelectedSQ({ id: row.id })) when that thunk exists
    setEditingSQ(row as SelectedSQ);
    setShowCreateForm(true);
  }, []);

  const handleCreateNew = () => {
    setEditingSQ(null);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingSQ(null);
  };

  const handleFormSubmit = (_data: any) => {
    setEditingSQ(null);
    setShowCreateForm(false);
    // Re-fetch so the list reflects the new / updated quotation
    dispatch(fetchSalesQuotationList({ fromDate, toDate }));
  };

  // ─── Columns ────────────────────────────────────────────────────────────
  const columns: Column<SalesQuotationRow>[] = useMemo(
    () => [
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={handleEdit}
            onDelete={() => { }}
          />
        ),
      },
      {
        key: "quotationNo",
        name: "Quotation No",
        width: 190,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold text-[#004687]">
            {row.quotationNo}
          </span>
        ),
      },
      {
        key: "quotationDate",
        name: "Quotation Date",
        width: 200,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.quotationDate}</span>
        ),
      },
      {
        key: "customer",
        name: "Customer",
        width: 280,
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
            <span className="text-[12px] font-medium text-slate-700">{row.customer}</span>
          </div>
        ),
      },
      {
        key: "referenceNo",
        name: "Reference No",
        width: 220,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] text-slate-500 font-mono">
            {row.referenceNo || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        key: "amount",
        name: "Amount",
        width: 250,
        renderHeaderCell: (props: any) => (
          <FilterHeader
            column={props.column}
            filterValue={props.filterValue ?? ""}
            onFilterChange={props.onFilterChange}
          />
        ),
        renderCell: ({ row }) => (
          <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
            ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
    ],
    [handleEdit]
  );

  // ─── Conditional Renders ────────────────────────────────────────────────

  // 1. Create / Edit form
  if (showCreateForm) {
    return (
      <SalesQuotationCreate
        setShowCreateForm={setShowCreateForm}
        onSaveSuccess={() =>
          dispatch(fetchSalesQuotationList({ fromDate, toDate }))
        }
      />
    );
  }

  // 2. List view
  return (
    <>
      <PageHeader
        title="SALES QUOTATION"
        subtitle="Details"
        icon={<ClipboardList size={16} className="text-white" />}
        createButtonLabel="CREATE SALES QUOTATION"
        onCreateClick={handleCreateNew}
      />

      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        <PageFilters
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={[]}
          itemsLoading={false}
          loading={quotationListLoading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={quotationListLoading}
          error={quotationListError}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default SalesQuotation;
