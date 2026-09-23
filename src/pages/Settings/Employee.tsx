"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import {
  Users,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppDispatch, RootState } from "@/store";
// ⚠️ adjust this path to wherever employeeSlice.ts lives in your store/slices folder
import {
  fetchEmployeeList,
  deleteEmployee,
} from "../../store/features/settings/systemsetup/employeeSlice";
import CreateEmployee from "../../components/Createemployee";

const ITEMS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeRow {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  status: string;
}

// ─── Column Definitions ─────────────────────────────────────────────────────

function getColumns(
  onEdit: (row: EmployeeRow) => void,
  onDelete: (row: EmployeeRow) => void
): Column<EmployeeRow>[] {
  return [
    {
      key: "employeeCode",
      name: "Employee Code",
      width: 150,
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.employeeCode}</span>
      ),
    },
    {
      key: "employeeName",
      name: "Employee Name",
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => <span className="text-slate-700">{row.employeeName}</span>,
    },
    {
      key: "department",
      name: "Department",
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => <span className="text-slate-600">{row.department}</span>,
    },
    {
      key: "designation",
      name: "Designation",
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => (
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          {row.designation}
        </span>
      ),
    },
    {
      key: "status",
      name: "Status",
      width: 130,
      renderHeaderCell: (props) => (
        <FilterHeader
          column={props.column}
          filterValue={(props as any).filterValue ?? ""}
          onFilterChange={(props as any).onFilterChange}
        />
      ),
      renderCell: ({ row }) => <StatusBadge label={row.status} />,
    },
    {
      key: "actions",
      name: "Actions",
      width: 90,
      renderCell: ({ row }) => (
        <ActionsCell row={row} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
  ];
}

export default function Employee() {
  const dispatch = useDispatch<AppDispatch>();
  const { employeeList, employeeListLoading, employeeListError, employeeDeleteLoading } =
    useSelector((state: RootState) => state.employee);

  const [view, setView] = useState<"list" | "form">("list");
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

  useEffect(() => {
    if (view !== "list") return;
    dispatch(fetchEmployeeList({ currentPage, rowsPerPage: itemsPerPage, searchStr: "" }));
  }, [dispatch, view, currentPage, itemsPerPage]);

  const rows: EmployeeRow[] = useMemo(
    () =>
      employeeList.map((e) => ({
        id: String(e.EmployeeID),
        employeeCode: e.EmpCode,
        employeeName: e.EmpName,
        department: e.DepartmentName,
        designation: e.DesignationName,
        status: e.Active,
      })),
    [employeeList]
  );

  function openCreate() {
    setEditingEmployeeId(undefined);
    setView("form");
  }

  function openEdit(row: EmployeeRow) {
    setEditingEmployeeId(Number(row.id));
    setView("form");
  }

  function closeForm() {
    setView("list");
    setEditingEmployeeId(undefined);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    dispatch(deleteEmployee({ id: Number(target.id) }))
      .unwrap()
      .then(() => {
        toast.success(`${target.employeeName} deleted.`);
      })
      .catch((err) => {
        toast.error(typeof err === "string" ? err : "Failed to delete employee.");
      });
  }

  const columns = useMemo(() => getColumns(openEdit, (row) => setDeleteTarget(row)), []);

  // ⚠️ GetEmployeeList doesn't return a total record count, so total pages can't
  // be known exactly — a full page of results is treated as "there may be more".
  const hasNextPage = rows.length === itemsPerPage;
  const totalPages = Math.max(currentPage, hasNextPage ? currentPage + 1 : currentPage);

  const rangeStart = rows.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const rangeEnd = (currentPage - 1) * itemsPerPage + rows.length;

  function goToPage(page: number) {
    const clamped = Math.max(1, page);
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  }

  if (view === "form") {
    return <CreateEmployee employeeId={editingEmployeeId} onBack={closeForm} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="EMPLOYEE"
        subtitle="Manage your workforce records"
        icon={<Users size={16} className="text-white" />}
        showCreateButton={true}
        createButtonLabel="Create Employee"
        onCreateClick={openCreate}
      />

      <div className="p-5 space-y-3">
        {/* ── Table ───────────────────────────────────────────────────── */}
        {employeeListError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {employeeListError}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey="id" />
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => goToPage(1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronLeft size={14} />
            </Button>

            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={() => goToPage(Number(pageInput) || 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToPage(Number(pageInput) || 1);
              }}
              className="h-8 w-12 text-center text-xs"
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">/ {totalPages}</span>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="h-8 w-8 bg-white"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
              className="h-8 w-8 bg-white"
            >
              <ChevronsRight size={14} />
            </Button>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                goToPage(1);
              }}
              className="h-8 rounded-md border border-slate-200 bg-white text-xs px-2 text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#004687]/30 cursor-pointer"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500 whitespace-nowrap">items per page</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {employeeListLoading
              ? "Loading..."
              : rows.length
              ? `${rangeStart} - ${rangeEnd}`
              : "No entries found"}
          </div>
        </div>
      </div>

      {/* ── Delete confirmation ─────────────────────────────────────────── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget?.employeeName} ({deleteTarget?.employeeCode})
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={employeeDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={employeeDeleteLoading}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
