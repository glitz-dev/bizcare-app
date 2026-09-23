"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hash, User, Building2, Briefcase, Check, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";

// ⚠️ adjust this path if your PageHeader lives elsewhere
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AppDispatch, RootState } from "@/store";

import {
  fetchDepartmentStartWith,
  fetchDesignationStartWith,
  fetchEmployeeById,
  saveEmployeeChanges,
  clearEmployeeDetail,
  type SaveEmployeeChangesPayload,
} from "../store/features/settings/systemsetup/employeeSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";
const ACCENT = "#F59E0B";

// ─── Shared input style helpers ────────────────────────────────────────────
const inputClass = "h-9 text-sm border-slate-200 focus-visible:ring-1";
const ringStyle = { ["--tw-ring-color" as any]: BRAND };

// ─── Shared labeled-field wrapper ──────────────────────────────────────────
function FieldShell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
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
        <label className="text-xs font-semibold text-slate-600">{label}</label>
      </div>
      {children}
    </div>
  );
}

interface SelectItem {
  id: string;
  label: string;
}

// ─── Static-list searchable select (also used for API-backed dropdowns) ───
function StaticSelect({
  displayValue,
  onSelect,
  onClear,
  placeholder,
  items,
  onOpen,
  loading,
}: {
  displayValue: string;
  onSelect: (item: SelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SelectItem[];
  /** Called the moment the dropdown opens — use to lazily fetch options. */
  onOpen?: () => void;
  /** Shows a loading state in place of the empty-results message. */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) onOpen?.();
    setOpen(next);
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 cursor-pointer",
              !displayValue && "text-slate-400"
            )}
            style={ringStyle}
          >
            <span className="truncate">{displayValue || placeholder}</span>
            <ChevronsUpDown size={14} className="shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.replace("Select ", "")}...`} />
            <CommandList>
              <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      size={14}
                      className={cn(
                        "mr-2",
                        displayValue === item.label ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {displayValue && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label={`Clear ${placeholder}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Shared checkbox row ────────────────────────────────────────────────────
function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
      />
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </label>
  );
}

interface CreateEmployeeProps {
  /** When set, the form loads and updates this employee instead of creating a new one. */
  employeeId?: number;
  /** Called when the user clicks "Employee Details" — typically navigates back to the list. */
  onBack?: () => void;
}

export default function CreateEmployee({ employeeId, onBack }: CreateEmployeeProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = employeeId !== undefined;

  const {
    departmentStartWithList,
    departmentStartWithLoading,
    designationStartWithList,
    designationStartWithLoading,
    employeeSaveLoading,
    employeeDetail,
    employeeDetailLoading,
  } = useSelector((state: RootState) => state.employee);

  const departmentItems: SelectItem[] = departmentStartWithList.map((d) => ({
    id: String(d.DepartmentID),
    label: d.DepartmentName,
  }));
  const designationItems: SelectItem[] = designationStartWithList.map((d) => ({
    id: String(d.DesignationID),
    label: d.DesignationName,
  }));

  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentLabel, setDepartmentLabel] = useState("");
  const [designationId, setDesignationId] = useState<number | null>(null);
  const [designationLabel, setDesignationLabel] = useState("");
  const [active, setActive] = useState(true);
  const [common, setCommon] = useState(true);

  // ── Edit mode: load the employee, then prefill the form once it arrives ──
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchEmployeeById({ employeeId }));
    }
    return () => {
      dispatch(clearEmployeeDetail());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (isEditMode && employeeDetail && employeeDetail.EmployeeID === employeeId) {
      setEmployeeCode(employeeDetail.EmpCode);
      setEmployeeName(employeeDetail.EmpName);
      setDepartmentId(employeeDetail.DepartmentID);
      setDepartmentLabel(employeeDetail.DepartmentM?.DepartmentName ?? "");
      setDesignationId(employeeDetail.DesignationID);
      setDesignationLabel(employeeDetail.DesignationM?.DesignationName ?? "");
      setActive(employeeDetail.Active);
      setCommon(employeeDetail.Common);
    }
  }, [isEditMode, employeeDetail, employeeId]);

  function handleClear() {
    setEmployeeCode("");
    setEmployeeName("");
    setDepartmentId(null);
    setDepartmentLabel("");
    setDesignationId(null);
    setDesignationLabel("");
    setActive(true);
    setCommon(true);
  }

  function handleDepartmentOpen() {
    if (!departmentStartWithList.length && !departmentStartWithLoading) {
      dispatch(fetchDepartmentStartWith());
    }
  }

  function handleDesignationOpen() {
    if (!designationStartWithList.length && !designationStartWithLoading) {
      dispatch(fetchDesignationStartWith());
    }
  }

  async function handleSubmit() {
    if (!employeeCode.trim() || !employeeName.trim()) {
      toast.error("Employee Code and Employee Name are required.");
      return;
    }
    if (departmentId === null || designationId === null) {
      toast.error("Please select a Department and Designation.");
      return;
    }

    const payload: SaveEmployeeChangesPayload = {
      Active: active,
      Common: common,
      DepartmentID: departmentId,
      DepartmentName: departmentLabel,
      DesignationID: designationId,
      DesignationName: designationLabel,
      EmpCode: employeeCode,
      EmpName: employeeName,
    };

    if (isEditMode && employeeDetail) {
      payload.EmployeeID = employeeDetail.EmployeeID;
      payload.BranchID = employeeDetail.BranchID;
      payload.CompanyID = employeeDetail.CompanyID;
      payload.EmpMGuid = employeeDetail.EmpMGuid;
      payload.EntryDate = employeeDetail.EntryDate;
      payload.ModifiedDate = employeeDetail.ModifiedDate;
      payload.ModifiedUserID = employeeDetail.ModifiedUserID;
      payload.Status = employeeDetail.Status;
      payload.UserID = employeeDetail.UserID;
      // ⚠️ StaticSelect only gives us an id/label pair, not the full DepartmentM/
      // DesignationM object GetEmployeeById returned. Carry the original nested
      // object forward only when the user left that selection unchanged; if they
      // picked a different department/designation, omit it and let the backend
      // resolve it from DepartmentID/DesignationID alone.
      if (departmentId === employeeDetail.DepartmentID) {
        payload.DepartmentM = employeeDetail.DepartmentM;
      }
      if (designationId === employeeDetail.DesignationID) {
        payload.DesignationM = employeeDetail.DesignationM;
      }
    }

    try {
      await dispatch(saveEmployeeChanges({ payload })).unwrap();

      toast.success(isEditMode ? "Employee updated." : "Employee saved.");
      handleClear();
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save employee.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="EMPLOYEE"
        subtitle={isEditMode ? "Edit employee record" : "Create or search employee records"}
        icon={<User size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Employee Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            {isEditMode && employeeDetailLoading ? (
              <div className="text-xs text-slate-500">Loading employee details...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldShell icon={<Hash size={11} />} label="Employee Code">
                  <Input
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee Code"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<User size={11} />} label="Employee Name">
                  <Input
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Employee Name"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Building2 size={11} />} label="Department">
                  <StaticSelect
                    displayValue={departmentLabel}
                    onSelect={(item) => {
                      setDepartmentId(Number(item.id));
                      setDepartmentLabel(item.label);
                    }}
                    onClear={() => {
                      setDepartmentId(null);
                      setDepartmentLabel("");
                    }}
                    placeholder="Select Department"
                    items={departmentItems}
                    onOpen={handleDepartmentOpen}
                    loading={departmentStartWithLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Briefcase size={11} />} label="Designation">
                  <StaticSelect
                    displayValue={designationLabel}
                    onSelect={(item) => {
                      setDesignationId(Number(item.id));
                      setDesignationLabel(item.label);
                    }}
                    onClear={() => {
                      setDesignationId(null);
                      setDesignationLabel("");
                    }}
                    placeholder="Select Designation"
                    items={designationItems}
                    onOpen={handleDesignationOpen}
                    loading={designationStartWithLoading}
                  />
                </FieldShell>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <CheckboxRow checked={active} onChange={setActive} label="Active" />
              <CheckboxRow checked={common} onChange={setCommon} label="Common" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50/50">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={employeeSaveLoading || (isEditMode && employeeDetailLoading)}
                className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                style={{ backgroundColor: BRAND }}
              >
                <Check size={14} />
                {employeeSaveLoading ? "Saving..." : isEditMode ? "Update" : "Submit"}
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                disabled={employeeSaveLoading}
                className="h-9 text-xs font-semibold gap-1.5 cursor-pointer text-white hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <X size={14} />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
