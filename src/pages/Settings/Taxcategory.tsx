"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Percent, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Column } from "react-data-grid";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, FilterHeader, ActionsCell } from "../../common/DataTable";
import CreateTaxCategory from "../../components/Createtaxcategory";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  fetchAllTaxCategories,
  deleteTaxCategory,
  type TaxCategoryListItem,
} from "../../store/features/settings/taxcategorySlice";

const BRAND = "#004687";

export default function TaxCategory() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    taxCategoryList,
    taxCategoryListLoading,
    taxCategoryListError,
  } = useSelector((state: RootState) => state.taxCategory);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaxCategoryId, setEditingTaxCategoryId] = useState<number | null>(null);
  const [editingTaxCategoryName, setEditingTaxCategoryName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Delete confirmation state ─────────────────────────────────────────
  const [taxCategoryToDelete, setTaxCategoryToDelete] = useState<TaxCategoryListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch the tax category list on mount
  useEffect(() => {
    dispatch(fetchAllTaxCategories());
  }, [dispatch]);

  const handleDelete = (row: TaxCategoryListItem) => {
    setTaxCategoryToDelete(row);
  };

  const handleEdit = (row: TaxCategoryListItem) => {
    setEditingTaxCategoryId(row.TaxCategoryId);
    setEditingTaxCategoryName(row.TaxCategoryName);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTaxCategoryId(null);
    setEditingTaxCategoryName(null);
    setIsFormOpen(true);
  };

  // Closes the form without saving (Cancel / back arrow)
  const handleFormBack = () => {
    setIsFormOpen(false);
    setEditingTaxCategoryId(null);
    setEditingTaxCategoryName(null);
  };

  // Called after a successful create or update — refresh the list
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTaxCategoryId(null);
    setEditingTaxCategoryName(null);
    dispatch(fetchAllTaxCategories());
  };

  const columns: Column<TaxCategoryListItem>[] = useMemo(
    () => [
      {
        key: "TaxCategoryCode",
        name: "Code",
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={searchQuery}
            onFilterChange={(_, value) => setSearchQuery(value)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-semibold text-slate-700">{row.TaxCategoryCode || "—"}</span>
        ),
      },
      {
        key: "TaxCategoryName",
        name: "Tax Category",
        renderHeaderCell: (props) => (
          <FilterHeader
            column={props.column}
            filterValue={searchQuery}
            onFilterChange={(_, value) => setSearchQuery(value)}
          />
        ),
        renderCell: ({ row }) => (
          <span className="font-medium text-slate-700">{row.TaxCategoryName || "—"}</span>
        ),
      },
      {
        key: "actions",
        name: "Actions",
        width: 110,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDelete(row)}
          />
        ),
      },
    ],
    [searchQuery]
  );

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return taxCategoryList;
    const lowerQuery = searchQuery.toLowerCase();
    return taxCategoryList.filter(
      (r) =>
        r.TaxCategoryName.toLowerCase().includes(lowerQuery) ||
        r.TaxCategoryCode.toLowerCase().includes(lowerQuery)
    );
  }, [taxCategoryList, searchQuery]);

  // Slice rows for pagination
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleDeleteConfirm = async () => {
    if (!taxCategoryToDelete) return;

    try {
      setIsDeleting(true);

      await dispatch(
        deleteTaxCategory({ taxCategoryId: taxCategoryToDelete.TaxCategoryId })
      ).unwrap();

      toast.success("Tax Category deleted successfully!");

      // Refresh the list from the server
      dispatch(fetchAllTaxCategories());

      // Safety check: if deleting leaves current page empty, go back 1 page
      if (paginatedRows.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(typeof error === "string" ? error : "Failed to delete tax category.");
    } finally {
      setIsDeleting(false);
      setTaxCategoryToDelete(null);
    }
  };

  if (isFormOpen) {
    return (
      <CreateTaxCategory
        taxCategoryId={editingTaxCategoryId ?? undefined}
        initialTaxCategoryName={editingTaxCategoryName ?? undefined}
        onBack={handleFormBack}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="TAX CATEGORY"
        subtitle="Manage tax codes and schedules"
        icon={<Percent size={16} className="text-white" />}
        createButtonLabel="CREATE TAX CATEGORY"
        onCreateClick={handleCreate}
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
                placeholder="Search code or tax category"
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 pl-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>
        </div>

        {/* ── Table & Pagination Area ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {taxCategoryListLoading ? (
            <div className="space-y-4 p-4">
              <div className="h-10 w-48 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />

              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="h-14 w-full rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800"
                />
              ))}
            </div>
          ) : taxCategoryListError ? (
            <div className="text-center text-sm text-red-500 py-6 bg-white border border-slate-100 rounded-xl">
              {taxCategoryListError}
            </div>
          ) : (
            <>
              <DataTable columns={columns} rows={paginatedRows} rowKey="TaxCategoryId" />

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

              {filteredRows.length === 0 && (
                <div className="text-center text-sm text-slate-500 py-6 bg-white border border-slate-100 rounded-xl">
                  No records found.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ───────────────────────────── */}
      <AlertDialog
        open={taxCategoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTaxCategoryToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tax category
              {taxCategoryToDelete ? ` "${taxCategoryToDelete.TaxCategoryName}"` : ""}. This
              action cannot be undone.
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
