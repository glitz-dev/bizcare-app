"use client";

import { useEffect, useState } from "react";
import { Landmark, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { PageHeader } from "../common/PageHeader";
// Adjust this import path to match where accountHeadSlice.ts lives in the project.
import {
  fetchAccGroupOptions,
  fetchAcMajorGroupForGroup,
  fetchAccountHeads,
  fetchAccountHead,
  checkAccHeadNameDuplication,
  createAccountHead,
  updateAccountHead,
  clearAccountHeadDetail,
} from "../store/features/settings/financialsetup/accountheadSlice";

// ─── Account Group searchable combobox (Popover + Command) ────────────────────
// Fetches accGroupOptions on open; reports the selected GroupName + GroupID back up.
function AccountGroupCombobox({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (groupName: string, groupId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const options = useSelector((state: RootState) => state.accountHead.accGroupOptions);
  const loading = useSelector((state: RootState) => state.accountHead.accGroupOptionsLoading);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) dispatch(fetchAccGroupOptions());
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-slate-500 data-[state=open]:ring-1 data-[state=open]:ring-[#004687]/30"
        >
          {value || "Select Account Group"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option: any) => (
                    <CommandItem
                      key={option.GroupID}
                      value={option.GroupName}
                      onSelect={() => {
                        onSelect(option.GroupName, option.GroupID);
                        setOpen(false);
                      }}
                    >
                      {option.GroupName}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === option.GroupName ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CreateAccountHead({
  onBack,
  headId,
}: {
  onBack: () => void;
  headId?: number;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = typeof headId === "number" && headId > 0;

  const [accountGroupName, setAccountGroupName] = useState("");
  const [accountGroupId, setAccountGroupId] = useState<number | null>(null);
  const [accountCode, setAccountCode] = useState("");
  const [accountHeadName, setAccountHeadName] = useState("");
  const [majorGroupName, setMajorGroupName] = useState("");
  const [majorGroupId, setMajorGroupId] = useState<number | null>(null);
  const [openingBalance, setOpeningBalance] = useState("");
  const [drOrCr, setDrOrCr] = useState<"Debit" | "Credit">("Debit");
  const [active, setActive] = useState(true);
  const [common, setCommon] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const majorGroupLoading = useSelector(
    (state: RootState) => state.accountHead.acMajorGroupForGroupLoading
  );

  const accountHeadDetail = useSelector(
    (state: RootState) => state.accountHead.accountHeadDetail
  );
  const accountHeadDetailLoading = useSelector(
    (state: RootState) => state.accountHead.accountHeadDetailLoading
  );

  // Edit mode: load the account head detail, and clear it again on unmount.
  useEffect(() => {
    if (isEditMode && headId) {
      dispatch(fetchAccountHead({ accHeadId: headId }));
    }
    return () => {
      dispatch(clearAccountHeadDetail());
    };
  }, [dispatch, headId, isEditMode]);

  // Populate the form once the account head detail arrives.
  useEffect(() => {
    if (isEditMode && accountHeadDetail && accountHeadDetail.HeadID === headId) {
      setAccountCode(accountHeadDetail.HeadCode ?? "");
      setAccountHeadName(accountHeadDetail.HeadName ?? "");
      setAccountGroupName(accountHeadDetail.GroupName ?? "");
      setAccountGroupId(accountHeadDetail.GroupID ?? null);
      setMajorGroupName(accountHeadDetail.MajorGroupName ?? "");
      setMajorGroupId(accountHeadDetail.MajorGroupID ?? null);
      setOpeningBalance(
        accountHeadDetail.OpBalance != null ? String(accountHeadDetail.OpBalance) : ""
      );
      setDrOrCr(accountHeadDetail.DrOrCr === "Cr" ? "Credit" : "Debit");
      setActive(!!accountHeadDetail.Active);
      setCommon(!!accountHeadDetail.Common);
    }
  }, [accountHeadDetail, isEditMode, headId]);

  const handleAccountGroupSelect = async (groupName: string, groupId: number) => {
    setAccountGroupName(groupName);
    setAccountGroupId(groupId);
    setMajorGroupName("");
    setMajorGroupId(null);
    try {
      const result = await dispatch(fetchAcMajorGroupForGroup({ groupId })).unwrap();
      setMajorGroupName(result?.MajorGroupName ?? "");
      setMajorGroupId(result?.MajorGroupID ?? null);
    } catch {
      // Error is already captured in redux state; nothing else to do here.
    }
  };

  const handleClear = () => {
    setAccountCode("");
    setAccountHeadName("");
    setAccountGroupName("");
    setAccountGroupId(null);
    setMajorGroupName("");
    setMajorGroupId(null);
    setOpeningBalance("");
    setDrOrCr("Debit");
    setActive(true);
    setCommon(true);
  };

  const handleSubmit = async () => {
    if (!accountHeadName.trim()) {
      toast.error("Account Head is required.");
      return;
    }
    if (!accountGroupId) {
      toast.error("Account Group is required.");
      return;
    }

    setSubmitting(true);
    try {
      const isDuplicate = await dispatch(
        checkAccHeadNameDuplication({
          headName: accountHeadName.trim(),
          headCode: accountCode.trim(),
          headId: isEditMode ? headId : undefined,
        })
      ).unwrap();

      if (isDuplicate) {
        toast.error("An account head with this name already exists.");
        return;
      }

      if (isEditMode && headId) {
        await dispatch(
          updateAccountHead({
            HeadID: headId,
            HeadCode: accountCode.trim(),
            HeadName: accountHeadName.trim(),
            GroupID: accountGroupId,
            GroupName: accountGroupName,
            MajorGroupID: majorGroupId ?? 0,
            MajorGroupName: majorGroupName ?? "",
            Active: active,
            Common: common,
            OpBalance: Number(openingBalance) || 0,
            DrOrCr: drOrCr === "Debit" ? "Dr" : "Cr",
          })
        ).unwrap();

        toast.success("Account head updated successfully.");
      } else {
        await dispatch(
          createAccountHead({
            Active: active,
            Common: common,
            DrOrCr: drOrCr === "Debit" ? "Dr" : "Cr",
            GroupID: accountGroupId,
            GroupName: accountGroupName,
            HeadCode: accountCode.trim(),
            HeadID: 0,
            HeadName: accountHeadName.trim(),
            MajorGroupID: majorGroupId ?? 0,
            MajorGroupName: majorGroupName ?? "",
          })
        ).unwrap();

        toast.success("Account head created successfully.");
      }

      dispatch(fetchAccountHeads());
      onBack();
    } catch (err: unknown) {
      toast.error(
        typeof err === "string"
          ? err
          : `Failed to ${isEditMode ? "update" : "create"} account head.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white shadow-sm overflow-hidden">
        <PageHeader
          title="Account Head"
          subtitle={isEditMode ? "Edit Account Head" : "Account Head Details"}
          icon={<Landmark size={16} className="text-white" />}
          createButtonLabel="Account Head Details"
          onCreateClick={onBack}
        />

        {isEditMode && accountHeadDetailLoading && !accountHeadDetail ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading account head…
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Account Code (Alias)
            </Label>
            <Input
              placeholder="Account Code"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              className="focus-visible:ring-[#004687]/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Account Head
            </Label>
            <Input
              placeholder="Account Name"
              value={accountHeadName}
              onChange={(e) => setAccountHeadName(e.target.value)}
              className="focus-visible:ring-[#004687]/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Account Group
            </Label>
            <AccountGroupCombobox value={accountGroupName} onSelect={handleAccountGroupSelect} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Major Group
            </Label>
            <Input
              placeholder="Major Group"
              value={majorGroupLoading ? "Loading…" : majorGroupName}
              readOnly
              disabled
              className="focus-visible:ring-[#004687]/30 bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Opening Balance
            </Label>
            <Input
              type="number"
              placeholder="Opening Balance"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="focus-visible:ring-[#004687]/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Debit/Credit
            </Label>
            <Select value={drOrCr} onValueChange={(v) => setDrOrCr(v as "Debit" | "Credit")}>
              <SelectTrigger className="focus:ring-[#004687]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Debit">Debit</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6 md:col-span-2 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={common}
                onChange={(e) => setCommon(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
              />
              Common
            </label>
          </div>
        </div>
        )}

        <div className="px-5 pb-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={submitting || (isEditMode && accountHeadDetailLoading)}
            className="h-9 px-4 text-sm font-semibold border-amber-300 text-amber-600 hover:bg-amber-50 cursor-pointer"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (isEditMode && accountHeadDetailLoading)}
            className="h-9 px-4 text-sm font-semibold bg-[#004687] hover:bg-[#003a70] cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountHead;