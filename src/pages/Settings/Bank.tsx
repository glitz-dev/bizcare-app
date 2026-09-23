import { useEffect, useMemo, useState } from "react";
import type { Column } from "react-data-grid";
import { Landmark, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, StatusBadge, ActionsCell, FilterHeader } from "../../common/DataTable";
import { Input } from "@/components/ui/input";
import CreateBank from "../../components/Createbank";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchAllBanks,
  checkBankDuplication,
  fetchBank,
  type BankDetail,
} from "../../store/features/settings/bankSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";

export default function Bank() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { bankList } = useSelector((state: RootState) => state.bank);

  useEffect(() => {
    dispatch(fetchAllBanks());
  }, [dispatch]);

  const handleEdit = async (row: { id: number; bank: string }) => {
    try {
      await dispatch(
        checkBankDuplication({ bankName: row.bank, bankId: row.id })
      ).unwrap();

      const bank = await dispatch(fetchBank({ bankId: row.id })).unwrap();

      setEditingBank(bank);
      setIsCreating(true);
    } catch (err) {
      console.error("Failed to load bank for edit:", err);
    }
  };

  const rows = useMemo(
    () =>
      bankList.map((b) => ({
        id: b.BankID,
        bank: b.BankName,
        address: b.Address ?? "",
        status: b.Active,
      })),
    [bankList]
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "bank",
        name: "Bank",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="font-medium text-slate-700">{row.bank || "—"}</span>
        ),
      },
      {
        key: "address",
        name: "Address",
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <span className="text-slate-600">{row.address || "—"}</span>
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
          <ActionsCell row={row} onEdit={() => handleEdit(row)} onDelete={() => {}} />
        ),
      },
    ],
    [handleEdit]
  );

  if (isCreating) {
    return (
      <CreateBank
        editBank={editingBank}
        onBack={() => {
          setIsCreating(false);
          setEditingBank(null);
          dispatch(fetchAllBanks());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Bank"
        subtitle="Bank Master"
        icon={<Landmark size={16} className="text-white" />}
        createButtonLabel="Create Bank"
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

        <DataTable columns={columns} rows={rows} rowKey="id" />
      </div>
    </div>
  );
}
