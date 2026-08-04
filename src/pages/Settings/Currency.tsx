import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import { Coins, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, StatusBadge, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreateCurrency from "../../components/Createcurrency";
import { Input } from "@/components/ui/input";
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
import { fetchAllCurrencies, deleteCurrency } from "../../store/features/settings/currencySlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";

export default function Currency() {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCurrencyId, setEditingCurrencyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { currencyList, currencyListLoading, currencyListError } = useSelector(
    (state: RootState) => state.currency
  );

  useEffect(() => {
    dispatch(fetchAllCurrencies());
  }, [dispatch]);

  const rows = useMemo(
    () =>
      currencyList.map((item) => ({
        id: item.CurrencyID,
        code: item.CurrencyCode,
        name: item.Currency,
        status: item.Active,
      })),
    [currencyList]
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "code",
        name: "Code",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="font-medium text-slate-700">{row.code || "—"}</span>
        ),
      },
      {
        key: "name",
        name: "Currency",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="text-slate-600">{row.name || "—"}</span>
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
            onEdit={(r) => setEditingCurrencyId(r.id)}
            onDelete={(r) => setDeleteTarget({ id: r.id, name: r.name || r.code })}
          />
        ),
      },
    ],
    []
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCurrency({ currencyId: deleteTarget.id })).unwrap();
      toast.success("Currency deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete currency.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCreating) {
    return (
      <CreateCurrency
        onBack={() => {
          setIsCreating(false);
          dispatch(fetchAllCurrencies());
        }}
      />
    );
  }

  if (editingCurrencyId != null) {
    return (
      <CreateCurrency
        currencyId={editingCurrencyId}
        onBack={() => {
          setEditingCurrencyId(null);
          dispatch(fetchAllCurrencies());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Currency"
        subtitle="Currency Master"
        icon={<Coins size={16} className="text-white" />}
        createButtonLabel="Create Currency"
        onCreateClick={() => setIsCreating(true)}
      />

      <div className="p-5 space-y-3">
        {/* ── Show entries / Search toolbar ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-16 text-xs border-slate-200 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
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
                placeholder="Search"
                className="h-9 pl-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={currencyListLoading}
          error={currencyListError}
          loadingLabel="Loading currencies…"
        />
      </div>

      {/* ── Delete confirmation dialog ─────────────────────────────────── */}
      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete currency?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
