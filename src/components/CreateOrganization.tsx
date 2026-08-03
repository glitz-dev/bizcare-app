import { useRef, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Hash,
  FileText,
  Coins,
  UserCheck,
  Clock,
  Landmark,
  CreditCard,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  MapPin,
  Printer,
  X,
  Info,
  Users,
  User,
  Wallet,
  Sliders,
  RotateCcw,
  Check,
  ChevronsUpDown,
  Map,
  Trash2,
  Plus,
  UploadCloud,
  FileImage,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchCurrencyStartWith,
  fetchTaxPayerTypeStartWith,
  fetchTimeZoneStartWith,
  fetchCountryStartWith,
  fetchStateStartWith,
  fetchBankStartWith,
  fetchCheckDuplication,
  createNewCompany,
  type CreateNewCompanyPayload,
} from "../store/features/settings/organizationSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Tabs config ────────────────────────────────────────────────────────────
type TabKey = "general" | "contact" | "banks" | "extras";

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "general", label: "General", icon: <Info size={13} /> },
  { key: "contact", label: "Contact", icon: <Users size={13} /> },
  { key: "banks", label: "Banks", icon: <Wallet size={13} /> },
  { key: "extras", label: "Extras", icon: <Sliders size={13} /> },
];

// ─── Shared labeled-field wrapper ──────────────────────────────────────────
function FieldShell({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
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

// ─── Clearable select (mirrors the "x" affordance in the reference UI) ────
function ClearableSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className="h-9 text-sm border-slate-200 focus-visible:ring-1 pr-8"
          style={{ ["--tw-ring-color" as any]: BRAND }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
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

// ─── Bank row (Banks tab) ───────────────────────────────────────────────────
interface BankRow {
  id: string;
  bankId: string;
  bankLabel: string;
  isDefault: boolean;
}

let bankRowSeq = 1;
function nextBankRowId() {
  return `bank-${bankRowSeq++}`;
}

interface CreateOrganizationProps {
  /** Called when the user clicks "Back" — typically navigates back to the Organisation list. */
  onBack?: () => void;
  /** Called with the core fields when the user clicks "Submit". */
  onSubmit?: (data: { name: string; code: string }) => void;
}

export default function CreateOrganization({ onBack, onSubmit }: CreateOrganizationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currencyList,
    currencyLoading,
    taxPayerTypeList,
    taxPayerTypeLoading,
    timeZoneList,
    timeZoneLoading,
    countryList,
    countryLoading,
    stateList,
    stateLoading,
    bankList,
    bankLoading,
    checkDuplicationLoading,
    createCompanyLoading,
  } = useSelector((s: RootState) => s.organization);

  const currencyItems: SearchableSelectItem[] = currencyList.map((c) => ({
    id: String(c.CurrencyID),
    label: `${c.Currency} (${c.CurrencyCode})`,
  }));
  const taxPayerTypeItems: SearchableSelectItem[] = taxPayerTypeList.map((t) => ({
    id: String(t.TaxPayerTypeId),
    label: t.TaxPayerType,
  }));
  const timeZoneItems: SearchableSelectItem[] = timeZoneList.map((t) => ({
    id: String(t.TimeZoneID),
    label: t.TimeZoneDesc,
  }));
  const countryItems: SearchableSelectItem[] = countryList.map((c) => ({
    id: String(c.CountryID),
    label: c.CountryName,
  }));
  const stateItems: SearchableSelectItem[] = stateList.map((s) => ({
    id: String(s.StateID),
    label: s.StateName,
  }));
  const bankItems: SearchableSelectItem[] = bankList.map((b) => ({
    id: String(b.BankID),
    label: b.BankName,
  }));

  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [taxRegNo, setTaxRegNo] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [taxPayerType, setTaxPayerType] = useState("");
  const [taxPayerTypeLabel, setTaxPayerTypeLabel] = useState("");
  const [timezone, setTimezone] = useState("");
  const [timezoneLabel, setTimezoneLabel] = useState("");
  const [bank, setBank] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [slogan, setSlogan] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [printAddress, setPrintAddress] = useState("");
  const [active, setActive] = useState(true);

  // ── Contact tab ──
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactNo2, setContactNo2] = useState("");
  const [contactNo3, setContactNo3] = useState("");
  const [fax, setFax] = useState("");
  const [country, setCountry] = useState("");
  const [countryLabel, setCountryLabel] = useState("");
  const [state, setState] = useState("");
  const [stateLabel, setStateLabel] = useState("");
  const [city, setCity] = useState("");
  const [email2, setEmail2] = useState("");
  const [email3, setEmail3] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");

  // ── Banks tab ──
  const [bankRows, setBankRows] = useState<BankRow[]>([
    { id: nextBankRowId(), bankId: "", bankLabel: "", isDefault: false },
  ]);

  function addBankRow() {
    setBankRows((prev) => [
      ...prev,
      { id: nextBankRowId(), bankId: "", bankLabel: "", isDefault: false },
    ]);
  }

  function removeBankRow(id: string) {
    setBankRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function updateBankRow(id: string, patch: Partial<BankRow>) {
    setBankRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return patch.isDefault ? { ...r, isDefault: false } : r;
        return { ...r, ...patch };
      })
    );
  }

  // ── Extras tab ──
  const [remarks, setRemarks] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    setName("");
    setCode("");
    setTaxRegNo("");
    setCurrency("");
    setCurrencyLabel("");
    setTaxPayerType("");
    setTaxPayerTypeLabel("");
    setTimezone("");
    setTimezoneLabel("");
    setBank("");
    setBankAccountNo("");
    setContactNo("");
    setSlogan("");
    setEmail("");
    setWebsite("");
    setAddress("");
    setPrintAddress("");
    setActive(true);

    setContactPersonName("");
    setContactNo2("");
    setContactNo3("");
    setFax("");
    setCountry("");
    setCountryLabel("");
    setState("");
    setStateLabel("");
    setCity("");
    setEmail2("");
    setEmail3("");
    setAddress2("");
    setAddress3("");

    setBankRows([{ id: nextBankRowId(), bankId: "", bankLabel: "", isDefault: false }]);

    setRemarks("");
    setRegistrationNo("");
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    try {
      const exists = await dispatch(
        fetchCheckDuplication({ code: trimmedCode, companyName: trimmedName, companyId: 0 })
      ).unwrap();

      if (exists) {
        toast.error(`An organisation named "${trimmedName}" already exists.`);
        return;
      }

      // "EUR (EUR)" -> "EUR"; falls back to the full label if no code is bracketed
      const currencyCode = currencyLabel.match(/\(([^)]+)\)\s*$/)?.[1] ?? currencyLabel;

      const payload: CreateNewCompanyPayload = {
        Active: active,
        Address1: address,
        Address2: address2,
        Address3: address3,
        CityName: city,
        Code: trimmedCode,
        CompanyID: 0,
        CompanyName: trimmedName,
        ContactPerson: contactPersonName,
        CountryName: countryLabel,
        Currency: currencyCode,
        CurrencyID: currency ? Number(currency) : 0,
        Email1: email,
        Email2: email2,
        Email3: email3,
        GstNo: taxRegNo,
        LstCompanyBanks: bankRows
          .filter((r) => r.bankId)
          .map((r) => ({
            BankName: r.bankLabel,
            BankID: Number(r.bankId),
            AccountNo: bankAccountNo,
          })),
        Phone2: contactNo,
        PrintAddress: printAddress,
        StateName: stateLabel,
        TaxPayerType: taxPayerTypeLabel,
        TaxPayerTypeID: taxPayerType ? Number(taxPayerType) : 0,
        TimeZoneDesc: timezoneLabel,
        TimeZoneID: timezone ? Number(timezone) : 0,
        Website: website,
      };

      await dispatch(createNewCompany(payload)).unwrap();

      toast.success(`Organisation "${trimmedName}" created successfully.`);
      onSubmit?.({ name: trimmedName, code: trimmedCode });
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Organisation"
        subtitle="Organisation Setup"
        icon={<Building2 size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Back to Organisations",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* ── Header row: tabs + secondary action ─────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-3 border-b border-slate-100">
            <div className="flex items-center gap-1 -mb-px overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap transition-colors cursor-pointer",
                    activeTab === tab.key
                      ? "border-current"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                  style={activeTab === tab.key ? { color: BRAND, borderColor: BRAND } : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 mb-2 cursor-pointer"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              <FileText size={13} />
              Organisation Details
            </Button>
          </div>

          {/* ── Tab content ─────────────────────────────────────────────── */}
          <div className="p-6">
            {activeTab === "general" && (
              <div className="space-y-5">
                {/* Row 1 — Name / Code */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <FieldShell icon={<Building2 size={11} />} label="Name">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Company Name"
                        className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                        style={{ ["--tw-ring-color" as any]: BRAND }}
                      />
                    </FieldShell>
                  </div>
                  <div className="sm:col-span-1">
                    <FieldShell icon={<Hash size={11} />} label="Code">
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Company Code"
                        className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                        style={{ ["--tw-ring-color" as any]: BRAND }}
                      />
                    </FieldShell>
                  </div>
                </div>

                {/* Row 2 — Tax Reg No. / Currency / Tax Payer Type / Timezone */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <FieldShell icon={<FileText size={11} />} label="Tax Registration No.">
                    <Input
                      value={taxRegNo}
                      onChange={(e) => setTaxRegNo(e.target.value)}
                      placeholder="Tax Registration No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Coins size={11} />} label="Currency">
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
                      onOpen={() => dispatch(fetchCurrencyStartWith({ startWith: "" }))}
                      onSearch={(query) => dispatch(fetchCurrencyStartWith({ startWith: query }))}
                    />
                  </FieldShell>

                  <FieldShell icon={<UserCheck size={11} />} label="Tax Payer Type">
                    <SearchableSelect
                      displayValue={taxPayerTypeLabel}
                      onSelect={(item) => {
                        setTaxPayerType(item.id);
                        setTaxPayerTypeLabel(item.label);
                      }}
                      onClear={() => {
                        setTaxPayerType("");
                        setTaxPayerTypeLabel("");
                      }}
                      placeholder="Select Tax Payer Type"
                      items={taxPayerTypeItems}
                      loading={taxPayerTypeLoading}
                      onOpen={() => dispatch(fetchTaxPayerTypeStartWith({ startWith: "" }))}
                      onSearch={(query) => dispatch(fetchTaxPayerTypeStartWith({ startWith: query }))}
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
                      onOpen={() => dispatch(fetchTimeZoneStartWith({ startWith: "" }))}
                      onSearch={(query) => dispatch(fetchTimeZoneStartWith({ startWith: query }))}
                    />
                  </FieldShell>
                </div>

                {/* Row 3 — Bank / Bank Account No. / Contact No. / Slogan */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <FieldShell icon={<Landmark size={11} />} label="Bank">
                    <Input
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      placeholder="Company Bank"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<CreditCard size={11} />} label="Bank Account No.">
                    <Input
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      placeholder="Enter Bank Account No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Phone size={11} />} label="Contact No.">
                    <Input
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      placeholder="Phone No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<MessageSquare size={11} />} label="Slogan">
                    <Input
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="Slogan"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                {/* Row 4 — Email / Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<Mail size={11} />} label="Email">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Globe size={11} />} label="Website">
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Website Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                {/* Row 5 — Address / Print Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<MapPin size={11} />} label="Address">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Company Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Printer size={11} />} label="Print Address">
                    <Input
                      value={printAddress}
                      onChange={(e) => setPrintAddress(e.target.value)}
                      placeholder="Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="active"
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Active
                  </label>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-5">
                {/* Row 1 — Contact Person Name / Contact No.2 / Contact No.3 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <FieldShell icon={<User size={11} />} label="Contact Person Name">
                      <Input
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                        placeholder="Person Name"
                        className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                        style={{ ["--tw-ring-color" as any]: BRAND }}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<Phone size={11} />} label="Contact No.2">
                    <Input
                      value={contactNo2}
                      onChange={(e) => setContactNo2(e.target.value)}
                      placeholder="Phone No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Phone size={11} />} label="Contact No.3">
                    <Input
                      value={contactNo3}
                      onChange={(e) => setContactNo3(e.target.value)}
                      placeholder="Phone No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                {/* Row 2 — Fax / Country / State / City */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <FieldShell icon={<Printer size={11} />} label="Fax">
                    <Input
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                      placeholder="Fax No."
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Globe size={11} />} label="Country">
                    <SearchableSelect
                      displayValue={countryLabel}
                      onSelect={(item) => {
                        setCountry(item.id);
                        setCountryLabel(item.label);
                        setState("");
                        setStateLabel("");
                      }}
                      onClear={() => {
                        setCountry("");
                        setCountryLabel("");
                        setState("");
                        setStateLabel("");
                      }}
                      placeholder="Select Country"
                      items={countryItems}
                      loading={countryLoading}
                      onOpen={() => dispatch(fetchCountryStartWith({ startWith: "" }))}
                      onSearch={(query) => dispatch(fetchCountryStartWith({ startWith: query }))}
                    />
                  </FieldShell>

                  <FieldShell icon={<Map size={11} />} label="State">
                    <SearchableSelect
                      displayValue={stateLabel}
                      onSelect={(item) => {
                        setState(item.id);
                        setStateLabel(item.label);
                      }}
                      onClear={() => {
                        setState("");
                        setStateLabel("");
                      }}
                      placeholder="Select State"
                      items={stateItems}
                      loading={stateLoading}
                      onOpen={() =>
                        country &&
                        dispatch(fetchStateStartWith({ countryID: Number(country), startWith: "" }))
                      }
                      onSearch={(query) =>
                        country &&
                        dispatch(fetchStateStartWith({ countryID: Number(country), startWith: query }))
                      }
                    />
                  </FieldShell>

                  <FieldShell icon={<MapPin size={11} />} label="City">
                    <ClearableSelect
                      value={city}
                      onChange={setCity}
                      placeholder="Select City"
                      options={["Kanhangad", "Kochi", "Chennai", "Bengaluru"]}
                    />
                  </FieldShell>
                </div>

                {/* Row 3 — Email Address-2 / Email Address-3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<Mail size={11} />} label="Email Address -2">
                    <Input
                      type="email"
                      value={email2}
                      onChange={(e) => setEmail2(e.target.value)}
                      placeholder="Email"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Mail size={11} />} label="Email Address -3">
                    <Input
                      type="email"
                      value={email3}
                      onChange={(e) => setEmail3(e.target.value)}
                      placeholder="Email"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                {/* Row 4 — Address-2 / Address-3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<MapPin size={11} />} label="Address -2">
                    <Input
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<MapPin size={11} />} label="Address -3">
                    <Input
                      value={address3}
                      onChange={(e) => setAddress3(e.target.value)}
                      placeholder="Address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>
              </div>
            )}

            {activeTab === "banks" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: BRAND }}>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-white px-4 py-2.5 w-16">
                          Sl No.
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-white px-4 py-2.5">
                          Bank
                        </th>
                        <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-white px-4 py-2.5 w-24">
                          Default
                        </th>
                        <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-white px-4 py-2.5 w-24">
                          Options
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-3 text-sm font-medium text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <SearchableSelect
                              displayValue={row.bankLabel}
                              onSelect={(item) =>
                                updateBankRow(row.id, { bankId: item.id, bankLabel: item.label })
                              }
                              onClear={() => updateBankRow(row.id, { bankId: "", bankLabel: "" })}
                              placeholder="Select Bank"
                              items={bankItems}
                              loading={bankLoading}
                              onOpen={() => dispatch(fetchBankStartWith())}
                              onSearch={(query) => dispatch(fetchBankStartWith({ startWith: query }))}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={row.isDefault}
                                onChange={(e) =>
                                  updateBankRow(row.id, { isDefault: e.target.checked })
                                }
                                aria-label={`Set row ${idx + 1} as default bank`}
                                className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeBankRow(row.id)}
                                disabled={bankRows.length === 1}
                                aria-label={`Remove row ${idx + 1}`}
                                className={cn(
                                  "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                                  bankRows.length === 1
                                    ? "text-slate-200 cursor-not-allowed"
                                    : "text-[#004687] hover:bg-[#004687]/[0.08] cursor-pointer"
                                )}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBankRow}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  <Plus size={13} />
                  Add Bank
                </Button>
              </div>
            )}

            {activeTab === "extras" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left — file upload */}
                <div className="space-y-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
                  >
                    <FileImage size={22} />
                  </span>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name ?? null)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                      style={{ backgroundColor: BRAND }}
                    >
                      <UploadCloud size={13} />
                      Upload Image
                    </Button>
                    {uploadedFileName && (
                      <p className="text-xs text-slate-400 truncate max-w-full">
                        {uploadedFileName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right — remarks / registration no. */}
                <div className="space-y-4">
                  <FieldShell icon={<MessageSquare size={11} />} label="Remarks, If Any">
                    <Input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Remarks, If Any"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <div className="max-w-[280px]">
                    <FieldShell icon={<ClipboardList size={11} />} label="Registration No.">
                      <Input
                        value={registrationNo}
                        onChange={(e) => setRegistrationNo(e.target.value)}
                        placeholder="Reg. No."
                        className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                        style={{ ["--tw-ring-color" as any]: BRAND }}
                      />
                    </FieldShell>
                  </div>
                </div>
              </div>
            )}
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
              disabled={!name.trim() || !code.trim() || checkDuplicationLoading || createCompanyLoading}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              <Check size={14} />
              {checkDuplicationLoading || createCompanyLoading ? "Saving..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
