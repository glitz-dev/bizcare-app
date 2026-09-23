"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { FolderTree, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Column } from "react-data-grid";

import type { AppDispatch, RootState } from "@/store";
import {
    fetchAccountGroups,
    fetchAccGroup,
    clearCreateAccountGroupStatus,
    clearAccGroupDetail,
    checkDeleteAccGroupAllowed,
    deleteAccountGroup,
    clearDeleteAllowedCheck,
    clearDeleteAccountGroupStatus,
    type AccountGroupItem,
    type AccGroupDetail,
} from "../../store/features/settings/financialsetup/accountgroupSlice"; 

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
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

import { Createaccountgroup } from "../../components/Createaccountgroup";

// ─── Row shape actually returned by GetAccountGroupList ──────────────────────
// Server only gives GroupID / GroupName / MajorGroupName — no LinkGroup,
// OrderPosition, Active or Common on the list endpoint, so the row type here
// matches AccountGroupItem from the slice rather than the old mock shape.
export type AccountGroupRow = AccountGroupItem;

const ROWS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type ViewMode = "list" | "create" | "edit";

export default function Accountgroup() {
    const dispatch = useDispatch<AppDispatch>();

    // Adjust `state.accountGroup` below to match whatever key this slice is
    // mounted under in your root reducer.
    const {
        accountGroupList,
        accountGroupListLoading,
        accGroupDetailLoading,
        deleteAccountGroupLoading,
    } = useSelector((state: RootState) => state.accountGroup as any);

    const [view, setView] = useState<ViewMode>("list");
    const [editingRow, setEditingRow] = useState<AccGroupDetail | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AccountGroupRow | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [groupNameFilter, setGroupNameFilter] = useState("");

    const hasMounted = useRef(false);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadPage = (page: number, searchStr: string) => {
        dispatch(
            fetchAccountGroups({
                currentPage: page,
                rowsPerPage: ROWS_PER_PAGE,
                searchStr,
            })
        );
    };

    // Fetch on mount
    useEffect(() => {
        if (hasMounted.current) return;
        hasMounted.current = true;
        loadPage(1, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch whenever the page changes (after mount)
    useEffect(() => {
        if (!hasMounted.current) return;
        loadPage(currentPage, groupNameFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Debounced search — resets to page 1 whenever the Group filter changes
    const handleGroupNameFilterChange = (value: string) => {
        setGroupNameFilter(value);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setCurrentPage(1);
            loadPage(1, value);
        }, SEARCH_DEBOUNCE_MS);
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    // Heuristic pagination: the list endpoint doesn't return a total count,
    // so "has a next page" is inferred from getting a full page back.
    const rows: AccountGroupRow[] = accountGroupList ?? [];
    const hasNextPage = rows.length === ROWS_PER_PAGE;
    const hasPrevPage = currentPage > 1;

    const handleCreateClick = () => {
        setEditingRow(null);
        setView("create");
    };

    const handleEdit = async (row: AccountGroupRow) => {
        const result = await dispatch(fetchAccGroup({ accGroupId: row.GroupID }));
        if (fetchAccGroup.fulfilled.match(result) && result.payload) {
            setEditingRow(result.payload);
            setView("edit");
        } else {
            toast.error(
                (fetchAccGroup.rejected.match(result) ? result.payload : null) ??
                    "Failed to load account group details"
            );
        }
    };

    // DeleteGrpYN?ID= — checked before we even show the confirmation dialog,
    // so we don't ask "Delete this?" and then fail right after the user says yes.
    const handleDeleteRequest = async (row: AccountGroupRow) => {
        const result = await dispatch(checkDeleteAccGroupAllowed({ groupId: row.GroupID }));
        if (checkDeleteAccGroupAllowed.fulfilled.match(result)) {
            if (result.payload) {
                setDeleteTarget(row);
            } else {
                toast.error(`"${row.GroupName}" cannot be deleted`);
            }
        } else {
            toast.error(
                (checkDeleteAccGroupAllowed.rejected.match(result) ? result.payload : null) ??
                    "Could not verify whether this account group can be deleted"
            );
        }
    };

    const closeDeleteDialog = () => {
        setDeleteTarget(null);
        dispatch(clearDeleteAllowedCheck());
        dispatch(clearDeleteAccountGroupStatus());
    };

    // DeleteAccGroup?AccGroupID= — fired once the user confirms in the dialog.
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await dispatch(deleteAccountGroup({ accGroupId: deleteTarget.GroupID }));
        if (deleteAccountGroup.fulfilled.match(result)) {
            toast.success(`"${deleteTarget.GroupName}" deleted`);
            closeDeleteDialog();
            loadPage(currentPage, groupNameFilter);
        } else {
            toast.error((result.payload as string) ?? "Failed to delete account group");
        }
    };

    // Fired by Createaccountgroup once CreateNewAccGroup has already
    // succeeded (it owns the dispatch, duplicate-name check, and its own
    // loading/error/toast handling) — we just close the form and resync
    // the list from the server rather than patching the row in locally.
    const handleCreateSuccess = (_payload: AccGroupDetail) => {
        setView("list");
        setEditingRow(null);
        loadPage(currentPage, groupNameFilter);
    };

    const columns: Column<AccountGroupRow>[] = useMemo(
        () => [
            {
                key: "GroupName",
                name: "Group",
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={groupNameFilter}
                        onFilterChange={handleGroupNameFilterChange}
                    />
                ),
                renderCell: ({ row }: { row: AccountGroupRow }) => (
                    <span className="text-slate-700 font-medium">{row.GroupName}</span>
                ),
            },
            {
                key: "MajorGroupName",
                name: "Major Group",
                renderHeaderCell: (props: any) => (
                    <FilterHeader column={props.column} filterValue="" onFilterChange={() => {}} />
                ),
                renderCell: ({ row }: { row: AccountGroupRow }) => (
                    <span className="text-slate-500">{row.MajorGroupName}</span>
                ),
            },
            {
                key: "actions",
                name: "Actions",
                width: 100,
                renderCell: ({ row }: { row: AccountGroupRow }) => (
                    <ActionsCell row={row} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [groupNameFilter]
    );

    if (view === "create" || view === "edit") {
        return (
            <Createaccountgroup
                initialData={editingRow ?? undefined}
                onSubmit={handleCreateSuccess}
                onCancel={() => {
                    setView("list");
                    setEditingRow(null);
                    dispatch(clearCreateAccountGroupStatus());
                    dispatch(clearAccGroupDetail());
                }}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden shadow-sm">
                <PageHeader
                    title="Account Group"
                    subtitle="Accounts · Master Data"
                    icon={<FolderTree size={16} className="text-white" />}
                    createButtonLabel="Create Account Group"
                    onCreateClick={handleCreateClick}
                />
            </div>

            <div className="px-5">
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey="GroupID"
                    pageSize={ROWS_PER_PAGE}
                    loadingLabel="Loading account groups…"
                    loading={accountGroupListLoading || accGroupDetailLoading}
                />

                {/* Server-driven pagination — the list endpoint has no total
                    count, so Next is enabled whenever a full page came back. */}
                <div className="flex items-center justify-end gap-3 py-3">
                    <span className="text-xs text-slate-500">Page {currentPage}</span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrevPage || accountGroupListLoading}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!hasNextPage || accountGroupListLoading}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && closeDeleteDialog()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete account group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-semibold text-slate-700">{deleteTarget?.GroupName}</span>{" "}
                            from the list. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteAccountGroupLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteAccountGroupLoading}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-1.5"
                        >
                            {deleteAccountGroupLoading && <Loader2 size={13} className="animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
