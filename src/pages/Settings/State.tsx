import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import { MapPinned, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, StatusBadge, ActionsCell, FilterHeader } from "../../common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Added Button for pagination
import CreateState from "../../components/Createstate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import type { AppDispatch, RootState } from "@/store";
import { fetchAllStates, deleteState } from "../../store/features/settings/stateSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";

export default function State() {
  const [isCreating, setIsCreating] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { stateList, stateListLoading } = useSelector((state: RootState) => state.state);

  // States for Delete Dialog
  const [stateToDelete, setStateToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Pagination & Search States ─────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); // Defaults to 15 per page
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all states whenever this component is active
  useEffect(() => {
    if (!isCreating) {
      dispatch(fetchAllStates());
    }
  }, [dispatch, isCreating]);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "code",
        name: "Code",
        width: 100,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="font-semibold text-slate-700">{row.code || "—"}</span>
        ),
      },
      {
        key: "state",
        name: "State",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="font-medium text-slate-700">{row.state || "—"}</span>
        ),
      },
      {
        key: "status",
        name: "Status",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => <StatusBadge label={row.status} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={() => { }}
            onDelete={() => setStateToDelete(row.id)}
          />
        ),
      },
    ],
    []
  );

  // 1. Map raw Redux data to rows
  const formattedRows = useMemo(() => {
    return stateList.map((item) => ({
      id: item.StateID,
      code: item.StateCode,
      state: item.StateName,
      status: item.Active,
    }));
  }, [stateList]);

  // 2. Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return formattedRows;
    const lowerQuery = searchQuery.toLowerCase();
    return formattedRows.filter(
      (r) =>
        r.state?.toLowerCase().includes(lowerQuery) ||
        r.code?.toLowerCase().includes(lowerQuery)
    );
  }, [formattedRows, searchQuery]);

  // 3. Slice rows for pagination
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleDeleteConfirm = async () => {
    if (stateToDelete === null) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteState({ stateId: stateToDelete })).unwrap();
      dispatch(fetchAllStates());

      // Safety check: if deleting leaves current page empty, go back 1 page
      if (paginatedRows.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (error) {
      alert(typeof error === "string" ? error : "Failed to delete state");
    } finally {
      setIsDeleting(false);
      setStateToDelete(null);
    }
  };

  if (isCreating) {
    return <CreateState onBack={() => setIsCreating(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="State"
        subtitle="State Master"
        icon={<MapPinned size={16} className="text-white" />}
        createButtonLabel="Create State"
        onCreateClick={() => setIsCreating(true)}
      />

      <div className="p-5 space-y-3">
        {/* ── Show entries / Search toolbar ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Show</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                setRowsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16 text-xs border-slate-200 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs font-semibold text-slate-600">entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Search:</span>
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search code or state"
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 pl-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>
        </div>

        {/* ── Table & Pagination Area ───────────────────────────────────────────── */}
        {stateListLoading ? (
          <div className="space-y-4 p-4">
            <div className="h-10 w-48 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />

            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="h-14 w-full rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable columns={columns} rows={paginatedRows} rowKey="id" />

            {/* Pagination Controls */}
            {filteredRows.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-xs text-slate-500 font-medium">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs px-3 bg-white"
                  >
                    <ChevronLeft size={14} className="mr-1" /> Prev
                  </Button>
                  <div className="text-xs font-semibold px-2 text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs px-3 bg-white"
                  >
                    Next <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {filteredRows.length === 0 && !stateListLoading && (
              <div className="text-center text-sm text-slate-500 py-6 bg-white border border-slate-100 rounded-xl">
                No records found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Dialog ───────────────────────────── */}
      <AlertDialog
        open={stateToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setStateToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
