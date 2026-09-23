"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch } from "@/store";
import {
  checkCountryDuplication,
  saveCountry,
  updateCountry,
  type CountryDetail,
} from "../store/features/settings/systemsetup/countrySlice";
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

interface CreateCountryProps {
  onBack?: () => void;
  editData?: CountryDetail | null; // when provided, the form works in edit mode
}

export default function CreateCountry({ onBack, editData }: CreateCountryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!editData;

  const [country, setCountry] = useState(editData?.CountryName ?? "");
  const [countryCode, setCountryCode] = useState(editData?.CountryCode ?? "");
  const [saving, setSaving] = useState(false);

  // Create mode: empty the form. Edit mode: restore the loaded values.
  const handleClear = () => {
    setCountry(editData?.CountryName ?? "");
    setCountryCode(editData?.CountryCode ?? "");
  };

  const handleSubmit = async () => {
    const trimmedCountry = country.trim();
    const trimmedCode = countryCode.trim();

    if (!trimmedCountry) {
      toast.error("Country is required");
      return;
    }
    if (!trimmedCode) {
      toast.error("Country Code is required");
      return;
    }

    setSaving(true);
    try {
      const { duplicate } = await dispatch(
        checkCountryDuplication({
          countryName: trimmedCountry,
          countryId: editData?.CountryID ?? 0,
          countryCode: trimmedCode,
        })
      ).unwrap();

      if (duplicate) {
        toast.error("This country already exists");
        return;
      }

      if (editData) {
        await dispatch(
          updateCountry({
            payload: {
              ...editData,
              CountryName: trimmedCountry,
              CountryCode: trimmedCode,
            },
          })
        ).unwrap();

        toast.success("Country updated successfully");
      } else {
        await dispatch(
          saveCountry({
            payload: {
              Active: true,
              Common: true,
              CountryName: trimmedCountry,
              CountryCode: trimmedCode,
              CountryID: 0,
            },
          })
        ).unwrap();

        toast.success("Country created successfully");
        handleClear();
      }

      onBack?.();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : isEdit
            ? "Failed to update country"
            : "Failed to save country"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <PageHeader
        title="Country"
        subtitle="Masters"
        icon={<Globe size={16} className="text-white" />}
        createButtonLabel="Country Details"
        onCreateClick={onBack}
      />

      {/* Form */}
      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Country">
            <Input
              placeholder="Enter Country Name"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={saving}
              className="h-9 text-sm"
            />
          </Field>
          <Field label="Country Code">
            <Input
              placeholder="Enter Country Code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
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
