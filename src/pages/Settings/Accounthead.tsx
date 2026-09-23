"use client";

import { useEffect, useMemo, useState } from "react";
import type { Column } from "react-data-grid";
import { Landmark } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/store";
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

import { PageHeader } from "../../common/PageHeader";
import {
  DataTable,
  ActionsCell,
  FilterHeader,
  StatusBadge,
} from "../../common/DataTable";
import { CreateAccountHead } from "../../components/Createaccounthead";
// Adjust this import path to match where accountHeadSlice.ts lives in the project.
import {
  fetchAccountHeads,
  checkAccHeadDeletable,
  deleteAccountHead,
} from "../../store/features/settings/financialsetup/accountheadSlice"

interface AccountHeadRow {
  AccHeadId: number;
  AccCode: string;
  AccHeadName: string;
  AccGroupName: string;
  ActiveYN: boolean;
}

const columns: Column<AccountHeadRow>[] = [
  {
    key: "AccCode",
    name: "Account Code(Alias)",
    renderHeaderCell: (props: any) => <FilterHeader {...props} />,
    width: 260,
  },
  {
    key: "AccHeadName",
    name: "Account Head",
    renderHeaderCell: (props: any) => <FilterHeader {...props} />,
    width: 300,
  },
  {
    key: "AccGroupName",
    name: "Account Group",
    renderHeaderCell: (props: any) => <FilterHeader {...props} />,
    width: 280,
  },
  {
    key: "ActiveYN",
    name: "Status",
    renderHeaderCell: (props: any) => <FilterHeader {...props} />,
    renderCell: ({ row }) => (
      <StatusBadge label={row.ActiveYN ? "Approved" : "Rejected"} />
    ),
    width: 270,
  },
  {
    key: "actions",
    name: "Actions",
    renderCell: ({ row }) => (
      <ActionsCell row={row} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
    ),
    width: 160,
    resizable: false,
  },
];

export function AccountHead() {
  const [view, setView] = useState<"list" | "create">("list");
  const [editHeadId, setEditHeadId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountHeadRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checkingDeletable, setCheckingDeletable] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const accountHeadList = useSelector((state: RootState) => state.accountHead.accountHeadList);
  const loading = useSelector((state: RootState) => state.accountHead.accountHeadListLoading);
  const error = useSelector((state: RootState) => state.accountHead.accountHeadListError);

  useEffect(() => {
    dispatch(fetchAccountHeads());
  }, [dispatch]);

  const handleEdit = (headId: number) => {
    setEditHeadId(headId);
    setView("create");
  };

  const handleBack = () => {
    setEditHeadId(null);
    setView("list");
  };

  const handleDelete = async (row: AccountHeadRow) => {
    setCheckingDeletable(true);
    try {
      const canDelete = await dispatch(
        checkAccHeadDeletable({ headId: row.AccHeadId })
      ).unwrap();

      if (!canDelete) {
        toast.error("This account head is in use and cannot be deleted.");
        return;
      }

      setDeleteTarget(row);
      setConfirmOpen(true);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to check account head. Please try again.");
    } finally {
      setCheckingDeletable(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await dispatch(deleteAccountHead({ headId: deleteTarget.AccHeadId })).unwrap();
      toast.success(`"${deleteTarget.AccHeadName}" was deleted successfully.`);
      setConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete account head. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Map the slice's AccountHeadItem shape onto the row shape DataTable/columns expect.
  const rows: AccountHeadRow[] = useMemo(
    () =>
      accountHeadList.map((item: any) => ({
        AccHeadId: item.HeadID,
        AccCode: item.HeadCode ?? "",
        AccHeadName: item.HeadName ?? "",
        AccGroupName: item.GroupName,
        ActiveYN: item.Active === "Active",
      })),
    [accountHeadList]
  );

  const columnsWithActions: Column<AccountHeadRow>[] = useMemo(
    () =>
      columns.map((col) =>
        col.key === "actions"
          ? {
              ...col,
              renderCell: ({ row }: { row: AccountHeadRow }) => (
                <ActionsCell
                  row={row}
                  onView={() => {}}
                  onEdit={() => handleEdit(row.AccHeadId)}
                  onDelete={() => handleDelete(row)}
                />
              ),
            }
          : col
      ),
    []
  );

  if (view === "create") {
    return <CreateAccountHead onBack={handleBack} headId={editHeadId ?? undefined} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white shadow-sm overflow-hidden">
        <PageHeader
          title="Account Head"
          subtitle="Chart of Accounts"
          icon={<Landmark size={16} className="text-white" />}
          createButtonLabel="Create Account Head"
          onCreateClick={() => setView("create")}
        />
      </div>

      <div className="px-4">
        <DataTable
          columns={columnsWithActions}
          rows={rows}
          rowKey="AccHeadId"
          loading={loading}
          error={error}
          loadingLabel="Loading account heads…"
          pageSize={15}
        />
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setConfirmOpen(open);
            if (!open) setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account head?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.AccHeadName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AccountHead;
