"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesQuotationRow {
  id: number;
  quotationNo: string;
  quotationDate: string;
  customer: string;
  referenceNo: string;
  amount: number;
}

// Mirrors SelectedPO pattern from PurchaseOrder — swap with your actual slice type
type SelectedSQ = SalesQuotationRow;

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_ROWS: SalesQuotationRow[] = [
  { id: 1,  quotationNo: "QN-1",  quotationDate: "11/14/2024", customer: "ABDUL SHUKOOR",  referenceNo: "101",      amount: 52500   },
  { id: 2,  quotationNo: "QN-2",  quotationDate: "11/14/2024", customer: "ABHILASHA P S",  referenceNo: "12",       amount: 112000  },
  { id: 3,  quotationNo: "QN-3",  quotationDate: "11/14/2024", customer: "ABDUL RAZIQ",    referenceNo: "122",      amount: 123200  },
  { id: 4,  quotationNo: "QN-4",  quotationDate: "11/14/2024", customer: "ABHILASHA P S",  referenceNo: "",         amount: 8850    },
  { id: 5,  quotationNo: "QN-5",  quotationDate: "11/14/2024", customer: "ABDULLA K",      referenceNo: "",         amount: 2950    },
  { id: 6,  quotationNo: "QN-6",  quotationDate: "11/14/2024", customer: "ABHILASHA P S",  referenceNo: "43",       amount: 735     },
  { id: 7,  quotationNo: "QN-7",  quotationDate: "11/14/2024", customer: "ABHILASHA P S",  referenceNo: "976",      amount: 2576    },
  { id: 8,  quotationNo: "QN-8",  quotationDate: "11/15/2024", customer: "ABDUL SHUKOOR",  referenceNo: "",         amount: 4200    },
  { id: 9,  quotationNo: "QN-9",  quotationDate: "12/27/2024", customer: "ABDUL SALAM",    referenceNo: "82",       amount: 210     },
  { id: 10, quotationNo: "QN-10", quotationDate: "01/28/2025", customer: "ABDULLA K",      referenceNo: "",         amount: 17248   },
  { id: 11, quotationNo: "QN-11", quotationDate: "04/20/2026", customer: "CUSTOMER567",    referenceNo: "",         amount: 1770    },
  { id: 12, quotationNo: "QN-12", quotationDate: "04/20/2026", customer: "CUSTOMER567",    referenceNo: "",         amount: 5310    },
  { id: 13, quotationNo: "QN-13", quotationDate: "05/05/2026", customer: "CUSTOMER567",    referenceNo: "Test Ref", amount: 2642.64 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTwoYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesQuotation = () => {
  // ─── View State ─────────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ─── Filter State ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getTwoYearsAgo());
  const [toDate, setToDate]     = useState(getToday());
  const [selectedItem, setSelectedItem] = useState("");
  const [rows, setRows]         = useState<SalesQuotationRow[]>(MOCK_ROWS);
  const [editingSQ, setEditingSQ] = useState<SelectedSQ | null>(null);

  // ─── Redux (wire up when slice is ready) ────────────────────────────────
  // const dispatch = useDispatch<AppDispatch>();
  // const { selectedSQ, selectedSQLoading, salesQuotations, loading, error, items, itemsLoading } =
  //   useSelector((state: RootState) => state.salesQuotation);
  //
  // Temporary stubs so the component compiles without the slice:
  const selectedSQ        = null as SelectedSQ | null;
  const selectedSQLoading = false;
  const loading           = false;
  const error             = null as string | null;
  const items             = [] as { id: string; name: string }[];
  const itemsLoading      = false;

  // Open edit form when a quotation is fetched from the store
  useEffect(() => {
    if (selectedSQ) {
      setEditingSQ(selectedSQ);
      setShowCreateForm(true);
    }
  }, [selectedSQ]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleEdit = useCallback((row: any) => {
    if (!row.id) {
      console.warn("No id on row", row);
      return;
    }
    // dispatch(fetchSelectedSQ({ id: row.id }));
    // Temporary: open form directly with the row data
    setEditingSQ(row as SelectedSQ);
    setShowCreateForm(true);
  }, []);

  const handleSearch = useCallback(() => {
    // dispatch(fetchSalesQuotations({ fromDate, toDate, itemid: selectedItem || undefined }));
  }, [fromDate, toDate, selectedItem]);

  const handleCreateNew = () => {
    setEditingSQ(null);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingSQ(null);
    // dispatch(clearSelectedSQ());
  };

  const handleFormSubmit = (data: any) => {
    setRows((prev) => {
      if (data.id && editingSQ) {
        return prev.map((r) => (r.id === data.id ? data : r));
      }
      return [data, ...prev];
    });
    setEditingSQ(null);
    // dispatch(clearSelectedSQ());
    setShowCreateForm(false);
    handleSearch();
  };

  // ─── Columns ────────────────────────────────────────────────────────────
  const columns: Column<SalesQuotationRow>[] = useMemo(
    () => [
      {
        key: "actions",
        name: "Actions",
        width: 90,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={handleEdit}
            onDelete={() => {}}
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
        width: 200,
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

  // 1. Loading spinner while fetching a specific quotation for editing
  if (selectedSQLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400 font-medium">Loading sales quotation…</p>
        </div>
      </div>
    );
  }

  // 2. Create / Edit form
  if (showCreateForm) {
    return (
      <SalesQuotationCreate
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editData={editingSQ}
      />
    );
  }

  // 3. List view
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
          items={items}
          itemsLoading={itemsLoading}
          loading={loading}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          error={error}
          rowHeight={40}
          headerRowHeight={60}
        />
      </div>
    </>
  );
};

export default SalesQuotation;