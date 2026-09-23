import { useEffect, useState } from "react";
import {
  Hash,
  ListOrdered,
  MapPinned,
  Globe2,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader } from "../common/PageHeader";
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
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";

// IMPORTANT: Update this import path to match your project structure!
import {
  fetchCountryStartWith,
  checkStateDuplication,
  createNewState,
} from "../store/features/settings/stateSlice"; 

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Shared labeled-field wrapper (sourced from Createbank.tsx) ───────────
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

// ─── Searchable dropdown (Radix Popover + Command, sourced from Createbank.tsx)
interface SearchableOption {
  value: string;
  label: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  loading,
  emptyText = "No results found.",
  searchValue,
  onSearchValueChange,
}: {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  emptyText?: string;
  /** Pass to make the search box controlled (e.g. for server-side search). */
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const isServerSearch = onSearchValueChange !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white pl-3 pr-2 text-sm outline-none focus:ring-1 transition-shadow cursor-pointer"
          style={{ ["--tw-ring-color" as any]: BRAND }}
        >
          <span
            className={cn(
              "truncate",
              selected ? "text-slate-700" : "text-slate-400"
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <span className="flex items-center gap-1 text-slate-400 shrink-0">
            {value && (
              <span
                role="button"
                aria-label="Clear selection"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="hover:text-slate-600"
              >
                <X size={13} />
              </span>
            )}
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ChevronDown size={13} />
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={!isServerSearch}>
          <CommandInput
            placeholder="Search..."
            className="h-9 text-sm"
            {...(isServerSearch
              ? { value: searchValue, onValueChange: onSearchValueChange }
              : {})}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Loading..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer"
                >
                  <Check
                    size={14}
                    className="mr-2 shrink-0"
                    style={{
                      color: BRAND,
                      opacity: value === option.value ? 1 : 0,
                    }}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface CreateStateProps {
  /** Called when the user clicks "State Details" — typically navigates back to the State list. */
  onBack?: () => void;
}

export default function CreateState({ onBack }: CreateStateProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { countryList, countryListLoading } = useSelector(
    (state: RootState) => state.state
  );

  const [countrySearch, setCountrySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(fetchCountryStartWith({ startWith: countrySearch }));
    }, 300);
    return () => clearTimeout(handle);
  }, [dispatch, countrySearch]);

  const countryOptions: SearchableOption[] = countryList.map((c) => ({
    value: String(c.CountryID),
    label: c.CountryName,
  }));

  const countryEmptyText = countrySearch.trim()
    ? `No countries found for "${countrySearch.trim()}"`
    : "No results found.";

  const [code, setCode] = useState("");
  const [number, setNumber] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [common, setCommon] = useState(true);
  const [active, setActive] = useState(true);

  const handleClear = () => {
    setCode("");
    setNumber("");
    setStateName("");
    setCountry("");
    setCommon(true);
    setActive(true);
  };

  const handleSubmit = async () => {
    if (!stateName.trim() || !country) {
      alert("Please enter a State Name and select a Country.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Check for duplication
      const isDuplicate = await dispatch(
        checkStateDuplication({ stateName: stateName.trim() })
      ).unwrap();

      if (isDuplicate) {
        alert("State name already exists.");
        setIsSubmitting(false);
        return;
      }

      // 2. Create new state if not duplicate
      const selectedCountryLabel =
        countryOptions.find((c) => c.value === country)?.label || "";

      await dispatch(
        createNewState({
          payload: {
            StateID: 0,
            StateName: stateName.trim(),
            StateCode: code.trim(),
            StateNumber: number.trim(),
            CountryID: Number(country),
            CountryName: selectedCountryLabel,
            Common: common,
            Active: active,
          },
        })
      ).unwrap();

      // 3. Return to previous page to refetch data
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(typeof error === "string" ? error : "Failed to create new state.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="State"
        subtitle="State Setup"
        icon={<MapPinned size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "State Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5 space-y-5">
        {/* ── State details card ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldShell icon={<Hash size={11} />} label="Code">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<ListOrdered size={11} />} label="Number">
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Number"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<MapPinned size={11} />} label="State">
                <Input
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Globe2 size={11} />} label="Country">
                <SearchableSelect
                  options={countryOptions}
                  value={country}
                  onChange={setCountry}
                  placeholder="Select Country"
                  loading={countryListLoading}
                  searchValue={countrySearch}
                  onSearchValueChange={setCountrySearch}
                  emptyText={countryEmptyText}
                />
              </FieldShell>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={common}
                  onChange={(e) => setCommon(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Common</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                />
                <span className="text-xs font-medium text-slate-600">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Footer actions ───────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}