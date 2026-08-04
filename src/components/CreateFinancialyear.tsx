// CreateFinancialyear.tsx
"use client";

import { useState } from "react";
import { CalendarRange, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "../common/PageHeader";
import {
  checkFinYearDuplication,
  createNewFinancialYear,
  type CreateFinancialYearPayload,
} from "../store/features/settings/financialyearSlice";
import { useDispatch } from "react-redux";

const BRAND = "#004687";

interface CreateFinancialyearProps {
  onBack?: () => void;
}

interface FormState {
  fromDate: string; // yyyy-mm-dd (native date input)
  toDate: string; // yyyy-mm-dd (native date input)
  name: string;
  allowEditOpBal: boolean;
  active: boolean;
}

const emptyForm: FormState = {
  fromDate: "",
  toDate: "",
  name: "",
  allowEditOpBal: false,
  active: false,
};

// Converts yyyy-mm-dd (native date input) -> "DD-MM-YYYY"
function toDisplayDate(inputDate: string) {
  if (!inputDate) return "";
  const [y, m, d] = inputDate.split("-");
  return `${d}-${m}-${y}`;
}

// Converts yyyy-mm-dd (native date input) -> ISO string
function toIsoDate(inputDate: string) {
  if (!inputDate) return "";
  return new Date(`${inputDate}T00:00:00`).toISOString();
}

interface FieldShellProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}
function FieldShell({ label, children, className = "" }: FieldShellProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
        style={{ accentColor: BRAND }}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

export default function CreateFinancialyear({
  onBack,
}: CreateFinancialyearProps) {
  const dispatch = useDispatch();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.fromDate || !form.toDate) {
      setError("From Date and To Date are required.");
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (form.fromDate >= form.toDate) {
      setError("From Date must be before To Date.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const finYearName = form.name.trim();

      const isDuplicate = await (dispatch(
        checkFinYearDuplication({ finYearName, finYearID: 0 }) as any
      ) as any).unwrap();

      if (isDuplicate) {
        toast.error("This financial year already exists.");
        return;
      }

      const payload: CreateFinancialYearPayload = {
        FinYearID: 0,
        FinYearName: finYearName,
        FromDatestr: toDisplayDate(form.fromDate),
        ToDatestr: toDisplayDate(form.toDate),
        FromDate: toIsoDate(form.fromDate),
        ToDate: toIsoDate(form.toDate),
        OpBalEdit: form.allowEditOpBal,
        ActiveFinYear: form.active,
      };

      await dispatch(createNewFinancialYear({ payload }) as any).unwrap();

      toast.success("Financial year created successfully.");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      setForm(emptyForm);
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Failed to save financial year.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClear() {
    setForm(emptyForm);
    setError(null);
  }

  return (
    <div className="border border-slate-200 bg-white overflow-hidden shadow-sm h-full">
      <PageHeader
        title="Financial Year"
        subtitle="Create New Period"
        icon={<CalendarRange className="w-4 h-4 text-white" />}
        showCreateButton={!!onBack}
        createButtonLabel="Financial Year Details"
        onCreateClick={onBack}
      />

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldShell label="From Date">
            <input
              type="date"
              value={form.fromDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, fromDate: e.target.value }))
              }
              className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]"
            />
          </FieldShell>

          <FieldShell label="To Date">
            <input
              type="date"
              value={form.toDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, toDate: e.target.value }))
              }
              className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004687]/30 focus:border-[#004687]"
            />
          </FieldShell>

          <FieldShell label="Name" className="sm:col-span-1">
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Financial Year"
              className="h-9 text-sm"
            />
          </FieldShell>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <CheckboxField
            label="Allow To Edit Op. Bal."
            checked={form.allowEditOpBal}
            onChange={(checked) =>
              setForm((f) => ({ ...f, allowEditOpBal: checked }))
            }
          />
          <CheckboxField
            label="Active"
            checked={form.active}
            onChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        {submitted && (
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ListChecks size={13} />
            Financial year saved successfully.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
        <Button
          type="button"
          onClick={handleClear}
          disabled={isSubmitting}
          className="h-9 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Clear
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-9 text-sm font-semibold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND }}
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
