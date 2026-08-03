import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GitBranch,
  Hash,
  Building2,
  FileText,
  Phone,
  Coins,
  Clock,
  MapPin,
  Image,
  Check,
  ChevronsUpDown,
  X,
  RotateCcw,
} from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchCurrencyStartWith,
  fetchTimeZoneStartWith,
  checkBranchDuplication,
  createNewBranch,
  type CreateBranchPayload,
} from "../store/features/settings/branchSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

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
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

// ─── Searchable select (server-driven: fetches on open + on search) ───────
interface SearchableSelectItem {
  id: string;
  label: string;
}

function SearchableSelect({
  displayValue,
  onSelect,
  onClear,
  placeholder,
  items,
  loading,
  onOpen,
  onSearch,
}: {
  displayValue: string;
  onSelect: (item: SearchableSelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SearchableSelectItem[];
  loading: boolean;
  onOpen: () => void;
  onSearch: (query: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(query: string) {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => onSearch(query), 300);
  }

  return (
    <div className="relative">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) onOpen();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 cursor-pointer",
              !displayValue && "text-slate-400"
            )}
            style={{ ["--tw-ring-color" as any]: BRAND }}
          >
            <span className="truncate">{displayValue || placeholder}</span>
            <ChevronsUpDown size={14} className="shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${placeholder.replace("Select ", "")}...`}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {loading && (
                <div className="py-4 text-center text-xs text-slate-400">Loading...</div>
              )}
              {!loading && items.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
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

interface CreateBranchProps {
  /** Called when the user clicks "Branch Details" — typically navigates back to the Branch list. */
  onBack?: () => void;
  /** Called with the core fields when the user clicks "Submit". */
  onSubmit?: (data: { code: string; name: string; address: string }) => void;
}

export default function CreateBranch({ onBack, onSubmit }: CreateBranchProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currencyList, currencyLoading, timeZoneList, timeZoneLoading } = useSelector(
    (s: RootState) => s.branch
  );

  const currencyItems: SearchableSelectItem[] = currencyList.map((c) => ({
    id: String(c.CurrencyID),
    label: `${c.Currency} (${c.CurrencyCode})`,
  }));
  const timeZoneItems: SearchableSelectItem[] = timeZoneList.map((t) => ({
    id: String(t.TimeZoneID),
    label: t.TimeZoneDesc,
  }));

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [timezone, setTimezone] = useState("");
  const [timezoneLabel, setTimezoneLabel] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [taxApplicable, setTaxApplicable] = useState(false);
  const [taxType, setTaxType] = useState<"GST" | "VAT">("GST");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClear() {
    setCode("");
    setName("");
    setPrintTitle("");
    setPhone("");
    setCurrency("");
    setCurrencyLabel("");
    setTimezone("");
    setTimezoneLabel("");
    setAddress("");
    setGstin("");
    setLogoPath("");
    setTaxApplicable(false);
    setTaxType("GST");
  }

  async function handleSubmit() {
    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (!trimmedCode || !trimmedName) return;

    setIsSubmitting(true);
    try {
      const isDuplicate = await dispatch(
        checkBranchDuplication({
          branchCode: trimmedCode,
          branchName: trimmedName,
          branchId: 0,
        })
      ).unwrap();

      if (isDuplicate) {
        toast.error("Branch already exists.");
        return;
      }

      const selectedCurrency = currencyList.find(
        (c) => String(c.CurrencyID) === currency
      );

      const payload: CreateBranchPayload = {
        BranchID: 0,
        BranchCode: trimmedCode,
        BranchName: trimmedName,
        ShortName: printTitle.trim(),
        PhoneNo: phone.trim(),
        Address: address.trim(),
        Currency: selectedCurrency?.Currency ?? "",
        CurrencyID: currency ? Number(currency) : 0,
        TimeZoneDesc: timezoneLabel,
        TimeZoneID: timezone ? Number(timezone) : 0,
        GSTIN: gstin.trim(),
        LogoPath: logoPath.trim(),
        TaxApplicable: taxApplicable,
      };

      await dispatch(createNewBranch({ payload })).unwrap();

      toast.success("Branch created successfully.");
      onSubmit?.({ code: trimmedCode, name: trimmedName, address: address.trim() });
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save branch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Branch"
        subtitle="Branch Setup"
        icon={<GitBranch size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Branch Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Row 1 — Code / Branch / Print Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldShell icon={<Hash size={11} />} label="Code">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Branch Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Building2 size={11} />} label="Branch">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Branch Name"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<FileText size={11} />} label="Print Title">
                <Input
                  value={printTitle}
                  onChange={(e) => setPrintTitle(e.target.value)}
                  placeholder="Print Title"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>

            {/* Row 2 — Phone / Base Currency / Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldShell icon={<Phone size={11} />} label="Phone">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile/Phone No."
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Coins size={11} />} label="Base Currency">
                <SearchableSelect
                  displayValue={currencyLabel}
                  onSelect={(item) => {
                    setCurrency(item.id);
                    setCurrencyLabel(item.label);
                  }}
                  onClear={() => {
                    setCurrency("");
                    setCurrencyLabel("");
                  }}
                  placeholder="Select Currency"
                  items={currencyItems}
                  loading={currencyLoading}
                  onOpen={() => dispatch(fetchCurrencyStartWith())}
                  onSearch={(query) => dispatch(fetchCurrencyStartWith({ startWith: query }))}
                />
              </FieldShell>

              <FieldShell icon={<Clock size={11} />} label="Timezone">
                <SearchableSelect
                  displayValue={timezoneLabel}
                  onSelect={(item) => {
                    setTimezone(item.id);
                    setTimezoneLabel(item.label);
                  }}
                  onClear={() => {
                    setTimezone("");
                    setTimezoneLabel("");
                  }}
                  placeholder="Select TimeZone"
                  items={timeZoneItems}
                  loading={timeZoneLoading}
                  onOpen={() => dispatch(fetchTimeZoneStartWith())}
                  onSearch={(query) => dispatch(fetchTimeZoneStartWith({ startWith: query }))}
                />
              </FieldShell>
            </div>

            {/* Row 3 — Address / GSTIN + Tax Applicable / Logo Path */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldShell icon={<MapPin size={11} />} label="Address">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  rows={4}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <div className="space-y-4">
                <FieldShell icon={<FileText size={11} />} label="GSTIN">
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="GSTIN"
                    className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                    style={{ ["--tw-ring-color" as any]: BRAND }}
                  />
                </FieldShell>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={taxApplicable}
                      onChange={(e) => setTaxApplicable(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Tax Applicable</span>
                  </label>

                  {taxApplicable && (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="taxType"
                          checked={taxType === "GST"}
                          onChange={() => setTaxType("GST")}
                          className="h-4 w-4 cursor-pointer accent-[#004687]"
                        />
                        <span className="text-xs font-medium text-slate-600">GST</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="taxType"
                          checked={taxType === "VAT"}
                          onChange={() => setTaxType("VAT")}
                          className="h-4 w-4 cursor-pointer accent-[#004687]"
                        />
                        <span className="text-xs font-medium text-slate-600">VAT</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <FieldShell icon={<Image size={11} />} label="Logo Path">
                <Input
                  value={logoPath}
                  onChange={(e) => setLogoPath(e.target.value)}
                  placeholder="Logo Path"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>
          </div>

          {/* ── Footer actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="h-9 text-xs font-semibold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
            >
              <RotateCcw size={13} />
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || !code.trim() || isSubmitting}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              <Check size={14} />
              {isSubmitting ? "Saving..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
