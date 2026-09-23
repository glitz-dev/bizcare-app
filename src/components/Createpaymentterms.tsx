"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/store";
import {
  createPaymentTerm,
  fetchPaymentTermById,
  updatePaymentTerm,
  clearPaymentTermDetail,
} from "../store/features/settings/systemsetup/paymenttermsSlice"; // adjust to the slice's actual path
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

interface CreatePaymentTermsProps {
  onBack?: () => void;
  /** When provided, the form loads and edits this record instead of creating a new one. */
  termId?: number;
}

export default function CreatePaymentTerms({ onBack, termId }: CreatePaymentTermsProps) {
  const isEditMode = termId != null;

  const dispatch = useDispatch<AppDispatch>();
  const {
    paymentTermSaving,
    paymentTermDetail,
    paymentTermDetailLoading,
    paymentTermUpdating,
  } = useSelector((state: RootState) => state.paymentTerms);

  const [paymentTerm, setPaymentTerm] = useState("");
  const [dueDays, setDueDays] = useState("");

  // Load the record to edit, and clear it on unmount so a later "Create" doesn't see stale data.
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchPaymentTermById(termId));
    }
    return () => {
      dispatch(clearPaymentTermDetail());
    };
  }, [dispatch, isEditMode, termId]);

  // Prefill the form once the detail record for this termId has loaded.
  useEffect(() => {
    if (isEditMode && paymentTermDetail && paymentTermDetail.TermsID === termId) {
      setPaymentTerm(paymentTermDetail.PaymentTerm);
      setDueDays(String(paymentTermDetail.DueDays));
    }
  }, [isEditMode, paymentTermDetail, termId]);

  const isSaving = isEditMode ? paymentTermUpdating : paymentTermSaving;

  const handleClear = () => {
    setPaymentTerm("");
    setDueDays("");
  };

  const handleSubmit = async () => {
    if (!paymentTerm.trim()) {
      toast.error("Payment Term is required");
      return;
    }
    if (dueDays.trim() === "" || Number.isNaN(Number(dueDays)) || Number(dueDays) < 0) {
      toast.error("Enter a valid number of due days");
      return;
    }

    if (isEditMode) {
      if (!paymentTermDetail) {
        toast.error("Payment term details are still loading");
        return;
      }
      try {
        await dispatch(
          updatePaymentTerm({
            TermsID: paymentTermDetail.TermsID,
            PaymentTerm: paymentTerm.trim(),
            DueDays: String(Number(dueDays)),
            UserID: paymentTermDetail.UserID,
            CompanyID: paymentTermDetail.CompanyID,
            EntryDate: paymentTermDetail.EntryDate,
            ModifiedUserID: paymentTermDetail.ModifiedUserID ?? paymentTermDetail.UserID,
            ModifiedDate: new Date().toISOString(),
            PaymentTermsGUID: paymentTermDetail.PaymentTermsGUID,
            Status: paymentTermDetail.Status,
          })
        ).unwrap();

        toast.success("Payment term updated successfully");
        onBack?.();
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to update payment term");
      }
      return;
    }

    try {
      await dispatch(
        createPaymentTerm({
          TermsID: 0, // 0 => new record
          PaymentTerm: paymentTerm.trim(),
          DueDays: String(Number(dueDays)),
        })
      ).unwrap();

      toast.success("Payment term created successfully");
      handleClear();
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create payment term");
    }
  };

  const fieldsDisabled = isSaving || (isEditMode && paymentTermDetailLoading);

  return (
    <div className="bg-white">
      {/* Header */}
      <PageHeader
        title="Payment Terms"
        subtitle="Masters"
        icon={<Wallet size={16} className="text-white" />}
        createButtonLabel="Payment Terms Details"
        onCreateClick={onBack}
      />

      {/* Form */}
      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Payment Term">
            <Input
              placeholder="Enter Payment Term"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              disabled={fieldsDisabled}
              className="h-9 text-sm"
            />
          </Field>
          <Field label="Due Days">
            <Input
              placeholder="Due Days"
              type="number"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
              disabled={fieldsDisabled}
              className="h-9 text-sm"
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={fieldsDisabled}
          className="h-9 px-5 bg-[#004687] hover:bg-[#1a7ec6] text-white text-xs font-semibold rounded-md cursor-pointer disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Submit"}
        </Button>
        <Button
          onClick={handleClear}
          disabled={fieldsDisabled}
          className="h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md cursor-pointer disabled:opacity-60"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
