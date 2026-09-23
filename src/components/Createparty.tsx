import { useState, useCallback, useRef } from "react";
import {
  Users,
  Hash,
  Tag,
  Phone,
  MapPinned,
  FileText,
  Coins,
  CalendarDays,
  Wallet,
  Globe,
  Map,
  Award,
  Anchor,
  MapPin,
  MessageSquare,
  Check,
  ChevronsUpDown,
  ChevronDown,
  X,
  RotateCcw,
  Building2,
  Clock,
  CalendarClock,
  FileStack,
  ClipboardList,
  ShieldCheck,
  FileCheck2,
  StickyNote,
  Handshake,
  Landmark,
  Link2,
  Link,
  PenLine,
  ScrollText,
  User,
  Briefcase,
  Mail,
  CreditCard,
  Plus,
  Trash2,
  Package,
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchPartyCategoryStartWith,
  fetchTaxPayerTypeStartWith,
  fetchCurrencyStartwith,
  fetchCountryStartwith,
  fetchStateStartwith,
  fetchAccHeadStartWith,
  fetchConsigneePartyStartWith,
  clearStateList,
} from "../store/features/settings/systemsetup/partySlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Shared input style helpers ────────────────────────────────────────────
const inputClass = "h-9 text-sm border-slate-200 focus-visible:ring-1";
const textareaClass =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1";
const ringStyle = { ["--tw-ring-color" as any]: BRAND };

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

// ─── Section label (matches legacy blue uppercase section headers) ────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[11px] font-bold uppercase tracking-wide"
      style={{ color: BRAND }}
    >
      {children}
    </h3>
  );
}

// ─── Collapsible section (Add Sample/Shipping Address) ─────────────────────
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between cursor-pointer group"
      >
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: BRAND }}
        >
          {title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform group-hover:text-slate-600",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pt-4">{children}</div>}
    </div>
  );
}

// ─── Debounced thunk dispatcher (for API-driven search dropdowns) ─────────
function useDebouncedDispatch<Arg>(
  dispatch: AppDispatch,
  thunk: (arg: Arg) => any,
  delay = 300
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (arg: Arg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        dispatch(thunk(arg));
      }, delay);
    },
    [dispatch, thunk, delay]
  );
}

// ─── API-backed searchable select (fetches from Redux on type/open) ───────
function ApiSelect({
  displayValue,
  onSelect,
  onClear,
  placeholder,
  items,
  loading,
  disabled,
  disabledHint,
  onSearch,
  onOpen,
}: {
  displayValue: string;
  onSelect: (item: SelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SelectItem[];
  loading?: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onSearch: (query: string) => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
          if (next) onOpen?.();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 cursor-pointer",
              !displayValue && "text-slate-400",
              disabled && "cursor-not-allowed opacity-60"
            )}
            style={ringStyle}
          >
            <span className="truncate">
              {displayValue || (disabled && disabledHint ? disabledHint : placeholder)}
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${placeholder.replace("Select ", "")}...`}
              onValueChange={onSearch}
            />
            <CommandList>
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">Searching...</div>
              ) : (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.label}
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
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {displayValue && !disabled && (
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

// ─── Static-list searchable select (UI only — no server wiring) ───────────
interface SelectItem {
  id: string;
  label: string;
}

function StaticSelect({
  displayValue,
  onSelect,
  onClear,
  placeholder,
  items,
}: {
  displayValue: string;
  onSelect: (item: SelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SelectItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 cursor-pointer",
              !displayValue && "text-slate-400"
            )}
            style={ringStyle}
          >
            <span className="truncate">{displayValue || placeholder}</span>
            <ChevronsUpDown size={14} className="shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.replace("Select ", "")}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
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

// ─── Static option lists (UI only — no matching API in partySlice yet) ────
const GRADE_ITEMS: SelectItem[] = [
  { id: "a", label: "Grade A" },
  { id: "b", label: "Grade B" },
  { id: "c", label: "Grade C" },
];
const LOADING_PORT_ITEMS: SelectItem[] = [
  { id: "cochin", label: "Cochin Port" },
  { id: "chennai", label: "Chennai Port" },
  { id: "mumbai", label: "Mumbai Port" },
];
const INVOICE_FORMAT_ITEMS: SelectItem[] = [
  { id: "standard", label: "Standard Invoice" },
  { id: "gst", label: "GST Invoice" },
  { id: "export", label: "Export Invoice" },
];
const PACKING_LIST_ITEMS: SelectItem[] = [
  { id: "standard", label: "Standard Packing List" },
  { id: "detailed", label: "Detailed Packing List" },
];
const ITEM_ITEMS: SelectItem[] = [
  { id: "item-1", label: "Cotton Fabric Roll" },
  { id: "item-2", label: "Polyester Yarn" },
  { id: "item-3", label: "Packing Carton" },
];

const TABS = ["General", "Customer Info.", "Accounts Info.", "Contact Info.", "Relations"] as const;
type Tab = (typeof TABS)[number];

// ─── Row types for the dynamic tables/lists on later tabs ─────────────────
interface BankRow {
  id: string;
  bankName: string;
  ifsc: string;
  swift: string;
  sortCode: string;
  routingNo: string;
  iban: string;
  accountNo: string;
  address: string;
  verified: boolean;
}
const emptyBankRow = (): BankRow => ({
  id: crypto.randomUUID(),
  bankName: "",
  ifsc: "",
  swift: "",
  sortCode: "",
  routingNo: "",
  iban: "",
  accountNo: "",
  address: "",
  verified: false,
});

interface RelationItemRow {
  id: string;
  itemLabel: string;
  proformaName: string;
  hsCode: string;
}

interface AddressRow {
  id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
const emptyAddressDraft = { address: "", city: "", state: "", pincode: "" };

interface CreatePartyProps {
  /** Called when the user clicks "Party Details" — typically navigates back to the Party list. */
  onBack?: () => void;
  /** Called with the core fields when the user clicks "Submit". */
  onSubmit?: (data: { code: string; name: string }) => void;
}

export default function CreateParty({ onBack, onSubmit }: CreatePartyProps) {
  const [activeTab, setActiveTab] = useState<Tab>("General");

  // ── API-backed dropdown data (from partySlice) ────────────────────────
  const dispatch = useDispatch<AppDispatch>();

  const partyCategoryList = useSelector((s: RootState) => s.party.partyCategoryList);
  const partyCategoryListLoading = useSelector((s: RootState) => s.party.partyCategoryListLoading);
  const taxPayerTypeList = useSelector((s: RootState) => s.party.taxPayerTypeList);
  const taxPayerTypeListLoading = useSelector((s: RootState) => s.party.taxPayerTypeListLoading);
  const currencyList = useSelector((s: RootState) => s.party.currencyList);
  const currencyListLoading = useSelector((s: RootState) => s.party.currencyListLoading);
  const countryList = useSelector((s: RootState) => s.party.countryList);
  const countryListLoading = useSelector((s: RootState) => s.party.countryListLoading);
  const stateList = useSelector((s: RootState) => s.party.stateList);
  const stateListLoading = useSelector((s: RootState) => s.party.stateListLoading);
  const accHeadList = useSelector((s: RootState) => s.party.accHeadList);
  const accHeadListLoading = useSelector((s: RootState) => s.party.accHeadListLoading);
  const consigneePartyList = useSelector((s: RootState) => s.party.consigneePartyList);
  const consigneePartyListLoading = useSelector((s: RootState) => s.party.consigneePartyListLoading);

  const partyCategoryOptions: SelectItem[] = partyCategoryList.map((p) => ({
    id: String(p.ID),
    label: p.PartyCategory,
  }));
  const taxPayerTypeOptions: SelectItem[] = taxPayerTypeList.map((t) => ({
    id: String(t.TaxPayerTypeId),
    label: t.TaxPayerType,
  }));
  const currencyOptions: SelectItem[] = currencyList.map((c) => ({
    id: String(c.CurrencyID),
    label: c.Currency.trim() || c.CurrencyCode,
  }));
  const countryOptions: SelectItem[] = countryList.map((c) => ({
    id: String(c.CountryID),
    label: c.CountryName,
  }));
  const stateOptions: SelectItem[] = stateList.map((s) => ({
    id: String(s.StateID),
    label: s.StateName,
  }));
  const accHeadOptions: SelectItem[] = accHeadList.map((a) => ({
    id: String(a.HeadID),
    label: a.HeadName,
  }));
  const linkedPartyOptions: SelectItem[] = consigneePartyList.map((p) => ({
    id: String(p.PartyID),
    label: p.PartyName,
  }));

  const searchPartyCategory = useDebouncedDispatch(dispatch, fetchPartyCategoryStartWith);
  const searchTaxPayerType = useDebouncedDispatch(dispatch, fetchTaxPayerTypeStartWith);
  const searchCurrency = useDebouncedDispatch(dispatch, fetchCurrencyStartwith);
  const searchCountry = useDebouncedDispatch(dispatch, fetchCountryStartwith);
  const searchState = useDebouncedDispatch(dispatch, fetchStateStartwith);
  const searchAccHead = useDebouncedDispatch(dispatch, fetchAccHeadStartWith);
  const searchLinkedParty = useDebouncedDispatch(dispatch, fetchConsigneePartyStartWith);


  // ── General ────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [partyCategory, setPartyCategory] = useState("");
  const [partyCategoryLabel, setPartyCategoryLabel] = useState("CUSTOMER");

  const [phone, setPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [taxpayerType, setTaxpayerType] = useState("");
  const [taxpayerTypeLabel, setTaxpayerTypeLabel] = useState("");

  const [currency, setCurrency] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [creditDays, setCreditDays] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  const [country, setCountry] = useState("");
  const [countryLabel, setCountryLabel] = useState("");
  const [state, setState] = useState("");
  const [stateLabel, setStateLabel] = useState("");
  const [grade, setGrade] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [loadingPort, setLoadingPort] = useState("");
  const [loadingPortLabel, setLoadingPortLabel] = useState("");

  const [address, setAddress] = useState("");
  const [remarks, setRemarks] = useState("");

  const [creditLimitDaysAlert, setCreditLimitDaysAlert] = useState(false);
  const [creditLimitAmountAlert, setCreditLimitAmountAlert] = useState(false);
  const [remarksAlert, setRemarksAlert] = useState(false);
  const [printChallan, setPrintChallan] = useState(false);
  const [merchantExporter, setMerchantExporter] = useState(false);
  const [active, setActive] = useState(true);
  const [common, setCommon] = useState(true);
  const [isLocal, setIsLocal] = useState(false);

  // ── Customer Info. ─────────────────────────────────────────────────────
  const [globalAccount, setGlobalAccount] = useState("");
  const [productionDays, setProductionDays] = useState("");
  const [invoiceDays, setInvoiceDays] = useState("");
  const [sampleQty, setSampleQty] = useState("");
  const [nameInFile, setNameInFile] = useState("");
  const [invoiceFormat, setInvoiceFormat] = useState("");
  const [invoiceFormatLabel, setInvoiceFormatLabel] = useState("");
  const [packingListFormat, setPackingListFormat] = useState("");
  const [packingListFormatLabel, setPackingListFormatLabel] = useState("");
  const [ecgcLimit, setEcgcLimit] = useState("");
  const [notesInProforma, setNotesInProforma] = useState("");
  const [ecgcTerms, setEcgcTerms] = useState("");
  const [salesOrderRemarks, setSalesOrderRemarks] = useState("");
  const [buyerTerms, setBuyerTerms] = useState("");
  const [directCustomer, setDirectCustomer] = useState(false);
  const [againstLC, setAgainstLC] = useState(false);
  const [ecgcApplicable, setEcgcApplicable] = useState(false);

  // ── Accounts Info. ─────────────────────────────────────────────────────
  const [accountHead, setAccountHead] = useState("");
  const [accountHeadLabel, setAccountHeadLabel] = useState("");
  const [linkedParty, setLinkedParty] = useState("");
  const [linkedPartyLabel, setLinkedPartyLabel] = useState("");
  const [opCashBalance, setOpCashBalance] = useState("");
  const [opBalanceType, setOpBalanceType] = useState<"Dr" | "Cr">("Dr");
  const [gstin, setGstin] = useState("");
  const [gstinRegName, setGstinRegName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [nameInCheque, setNameInCheque] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [bankRows, setBankRows] = useState<BankRow[]>([emptyBankRow()]);

  function updateBankRow(id: string, patch: Partial<BankRow>) {
    setBankRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addBankRow() {
    setBankRows((rows) => [...rows, emptyBankRow()]);
  }
  function removeBankRow(id: string) {
    setBankRows((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  }

  // ── Contact Info. ──────────────────────────────────────────────────────
  const [contactPerson, setContactPerson] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [contactDesignation, setContactDesignation] = useState("");
  const [otherContacts, setOtherContacts] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // ── Relations ───────────────────────────────────────────────────────────
  const [itemDraftId, setItemDraftId] = useState("");
  const [itemDraftLabel, setItemDraftLabel] = useState("");
  const [proformaNameDraft, setProformaNameDraft] = useState("");
  const [hsCodeDraft, setHsCodeDraft] = useState("");
  const [relationItems, setRelationItems] = useState<RelationItemRow[]>([]);

  function addRelationItem() {
    if (!itemDraftLabel.trim()) return;
    setRelationItems((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        itemLabel: itemDraftLabel,
        proformaName: proformaNameDraft,
        hsCode: hsCodeDraft,
      },
    ]);
    setItemDraftId("");
    setItemDraftLabel("");
    setProformaNameDraft("");
    setHsCodeDraft("");
  }
  function removeRelationItem(id: string) {
    setRelationItems((rows) => rows.filter((r) => r.id !== id));
  }

  const [showSampleAddress, setShowSampleAddress] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [sampleAddressDraft, setSampleAddressDraft] = useState(emptyAddressDraft);
  const [sampleAddresses, setSampleAddresses] = useState<AddressRow[]>([]);
  const [shippingAddressDraft, setShippingAddressDraft] = useState(emptyAddressDraft);
  const [shippingAddresses, setShippingAddresses] = useState<AddressRow[]>([]);

  function addSampleAddress() {
    if (!sampleAddressDraft.address.trim()) return;
    setSampleAddresses((rows) => [...rows, { id: crypto.randomUUID(), ...sampleAddressDraft }]);
    setSampleAddressDraft(emptyAddressDraft);
  }
  function removeSampleAddress(id: string) {
    setSampleAddresses((rows) => rows.filter((r) => r.id !== id));
  }
  function addShippingAddress() {
    if (!shippingAddressDraft.address.trim()) return;
    setShippingAddresses((rows) => [...rows, { id: crypto.randomUUID(), ...shippingAddressDraft }]);
    setShippingAddressDraft(emptyAddressDraft);
  }
  function removeShippingAddress(id: string) {
    setShippingAddresses((rows) => rows.filter((r) => r.id !== id));
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClear() {
    setName("");
    setCode("");
    setPartyCategory("");
    setPartyCategoryLabel("");
    setPhone("");
    setPinCode("");
    setTaxpayerType("");
    setTaxpayerTypeLabel("");
    setCurrency("");
    setCurrencyLabel("");
    setCreditDays("");
    setCreditAmount("");
    setCountry("");
    setCountryLabel("");
    setState("");
    setStateLabel("");
    setGrade("");
    setGradeLabel("");
    setLoadingPort("");
    setLoadingPortLabel("");
    setAddress("");
    setRemarks("");
    setCreditLimitDaysAlert(false);
    setCreditLimitAmountAlert(false);
    setRemarksAlert(false);
    setPrintChallan(false);
    setMerchantExporter(false);
    setActive(true);
    setCommon(true);
    setIsLocal(false);

    setGlobalAccount("");
    setProductionDays("");
    setInvoiceDays("");
    setSampleQty("");
    setNameInFile("");
    setInvoiceFormat("");
    setInvoiceFormatLabel("");
    setPackingListFormat("");
    setPackingListFormatLabel("");
    setEcgcLimit("");
    setNotesInProforma("");
    setEcgcTerms("");
    setSalesOrderRemarks("");
    setBuyerTerms("");
    setDirectCustomer(false);
    setAgainstLC(false);
    setEcgcApplicable(false);

    setAccountHead("");
    setAccountHeadLabel("");
    setLinkedParty("");
    setLinkedPartyLabel("");
    setOpCashBalance("");
    setOpBalanceType("Dr");
    setGstin("");
    setGstinRegName("");
    setRegNo("");
    setPanNo("");
    setNameInCheque("");
    setPaymentTerms("");
    setBankRows([emptyBankRow()]);

    setContactPerson("");
    setContactNo("");
    setContactDesignation("");
    setOtherContacts("");
    setEmail("");
    setWebsite("");

    setItemDraftId("");
    setItemDraftLabel("");
    setProformaNameDraft("");
    setHsCodeDraft("");
    setRelationItems([]);
    setShowSampleAddress(false);
    setShowShippingAddress(false);
    setSampleAddressDraft(emptyAddressDraft);
    setSampleAddresses([]);
    setShippingAddressDraft(emptyAddressDraft);
    setShippingAddresses([]);
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) return;

    setIsSubmitting(true);
    try {
      // UI only — wire to a partySlice thunk when the API is ready.
      await new Promise((r) => setTimeout(r, 400));
      toast.success("Party created successfully.");
      onSubmit?.({ code: trimmedCode, name: trimmedName });
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save party. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Party"
        subtitle="Party Setup"
        icon={<Users size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Party Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-6 px-6 border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap cursor-pointer transition-colors",
                  activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span
                    className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                    style={{ backgroundColor: BRAND }}
                  />
                )}
              </button>
            ))}
          </div>

          {activeTab === "General" ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* ── Left column ───────────────────────────────────────── */}
                <div className="space-y-5">
                  <FieldShell icon={<Users size={11} />} label="Name">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldShell icon={<Phone size={11} />} label="Phone">
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<MapPinned size={11} />} label="Pin Code">
                      <Input
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="PinCode"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<FileText size={11} />} label="Taxpayer Type">
                      <ApiSelect
                        displayValue={taxpayerTypeLabel}
                        onSelect={(item) => {
                          setTaxpayerType(item.id);
                          setTaxpayerTypeLabel(item.label);
                        }}
                        onClear={() => {
                          setTaxpayerType("");
                          setTaxpayerTypeLabel("");
                        }}
                        placeholder="Select Taxpayer Type"
                        items={taxPayerTypeOptions}
                        loading={taxPayerTypeListLoading}
                        onSearch={(q) => searchTaxPayerType({ startWith: q })}
                        onOpen={() => {
                          if (taxPayerTypeList.length === 0) dispatch(fetchTaxPayerTypeStartWith({ startWith: "" }));
                        }}
                      />
                    </FieldShell>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<Globe size={11} />} label="Country">
                      <ApiSelect
                        displayValue={countryLabel}
                        onSelect={(item) => {
                          setCountry(item.id);
                          setCountryLabel(item.label);
                          // reset dependent State selection when country changes
                          setState("");
                          setStateLabel("");
                          dispatch(clearStateList());
                        }}
                        onClear={() => {
                          setCountry("");
                          setCountryLabel("");
                          setState("");
                          setStateLabel("");
                          dispatch(clearStateList());
                        }}
                        placeholder="Select Country"
                        items={countryOptions}
                        loading={countryListLoading}
                        onSearch={(q) => searchCountry({ startWith: q })}
                        onOpen={() => {
                          if (countryList.length === 0) dispatch(fetchCountryStartwith({ startWith: "" }));
                        }}
                      />
                    </FieldShell>

                    <FieldShell icon={<Map size={11} />} label="State">
                      <ApiSelect
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
                        items={stateOptions}
                        loading={stateListLoading}
                        disabled={!country}
                        disabledHint="Select Country first"
                        onSearch={(q) => searchState({ countryId: Number(country), startWith: q })}
                        onOpen={() => {
                          if (country && stateList.length === 0) {
                            dispatch(fetchStateStartwith({ countryId: Number(country), startWith: "" }));
                          }
                        }}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<MapPin size={11} />} label="Address">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>
                </div>

                {/* ── Right column ──────────────────────────────────────── */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<Hash size={11} />} label="Code">
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Code"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<Tag size={11} />} label="Party Category">
                      <ApiSelect
                        displayValue={partyCategoryLabel}
                        onSelect={(item) => {
                          setPartyCategory(item.id);
                          setPartyCategoryLabel(item.label);
                        }}
                        onClear={() => {
                          setPartyCategory("");
                          setPartyCategoryLabel("");
                        }}
                        placeholder="Select Party Category"
                        items={partyCategoryOptions}
                        loading={partyCategoryListLoading}
                        onSearch={(q) => searchPartyCategory({ startWith: q })}
                        onOpen={() => {
                          if (partyCategoryList.length === 0) dispatch(fetchPartyCategoryStartWith({ startWith: "" }));
                        }}
                      />
                    </FieldShell>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldShell icon={<Coins size={11} />} label="Currency">
                      <ApiSelect
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
                        items={currencyOptions}
                        loading={currencyListLoading}
                        onSearch={(q) => searchCurrency({ startWith: q })}
                        onOpen={() => {
                          if (currencyList.length === 0) dispatch(fetchCurrencyStartwith({ startWith: "" }));
                        }}
                      />
                    </FieldShell>

                    <FieldShell icon={<CalendarDays size={11} />} label="Credit Days">
                      <Input
                        value={creditDays}
                        onChange={(e) => setCreditDays(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Days"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<Wallet size={11} />} label="Credit Amount">
                      <Input
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="Credit Amount"
                        inputMode="decimal"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<Award size={11} />} label="Grade">
                      <StaticSelect
                        displayValue={gradeLabel}
                        onSelect={(item) => {
                          setGrade(item.id);
                          setGradeLabel(item.label);
                        }}
                        onClear={() => {
                          setGrade("");
                          setGradeLabel("");
                        }}
                        placeholder="Select Grade"
                        items={GRADE_ITEMS}
                      />
                    </FieldShell>

                    <FieldShell icon={<Anchor size={11} />} label="Loading Port">
                      <StaticSelect
                        displayValue={loadingPortLabel}
                        onSelect={(item) => {
                          setLoadingPort(item.id);
                          setLoadingPortLabel(item.label);
                        }}
                        onClear={() => {
                          setLoadingPort("");
                          setLoadingPortLabel("");
                        }}
                        placeholder="Select Port"
                        items={LOADING_PORT_ITEMS}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<MessageSquare size={11} />} label="Remarks">
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Remarks"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>
                </div>
              </div>

              {/* ── Checkbox row ───────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={creditLimitDaysAlert}
                      onChange={(e) => setCreditLimitDaysAlert(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">CreditLimit Days Alert</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={creditLimitAmountAlert}
                      onChange={(e) => setCreditLimitAmountAlert(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">CreditLimit Amount Alert</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remarksAlert}
                      onChange={(e) => setRemarksAlert(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Remarks Alert</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={printChallan}
                      onChange={(e) => setPrintChallan(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Print Challan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={merchantExporter}
                      onChange={(e) => setMerchantExporter(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Merchant Exporter</span>
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
                      checked={isLocal}
                      onChange={(e) => setIsLocal(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Is Local</span>
                  </label>
                </div>
              </div>
            </div>
          ) : activeTab === "Customer Info." ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* ── Left column ───────────────────────────────────────── */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<Building2 size={11} />} label="Global Account">
                      <Input
                        value={globalAccount}
                        onChange={(e) => setGlobalAccount(e.target.value)}
                        placeholder="Global Account No."
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<Clock size={11} />} label="Production To Be Completed Before">
                      <Input
                        value={productionDays}
                        onChange={(e) => setProductionDays(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Enter Days"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<FileText size={11} />} label="Name In File">
                    <Input
                      value={nameInFile}
                      onChange={(e) => setNameInFile(e.target.value)}
                      placeholder="Name"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<FileStack size={11} />} label="Invoice Format">
                    <StaticSelect
                      displayValue={invoiceFormatLabel}
                      onSelect={(item) => {
                        setInvoiceFormat(item.id);
                        setInvoiceFormatLabel(item.label);
                      }}
                      onClear={() => {
                        setInvoiceFormat("");
                        setInvoiceFormatLabel("");
                      }}
                      placeholder="Select Invoice Format"
                      items={INVOICE_FORMAT_ITEMS}
                    />
                  </FieldShell>

                  <FieldShell icon={<StickyNote size={11} />} label="Notes In Proforma">
                    <textarea
                      value={notesInProforma}
                      onChange={(e) => setNotesInProforma(e.target.value)}
                      placeholder="Enter Notes"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<MessageSquare size={11} />} label="Remarks (For Sales Order)">
                    <textarea
                      value={salesOrderRemarks}
                      onChange={(e) => setSalesOrderRemarks(e.target.value)}
                      placeholder="Enter Sales Order Remarks"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>
                </div>

                {/* ── Right column ──────────────────────────────────────── */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<CalendarClock size={11} />} label="Invoice To Be Entered Before">
                      <Input
                        value={invoiceDays}
                        onChange={(e) => setInvoiceDays(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Enter Days"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>

                    <FieldShell icon={<Package size={11} />} label="Sample Qty.">
                      <Input
                        value={sampleQty}
                        onChange={(e) => setSampleQty(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Quantity"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldShell icon={<ClipboardList size={11} />} label="Packing List Format">
                      <StaticSelect
                        displayValue={packingListFormatLabel}
                        onSelect={(item) => {
                          setPackingListFormat(item.id);
                          setPackingListFormatLabel(item.label);
                        }}
                        onClear={() => {
                          setPackingListFormat("");
                          setPackingListFormatLabel("");
                        }}
                        placeholder="Select Packing List"
                        items={PACKING_LIST_ITEMS}
                      />
                    </FieldShell>

                    <FieldShell icon={<ShieldCheck size={11} />} label="ECGC Limit">
                      <Input
                        value={ecgcLimit}
                        onChange={(e) => setEcgcLimit(e.target.value)}
                        placeholder="ECGCLimit"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<FileCheck2 size={11} />} label="ECGC Terms">
                    <textarea
                      value={ecgcTerms}
                      onChange={(e) => setEcgcTerms(e.target.value)}
                      placeholder="Enter ECGC Terms"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<Handshake size={11} />} label="Buyer Terms">
                    <textarea
                      value={buyerTerms}
                      onChange={(e) => setBuyerTerms(e.target.value)}
                      placeholder="Enter Buyer Terms"
                      rows={4}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>
                </div>
              </div>

              {/* ── Checkbox row ───────────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={directCustomer}
                    onChange={(e) => setDirectCustomer(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-xs font-medium text-slate-600">Direct Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={againstLC}
                    onChange={(e) => setAgainstLC(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-xs font-medium text-slate-600">Against L/C</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ecgcApplicable}
                    onChange={(e) => setEcgcApplicable(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-xs font-medium text-slate-600">ECGC Applicable</span>
                </label>
              </div>
            </div>
          ) : activeTab === "Accounts Info." ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                <FieldShell icon={<Landmark size={11} />} label="Account Head">
                  <ApiSelect
                    displayValue={accountHeadLabel}
                    onSelect={(item) => {
                      setAccountHead(item.id);
                      setAccountHeadLabel(item.label);
                    }}
                    onClear={() => {
                      setAccountHead("");
                      setAccountHeadLabel("");
                    }}
                    placeholder="Select Dr. Head"
                    items={accHeadOptions}
                    loading={accHeadListLoading}
                    onSearch={(q) => searchAccHead({ startWith: q })}
                    onOpen={() => {
                      if (accHeadList.length === 0) dispatch(fetchAccHeadStartWith({ startWith: "" }));
                    }}
                  />
                </FieldShell>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<Link2 size={11} />} label="Linked Party">
                    <ApiSelect
                      displayValue={linkedPartyLabel}
                      onSelect={(item) => {
                        setLinkedParty(item.id);
                        setLinkedPartyLabel(item.label);
                      }}
                      onClear={() => {
                        setLinkedParty("");
                        setLinkedPartyLabel("");
                      }}
                      placeholder="Select Linked Party"
                      items={linkedPartyOptions}
                      loading={consigneePartyListLoading}
                      onSearch={(q) => searchLinkedParty({ startWith: q })}
                      onOpen={() => {
                        if (consigneePartyList.length === 0) dispatch(fetchConsigneePartyStartWith({ startWith: "" }));
                      }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Wallet size={11} />} label="Op. Cash Balance">
                    <div className="flex gap-1.5">
                      <Input
                        value={opCashBalance}
                        onChange={(e) => setOpCashBalance(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="Op. Balance"
                        inputMode="decimal"
                        className={inputClass}
                        style={ringStyle}
                      />
                      <div className="flex shrink-0 rounded-md border border-slate-200 overflow-hidden">
                        {(["Dr", "Cr"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setOpBalanceType(t)}
                            className={cn(
                              "h-9 px-2.5 text-xs font-semibold cursor-pointer transition-colors",
                              opBalanceType === t ? "text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                            )}
                            style={opBalanceType === t ? { backgroundColor: BRAND } : undefined}
                          >
                            {t}.
                          </button>
                        ))}
                      </div>
                    </div>
                  </FieldShell>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldShell icon={<FileText size={11} />} label="GSTIN">
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="GSTIN"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Building2 size={11} />} label="GSTIN Reg Name">
                  <Input
                    value={gstinRegName}
                    onChange={(e) => setGstinRegName(e.target.value)}
                    placeholder="GSTIN Reg Name"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Hash size={11} />} label="Reg. No.">
                  <Input
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Reg. No"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<CreditCard size={11} />} label="PAN No.">
                  <Input
                    value={panNo}
                    onChange={(e) => setPanNo(e.target.value)}
                    placeholder="Pancard No"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldShell icon={<PenLine size={11} />} label="Name In Cheque">
                  <Input
                    value={nameInCheque}
                    onChange={(e) => setNameInCheque(e.target.value)}
                    placeholder="Name In Cheque"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<ScrollText size={11} />} label="Payment Terms">
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="Payment Terms"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>
              </div>

              {/* ── Bank details ─────────────────────────────────────────── */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pt-3">
                  <SectionLabel>Bank Details</SectionLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBankRow}
                    className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Row
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 w-10">
                          Sl No.
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[140px]">
                          Bank Name
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[100px]">
                          IFSC Code
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[100px]">
                          Swift Code
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[100px]">
                          Sort Code
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[100px]">
                          Routing No.
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[110px]">
                          IBAN No.
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">
                          Account No.
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 min-w-[160px]">
                          Address
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Verified
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 w-10">
                          <span className="sr-only">Options</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                          <td className="px-3 py-2 text-slate-500 font-medium align-top">{idx + 1}</td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.bankName}
                              onChange={(e) => updateBankRow(row.id, { bankName: e.target.value })}
                              placeholder="Enter BankName"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.ifsc}
                              onChange={(e) => updateBankRow(row.id, { ifsc: e.target.value })}
                              placeholder="IFSC code"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.swift}
                              onChange={(e) => updateBankRow(row.id, { swift: e.target.value })}
                              placeholder="Swift Code"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.sortCode}
                              onChange={(e) => updateBankRow(row.id, { sortCode: e.target.value })}
                              placeholder="Sort Code"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.routingNo}
                              onChange={(e) => updateBankRow(row.id, { routingNo: e.target.value })}
                              placeholder="Routing No"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.iban}
                              onChange={(e) => updateBankRow(row.id, { iban: e.target.value })}
                              placeholder="IBAN No"
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <Input
                              value={row.accountNo}
                              onChange={(e) => updateBankRow(row.id, { accountNo: e.target.value })}
                              placeholder="AccountNum..."
                              className="h-8 text-xs border-slate-200 focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-1.5 align-top">
                            <textarea
                              value={row.address}
                              onChange={(e) => updateBankRow(row.id, { address: e.target.value })}
                              placeholder="Address"
                              rows={1}
                              className="w-full min-w-[140px] rounded-md border border-slate-200 px-2 py-1.5 text-xs resize-none focus-visible:outline-none focus-visible:ring-1"
                              style={ringStyle}
                            />
                          </td>
                          <td className="px-2 py-2 text-center align-top">
                            <input
                              type="checkbox"
                              checked={row.verified}
                              onChange={(e) => updateBankRow(row.id, { verified: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                            />
                          </td>
                          <td className="px-2 py-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => removeBankRow(row.id)}
                              disabled={bankRows.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Remove bank row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "Contact Info." ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldShell icon={<User size={11} />} label="Contact Person">
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Contact Person"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Phone size={11} />} label="Contact No.">
                  <Input
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    placeholder="Contact No."
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Briefcase size={11} />} label="Contact Person's Designation">
                  <Input
                    value={contactDesignation}
                    onChange={(e) => setContactDesignation(e.target.value)}
                    placeholder="Contact Person's Designation"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Users size={11} />} label="Other Contacts, If Any">
                  <Input
                    value={otherContacts}
                    onChange={(e) => setOtherContacts(e.target.value)}
                    placeholder="Other Contacts"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldShell icon={<Mail size={11} />} label="Email">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Link size={11} />} label="Website">
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Website"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* ── Add Customer Items ───────────────────────────────────── */}
              <div className="space-y-3">
                <SectionLabel>Add Customer Items</SectionLabel>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 sm:items-end">
                  <FieldShell icon={<Package size={11} />} label="Item">
                    <StaticSelect
                      displayValue={itemDraftLabel}
                      onSelect={(item) => {
                        setItemDraftId(item.id);
                        setItemDraftLabel(item.label);
                      }}
                      onClear={() => {
                        setItemDraftId("");
                        setItemDraftLabel("");
                      }}
                      placeholder="Select Item"
                      items={ITEM_ITEMS}
                    />
                  </FieldShell>

                  <FieldShell icon={<StickyNote size={11} />} label="Name In Proforma">
                    <Input
                      value={proformaNameDraft}
                      onChange={(e) => setProformaNameDraft(e.target.value)}
                      placeholder="Enter Proforma Name"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<Hash size={11} />} label="HS Code">
                    <Input
                      value={hsCodeDraft}
                      onChange={(e) => setHsCodeDraft(e.target.value)}
                      placeholder="Enter HS"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <Button
                    type="button"
                    onClick={addRelationItem}
                    disabled={!itemDraftLabel.trim()}
                    className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                    style={{ backgroundColor: BRAND }}
                  >
                    <Plus size={14} /> Add Items
                  </Button>
                </div>

                {relationItems.length > 0 && (
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Item
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Proforma Name
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            HS Code
                          </th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 w-10">
                            <span className="sr-only">Options</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {relationItems.map((row) => (
                          <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-slate-700 font-medium">{row.itemLabel}</td>
                            <td className="px-3 py-2 text-slate-600">{row.proformaName || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{row.hsCode || "—"}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeRelationItem(row.id)}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Add Sample Address ───────────────────────────────────── */}
              <CollapsibleSection
                title="Add Sample Address"
                open={showSampleAddress}
                onToggle={() => setShowSampleAddress((v) => !v)}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldShell icon={<Map size={11} />} label="City">
                      <Input
                        value={sampleAddressDraft.city}
                        onChange={(e) => setSampleAddressDraft((d) => ({ ...d, city: e.target.value }))}
                        placeholder="City"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                    <FieldShell icon={<Globe size={11} />} label="State">
                      <Input
                        value={sampleAddressDraft.state}
                        onChange={(e) => setSampleAddressDraft((d) => ({ ...d, state: e.target.value }))}
                        placeholder="State"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                    <FieldShell icon={<MapPinned size={11} />} label="Pincode">
                      <Input
                        value={sampleAddressDraft.pincode}
                        onChange={(e) =>
                          setSampleAddressDraft((d) => ({ ...d, pincode: e.target.value.replace(/[^0-9]/g, "") }))
                        }
                        placeholder="Pincode"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<MapPin size={11} />} label="Address">
                    <textarea
                      value={sampleAddressDraft.address}
                      onChange={(e) => setSampleAddressDraft((d) => ({ ...d, address: e.target.value }))}
                      placeholder="Address"
                      rows={3}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={addSampleAddress}
                      disabled={!sampleAddressDraft.address.trim()}
                      className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Plus size={14} /> Add Address
                    </Button>
                  </div>

                  {sampleAddresses.length > 0 && (
                    <div className="space-y-2">
                      {sampleAddresses.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                        >
                          <div className="text-xs text-slate-600">
                            <span className="text-slate-800">{row.address}</span>
                            {(row.city || row.state || row.pincode) && (
                              <span className="text-slate-400">
                                {" "}
                                — {[row.city, row.state, row.pincode].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSampleAddress(row.id)}
                            className="text-slate-400 hover:text-red-500 shrink-0 cursor-pointer"
                            aria-label="Remove address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* ── Add Shipping Address ─────────────────────────────────── */}
              <CollapsibleSection
                title="Add Shipping Address"
                open={showShippingAddress}
                onToggle={() => setShowShippingAddress((v) => !v)}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldShell icon={<Map size={11} />} label="City">
                      <Input
                        value={shippingAddressDraft.city}
                        onChange={(e) => setShippingAddressDraft((d) => ({ ...d, city: e.target.value }))}
                        placeholder="City"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                    <FieldShell icon={<Globe size={11} />} label="State">
                      <Input
                        value={shippingAddressDraft.state}
                        onChange={(e) => setShippingAddressDraft((d) => ({ ...d, state: e.target.value }))}
                        placeholder="State"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                    <FieldShell icon={<MapPinned size={11} />} label="Pincode">
                      <Input
                        value={shippingAddressDraft.pincode}
                        onChange={(e) =>
                          setShippingAddressDraft((d) => ({ ...d, pincode: e.target.value.replace(/[^0-9]/g, "") }))
                        }
                        placeholder="Pincode"
                        inputMode="numeric"
                        className={inputClass}
                        style={ringStyle}
                      />
                    </FieldShell>
                  </div>

                  <FieldShell icon={<MapPin size={11} />} label="Address">
                    <textarea
                      value={shippingAddressDraft.address}
                      onChange={(e) => setShippingAddressDraft((d) => ({ ...d, address: e.target.value }))}
                      placeholder="Address"
                      rows={3}
                      className={textareaClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={addShippingAddress}
                      disabled={!shippingAddressDraft.address.trim()}
                      className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Plus size={14} /> Add Address
                    </Button>
                  </div>

                  {shippingAddresses.length > 0 && (
                    <div className="space-y-2">
                      {shippingAddresses.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                        >
                          <div className="text-xs text-slate-600">
                            <span className="text-slate-800">{row.address}</span>
                            {(row.city || row.state || row.pincode) && (
                              <span className="text-slate-400">
                                {" "}
                                — {[row.city, row.state, row.pincode].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeShippingAddress(row.id)}
                            className="text-slate-400 hover:text-red-500 shrink-0 cursor-pointer"
                            aria-label="Remove address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          )}

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
