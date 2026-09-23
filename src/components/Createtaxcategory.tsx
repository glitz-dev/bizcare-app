import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Hash,
  Percent,
  AlignLeft,
  Check,
  RotateCcw,
  Loader2,
  ListOrdered
} from "lucide-react";
import { PageHeader } from "../common/PageHeader"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppDispatch, RootState } from "@/store";
import {
  checkTaxCategoryDuplication,
  createNewTaxCategory,
  fetchTaxCategoryById,
  updateTaxCategory,
  clearSelectedTaxCategory,
} from "../store/features/settings/taxcategorySlice";

const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

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
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

interface CreateTaxCategoryProps {
  onBack?: () => void;
  onSuccess?: () => void;
  /** When provided, the form opens in edit mode for this tax category. */
  taxCategoryId?: number;
  /** Current name of the row being edited — needed to run the duplication check before loading details. */
  initialTaxCategoryName?: string;
}

export default function CreateTaxCategory({
  onBack,
  onSuccess,
  taxCategoryId,
  initialTaxCategoryName,
}: CreateTaxCategoryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = taxCategoryId != null;

  const { selectedTaxCategoryLoading } = useSelector((state: RootState) => state.taxCategory);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(isEditMode);

  const [code, setCode] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [description, setDescription] = useState("");

  // ─── Edit mode: check duplication then load the record's details ──────────
  useEffect(() => {
    if (!isEditMode || taxCategoryId == null) return;

    let isCancelled = false;

    (async () => {
      try {
        setIsLoadingDetails(true);

        if (initialTaxCategoryName) {
          await dispatch(
            checkTaxCategoryDuplication({
              taxCategoryName: initialTaxCategoryName,
              taxCategoryId,
            })
          ).unwrap();
        }

        const detail = await dispatch(fetchTaxCategoryById({ taxCategoryId })).unwrap();

        if (isCancelled) return;

        setCode(detail.TaxCategoryCode ?? "");
        setTaxCategory(detail.TaxCategoryName ?? "");
        setTaxPercentage(
          detail.TaxValue !== null && detail.TaxValue !== undefined ? String(detail.TaxValue) : ""
        );
        setDescription(detail.Description ?? "");
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load tax category:", error);
          toast.error(typeof error === "string" ? error : "Failed to load tax category details.");
        }
      } finally {
        if (!isCancelled) setIsLoadingDetails(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, taxCategoryId]);

  // Clear the selected-record state once the form unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedTaxCategory());
    };
  }, [dispatch]);

  const handleClear = () => {
    setCode("");
    setTaxCategory("");
    setTaxPercentage("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!code.trim() || !taxCategory.trim() || !taxPercentage.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && taxCategoryId != null) {
        // ── Update flow ─────────────────────────────────────────────────
        await dispatch(
          updateTaxCategory({
            payload: {
              TaxCategoryId: taxCategoryId,
              TaxCategoryCode: code.trim(),
              TaxCategoryName: taxCategory.trim(),
              Description: description.trim() ? description.trim() : null,
              TaxValue: Number(taxPercentage),
            },
          })
        ).unwrap();

        toast.success("Tax Category updated successfully!");
      } else {
        // ── Create flow ─────────────────────────────────────────────────
        const isDuplicate = await dispatch(
          checkTaxCategoryDuplication({
            taxCategoryName: taxCategory.trim(),
            taxCategoryId: 0,
          })
        ).unwrap();

        if (isDuplicate) {
          toast.error("A tax category with this name already exists.");
          return;
        }

        await dispatch(
          createNewTaxCategory({
            payload: {
              TaxCategoryId: 0,
              TaxCategoryCode: code.trim(),
              TaxCategoryName: taxCategory.trim(),
              TaxValue: taxPercentage.trim(),
            },
          })
        ).unwrap();

        toast.success("Tax Category created successfully!");
      }

      handleClear();

      if (onSuccess) {
        onSuccess();
      } else if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        typeof error === "string"
          ? error
          : `Failed to ${isEditMode ? "update" : "create"} tax category.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isLoadingDetails || selectedTaxCategoryLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="TAX CATEGORY"
        subtitle={isEditMode ? "Edit Tax Category" : "Create New Tax Category"}
        icon={<Percent size={16} className="text-white" />}
        showCreateButton={true}
        createButtonLabel="TAX CATEGORY DETAILS"
        onCreateClick={onBack || (() => console.log("Go back to list"))}
      />

      <div className="p-5 space-y-5">
        {/* ── Tax Category Details Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 py-10">
                <Loader2 size={16} className="animate-spin" />
                Loading tax category...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FieldShell icon={<Hash size={11} />} label="Code">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Tax Category Code"
                    disabled={isBusy}
                    className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                    style={{ ["--tw-ring-color" as any]: BRAND }}
                  />
                </FieldShell>

                <FieldShell icon={<ListOrdered size={11} />} label="Tax Category">
                  <Input
                    value={taxCategory}
                    onChange={(e) => setTaxCategory(e.target.value)}
                    placeholder="Tax Category"
                    disabled={isBusy}
                    className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                    style={{ ["--tw-ring-color" as any]: BRAND }}
                  />
                </FieldShell>

                <FieldShell icon={<Percent size={11} />} label="Tax Percentage">
                  <Input
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    placeholder="Tax Percentage"
                    type="number"
                    disabled={isBusy}
                    className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                    style={{ ["--tw-ring-color" as any]: BRAND }}
                  />
                </FieldShell>

                <div className="sm:col-span-3">
                  <FieldShell icon={<AlignLeft size={11} />} label="Description">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      disabled={isBusy}
                      className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-1 placeholder:text-slate-400 transition-shadow disabled:opacity-70"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ───────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-white"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isSubmitting
              ? isEditMode
                ? "UPDATING..."
                : "SUBMITTING..."
              : isEditMode
              ? "UPDATE"
              : "SUBMIT"}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            disabled={isBusy}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            CLEAR
          </Button>
        </div>
      </div>
    </div>
  );
}
