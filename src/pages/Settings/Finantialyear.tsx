// Financialyear.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "../../common/PageHeader";
import CreateFinancialyear from "../../components/CreateFinancialyear";
import { fetchAllFinYears } from "../../store/features/settings/financialyearSlice";
import { useDispatch, useSelector } from "react-redux";

const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

interface FinancialYearRow {
  id: string;
  year: string;
  fromDate: string; // DD-MM-YYYY (display)
  toDate: string; // DD-MM-YYYY (display)
  active: boolean;
}

interface FinancialYearApiItem {
  FinYearID: number | string;
  FinYearName: string;
  FromDate: string;
  ToDate: string;
  ActiveFinYear: string;
}

// Converts DD-MM-YYYY <-> YYYY-MM-DD for native <input type="date">
function toInputDate(display: string) {
  if (!display) return "";
  const [d, m, y] = display.split("-");
  return `${y}-${m}-${d}`;
}
function toDisplayDate(inputDate: string) {
  if (!inputDate) return "";
  const [y, m, d] = inputDate.split("-");
  return `${d}-${m}-${y}`;
}

interface FieldShellProps {
  label: string;
  children: React.ReactNode;
}
function FieldShell({ label, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

interface FormState {
  year: string;
  fromDate: string; // yyyy-mm-dd for input
  toDate: string; // yyyy-mm-dd for input
}

const emptyForm: FormState = { year: "", fromDate: "", toDate: "" };

export default function Financialyear() {
  // allow dispatching thunks
  const dispatch = useDispatch<any>();
  const { finYearList, finYearListLoading, finYearListError } = useSelector(
    (state: any) => state.financialYear
  );

  const [view, setView] = useState<"list" | "create">("list");

  const [rows, setRows] = useState<FinancialYearRow[]>([]);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FinancialYearRow | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchAllFinYears());
  }, [dispatch]);

  useEffect(() => {
    const mapped: FinancialYearRow[] = finYearList.map((item:any) => ({
      id: String(item.FinYearID),
      year: item.FinYearName,
      fromDate: item.FromDate,
      toDate: item.ToDate,
      active: item.ActiveFinYear === "Yes",
    }));
    setRows(mapped);
  }, [finYearList]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.year.toLowerCase().includes(term) ||
        r.fromDate.toLowerCase().includes(term) ||
        r.toDate.toLowerCase().includes(term)
    );
  }, [rows, search]);

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * entriesPerPage;
    return filteredRows.slice(start, start + entriesPerPage);
  }, [filteredRows, safePage, entriesPerPage]);

  const rangeStart = totalEntries === 0 ? 0 : (safePage - 1) * entriesPerPage + 1;
  const rangeEnd = Math.min(safePage * entriesPerPage, totalEntries);

  function openEditModal(row: FinancialYearRow) {
    setEditingId(row.id);
    setForm({
      year: row.year,
      fromDate: toInputDate(row.fromDate),
      toDate: toInputDate(row.toDate),
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function handleSave() {
    if (!form.year.trim() || !form.fromDate || !form.toDate) {
      setFormError("All fields are required.");
      return;
    }
    if (form.fromDate >= form.toDate) {
      setFormError("From Date must be before To Date.");
      return;
    }

    const existing = rows.find((r) => r.id === editingId);
    const nextRow: FinancialYearRow = {
      id: editingId ?? crypto.randomUUID(),
      year: form.year.trim(),
      fromDate: toDisplayDate(form.fromDate),
      toDate: toDisplayDate(form.toDate),
      active: existing?.active ?? false,
    };

    setRows((prev) =>
      editingId
        ? prev.map((r) => (r.id === editingId ? nextRow : r))
        : [nextRow, ...prev]
    );
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  if (view === "create") {
    return <CreateFinancialyear onBack={() => setView("list")} />;
  }

  return (
    <div className="border border-slate-200 bg-white overflow-hidden shadow-sm h-full">
      <PageHeader
        title="Financial Year"
        subtitle="Accounting Periods"
        icon={<CalendarRange className="w-4 h-4 text-white" />}
        createButtonLabel="Create Financial Year"
        onCreateClick={() => setView("create")}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="relative w-full max-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search financial year..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: BRAND_LIGHT }}>
              <th
                className="text-left text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-l-lg"
                style={{ color: BRAND }}
              >
                Year
              </th>
              <th
                className="text-left text-xs font-bold uppercase tracking-wide px-4 py-2.5"
                style={{ color: BRAND }}
              >
                From Date
              </th>
              <th
                className="text-left text-xs font-bold uppercase tracking-wide px-4 py-2.5"
                style={{ color: BRAND }}
              >
                To Date
              </th>
              <th
                className="text-right text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-r-lg"
                style={{ color: BRAND }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {finYearListLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading financial years...
                  </div>
                </td>
              </tr>
            ) : finYearListError ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-red-500">
                  {finYearListError}
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-slate-400">
                  No financial years found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      {row.year}
                      {row.active && (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.fromDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.toDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        aria-label="Edit financial year"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Delete financial year"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p className="text-xs text-slate-500">
          {totalEntries === 0
            ? "Showing 0 entries"
            : `Showing ${rangeStart} to ${rangeEnd} of ${totalEntries} entries`}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-8 px-2.5 rounded-md border border-slate-300 text-slate-600 text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className="h-8 w-8 rounded-md text-xs font-semibold cursor-pointer transition-colors"
              style={
                page === safePage
                  ? { backgroundColor: BRAND, color: "white" }
                  : { color: "#475569" }
              }
              onMouseEnter={(e) => {
                if (page !== safePage)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    BRAND_LIGHT;
              }}
              onMouseLeave={(e) => {
                if (page !== safePage)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 px-2.5 rounded-md border border-slate-300 text-slate-600 text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle style={{ color: BRAND }}>
              Edit Financial Year
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <FieldShell label="Year">
              <Input
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="e.g. 2026-2027"
                className="h-9 text-sm"
              />
            </FieldShell>

            <FieldShell label="From Date">
              <input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fromDate: e.target.value }))
                }
                className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]"
              />
            </FieldShell>

            <FieldShell label="To Date">
              <input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, toDate: e.target.value }))
                }
                className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]"
              />
            </FieldShell>

            {formError && (
              <p className="text-xs text-red-500 font-medium">{formError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm cursor-pointer"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 text-sm text-white cursor-pointer"
              style={{ backgroundColor: BRAND }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-slate-800 text-base">Delete Financial Year</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">
              {deleteTarget?.year}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 text-sm text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
