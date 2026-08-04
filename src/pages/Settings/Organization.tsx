import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Hash,
  FileText,
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
import { fetchGetLoginDetails } from "../../store/features/settings/organizationSlice";
import CreateOrganization from "../../components/CreateOrganization";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Table row shape (mapped from GetLoginDetails) ─────────────────────────
interface Organisation {
  id: string;
  code: string;
  name: string;
}

const ENTRY_OPTIONS = [10, 25, 50, 100];

// ─── Shared labeled-field wrapper (matches Chart of Accounts modals) ───────
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

export default function Organization() {
  const dispatch = useDispatch<AppDispatch>();
  const { loginDetailsList, loginDetailsLoading } = useSelector(
    (s: RootState) => s.organization
  );

  const [view, setView] = useState<ViewMode>("list");

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");

  // ─── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchGetLoginDetails());
  }, [dispatch]);

  // ─── Populate the table from the API response ──────────────────────────────
  useEffect(() => {
    setOrganisations(
      loginDetailsList.map((item) => ({
        id: String(item.CompanyId),
        code: item.CompanyCode,
        name: item.CompanyName,
      }))
    );
  }, [loginDetailsList]);

  // ─── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return organisations;
    return organisations.filter(
      (o) =>
        o.code.toLowerCase().includes(term) ||
        o.name.toLowerCase().includes(term)
    );
  }, [organisations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * entriesPerPage;
  const pageRows = filtered.slice(startIdx, startIdx + entriesPerPage);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  function openCreateDialog() {
    setView("create");
  }

  function handleCreateSubmit(data: { name: string; code: string }) {
    if (!data.code.trim() || !data.name.trim()) return;
    const newOrg: Organisation = {
      id: crypto.randomUUID(),
      code: data.code.trim(),
      name: data.name.trim(),
    };
    setOrganisations((prev) => [newOrg, ...prev]);
  }

  function openEditDialog(org: Organisation) {
    setEditingOrg(org);
    setFormCode(org.code);
    setFormName(org.name);
    setDialogOpen(true);
  }

  function handleReset() {
    setFormCode(editingOrg?.code ?? "");
    setFormName(editingOrg?.name ?? "");
  }

  function handleSave() {
    if (!editingOrg || !formCode.trim() || !formName.trim()) return;

    setOrganisations((prev) =>
      prev.map((o) =>
        o.id === editingOrg.id ? { ...o, code: formCode.trim(), name: formName.trim() } : o
      )
    );
    setDialogOpen(false);
  }

  if (view === "create") {
    return (
      <CreateOrganization
        onBack={() => setView("list")}
        onSubmit={handleCreateSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Organisation"
        subtitle="Organisation Setup"
        icon={<Building2 size={16} className="text-white" />}
        createButtonLabel="Create Organisation"
        showCreateButton
        onCreateClick={openCreateDialog}
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
                placeholder="Search organisation..."
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
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5 w-32">
                    Code
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5">
                    Organisation
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5 w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loginDetailsLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-400 py-10">
                      Loading organisations...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-400 py-10">
                      No matching organisations found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((org) => (
                    <tr
                      key={org.id}
                      className="group border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {org.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{org.name}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEditDialog(org)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#004687] hover:bg-[#004687]/[0.08] transition-colors cursor-pointer"
                          aria-label={`Edit ${org.name}`}
                        >
                          <Pencil size={13} />
                        </button>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
              >
                <Building2 size={17} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-slate-800">
                  Edit Organisation
                </DialogTitle>
                <p className="text-[11px] text-slate-400 truncate">
                  Updating "{editingOrg?.name}"
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <FieldShell icon={<Hash size={11} />} label="Code">
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. C1"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>

            <div className="sm:col-span-2">
              <FieldShell icon={<FileText size={11} />} label="Organisation Name">
                <Input
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Adarsh Co-operative Society"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>
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
              disabled={!formCode.trim() || !formName.trim()}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              <Plus size={14} />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
