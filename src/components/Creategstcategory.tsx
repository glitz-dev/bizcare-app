"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronsUpDown, MoreHorizontal, Receipt, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "../common/PageHeader";
import {
  fetchItemUnits,
  fetchTaxCategories,
  fetchGSTCategoryByID,
  saveGSTCategory,
  updateGSTCategory,
} from "../store/features/settings/systemsetup/gstcategorySlice";
import type {
  ItemUnit,
  TaxCategoryOption,
  SaveGSTCategoryParams,
  UpdateGSTCategoryParams,
} from "../store/features/settings/systemsetup/gstcategorySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Searchable dropdown (shadcn Popover + Command) ───────────────────────────
interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  onOpen?: () => void;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  onOpen,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      onOpen?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm",
            "hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#004687]/30",
            !value && "text-slate-400"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <span className="flex items-center gap-1 shrink-0">
            {value && (
              <X
                size={13}
                className="text-slate-400 hover:text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              />
            )}
            <ChevronsUpDown size={13} className="text-slate-400" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9 text-sm" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Check
                    size={14}
                    className={cn(
                      "mr-2",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TaxCategoryRow {
  id: number;
  gstCategoryTID?: number;
  taxCategory: string;
  taxCategoryId: number;
  wefDate: string;
}

const todayISO = new Date().toISOString().slice(0, 10);

interface CreateGstCategoryProps {
  onBack?: () => void;
  gstCategoryMID?: number | null;
}

export default function CreateGstCategory({ onBack, gstCategoryMID }: CreateGstCategoryProps) {
  const dispatch = useDispatch<any>();
  const {
    itemUnitList,
    itemUnitLoading,
    taxCategoryList,
    taxCategoryLoading,
    gstCategorySaving,
    gstCategoryUpdating,
    gstCategoryDetail,
    gstCategoryDetailLoading,
  } = useSelector((state: any) => state.gstCategory);

  const isEditing = Boolean(gstCategoryMID);

  const [gstCategoryName, setGstCategoryName] = useState("");
  const [hsn, setHsn] = useState("");
  const [uom, setUom] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const [date, setDate] = useState(todayISO);
  const [taxCategoryRows, setTaxCategoryRows] = useState<TaxCategoryRow[]>([]);

  useEffect(() => {
    dispatch(fetchTaxCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!gstCategoryMID) return;
    dispatch(fetchItemUnits());
    dispatch(fetchGSTCategoryByID({ GSTCategoryMID: gstCategoryMID }));
  }, [dispatch, gstCategoryMID]);

  useEffect(() => {
    if (!gstCategoryMID || !gstCategoryDetail) return;
    if (gstCategoryDetail.GSTCategoryMID !== gstCategoryMID) return;

    setGstCategoryName(gstCategoryDetail.GSTCategoryName ?? "");
    setHsn(gstCategoryDetail.HSN ?? "");
    setUom(gstCategoryDetail.ItemUnitName ?? "");
    setTaxCategoryRows(
      (gstCategoryDetail.LstCustomerItems ?? []).map(
        (item: { GSTCategoryTID: number; TaxCategoryID: number | null; TaxCategoryName: string; WEFDate: string }) => ({
          id: item.GSTCategoryTID || Date.now() + Math.random(),
          gstCategoryTID: item.GSTCategoryTID,
          taxCategory: item.TaxCategoryName,
          taxCategoryId: item.TaxCategoryID ?? 0,
          wefDate: item.WEFDate ? item.WEFDate.slice(0, 10) : todayISO,
        })
      )
    );
  }, [gstCategoryDetail, gstCategoryMID]);

  const uomOptions = itemUnitList.map((u: ItemUnit) => u.ItemUnitName);
  const taxCategoryOptions = taxCategoryList.map((t: TaxCategoryOption) => t.TaxCategoryName);

  const handleAddTaxCategory = () => {
    if (!taxCategory || !date) return;
    const matched = taxCategoryList.find(
      (t: TaxCategoryOption) => t.TaxCategoryName === taxCategory
    );
    setTaxCategoryRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        taxCategory,
        taxCategoryId: matched?.TaxCategoryId ?? 0,
        wefDate: date,
      },
    ]);
    setTaxCategory("");
  };

  const handleRemoveRow = (id: number) => {
    setTaxCategoryRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleClear = () => {
    setGstCategoryName("");
    setHsn("");
    setUom("");
    setTaxCategory("");
    setDate(todayISO);
    setTaxCategoryRows([]);
  };

  const toWEFDateStr = (isoDate: string) => {
    const [y, m, d] = isoDate.split("-");
    return `${d}-${m}-${y}`;
  };

  const handleSubmit = async () => {
    if (!gstCategoryName || !hsn || !uom) {
      toast.error("Please fill GST Category Name, HSN and UOM.");
      return;
    }

    const matchedUnit = itemUnitList.find((u: ItemUnit) => u.ItemUnitName === uom);
    const pendingTaxCategory = taxCategoryList.find(
      (t: TaxCategoryOption) => t.TaxCategoryName === taxCategory
    );

    if (isEditing && gstCategoryDetail) {
      const payload: UpdateGSTCategoryParams = {
        GSTCategoryMID: gstCategoryDetail.GSTCategoryMID,
        GSTCategoryName: gstCategoryName,
        HSN: hsn,
        ItemUnitName: uom,
        UnitID: matchedUnit?.UnitID ?? gstCategoryDetail.UnitID ?? 0,
        UserID: gstCategoryDetail.UserID ?? 0,
        EntryDate: gstCategoryDetail.EntryDate,
        ModifiedUserID: gstCategoryDetail.ModifiedUserID,
        ModifiedDate: gstCategoryDetail.ModifiedDate,
        Status: gstCategoryDetail.Status,
        GSTCategoryMGuid: gstCategoryDetail.GSTCategoryMGuid,
        CompanyID: gstCategoryDetail.CompanyID,
        BranchID: gstCategoryDetail.BranchID,
        AllowDuplicateHSN: gstCategoryDetail.AllowDuplicateHSN,
        LstCustomerItemDetails: {
          TaxCategoryID: pendingTaxCategory?.TaxCategoryId ?? null,
          TaxCategoryName: taxCategory,
          WEFDateStr: toWEFDateStr(date),
        },
        LstCustomerItems: taxCategoryRows.map((row) => ({
          GSTCategoryTID: row.gstCategoryTID ?? 0,
          GSTCategoryMID: gstCategoryDetail.GSTCategoryMID,
          GSTCategoryM: null,
          TaxCategoryID: row.taxCategoryId,
          UserID: 0,
          EntryDate: "0001-01-01T00:00:00",
          ModifiedUserID: null,
          ModifiedDate: null,
          Status: false,
          GSTCategoryTGuid: "00000000-0000-0000-0000-000000000000",
          WEFDate: new Date(row.wefDate).toISOString(),
          WEFDateStr: toWEFDateStr(row.wefDate),
          TaxCategoryName: row.taxCategory,
        })),
      };

      try {
        await dispatch(updateGSTCategory(payload)).unwrap();
        toast.success("GST Category updated successfully.");
        handleClear();
        onBack?.();
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to update GST Category.");
      }
      return;
    }

    const payload: SaveGSTCategoryParams = {
      GSTCategoryName: gstCategoryName,
      HSN: hsn,
      ItemUnitName: uom,
      UnitID: matchedUnit?.UnitID ?? 0,
      LstCustomerItemDetails: {
        TaxCategoryID: pendingTaxCategory?.TaxCategoryId ?? null,
        TaxCategoryName: taxCategory,
        WEFDateStr: toWEFDateStr(date),
      },
      LstCustomerItems: taxCategoryRows.map((row) => ({
        TaxCategoryID: row.taxCategoryId,
        TaxCategoryName: row.taxCategory,
        WEFDate: new Date(row.wefDate).toISOString(),
        WEFDateStr: toWEFDateStr(row.wefDate),
      })),
    };

    try {
      await dispatch(saveGSTCategory(payload)).unwrap();
      toast.success("GST Category saved successfully.");
      handleClear();
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save GST Category.");
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <PageHeader
        title={isEditing ? "Edit GST Category" : "GST Category"}
        subtitle="Masters"
        icon={<Receipt size={16} className="text-white" />}
        createButtonLabel="GST Category Details"
        onCreateClick={onBack}
      />

      {isEditing && gstCategoryDetailLoading && (
        <div className="px-5 pt-3 text-xs text-slate-400">Loading GST category details...</div>
      )}

      {/* Form */}
      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="GST Category Name">
            <Input
              placeholder="Enter GST Category Name"
              value={gstCategoryName}
              onChange={(e) => setGstCategoryName(e.target.value)}
              className="h-9 text-sm"
            />
          </Field>
          <Field label="HSN">
            <Input
              placeholder="Enter HSN"
              value={hsn}
              onChange={(e) => setHsn(e.target.value)}
              className="h-9 text-sm"
            />
          </Field>
          <Field label="UOM">
            <SearchableSelect
              value={uom}
              onChange={setUom}
              options={uomOptions}
              placeholder={itemUnitLoading ? "Loading units..." : "Select unit"}
              onOpen={() => dispatch(fetchItemUnits())}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Field label="Tax Category">
            <SearchableSelect
              value={taxCategory}
              onChange={setTaxCategory}
              options={taxCategoryOptions}
              placeholder={taxCategoryLoading ? "Loading..." : "Select Tax Category"}
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-sm"
            />
          </Field>
          <Button
            onClick={handleAddTaxCategory}
            className="h-9 bg-[#004687] hover:bg-[#004697] text-white text-xs font-semibold rounded-md cursor-pointer"
          >
            Add Tax Category
          </Button>
        </div>

        {/* Added tax categories table */}
        <div className="rounded-lg overflow-hidden border border-slate-100">
          <div className="bg-[#004687] px-4 py-2 grid grid-cols-[1fr_1fr_40px] text-white text-[11px] font-bold uppercase tracking-wider">
            <span>Tax Category</span>
            <span>WEF Date</span>
            <span />
          </div>
          {taxCategoryRows.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No tax categories added yet.
            </div>
          ) : (
            taxCategoryRows.map((row, idx) => (
              <div
                key={row.id}
                className={cn(
                  "px-4 py-2 grid grid-cols-[1fr_1fr_40px] items-center text-sm text-slate-700",
                  idx % 2 === 1 && "bg-slate-50"
                )}
              >
                <span>{row.taxCategory}</span>
                <span>{row.wefDate}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600 justify-self-end cursor-pointer">
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-600 cursor-pointer"
                      onClick={() => handleRemoveRow(row.id)}
                    >
                      <Trash2 size={13} className="mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isEditing ? gstCategoryUpdating : gstCategorySaving}
          className="h-9 px-5 bg-[#004687] hover:bg-[#1a7ec6] text-white text-xs font-semibold rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isEditing
            ? gstCategoryUpdating
              ? "Updating..."
              : "Update"
            : gstCategorySaving
              ? "Saving..."
              : "Submit"}
        </Button>
        <Button
          onClick={handleClear}
          className="h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md cursor-pointer"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
