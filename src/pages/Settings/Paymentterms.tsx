"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchPaymentTerms,
  deletePaymentTerm,
} from "../../store/features/settings/systemsetup/paymenttermsSlice"; // adjust to the slice's actual path
import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreatePaymentTerms from "../../components/Createpaymentterms";
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

const PAGE_SIZE = 15;

interface PaymentTermRow {
  PaymentTermID: number;
  PaymentTerm: string;
  DueDays: number;
}

export default function PaymentTerms() {
  const [view, setView] = useState<"list" | "create">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentTermRow | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { paymentTermsList, paymentTermsLoading, paymentTermDeleting } = useSelector(
    (state: RootState) => state.paymentTerms
  );

  useEffect(() => {
    dispatch(fetchPaymentTerms());
  }, [dispatch]);

  // Back to the list, and pull the latest rows from the server.
  const handleBack = useCallback(() => {
    setView("list");
    setEditingId(null);
    dispatch(fetchPaymentTerms());
  }, [dispatch]);

  const handleEdit = useCallback((row: PaymentTermRow) => {
    setEditingId(row.PaymentTermID);
    setView("create");
  }, []);

  const handleDeleteRequest = useCallback((row: PaymentTermRow) => {
    setDeleteTarget(row);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deletePaymentTerm({ termsId: deleteTarget.PaymentTermID })).unwrap();
      toast.success("Payment term deleted successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete payment term");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, dispatch]);

  const paymentTermRows: PaymentTermRow[] = useMemo(
    () =>
      paymentTermsList.map((term: any) => ({
        PaymentTermID: term.TermsID,
        PaymentTerm: term.PaymentTerm,
        DueDays: term.DueDays,
      })),
    [paymentTermsList]
  );

  const columns: Column<PaymentTermRow>[] = useMemo(
    () => [
      {
        key: "PaymentTerm",
        name: "Payment Term",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "DueDays",
        name: "Due Days",
        resizable: true,
        width: 140,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 90,
        resizable: false,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDeleteRequest(row)}
          />
        ),
      },
    ],
    [handleEdit, handleDeleteRequest]
  );

  if (view === "create") {
    return <CreatePaymentTerms onBack={handleBack} termId={editingId ?? undefined} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="Payment Terms"
          subtitle="Masters"
          icon={<Wallet size={16} className="text-white" />}
          createButtonLabel="Create Payment Terms"
          onCreateClick={() => {
            setEditingId(null);
            setView("create");
          }}
        />
      </div>

      <div className="px-3">
        <DataTable
          columns={columns}
          rows={paymentTermRows}
          rowKey="PaymentTermID"
          loading={paymentTermsLoading}
          loadingLabel="Loading payment terms..."
          pageSize={PAGE_SIZE}
        />
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Term</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.PaymentTerm}"` : " this payment term"}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={paymentTermDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={paymentTermDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {paymentTermDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
