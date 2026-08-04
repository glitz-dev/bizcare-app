import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GitBranch,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Check,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "../../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import { fetchAllBranches } from "../../store/features/settings/branchSlice";
import CreateBranch from "../../components/Createbranch";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
}

const ENTRY_OPTIONS = [10, 25, 50, 100];

// ─── Shared labeled-field wrapper (matches Chart of Accounts / Organisation modals) ─
function FieldShell({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md shrink-0"
          style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
        >
          {icon}
        </span>
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

type ViewMode = "list" | "create";

export default function Branch() {
  const [view, setView] = useState<ViewMode>("list");

  const dispatch = useDispatch<AppDispatch>();
  const { branchList, branchListLoading, branchListError } = useSelector(
    (s: RootState) => s.branch
  );

  useEffect(() => {
    dispatch(fetchAllBranches());
  }, [dispatch]);

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    setBranches(
      branchList.map((b) => ({
        id: String(b.BranchID),
        code: b.BranchCode,
        name: b.BranchName,
        address: b.Address ?? "",
      }))
    );
  }, [branchList]);

  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  // ─── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.address.toLowerCase().includes(term)
    );
  }, [branches, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * entriesPerPage;
  const pageRows = filtered.slice(startIdx, startIdx + entriesPerPage);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  function openCreateView() {
    setView("create");
  }

  function handleCreateSubmit(data: { code: string; name: string; address: string }) {
    if (!data.code.trim() || !data.name.trim()) return;
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      code: data.code.trim(),
      name: data.name.trim(),
      address: data.address.trim(),
    };
    setBranches((prev) => [newBranch, ...prev]);
  }

  function openEditDialog(branch: Branch) {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setDialogOpen(true);
  }

  function handleReset() {
    setFormName(editingBranch?.name ?? "");
    setFormAddress(editingBranch?.address ?? "");
  }

  function handleSave() {
    if (!editingBranch || !formName.trim()) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? { ...b, name: formName.trim(), address: formAddress.trim() }
          : b
      )
    );
    setDialogOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  if (view === "create") {
    return <CreateBranch onBack={() => setView("list")} onSubmit={handleCreateSubmit} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Branch"
        subtitle="Branch Setup"
        icon={<GitBranch size={16} className="text-white" />}
        createButtonLabel="Create Branch"
        showCreateButton
        onCreateClick={openCreateView}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <Select
                value={String(entriesPerPage)}
                onValueChange={(v) => {
                  setEntriesPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="h-8 w-[68px] text-xs border-slate-200 bg-slate-50 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search branch..."
                className="h-8 pl-8 text-xs border-slate-200 bg-slate-50 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5 w-64">
                    Branch
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5">
                    Address
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5 w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchListLoading && branches.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-400 py-10">
                      Loading branches...
                    </td>
                  </tr>
                ) : branchListError ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-red-500 py-10">
                      {branchListError}
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-400 py-10">
                      No matching branches found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((branch) => (
                    <tr
                      key={branch.id}
                      className="group border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {branch.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {branch.address || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditDialog(branch)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#004687] hover:bg-[#004687]/[0.08] transition-colors cursor-pointer"
                            aria-label={`Edit ${branch.name}`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(branch)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label={`Delete ${branch.name}`}
                          >
                            <Trash2 size={13} />
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filtered.length === 0 ? 0 : startIdx + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-600">
                {Math.min(startIdx + entriesPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-600">{filtered.length}</span> entries
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium border border-slate-200 flex items-center gap-1",
                  safePage === 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:bg-slate-50 cursor-pointer"
                )}
              >
                <ChevronLeft size={12} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "h-7 w-7 rounded-lg text-[11px] font-semibold border transition-colors",
                    p === safePage
                      ? "text-white border-transparent"
                      : "text-slate-500 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  )}
                  style={p === safePage ? { backgroundColor: BRAND } : undefined}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium border border-slate-200 flex items-center gap-1",
                  safePage === totalPages
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:bg-slate-50 cursor-pointer"
                )}
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
              >
                <GitBranch size={17} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-slate-800">
                  Edit Branch
                </DialogTitle>
                <p className="text-[11px] text-slate-400 truncate">
                  Updating "{editingBranch?.name}"
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 space-y-4">
            <FieldShell icon={<Building2 size={11} />} label="Branch Name">
              <Input
                autoFocus
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Main Branch"
                className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </FieldShell>

            <FieldShell icon={<MapPin size={11} />} label="Address">
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Address"
                rows={3}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </FieldShell>
          </div>

          <DialogFooter className="px-5 py-4 border-t border-slate-100 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-9 text-xs font-semibold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!formName.trim()}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              <Check size={14} />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-red-50 text-red-600">
                <Trash2 size={17} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-slate-800">
                  Delete Branch
                </DialogTitle>
                <p className="text-[11px] text-slate-400 truncate">This cannot be undone</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">"{deleteTarget?.name}"</span>?
            </p>
          </div>

          <DialogFooter className="px-5 py-4 border-t border-slate-100 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
