import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Coins, Hash, Type, Percent, Check, RotateCcw } from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppDispatch, RootState } from "@/store";
import {
  checkCurrencyDuplication,
  createNewCurrency,
  fetchCurrencyById,
  updateCurrency,
  type CreateCurrencyPayload,
  type CurrencyDetail,
} from "../store/features/settings/currencySlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Shared labeled-field wrapper (sourced from Createbranch.tsx) ─────────
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

interface CreateCurrencyProps {
  /** When provided, the form loads and edits this currency instead of creating a new one. */
  currencyId?: number;
  /** Called when the user clicks "Currency Details" — typically navigates back to the Currency list. */
  onBack?: () => void;
}

export default function CreateCurrency({ currencyId, onBack }: CreateCurrencyProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = currencyId != null;

  const { currencyDetail, currencyDetailLoading } = useSelector(
    (state: RootState) => state.currency
  );

  const [originalDetail, setOriginalDetail] = useState<CurrencyDetail | null>(null);
  const [code, setCode] = useState("");
  const [sign, setSign] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [active, setActive] = useState(true);
  const [common, setCommon] = useState(true);
  const [rateDirection, setRateDirection] = useState<"baseToCurrency" | "currencyToBase">(
    "baseToCurrency"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the currency to edit when a currencyId is provided
  useEffect(() => {
    if (isEditing) {
      dispatch(fetchCurrencyById({ currencyId }));
    }
  }, [isEditing, currencyId, dispatch]);

  // Prefill the form once the currency detail loads
  useEffect(() => {
    if (isEditing && currencyDetail && currencyDetail.CurrencyID === currencyId) {
      setOriginalDetail(currencyDetail);
      setCode(currencyDetail.CurrencyCode ?? "");
      setSign(currencyDetail.Symbol ?? "");
      setCurrency(currencyDetail.Currency ?? "");
      setActive(currencyDetail.Active);
      setCommon(currencyDetail.Common);
    }
  }, [isEditing, currencyDetail, currencyId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isDuplicate = await dispatch(
        checkCurrencyDuplication({
          currencyName: currency,
          currencyId: isEditing ? currencyId : undefined,
        })
      ).unwrap();

      if (isDuplicate) {
        toast.error(`"${currency}" already exists. Please use a different name.`);
        return;
      }

      if (isEditing && originalDetail) {
        const payload: CurrencyDetail = {
          ...originalDetail,
          CurrencyCode: code,
          Currency: currency,
          Symbol: sign,
          Active: active,
          Common: common,
        };

        await dispatch(updateCurrency({ payload })).unwrap();
        toast.success("Currency updated successfully.");
        onBack?.();
      } else {
        const payload: CreateCurrencyPayload = {
          CurrencyID: 0,
          CurrencyCode: code,
          Currency: currency,
          Symbol: sign,
          ExchRate: Number(exchangeRate) || 0,
          Active: active,
          Common: common,
          BaseToCur: rateDirection === "baseToCurrency",
          CurToBase: rateDirection === "currencyToBase",
        };

        await dispatch(createNewCurrency({ payload })).unwrap();
        toast.success("Currency saved successfully.");
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : `Failed to ${isEditing ? "update" : "save"} currency.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Currency"
        subtitle={isEditing ? "Edit Currency" : "Currency Setup"}
        icon={<Coins size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Currency Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Row 1 — Code / Sign / Currency / Exchange Rate / toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldShell icon={<Hash size={11} />} label="Code">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Currency Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Type size={11} />} label="Sign">
                <Input
                  value={sign}
                  onChange={(e) => setSign(e.target.value)}
                  placeholder="Sign"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Coins size={11} />} label="Currency">
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Currency"
                  className="h-9 text-sm border-l-4 border-slate-200 focus-visible:ring-1"
                  style={{
                    ["--tw-ring-color" as any]: BRAND,
                    borderLeftColor: "#94a3b8",
                  }}
                />
              </FieldShell>

              <FieldShell icon={<Percent size={11} />} label="Exchange Rate">
                <Input
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="Currency Rate"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>

            {/* Row 2 — Active / Common / Base To Currency / Currency To Base */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={common}
                  onChange={(e) => setCommon(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Common</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="rateDirection"
                  checked={rateDirection === "baseToCurrency"}
                  onChange={() => setRateDirection("baseToCurrency")}
                  className="h-4 w-4 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Base To Currency</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="rateDirection"
                  checked={rateDirection === "currencyToBase"}
                  onChange={() => setRateDirection("currencyToBase")}
                  className="h-4 w-4 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Currency To Base</span>
              </label>
            </div>
          </div>

          {/* ── Footer actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <Check size={14} />
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Submit"}
            </Button>
            <Button
              type="button"
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RotateCcw size={13} />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
