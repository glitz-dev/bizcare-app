"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronsUpDown, Monitor, X } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/store";
import {
  checkMachineDuplication,
  fetchStores,
  saveMachine,
  updateMachine,
  type MachineDetail,
} from "../store/features/settings/systemsetup/machineregistrationSlice";
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

export interface MachineFormValues {
  machineCode: string;
  machineIP: string;
  machineName: string;
  storeId: string;
  macAddress: string;
  tillOpenCommand: string;
}

interface CreateMachineregistrationProps {
  onBack?: () => void;
  editData?: MachineDetail | null; // when provided, the form works in edit mode
}

const emptyForm: MachineFormValues = {
  machineCode: "",
  machineIP: "",
  machineName: "",
  storeId: "",
  macAddress: "",
  tillOpenCommand: "",
};

// Build the initial form values from a fetched record (edit mode) or empty (create mode).
const toFormValues = (d?: MachineDetail | null): MachineFormValues =>
  d
    ? {
        machineCode: d.MachineCode ?? "",
        machineIP: d.MachineIP ?? "",
        machineName: d.MachineName ?? "",
        storeId: d.StoreID ? String(d.StoreID) : "",
        macAddress: d.MacID ?? "",
        tillOpenCommand: d.TillOpenCommand ?? "",
      }
    : emptyForm;

export default function CreateMachineregistration({
  onBack,
  editData,
}: CreateMachineregistrationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!editData;
  const { storeList, storeListLoading } = useSelector(
    (state: RootState) => state.machineRegistration
  );

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  const [form, setForm] = useState<MachineFormValues>(() => toFormValues(editData));
  const [saving, setSaving] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);

  // In edit mode the store list may not have loaded yet, so fall back to the fetched record's store.
  const selectedStoreName =
    storeList.find((st: any) => String(st.StoreID) === form.storeId)?.StoreName ??
    (editData && String(editData.StoreID) === form.storeId ? editData.StoreM?.StoreName ?? "" : "");

  const setField = <K extends keyof MachineFormValues>(key: K, value: MachineFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Create mode: empty the form. Edit mode: restore the loaded values.
  const handleClear = () => setForm(toFormValues(editData));

  const handleSubmit = async () => {
    const values: MachineFormValues = {
      ...form,
      machineCode: form.machineCode.trim(),
      machineIP: form.machineIP.trim(),
      machineName: form.machineName.trim(),
      macAddress: form.macAddress.trim(),
      tillOpenCommand: form.tillOpenCommand.trim(),
    };

    if (!values.machineCode) {
      toast.error("Machine Code is required");
      return;
    }
    if (!values.machineIP) {
      toast.error("Machine IP Address is required");
      return;
    }
    if (!values.machineName) {
      toast.error("Machine Name is required");
      return;
    }

    const selectedStore =
      storeList.find((st: any) => String(st.StoreID) === values.storeId) ??
      (editData && String(editData.StoreID) === values.storeId
        ? { StoreID: editData.StoreID, StoreName: editData.StoreM?.StoreName ?? "" }
        : undefined);
    if (!selectedStore) {
      toast.error("Store For Counter is required");
      return;
    }

    setSaving(true);
    try {
      const { duplicate } = await dispatch(
        checkMachineDuplication({
          machineCode: values.machineCode,
          machineIP: values.machineIP,
          macId: values.macAddress,
          machineName: values.machineName,
          machineId: editData?.MachineID ?? 0,
        })
      ).unwrap();

      if (duplicate) {
        toast.error("This machine already exists");
        return;
      }

      if (editData) {
        await dispatch(
          updateMachine({
            payload: {
              ...editData,
              MachineCode: values.machineCode,
              MachineIP: values.machineIP,
              MachineName: values.machineName,
              MacID: values.macAddress,
              Store: selectedStore.StoreName,
              StoreID: selectedStore.StoreID,
              TillOpenCommand: values.tillOpenCommand,
            },
          })
        ).unwrap();

        toast.success("Machine updated successfully");
      } else {
        await dispatch(
          saveMachine({
            payload: {
              MachineID: 0,
              MachineCode: values.machineCode,
              MachineIP: values.machineIP,
              MachineName: values.machineName,
              MacID: values.macAddress,
              Store: selectedStore.StoreName,
              StoreID: selectedStore.StoreID,
              TillOpenCommand: values.tillOpenCommand,
            },
          })
        ).unwrap();

        toast.success("Machine registered successfully");
        handleClear();
      }

      onBack?.();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : isEdit
            ? "Failed to update machine"
            : "Failed to save machine"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <PageHeader
        title="Machine Registration"
        subtitle="Inventory"
        icon={<Monitor size={16} className="text-white" />}
        createButtonLabel="Machine Registration Details"
        onCreateClick={onBack}
      />

      {/* Form */}
      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Field label="Machine Code" className="md:col-span-2">
            <Input
              placeholder="Machine Code"
              value={form.machineCode}
              onChange={(e) => setField("machineCode", e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>

          <Field label="Machine IP Address" className="md:col-span-4">
            <Input
              placeholder="Machine IP Address"
              value={form.machineIP}
              onChange={(e) => setField("machineIP", e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>

          <Field label="Machine Name" className="md:col-span-3">
            <Input
              placeholder="Machine Name"
              value={form.machineName}
              onChange={(e) => setField("machineName", e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>

          <Field label="Store For Counter" className="md:col-span-3">
            <div className="relative">
              <Popover open={storeOpen} onOpenChange={setStoreOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={storeOpen}
                    disabled={saving}
                    className="h-9 w-full justify-between px-3 text-sm font-normal cursor-pointer"
                  >
                    <span className={cn("truncate", !selectedStoreName && "text-muted-foreground")}>
                      {selectedStoreName || "Select Counter Store"}
                    </span>
                    <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                  <Command>
                    <CommandInput placeholder="Search store..." className="h-9 text-sm" />
                    <CommandList>
                      {storeListLoading ? (
                        <div className="py-6 text-center text-sm text-slate-400">
                          Loading stores...
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No stores found.</CommandEmpty>
                          <CommandGroup>
                            {storeList.map((store:any) => (
                              <CommandItem
                                key={store.StoreID}
                                value={String(store.StoreID)}
                                keywords={[store.StoreName]}
                                onSelect={() => {
                                  setField("storeId", String(store.StoreID));
                                  setStoreOpen(false);
                                }}
                              >
                                <Check
                                  size={14}
                                  className={cn(
                                    "mr-2",
                                    form.storeId === String(store.StoreID)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {store.StoreName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.storeId && !saving && (
                <button
                  type="button"
                  onClick={() => setField("storeId", "")}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </Field>

          <Field label="Mac Address" className="md:col-span-6">
            <Input
              placeholder="Mac Address"
              value={form.macAddress}
              onChange={(e) => setField("macAddress", e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>

          <Field label="Till Open Command" className="md:col-span-6">
            <Input
              placeholder="Enter Till Open Command"
              value={form.tillOpenCommand}
              onChange={(e) => setField("tillOpenCommand", e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="h-9 px-5 bg-[#004687] hover:bg-[#1a7ec6] text-white text-xs font-semibold rounded-md cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit"}
        </Button>
        <Button
          onClick={handleClear}
          disabled={saving}
          className="h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md cursor-pointer disabled:opacity-60"
        >
          {isEdit ? "Reset" : "Clear"}
        </Button>
      </div>
    </div>
  );
}
