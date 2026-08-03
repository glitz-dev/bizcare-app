"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Column } from "react-data-grid";
import {
  Landmark,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  FolderTree,
  Wallet,
  RefreshCcw,
  AlertCircle,
  FolderPlus,
  Link2,
  ListOrdered,
  RotateCcw,
  FilePlus2,
  Hash,
  FileText,
  Layers,
  ArrowLeftRight,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { PageHeader } from "../../../../common/PageHeader";
import { DataTable, ActionsCell } from "../../../../common/DataTable";

// NOTE: adjust this import path to wherever chartAccountsSlice.ts actually lives
import {
  fetchMajorGroupAndGroups,
  fetchAccHeadsForOpening,
  clearAccHeadsForOpeningList,
  checkGroupDuplication,
  clearGroupDuplication,
  createAccountGroup,
  updateAccountGroup,
  createAccountHead,
  updateAccountHead,
  checkAccountHeadDuplication,
  clearHeadDuplication,
  deleteAccountGroup,
  deleteAccountHead,
  isUsedAccHead,
  removeAccountHead,
  fetchAccHead,
  clearAccHeadDetail,
  MajorGroupItem,
  AccountHeadDetailItem,
} from "../../../../store/features/Accounts/accounts/chartAccountsSlice";
import type { AppDispatch, RootState } from "@/store";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";
const BRAND_MID = "#3D6FA3";

// ─── Types ──────────────────────────────────────────────────────────────────
interface LedgerRow {
  id: string;
  slNo: number;
  code: string;
  accountName: string;
  credit: number;
  debit: number;
}

const currency = (n: number) =>
  n === 0
    ? "—"
    : new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

// ─── Tree helpers ───────────────────────────────────────────────────────────
function filterTree(nodes: MajorGroupItem[], query: string): MajorGroupItem[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<MajorGroupItem[]>((acc, node) => {
    const titleMatches = node.title.toLowerCase().includes(q);
    const filteredChildren = filterTree(node.items ?? [], query);
    if (titleMatches) {
      acc.push(node);
    } else if (filteredChildren.length > 0) {
      acc.push({ ...node, items: filteredChildren });
    }
    return acc;
  }, []);
}

function findPath(
  nodes: MajorGroupItem[],
  id: number,
  trail: MajorGroupItem[] = []
): MajorGroupItem[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === id) return nextTrail;
    if (node.items?.length) {
      const found = findPath(node.items, id, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

// ─── Row action menu (shadcn dropdown, replaces the 4-icon row) ────────────
function RowActionsMenu({
  onAddChild,
  onEdit,
  onDelete,
  onAddAccountHead,
  isMajorGroup,
}: {
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddAccountHead: () => void;
  isMajorGroup: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 transition-all duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-52 p-1.5 rounded-xl border border-slate-200/80 shadow-lg shadow-slate-900/[0.06] backdrop-blur-sm"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          className="group/item gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-medium text-slate-600 focus:bg-[#004687]/[0.06] focus:text-[#004687] cursor-pointer transition-colors"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#004687]/10 text-[#004687] transition-colors group-hover/item:bg-[#004687]/15">
            <Plus size={13} />
          </span>
          {isMajorGroup ? "Add Group" : "Add Sub Group"}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="group/item gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-medium text-slate-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer transition-colors"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-500 transition-colors group-hover/item:bg-amber-100">
            <Pencil size={12} />
          </span>
          Rename
        </DropdownMenuItem>

        {!isMajorGroup && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onAddAccountHead();
            }}
            className="group/item gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-medium text-slate-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer transition-colors"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-500 transition-colors group-hover/item:bg-emerald-100">
              <FilePlus2 size={12} />
            </span>
            Add Account Head
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="group/item gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-medium text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer transition-colors"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500 transition-colors group-hover/item:bg-red-100">
            <Trash2 size={12} />
          </span>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Modern "Create Account Group" modal ────────────────────────────────────
interface GroupModalContext {
  mode: "group" | "subgroup"; // "group" = child of a Major Group, "subgroup" = child of a Group
  majorGroup: MajorGroupItem | null;
  parentGroup: MajorGroupItem | null; // the "Link Group" being nested under
}

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

function CreateGroupModal({
  open,
  context,
  onOpenChange,
  onSubmit,
  submitting = false,
  errorMessage = null,
}: {
  open: boolean;
  context: GroupModalContext | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    majorGroupId: number | null;
    parentGroupId: number | null;
    orderPosition: string;
  }) => void;
  submitting?: boolean;
  errorMessage?: string | null;
}) {
  const emptyForm = { name: "", orderPosition: "" };
  const [form, setForm] = useState(emptyForm);

  // Reset the form whenever a fresh context is opened
  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open, context]);

  if (!context) return null;

  const isSubGroup = context.mode === "subgroup";
  const title = isSubGroup ? "Create Sub Group" : "Create Account Group";

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      majorGroupId: context.majorGroup?.id ?? null,
      parentGroupId: context.parentGroup?.id ?? null,
      orderPosition: form.orderPosition,
    });
  };

  const handleReset = () => setForm(emptyForm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              <FolderPlus size={17} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-slate-800">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-slate-400 truncate">
                {isSubGroup
                  ? `Nested under "${context.parentGroup?.title}"`
                  : `Directly under "${context.majorGroup?.title}"`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FieldShell icon={<FolderTree size={11} />} label="Sub Group">
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Account Group Name"
                className={cn(
                  "h-9 text-sm border-slate-200 focus-visible:ring-1",
                  errorMessage && "border-red-300 focus-visible:ring-red-300"
                )}
                style={{ ["--tw-ring-color" as any]: errorMessage ? "#f87171" : BRAND }}
              />
              {errorMessage && (
                <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errorMessage}
                </p>
              )}
            </FieldShell>
          </div>

          <FieldShell icon={<Landmark size={11} />} label="Major Group">
            <Input
              value={context.majorGroup?.title ?? ""}
              disabled
              className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
            />
          </FieldShell>

          <FieldShell icon={<Link2 size={11} />} label="Account Group">
            <Input
              value={context.parentGroup?.title ?? "— Top level —"}
              disabled
              className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
            />
          </FieldShell>

          <div className="sm:col-span-2">
            <FieldShell icon={<ListOrdered size={11} />} label="Ordering Position">
              <Input
                type="number"
                value={form.orderPosition}
                onChange={(e) => setForm((f) => ({ ...f, orderPosition: e.target.value }))}
                placeholder="Order Position (optional)"
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
            disabled={submitting}
            className="h-9 text-xs font-semibold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name.trim() || submitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
            style={{ backgroundColor: BRAND }}
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Checking…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modern "Create Account Head" modal ─────────────────────────────────────
interface AccountHeadModalContext {
  group: MajorGroupItem;
  majorGroup: MajorGroupItem | null;
}

function CreateAccountHeadModal({
  open,
  context,
  onOpenChange,
  onSubmit,
  submitting = false,
  errorMessage = null,
}: {
  open: boolean;
  context: AccountHeadModalContext | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    code: string;
    name: string;
    groupId: number;
    majorGroupId: number | null;
    openingBalance: string;
    balanceType: "Debit" | "Credit";
  }) => void;
  submitting?: boolean;
  errorMessage?: string | null;
}) {
  const emptyForm = { code: "", name: "", openingBalance: "0", balanceType: "Debit" as "Debit" | "Credit" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open, context]);

  if (!context) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      groupId: context.group.id,
      majorGroupId: context.majorGroup?.id ?? null,
      openingBalance: form.openingBalance,
      balanceType: form.balanceType,
    });
  };

  const handleReset = () => setForm(emptyForm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              <FilePlus2 size={17} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-slate-800">
                Create Account Head
              </DialogTitle>
              <p className="text-[11px] text-slate-400 truncate">
                Adding a ledger under &quot;{context.group.title}&quot;
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <FieldShell icon={<Hash size={11} />} label="Account Code (Alias)">
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Account Code"
                className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </FieldShell>
          </div>

          <div className="sm:col-span-2">
            <FieldShell icon={<FileText size={11} />} label="Account Head">
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Account Name"
                className={cn(
                  "h-9 text-sm border-slate-200 focus-visible:ring-1",
                  errorMessage && "border-red-300 focus-visible:ring-red-300"
                )}
                style={{ ["--tw-ring-color" as any]: errorMessage ? "#f87171" : BRAND }}
              />
              {errorMessage && (
                <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errorMessage}
                </p>
              )}
            </FieldShell>
          </div>

          <div className="sm:col-span-1">
            <FieldShell icon={<Layers size={11} />} label="Account Group">
              <Input
                value={context.group.title}
                disabled
                className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
              />
            </FieldShell>
          </div>

          <div className="sm:col-span-2">
            <FieldShell icon={<Landmark size={11} />} label="Major Group">
              <Input
                value={context.majorGroup?.title ?? ""}
                disabled
                className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
              />
            </FieldShell>
          </div>

          <div className="sm:col-span-1">
            <FieldShell icon={<Wallet size={11} />} label="Opening Balance">
              <Input
                type="number"
                value={form.openingBalance}
                onChange={(e) => setForm((f) => ({ ...f, openingBalance: e.target.value }))}
                placeholder="0"
                className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </FieldShell>
          </div>

          <div className="sm:col-span-1">
            <FieldShell icon={<ArrowLeftRight size={11} />} label="Dr./Cr.">
              <Select
                value={form.balanceType}
                onValueChange={(v) => setForm((f) => ({ ...f, balanceType: v as "Debit" | "Credit" }))}
              >
                <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </FieldShell>
          </div>
        </div>

        <DialogFooter className="px-5 py-7 border-t border-slate-100 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={submitting}
            className="h-9 text-xs font-semibold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name.trim() || submitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
            style={{ backgroundColor: BRAND }}
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Checking…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modern "Edit Account Head" modal ───────────────────────────────────────
function EditAccountHeadModal({
  open,
  detail,
  loading,
  onOpenChange,
  onSubmit,
  submitting = false,
  errorMessage = null,
}: {
  open: boolean;
  detail: AccountHeadDetailItem | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    code: string;
    name: string;
    openingBalance: string;
    balanceType: "Debit" | "Credit";
  }) => void;
  submitting?: boolean;
  errorMessage?: string | null;
}) {
  const emptyForm = { code: "", name: "", openingBalance: "0", balanceType: "Debit" as "Debit" | "Credit" };
  const [form, setForm] = useState(emptyForm);

  // Populate the form once the account head detail arrives from fetchAccHead
  useEffect(() => {
    if (open && detail) {
      setForm({
        code: detail.HeadCode ?? "",
        name: detail.HeadName ?? "",
        openingBalance: String(detail.OpBalance ?? 0),
        balanceType: detail.DrOrCr === "Cr" ? "Credit" : "Debit",
      });
    } else if (open && !detail) {
      setForm(emptyForm);
    }
  }, [open, detail]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      openingBalance: form.openingBalance,
      balanceType: form.balanceType,
    });
  };

  const handleReset = () => {
    if (detail) {
      setForm({
        code: detail.HeadCode ?? "",
        name: detail.HeadName ?? "",
        openingBalance: String(detail.OpBalance ?? 0),
        balanceType: detail.DrOrCr === "Cr" ? "Credit" : "Debit",
      });
    } else {
      setForm(emptyForm);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              <Pencil size={16} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-slate-800">
                Edit Account Head
              </DialogTitle>
              <p className="text-[11px] text-slate-400 truncate">
                {detail
                  ? `Updating "${detail.HeadName}"`
                  : loading
                    ? "Loading account head…"
                    : "Account head details"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {loading && !detail ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: BRAND }} />
            <p className="text-xs font-medium text-slate-400">Fetching account head…</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldShell icon={<Hash size={11} />} label="Account Code (Alias)">
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="Account Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <div>
                <FieldShell icon={<FileText size={11} />} label="Account Head">
                  <Input
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Account Name"
                    className={cn(
                      "h-9 text-sm border-slate-200 focus-visible:ring-1",
                      errorMessage && "border-red-300 focus-visible:ring-red-300"
                    )}
                    style={{ ["--tw-ring-color" as any]: errorMessage ? "#f87171" : BRAND }}
                  />
                  {errorMessage && (
                    <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {errorMessage}
                    </p>
                  )}
                </FieldShell>
              </div>

              <FieldShell icon={<Layers size={11} />} label="Account Group">
                <Input
                  value={detail?.GroupName ?? ""}
                  disabled
                  className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
                />
              </FieldShell>

              <FieldShell icon={<Landmark size={11} />} label="Major Group">
                <Input
                  value={detail?.MajorGroupName ?? ""}
                  disabled
                  className="h-9 text-sm border-slate-200 bg-slate-50 text-slate-500 font-medium"
                />
              </FieldShell>

              <FieldShell icon={<Wallet size={11} />} label="Opening Balance">
                <Input
                  type="number"
                  value={form.openingBalance}
                  onChange={(e) => setForm((f) => ({ ...f, openingBalance: e.target.value }))}
                  placeholder="0"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<ArrowLeftRight size={11} />} label="Dr./Cr.">
                <Select
                  value={form.balanceType}
                  onValueChange={(v) => setForm((f) => ({ ...f, balanceType: v as "Debit" | "Credit" }))}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </FieldShell>
            </div>

            <DialogFooter className="px-5 py-4 border-t border-slate-100 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={submitting}
                className="h-9 text-xs font-semibold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
              >
                <RotateCcw size={13} />
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!form.name.trim() || submitting}
                className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Recursive tree node ────────────────────────────────────────────────────
function GroupNode({
  node,
  level,
  expandedMap,
  onToggleExpand,
  selectedGroupId,
  onSelect,
  forceExpand,
  onAddChild,
  onAddAccountHead,
  onDeleteRequest,
  onRenameRequest,
}: {
  node: MajorGroupItem;
  level: number;
  expandedMap: Record<number, boolean>;
  onToggleExpand: (id: number) => void;
  selectedGroupId: number | null;
  onSelect: (node: MajorGroupItem) => void;
  forceExpand: boolean;
  onAddChild: (node: MajorGroupItem, isTopLevel: boolean) => void;
  onAddAccountHead: (node: MajorGroupItem) => void;
  onDeleteRequest: (node: MajorGroupItem, isTopLevel: boolean) => void;
  onRenameRequest: (node: MajorGroupItem, isTopLevel: boolean) => void;
}) {
  const hasChildren = !!node.items?.length;
  const isOpen = forceExpand || !!expandedMap[node.id];
  const isSelected = selectedGroupId === node.id;
  const isTopLevel = level === 0;

  return (
    <div className={isTopLevel ? "px-2" : ""}>
      <div
        onClick={() => onSelect(node)}
        className={cn(
          "group flex items-center justify-between gap-2 rounded-lg cursor-pointer transition-colors",
          isTopLevel
            ? "px-2 py-2 hover:bg-slate-50"
            : "pl-2 pr-1 py-1.5 text-[12px]",
          !isTopLevel && (isSelected ? "font-semibold" : "text-slate-600 hover:bg-slate-50")
        )}
        style={!isTopLevel && isSelected ? { backgroundColor: BRAND_LIGHT, color: BRAND } : undefined}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="shrink-0 rounded hover:bg-slate-200/60 -m-0.5 p-0.5"
            >
              {isOpen ? (
                <ChevronDown size={isTopLevel ? 14 : 12} className={isTopLevel ? "" : "text-slate-400"} style={isTopLevel ? { color: BRAND } : undefined} />
              ) : (
                <ChevronRight size={isTopLevel ? 14 : 12} className="text-slate-400" />
              )}
            </button>
          ) : (
            <span className="w-[12px] shrink-0" />
          )}
          {isTopLevel && <FolderTree size={13} style={{ color: BRAND }} className="shrink-0" />}
          <span
            className={cn("truncate", isTopLevel && "text-[12px] font-bold uppercase tracking-wide")}
            style={isTopLevel ? { color: BRAND } : undefined}
          >
            {node.title}
          </span>
          {isTopLevel && hasChildren && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] font-semibold border-0"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND_MID }}
            >
              {node.items.length}
            </Badge>
          )}
        </div>
        <RowActionsMenu
          isMajorGroup={isTopLevel}
          onAddChild={() => onAddChild(node, isTopLevel)}
          onEdit={() => onRenameRequest(node, isTopLevel)}
          onDelete={() => onDeleteRequest(node, isTopLevel)}
          onAddAccountHead={() => onAddAccountHead(node)}
        />
      </div>

      {hasChildren && isOpen && (
        <div className="ml-3 pl-3 border-l border-slate-100 pb-1">
          {node.items.map((child) => (
            <GroupNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              selectedGroupId={selectedGroupId}
              onSelect={onSelect}
              forceExpand={forceExpand}
              onAddChild={onAddChild}
              onAddAccountHead={onAddAccountHead}
              onDeleteRequest={onDeleteRequest}
              onRenameRequest={onRenameRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Custom delete confirmation dialog (no shadcn AlertDialog dependency) ───
function DeleteConfirmDialog({
  open,
  title,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  submitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !submitting && onCancel()}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-950/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => !submitting && onCancel()}
          disabled={submitting}
          className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-6">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <Trash2 size={20} className="text-red-500" />
          </div>

          {/* Copy */}
          <h2 className="mt-4 text-[15px] font-bold text-slate-900">
            Delete "{title}"?
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
            This will permanently remove this account group. This can't be undone, and it will fail
            if the group still has sub-groups or account heads linked to it.
          </p>

          {errorMessage && (
            <div className="mt-3.5 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/70 px-3 py-2.5">
              <AlertCircle size={14} className="mt-[1px] shrink-0 text-red-500" />
              <p className="text-[12px] font-medium leading-snug text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="h-9 gap-1.5 bg-red-500 px-4 text-xs font-semibold shadow-sm shadow-red-500/30 hover:bg-red-600 cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete group
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirmation dialog (account head / ledger) ────────────────────
function DeleteAccountHeadDialog({
  open,
  accountName,
  checking,
  warning,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  accountName: string;
  checking: boolean;
  warning: string | null;
  submitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !submitting && onCancel()}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-950/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => !submitting && onCancel()}
          disabled={submitting}
          className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-6">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <Trash2 size={20} className="text-red-500" />
          </div>

          {/* Copy */}
          <h2 className="mt-4 text-[15px] font-bold text-slate-900">
            Delete "{accountName}"?
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
            This will permanently remove this ledger account. This can't be undone, and it will
            fail if the account head still has linked transactions.
          </p>

          {checking && (
            <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <Loader2 size={13} className="animate-spin text-slate-400" />
              <p className="text-[12px] font-medium text-slate-500">Checking account usage…</p>
            </div>
          )}

          {!checking && warning && (
            <div className="mt-3.5 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2.5">
              <AlertCircle size={14} className="mt-[1px] shrink-0 text-amber-500" />
              <p className="text-[12px] font-medium leading-snug text-amber-700">{warning}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3.5 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/70 px-3 py-2.5">
              <AlertCircle size={14} className="mt-[1px] shrink-0 text-red-500" />
              <p className="text-[12px] font-medium leading-snug text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={submitting || checking}
              className="h-9 gap-1.5 bg-red-500 px-4 text-xs font-semibold shadow-sm shadow-red-500/30 hover:bg-red-600 cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete ledger
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rename account group modal ─────────────────────────────────────────────
function RenameGroupModal({
  open,
  node,
  onOpenChange,
  onSubmit,
  submitting = false,
  errorMessage = null,
}: {
  open: boolean;
  node: MajorGroupItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  submitting?: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(node?.title ?? "");
  }, [open, node]);

  if (!node) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-amber-50 text-amber-500">
              <Pencil size={16} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-slate-800">
                Rename
              </DialogTitle>
              <p className="text-[11px] text-slate-400 truncate">
                Renaming "{node.title}"
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-5">
          <FieldShell icon={<FolderTree size={11} />} label="Account Group">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account Group Name"
              className={cn(
                "h-9 text-sm border-slate-200 focus-visible:ring-1",
                errorMessage && "border-red-300 focus-visible:ring-red-300"
              )}
              style={{ ["--tw-ring-color" as any]: errorMessage ? "#f87171" : BRAND }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {errorMessage && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <AlertCircle size={11} />
                {errorMessage}
              </p>
            )}
          </FieldShell>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-slate-100 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-9 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
            style={{ backgroundColor: BRAND }}
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Pencil size={13} />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ChartOfAccounts() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    majorGroupList,
    majorGroupLoading,
    majorGroupError,
    accHeadsForOpeningList,
    accHeadsForOpeningLoading,
    accHeadDetail,
    accHeadDetailLoading,
  } = useSelector((state: RootState) => state.chartAccount);

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalContext, setGroupModalContext] = useState<GroupModalContext | null>(null);
  const [groupModalSubmitting, setGroupModalSubmitting] = useState(false);
  const [groupModalError, setGroupModalError] = useState<string | null>(null);

  const [accountHeadModalOpen, setAccountHeadModalOpen] = useState(false);
  const [accountHeadModalContext, setAccountHeadModalContext] = useState<AccountHeadModalContext | null>(null);
  const [accountHeadModalSubmitting, setAccountHeadModalSubmitting] = useState(false);
  const [accountHeadModalError, setAccountHeadModalError] = useState<string | null>(null);

  const [deleteConfirmNode, setDeleteConfirmNode] = useState<MajorGroupItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deleteHeadConfirm, setDeleteHeadConfirm] = useState<LedgerRow | null>(null);
  const [deleteHeadChecking, setDeleteHeadChecking] = useState(false);
  const [deleteHeadWarning, setDeleteHeadWarning] = useState<string | null>(null);
  const [deleteHeadSubmitting, setDeleteHeadSubmitting] = useState(false);
  const [deleteHeadError, setDeleteHeadError] = useState<string | null>(null);
  const [removedHeadIds, setRemovedHeadIds] = useState<Set<string>>(new Set());

  const [renameNode, setRenameNode] = useState<MajorGroupItem | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [editAccountHeadModalOpen, setEditAccountHeadModalOpen] = useState(false);
  const [editAccountHeadModalSubmitting, setEditAccountHeadModalSubmitting] = useState(false);
  const [editAccountHeadModalError, setEditAccountHeadModalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMajorGroupAndGroups());
  }, [dispatch]);

  // Auto-expand top-level (major) groups once they arrive
  useEffect(() => {
    if (majorGroupList.length) {
      setExpanded((prev) => {
        const next = { ...prev };
        majorGroupList.forEach((g) => {
          if (next[g.id] === undefined) next[g.id] = true;
        });
        return next;
      });
    }
  }, [majorGroupList]);

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Any locally-removed ledger rows only apply to the group they were removed
  // from; clear the overlay whenever the selection changes.
  useEffect(() => {
    setRemovedHeadIds(new Set());
  }, [selectedGroupId]);

  // Opens the "Create Account Group" modal, prefilling Major Group / Link Group
  // based on which node's "Add Group" / "Add Sub Group" action was clicked.
  const handleOpenAddGroup = (node: MajorGroupItem, isTopLevel: boolean) => {
    if (isTopLevel) {
      // "Add Group" on a Major Group -> new Group directly under it, no parent group
      setGroupModalContext({ mode: "group", majorGroup: node, parentGroup: null });
    } else {
      // "Add Sub Group" on a Group -> new Group nested under it, Major Group inherited
      const path = findPath(majorGroupList, node.id);
      const majorGroup = path?.[0] ?? null;
      setGroupModalContext({ mode: "subgroup", majorGroup, parentGroup: node });
    }
    setGroupModalError(null);
    setGroupModalSubmitting(false);
    dispatch(clearGroupDuplication());
    setGroupModalOpen(true);
  };

  const handleCreateGroup = async (payload: {
    name: string;
    majorGroupId: number | null;
    parentGroupId: number | null;
    orderPosition: string;
  }) => {
    setGroupModalSubmitting(true);
    setGroupModalError(null);

    try {
      // Guard against duplicate group/sub-group names before saving
      const duplicateCount = await dispatch(
        checkGroupDuplication({
          groupName: payload.name,
          groupId: 0, // 0 = creating new, nothing to exclude from the check
        })
      ).unwrap();

      if (duplicateCount > 0) {
        setGroupModalError(`"${payload.name}" already exists. Please choose a different name.`);
        setGroupModalSubmitting(false);
        return;
      }

      // Link Group / Sel Group both refer to the parent group this new
      // group/sub-group is nested under (top-level "Add Group" has none).
      const linkGroupId = groupModalContext?.parentGroup?.id ?? 0;
      const linkGroupName = groupModalContext?.parentGroup?.title ?? "";

      await dispatch(
        createAccountGroup({
          GroupID: 0,
          GroupName: payload.name,
          LinkGroupID: linkGroupId,
          LinkGroupName: linkGroupName,
          MajorGroupID: payload.majorGroupId ?? 0,
          MajorGroupName: groupModalContext?.majorGroup?.title ?? "",
          PLSortOrder: Number(payload.orderPosition) || 0,
          SelGroupID: linkGroupId,
          SelGroupName: linkGroupName,
        })
      ).unwrap();

      setGroupModalOpen(false);
      // Refresh the tree immediately so the new group/sub-group shows up
      dispatch(fetchMajorGroupAndGroups());
    } catch (err) {
      setGroupModalError(
        typeof err === "string" ? err : "Something went wrong while saving. Please try again."
      );
    } finally {
      setGroupModalSubmitting(false);
    }
  };

  // Opens the "Create Account Head" modal for a given Group, prefilling its Major Group
  const handleOpenAddAccountHead = (node: MajorGroupItem) => {
    const path = findPath(majorGroupList, node.id);
    const majorGroup = path?.[0] ?? null;
    setAccountHeadModalContext({ group: node, majorGroup });
    setAccountHeadModalError(null);
    setAccountHeadModalSubmitting(false);
    dispatch(clearHeadDuplication());
    setAccountHeadModalOpen(true);
  };

  const handleCreateAccountHead = async (payload: {
    code: string;
    name: string;
    groupId: number;
    majorGroupId: number | null;
    openingBalance: string;
    balanceType: "Debit" | "Credit";
  }) => {
    setAccountHeadModalSubmitting(true);
    setAccountHeadModalError(null);

    try {
      // Guard against duplicate account head names/codes before saving
      const isDuplicate = await dispatch(
        checkAccountHeadDuplication({
          headName: payload.name,
          headCode: payload.code,
          headId: 0, // 0 = creating new, nothing to exclude from the check
        })
      ).unwrap();

      if (isDuplicate) {
        setAccountHeadModalError(`"${payload.name}" already exists. Please choose a different name.`);
        setAccountHeadModalSubmitting(false);
        return;
      }

      await dispatch(
        createAccountHead({
          HeadID: 0,
          HeadCode: payload.code,
          HeadName: payload.name,
          GroupID: payload.groupId,
          GroupName: accountHeadModalContext?.group.title ?? "",
          MajorGroupID: payload.majorGroupId ?? 0,
          MajorGroupName: accountHeadModalContext?.majorGroup?.title ?? "",
          SelGroupID: payload.groupId,
          SelGroupName: accountHeadModalContext?.group.title ?? "",
          OpBalance: Number(payload.openingBalance) || 0,
          DrOrCr: payload.balanceType === "Debit" ? "Dr" : "Cr",
          Active: true,
          Common: false,
        })
      ).unwrap();

      setAccountHeadModalOpen(false);

      // Make sure the tree selection matches the group we just saved into,
      // so the refreshed ledger table lines up with the header shown above it
      setSelectedGroupId(payload.groupId);

      // Refresh the ledger table immediately so the new account head shows up
      dispatch(
        fetchAccHeadsForOpening({
          groupId: payload.groupId,
          majorGrpId: payload.majorGroupId ?? payload.groupId,
          pageSize: 25,
          page: 1,
        })
      );
    } catch (err) {
      setAccountHeadModalError(
        typeof err === "string" ? err : "Something went wrong while saving. Please try again."
      );
    } finally {
      setAccountHeadModalSubmitting(false);
    }
  };

  // Opens the "Edit Account Head" modal for a given ledger row and fetches its details
  const handleOpenEditAccountHead = (row: LedgerRow) => {
    setEditAccountHeadModalError(null);
    setEditAccountHeadModalSubmitting(false);
    dispatch(clearAccHeadDetail());
    setEditAccountHeadModalOpen(true);
    dispatch(fetchAccHead({ headId: Number(row.id) }));
  };

  const handleUpdateAccountHead = async (payload: {
    code: string;
    name: string;
    openingBalance: string;
    balanceType: "Debit" | "Credit";
  }) => {
    if (!accHeadDetail) return;

    setEditAccountHeadModalSubmitting(true);
    setEditAccountHeadModalError(null);

    try {
      // Guard against renaming/re-coding into a name or code already in use elsewhere
      if (payload.name !== accHeadDetail.HeadName || payload.code !== (accHeadDetail.HeadCode ?? "")) {
        const isDuplicate = await dispatch(
          checkAccountHeadDuplication({
            headName: payload.name,
            headCode: payload.code,
            headId: accHeadDetail.HeadID,
          })
        ).unwrap();

        if (isDuplicate) {
          setEditAccountHeadModalError(`"${payload.name}" already exists. Please choose a different name.`);
          setEditAccountHeadModalSubmitting(false);
          return;
        }
      }

      await dispatch(
        updateAccountHead({
          HeadID: accHeadDetail.HeadID,
          HeadCode: payload.code,
          HeadName: payload.name,
          GroupID: accHeadDetail.GroupID,
          GroupName: accHeadDetail.GroupName,
          MajorGroupID: accHeadDetail.MajorGroupID,
          MajorGroupName: accHeadDetail.MajorGroupName,
          OpBalance: Number(payload.openingBalance) || 0,
          DrOrCr: payload.balanceType === "Debit" ? "Dr" : "Cr",
          Active: accHeadDetail.Active,
          Common: accHeadDetail.Common,
        })
      ).unwrap();

      setEditAccountHeadModalOpen(false);
      toast.success("Account head updated", {
        description: `"${payload.name}" was saved.`,
        style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },
      });

      // Refresh the ledger table immediately so the change shows up
      const path = findPath(majorGroupList, accHeadDetail.GroupID);
      const majorGroupId = path?.[0]?.id ?? accHeadDetail.MajorGroupID;
      dispatch(
        fetchAccHeadsForOpening({
          groupId: accHeadDetail.GroupID,
          majorGrpId: majorGroupId,
          pageSize: 25,
          page: 1,
        })
      );
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Something went wrong while saving. Please try again.";
      setEditAccountHeadModalError(message);
      toast.error("Update failed", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
        description: message,
      });
    } finally {
      setEditAccountHeadModalSubmitting(false);
    }
  };

  // Clicking the delete icon on a ledger row: kick off the usage/permission
  // checks in parallel and open the confirmation dialog right away, filling
  // in a warning banner once the checks come back.
  const handleRequestDeleteAccountHead = async (row: LedgerRow) => {
    setDeleteHeadError(null);
    setDeleteHeadWarning(null);
    setDeleteHeadConfirm(row);
    setDeleteHeadChecking(true);

    try {
      const headId = Number(row.id);
      const [ynResult, usedResult] = await Promise.all([
        dispatch(deleteAccountHead({ headId })).unwrap(),
        dispatch(isUsedAccHead({ headId })).unwrap(),
      ]);

      if (usedResult === 1 || ynResult !== 1) {
        setDeleteHeadWarning(
          `"${row.accountName}" has linked transactions or balances. Deleting it may fail.`
        );
      }
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Couldn't verify this ledger before deleting.";
      setDeleteHeadWarning(message);
    } finally {
      setDeleteHeadChecking(false);
    }
  };

  const handleCancelDeleteAccountHead = () => {
    if (deleteHeadSubmitting) return;
    setDeleteHeadConfirm(null);
    setDeleteHeadWarning(null);
    setDeleteHeadError(null);
  };

  // Clicking "OK" (confirm) in the dialog: perform the actual delete, then
  // drop the row from the table right away and refetch to stay in sync.
  const handleConfirmDeleteAccountHead = async () => {
    if (!deleteHeadConfirm) return;

    const row = deleteHeadConfirm;
    setDeleteHeadSubmitting(true);
    setDeleteHeadError(null);

    try {
      const result = await dispatch(removeAccountHead({ headId: Number(row.id) })).unwrap();

      if (result !== 0) {
        const message = `"${row.accountName}" couldn't be deleted. It likely still has linked transactions.`;
        setDeleteHeadError(message);
        toast.error("Delete failed", { description: message });
        setDeleteHeadSubmitting(false);
        return;
      }

      // Remove it from the table immediately, before the refetch resolves
      setRemovedHeadIds((prev) => new Set(prev).add(row.id));

      setDeleteHeadConfirm(null);
      setDeleteHeadWarning(null);
      toast.success("Account head deleted", {
        description: `"${row.accountName}" was removed.`,
        style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },
      });

      // Refresh from the server so the table reflects the latest list
      if (selectedGroupId != null) {
        const path = findPath(majorGroupList, selectedGroupId);
        const majorGroupId = path?.[0]?.id ?? selectedGroupId;
        dispatch(
          fetchAccHeadsForOpening({
            groupId: selectedGroupId,
            majorGrpId: majorGroupId,
            pageSize: 25,
            page: 1,
          })
        );
      }
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Something went wrong while deleting. Please try again.";
      setDeleteHeadError(message);
      toast.error("Delete failed", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
        description: message,
      });
    } finally {
      setDeleteHeadSubmitting(false);
    }
  };

  const handleRequestDeleteGroup = (node: MajorGroupItem, _isTopLevel: boolean) => {
    setDeleteError(null);
    setDeleteConfirmNode(node);
  };

  const handleOpenRenameGroup = (node: MajorGroupItem, _isTopLevel: boolean) => {
    setRenameError(null);
    setRenameSubmitting(false);
    setRenameNode(node);
    dispatch(clearGroupDuplication());
    setRenameModalOpen(true);
  };

  const handleConfirmRenameGroup = async (newName: string) => {
    if (!renameNode) return;

    setRenameSubmitting(true);
    setRenameError(null);

    try {
      // Guard against renaming into a name that's already in use elsewhere
      if (newName !== renameNode.title) {
        const duplicateCount = await dispatch(
          checkGroupDuplication({ groupName: newName, groupId: renameNode.id })
        ).unwrap();

        if (duplicateCount > 0) {
          setRenameError(`"${newName}" already exists. Please choose a different name.`);
          setRenameSubmitting(false);
          return;
        }
      }

      const path = findPath(majorGroupList, renameNode.id);
      const majorGroup = path?.[0] ?? null;
      // The Link/Sel group is the immediate parent this group is nested under
      // (undefined for a Major Group renamed directly, i.e. no parent in the path)
      const parentGroup = path && path.length > 1 ? path[path.length - 2] : null;

      await dispatch(
        updateAccountGroup({
          GroupID: renameNode.id,
          GroupName: newName,
          LinkGroupID: parentGroup?.id ?? 0,
          LinkGroupName: parentGroup?.title ?? "",
          MajorGroupID: majorGroup?.id ?? 0,
          MajorGroupName: majorGroup?.title ?? "",
          PLSortOrder: 0,
          SelGroupID: renameNode.id,
          SelGroupName: renameNode.title,
          Active: true,
          Common: true,
        })
      ).unwrap();

      setRenameModalOpen(false);
      toast.success("Account group renamed", {
        description: `"${renameNode.title}" is now "${newName}".`,
        style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },
      });
      // Refresh the tree so the new name shows up immediately
      dispatch(fetchMajorGroupAndGroups());
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Something went wrong while renaming. Please try again.";
      setRenameError(message);
      toast.error("Rename failed", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        },
        description: message,
      });
    } finally {
      setRenameSubmitting(false);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!deleteConfirmNode) return;

    const groupTitle = deleteConfirmNode.title;
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const result = await dispatch(deleteAccountGroup({ groupId: deleteConfirmNode.id })).unwrap();

      if (result !== 0) {
        const message = `"${groupTitle}" couldn't be deleted. It likely still has linked sub-groups or account heads.`;
        setDeleteError(message);
        toast.error("Delete failed", { description: message });
        setDeleteSubmitting(false);
        return;
      }

      // Clear the selection if the deleted node (or its parent selection) is gone
      if (selectedGroupId === deleteConfirmNode.id) {
        setSelectedGroupId(null);
        dispatch(clearAccHeadsForOpeningList());
      }

      setDeleteConfirmNode(null);
      toast.success("Account group deleted", {
        description: `"${groupTitle}" was removed.`,
        style: {
          background: "#097969",
          color: "white",
          border: "1px solid #d97706",
        },
      });
      // Refresh the tree so the deleted group disappears immediately
      dispatch(fetchMajorGroupAndGroups());
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Something went wrong while deleting. Please try again.";
      setDeleteError(message);
      toast.error("Delete failed", {
        style: {
          background: "#FF4433",
          color: "white",
          border: "1px solid #d97706",
        }, description: message
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleSelectNode = (node: MajorGroupItem) => {
    setSelectedGroupId(node.id);

    // Only "Groups" (not top-level Major Groups) have ledgers to fetch
    if (node.IsGroup) {
      const path = findPath(majorGroupList, node.id);
      const majorGroupId = path?.[0]?.id ?? node.id;

      dispatch(
        fetchAccHeadsForOpening({
          groupId: node.id,
          majorGrpId: majorGroupId,
          pageSize: 25,
          page: 1,
        })
      );
    }
  };

  const filteredGroups = useMemo(
    () => filterTree(majorGroupList, search),
    [majorGroupList, search]
  );

  const selectedPath = useMemo(
    () => (selectedGroupId != null ? findPath(majorGroupList, selectedGroupId) : null),
    [majorGroupList, selectedGroupId]
  );
  const selectedNode = selectedPath ? selectedPath[selectedPath.length - 1] : null;

  const ledgerRows: LedgerRow[] = useMemo(
    () =>
      accHeadsForOpeningList
        .filter((head) => !removedHeadIds.has(String(head.HeadID)))
        .map((head, idx) => ({
          id: String(head.HeadID),
          slNo: idx + 1,
          code: head.HeadCode ?? head.Code,
          accountName: head.HeadName,
          credit: head.CreditAmount,
          debit: head.DebitAmount,
        })),
    [accHeadsForOpeningList, removedHeadIds]
  );

  const columns: Column<LedgerRow>[] = [
    { key: "slNo", name: "Sl No.", width: 64 },
    { key: "code", name: "Code", width: 110 },
    { key: "accountName", name: "Account Name", minWidth: 220 },
    {
      key: "credit",
      name: "Credit",
      width: 150,
      renderCell: ({ row }) => (
        <span className={cn("tabular-nums", row.credit > 0 ? "text-emerald-600 font-medium" : "text-slate-300")}>
          {currency(row.credit)}
        </span>
      ),
    },
    {
      key: "debit",
      name: "Debit",
      width: 150,
      renderCell: ({ row }) => (
        <span className={cn("tabular-nums", row.debit > 0 ? "text-red-500 font-medium" : "text-slate-300")}>
          {currency(row.debit)}
        </span>
      ),
    },
    {
      key: "actions",
      name: "Actions",
      width: 110,
      renderCell: ({ row }) => (
        <ActionsCell
          row={row}
          onView={() => console.log("view", row)}
          onEdit={() => handleOpenEditAccountHead(row)}
          onDelete={() => handleRequestDeleteAccountHead(row)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Chart of Accounts"
        subtitle="Accounts Master"
        icon={<Landmark size={16} className="text-white" />}
      />

      <div className="p-5 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
        {/* ── Left: Group tree ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="h-8 pl-8 text-xs border-slate-200 bg-slate-50 focus-visible:ring-1"
                style={{ ["--tw-ring-color" as any]: BRAND }}
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto py-1">
            {majorGroupLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-14">
                <RefreshCcw size={20} className="text-slate-300 animate-spin" />
                <p className="text-xs font-medium text-slate-400">Loading account groups…</p>
              </div>
            )}

            {!majorGroupLoading && majorGroupError && (
              <div className="flex flex-col items-center justify-center gap-2 py-14 px-4 text-center">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-xs font-semibold text-red-500">{majorGroupError}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs mt-1 cursor-pointer"
                  onClick={() => dispatch(fetchMajorGroupAndGroups())}
                >
                  Retry
                </Button>
              </div>
            )}

            {!majorGroupLoading && !majorGroupError && filteredGroups.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-14">
                {search ? `No groups match "${search}"` : "No account groups found"}
              </p>
            )}

            {!majorGroupLoading &&
              !majorGroupError &&
              filteredGroups.map((mg) => (
                <GroupNode
                  key={mg.id}
                  node={mg}
                  level={0}
                  expandedMap={expanded}
                  onToggleExpand={toggleExpanded}
                  selectedGroupId={selectedGroupId}
                  onSelect={handleSelectNode}
                  forceExpand={!!search.trim()}
                  onAddChild={handleOpenAddGroup}
                  onAddAccountHead={handleOpenAddAccountHead}
                  onDeleteRequest={handleRequestDeleteGroup}
                  onRenameRequest={handleOpenRenameGroup}
                />
              ))}
          </div>
        </div>

        {/* ── Right: Ledger table ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {selectedNode ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>   
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    {selectedPath!.slice(0, -1).map((n) => n.title).join(" / ") || "Chart of Accounts"}
                  </p>
                  <h2 className="text-base font-bold text-slate-800">{selectedNode.title}</h2>
                </div>
              </div>

              <DataTable
                columns={columns}
                rows={ledgerRows}
                rowKey="id"
                loading={accHeadsForOpeningLoading}
                loadingLabel="Loading ledgers…"
              />
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center gap-2">
              <Wallet size={28} className="text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">Select a group to view its ledgers</p>
              <p className="text-xs text-slate-300">Choose an account group from the tree on the left</p>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        open={groupModalOpen}
        context={groupModalContext}
        onOpenChange={(next) => {
          setGroupModalOpen(next);
          if (!next) setGroupModalError(null);
        }}
        onSubmit={handleCreateGroup}
        submitting={groupModalSubmitting}
        errorMessage={groupModalError}
      />

      <CreateAccountHeadModal
        open={accountHeadModalOpen}
        context={accountHeadModalContext}
        onOpenChange={(next) => {
          setAccountHeadModalOpen(next);
          if (!next) setAccountHeadModalError(null);
        }}
        onSubmit={handleCreateAccountHead}
        submitting={accountHeadModalSubmitting}
        errorMessage={accountHeadModalError}
      />

      <EditAccountHeadModal
        open={editAccountHeadModalOpen}
        detail={accHeadDetail}
        loading={accHeadDetailLoading}
        onOpenChange={(next) => {
          if (editAccountHeadModalSubmitting) return;
          setEditAccountHeadModalOpen(next);
          if (!next) {
            setEditAccountHeadModalError(null);
            dispatch(clearAccHeadDetail());
          }
        }}
        onSubmit={handleUpdateAccountHead}
        submitting={editAccountHeadModalSubmitting}
        errorMessage={editAccountHeadModalError}
      />

      <RenameGroupModal
        open={renameModalOpen}
        node={renameNode}
        onOpenChange={(next) => {
          if (renameSubmitting) return;
          setRenameModalOpen(next);
          if (!next) setRenameError(null);
        }}
        onSubmit={handleConfirmRenameGroup}
        submitting={renameSubmitting}
        errorMessage={renameError}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirmNode}
        title={deleteConfirmNode?.title ?? ""}
        submitting={deleteSubmitting}
        errorMessage={deleteError}
        onCancel={() => {
          if (deleteSubmitting) return;
          setDeleteConfirmNode(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDeleteGroup}
      />

      <DeleteAccountHeadDialog
        open={!!deleteHeadConfirm}
        accountName={deleteHeadConfirm?.accountName ?? ""}
        checking={deleteHeadChecking}
        warning={deleteHeadWarning}
        submitting={deleteHeadSubmitting}
        errorMessage={deleteHeadError}
        onCancel={handleCancelDeleteAccountHead}
        onConfirm={handleConfirmDeleteAccountHead}
      />
    </div>
  );
}
