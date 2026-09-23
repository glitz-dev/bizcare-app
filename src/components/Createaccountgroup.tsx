"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Check, ChevronsUpDown, FolderTree, Loader2, Plus } from "lucide-react";

import type { AppDispatch, RootState } from "@/store";
import {
    fetchMajorGroupOptions,
    fetchAccLinkGroupOptions,
    clearAccLinkGroupOptions,
    checkAccGroupNameDuplication,
    createAccountGroup,
    updateAccountGroup,
    clearCreateAccountGroupStatus,
    clearAccGroupDetail,
    type AccGroupDetail,
} from "../store/features/settings/financialsetup/accountgroupSlice"; // adjust path to wherever accountgroupSlice.ts actually lives

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

interface ComboOption {
    value: number;
    label: string;
}

// ─── Combobox field — Radix Popover + cmdk Command. Now supports a remote,
// debounced `onSearchChange` (wired to the *StartWith endpoints) on top of
// cmdk's own client-side filtering, plus a loading state and a disabled
// state (used for Link Group before a Major Group is chosen). ─────────────
function ComboboxField({
    options,
    value,
    onChange,
    onSearchChange,
    loading,
    disabled,
    placeholder,
    disabledPlaceholder,
    emptyLabel = "No results found.",
    error,
}: {
    options: ComboOption[];
    value: number | null;
    onChange: (value: number | null) => void;
    onSearchChange?: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
    placeholder: string;
    disabledPlaceholder?: string;
    emptyLabel?: string;
    error?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((opt) => opt.value === value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const handleSearchChange = (text: string) => {
        if (!onSearchChange) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onSearchChange(text), SEARCH_DEBOUNCE_MS);
    };

    return (
        <Popover
            open={open && !disabled}
            onOpenChange={(next) => {
                if (disabled) return;
                setOpen(next);
                // Lazy-fetch the first page of options the moment the popover opens.
                if (next) onSearchChange?.("");
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-9 font-normal text-sm cursor-pointer",
                        !selected && "text-slate-400",
                        error && "border-red-400 focus-visible:ring-red-300",
                        disabled && "cursor-not-allowed opacity-60"
                    )}
                >
                    {selected ? selected.label : disabled ? disabledPlaceholder ?? placeholder : placeholder}
                    {loading ? (
                        <Loader2 className="ml-2 h-3.5 w-3.5 shrink-0 animate-spin opacity-60" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={!onSearchChange}>
                    <CommandInput
                        placeholder={placeholder}
                        className="h-9 text-sm"
                        onValueChange={handleSearchChange}
                    />
                    <CommandList>
                        <CommandEmpty>{loading ? "Searching…" : emptyLabel}</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => {
                                        onChange(opt.value === value ? null : opt.value);
                                        setOpen(false);
                                    }}
                                    className="text-sm cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-3.5 w-3.5",
                                            opt.value === value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface CreateaccountgroupProps {
    // Full record from fetchAccGroup when editing an existing row — undefined
    // when creating a new one.
    initialData?: AccGroupDetail;
    // Fired once CreateNewAccGroup/UpdateAccGroup has actually succeeded — the
    // parent uses this to close the form and refresh the list. The component
    // owns the dispatch/loading/error lifecycle itself, so it no longer needs
    // `submitting` / `submitError` passed in from outside.
    onSubmit: (payload: AccGroupDetail) => void;
    onCancel: () => void;
}

export function Createaccountgroup({
    initialData,
    onSubmit,
    onCancel,
}: CreateaccountgroupProps) {
    const isEdit = !!initialData;
    const dispatch = useDispatch<AppDispatch>();

    // Adjust `state.accountGroup` below to match whatever key this slice is
    // mounted under in your root reducer.
    const {
        majorGroupOptions,
        majorGroupOptionsLoading,
        accLinkGroupOptions,
        accLinkGroupOptionsLoading,
        createAccountGroupLoading,
        createAccountGroupError,
        updateAccountGroupLoading,
        updateAccountGroupError,
    } = useSelector((state: RootState) => state.accountGroup as any);

    // Duplicate-name check (GetDuplication) runs right before the create/
    // update call; it has its own brief loading state so it can be folded
    // into the same "submitting" flag the buttons/inputs disable on.
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const saveLoading = isEdit ? updateAccountGroupLoading : createAccountGroupLoading;
    const saveError = isEdit ? updateAccountGroupError : createAccountGroupError;
    const submitting = checkingDuplicate || saveLoading;

    // initialData now comes straight from fetchAccGroup (GetAccGroup), which
    // returns the full record — MajorGroupID/LinkGroupID included — so every
    // field below can be prefilled directly with no name-matching needed.
    const [groupName, setGroupName] = useState(initialData?.GroupName ?? "");
    const [majorGroupId, setMajorGroupId] = useState<number | null>(initialData?.MajorGroupID ?? null);
    const [majorGroupName, setMajorGroupName] = useState<string>(initialData?.MajorGroupName ?? "");
    const [linkGroupId, setLinkGroupId] = useState<number | null>(initialData?.LinkGroupID ?? null);
    const [linkGroupName, setLinkGroupName] = useState<string>(initialData?.LinkGroupName ?? "");
    const [orderPosition, setOrderPosition] = useState<string>(
        initialData?.PLSortOrder != null ? String(initialData.PLSortOrder) : ""
    );
    const [active, setActive] = useState(initialData?.Active ?? true);
    const [common, setCommon] = useState(initialData?.Common ?? true);
    const [errors, setErrors] = useState<{ groupName?: string; majorGroupId?: string }>({});

    // Fetched options merged with the current selection — so the combobox
    // shows the right label immediately on an edit, before the popover has
    // been opened and the *StartWith options have actually loaded.
    const majorOptions: ComboOption[] = useMemo(() => {
        const fetched: ComboOption[] = (majorGroupOptions ?? []).map((m: any) => ({
            value: m.MajorGroupID,
            label: m.MajorGroupName,
        }));
        if (majorGroupId != null && !fetched.some((o) => o.value === majorGroupId)) {
            fetched.unshift({ value: majorGroupId, label: majorGroupName });
        }
        return fetched;
    }, [majorGroupOptions, majorGroupId, majorGroupName]);

    const linkOptions: ComboOption[] = useMemo(() => {
        const fetched: ComboOption[] = (accLinkGroupOptions ?? []).map((l: any) => ({
            value: l.GroupID,
            label: l.GroupName,
        }));
        if (linkGroupId != null && !fetched.some((o) => o.value === linkGroupId)) {
            fetched.unshift({ value: linkGroupId, label: linkGroupName });
        }
        return fetched;
    }, [accLinkGroupOptions, linkGroupId, linkGroupName]);

    // Fetch link groups scoped to the selected major group whenever it changes.
    useEffect(() => {
        if (majorGroupId == null) {
            dispatch(clearAccLinkGroupOptions());
            return;
        }
        dispatch(fetchAccLinkGroupOptions({ majorGroupId, startWith: "" }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [majorGroupId]);

    const handleClear = () => {
        setGroupName("");
        setMajorGroupId(null);
        setMajorGroupName("");
        setLinkGroupId(null);
        setLinkGroupName("");
        setOrderPosition("");
        setActive(true);
        setCommon(true);
        setErrors({});
    };

    const handleSubmit = async () => {
        const nextErrors: { groupName?: string; majorGroupId?: string } = {};
        if (!groupName.trim()) nextErrors.groupName = "Account group name is required";
        if (!majorGroupId) nextErrors.majorGroupId = "Major group is required";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        // GetDuplication?GroupName=&GroupID= — pass the existing GroupID when
        // editing so the row isn't flagged as a duplicate of itself.
        setCheckingDuplicate(true);
        const dupResult = await dispatch(
            checkAccGroupNameDuplication({
                groupName: groupName.trim(),
                groupId: initialData?.GroupID ?? 0,
            })
        );
        setCheckingDuplicate(false);

        if (checkAccGroupNameDuplication.rejected.match(dupResult)) {
            toast.error(dupResult.payload ?? "Could not verify the group name. Please try again.");
            return;
        }
        if (checkAccGroupNameDuplication.fulfilled.match(dupResult) && dupResult.payload === true) {
            setErrors((prev) => ({ ...prev, groupName: "An account group with this name already exists" }));
            return;
        }

        const payload: AccGroupDetail = {
            Active: active,
            Common: common,
            GroupID: initialData?.GroupID ?? 0,
            GroupName: groupName.trim(),
            LinkGroupID: linkGroupId ?? 0,
            LinkGroupName: linkGroupName ?? "",
            MajorGroupID: majorGroupId as number,
            MajorGroupName: majorGroupName,
            PLSortOrder: orderPosition.trim() === "" ? null : Number(orderPosition),
        };

        const result = isEdit
            ? await dispatch(updateAccountGroup(payload))
            : await dispatch(createAccountGroup(payload));
        const succeeded = isEdit
            ? updateAccountGroup.fulfilled.match(result)
            : createAccountGroup.fulfilled.match(result);

        if (succeeded) {
            toast.success(isEdit ? "Account group updated" : "Account group created");
            dispatch(clearCreateAccountGroupStatus());
            if (isEdit) dispatch(clearAccGroupDetail());
            onSubmit(payload);
        } else {
            toast.error((result.payload as string) ?? "Failed to save account group");
        }
    };

    return (
        <div className="overflow-hidden shadow-sm bg-white">
            {/* Header */}
            <div className="bg-[#004687] px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                        <FolderTree size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm tracking-wide truncate">
                            Account Group
                        </h1>
                        <p className="text-blue-200 text-[10px] tracking-widest uppercase">
                            {isEdit ? "Edit Account Group" : "Account Group Details"}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onCancel}
                    className="bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs h-8 px-3 rounded-lg shadow-none gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                >
                    <Plus size={13} />
                    Account Group Details
                </Button>
            </div>

            {/* Form */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-7xl">
                    <div className="space-y-1.5">
                        <Label htmlFor="group-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Account Group
                        </Label>
                        <Input
                            id="group-name"
                            placeholder="Account Group Name"
                            value={groupName}
                            onChange={(e) => {
                                setGroupName(e.target.value);
                                if (errors.groupName) setErrors((prev) => ({ ...prev, groupName: undefined }));
                            }}
                            className={errors.groupName ? "border-red-400 focus-visible:ring-red-300" : ""}
                        />
                        {errors.groupName && (
                            <p className="text-[11px] text-red-500">{errors.groupName}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Major Group
                        </Label>
                        <ComboboxField
                            options={majorOptions}
                            value={majorGroupId}
                            loading={majorGroupOptionsLoading}
                            onChange={(val) => {
                                setMajorGroupId(val);
                                setMajorGroupName(majorOptions.find((o) => o.value === val)?.label ?? "");
                                // A new major group invalidates any previously chosen link group.
                                setLinkGroupId(null);
                                setLinkGroupName("");
                                if (errors.majorGroupId) setErrors((prev) => ({ ...prev, majorGroupId: undefined }));
                            }}
                            onSearchChange={(text) => dispatch(fetchMajorGroupOptions({ startWith: text }))}
                            placeholder="Select Major Group"
                            error={!!errors.majorGroupId}
                        />
                        {errors.majorGroupId && (
                            <p className="text-[11px] text-red-500">{errors.majorGroupId}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Link Group
                        </Label>
                        <ComboboxField
                            options={linkOptions}
                            value={linkGroupId}
                            loading={accLinkGroupOptionsLoading}
                            disabled={majorGroupId == null}
                            disabledPlaceholder="Select Major Group first"
                            onChange={(val) => {
                                setLinkGroupId(val);
                                setLinkGroupName(linkOptions.find((o) => o.value === val)?.label ?? "");
                            }}
                            onSearchChange={
                                majorGroupId == null
                                    ? undefined
                                    : (text) =>
                                          dispatch(
                                              fetchAccLinkGroupOptions({ majorGroupId, startWith: text })
                                          )
                            }
                            placeholder="Select Link Group"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="order-position" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Ordering Position
                        </Label>
                        <Input
                            id="order-position"
                            type="number"
                            placeholder="Order Position"
                            value={orderPosition}
                            onChange={(e) => setOrderPosition(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6 sm:col-span-2 pt-1">
                        <div className="flex items-center gap-2">
                            <input
                                id="active"
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
                            />
                            <Label htmlFor="active" className="text-sm text-slate-600 cursor-pointer">
                                Active
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="common"
                                type="checkbox"
                                checked={common}
                                onChange={(e) => setCommon(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-[#004687] focus:ring-[#004687]/30 cursor-pointer"
                            />
                            <Label htmlFor="common" className="text-sm text-slate-600 cursor-pointer">
                                Common
                            </Label>
                        </div>
                    </div>
                </div>

                {saveError && (
                    <p className="text-[12px] text-red-500 mt-4 max-w-3xl">{saveError}</p>
                )}

                {/* Actions */}
                <div className="flex items-end justify-end gap-2 mt-8 pt-5 border-t border-slate-100 max-w-7xl">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={submitting}
                        className="h-9 px-4 text-xs font-semibold cursor-pointer"
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-9 px-5 text-xs font-semibold bg-[#004687] hover:bg-[#00396e] cursor-pointer gap-1.5"
                    >
                        {submitting && <Loader2 size={13} className="animate-spin" />}
                        {isEdit ? "Update" : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
}