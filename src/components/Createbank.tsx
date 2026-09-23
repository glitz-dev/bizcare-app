import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Landmark,
  Hash,
  MapPinned,
  ShieldCheck,
  User,
  Phone,
  Home,
  Wallet,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Check,
  Check as CheckIcon,
  RotateCcw,
  CalendarDays,
  Percent,
  FileStack,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  fetchAccHeadStartWith,
  fetchCurrencyStartWith,
  fetchDocumentMLists,
  checkBankDuplication,
  createNewBank,
  updateBank,
  type CreateBankPayload,
  type UpdateBankPayload,
  type BankDetail,
} from "../store/features/settings/bankSlice";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Shared labeled-field wrapper (sourced from Createcurrency.tsx) ───────
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

// ─── Visual-only "select" field (no live data wiring — UI only) ───────────
function ComboField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-3 pr-14 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 transition-shadow"
        style={{ ["--tw-ring-color" as any]: BRAND }}
      />
      <div className="absolute inset-y-0 right-2 flex items-center gap-1 text-slate-400">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="hover:text-slate-600 cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
        <ChevronDown size={13} />
      </div>
    </div>
  );
}

// ─── Searchable dropdown (Radix Popover + Command, sourced from the app's
// SearchableCombobox pattern) — used for fields backed by live API options ──
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
}: {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

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
        <Command>
          <CommandInput placeholder="Search..." className="h-9 text-sm" />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : emptyText}
            </CommandEmpty>
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
                  <CheckIcon
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

// ─── Small "Add Row" button ────────────────────────────────────────────────
function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold cursor-pointer transition-colors border"
      style={{ color: BRAND, borderColor: BRAND_LIGHT, backgroundColor: BRAND_LIGHT }}
    >
      <Plus size={13} />
      {label}
    </button>
  );
}

// ─── Row types (UI-only local state) ───────────────────────────────────────
interface LoanAccountRow {
  id: number;
  documentType: string;
  accountHead: string;
  currency: string;
}

interface BankFacilityRow {
  id: number;
  weDate: string;
  pcfcRate: string;
  pclRate: string;
}

interface DocumentRow {
  id: number;
  document: string;
}

let rowIdCounter = 1;
const nextRowId = () => rowIdCounter++;

// ─── Date helper (DD-MM-YYYY, matching RateDateStr convention) ────────────
const formatDateStr = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

interface CreateBankProps {
  /** Called when the user clicks "Bank Details" — typically navigates back to the Bank list. */
  onBack?: () => void;
  /** When provided, the form prefills with this bank's details for editing. */
  editBank?: BankDetail | null;
}

export default function CreateBank({ onBack, editBank }: CreateBankProps) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    accHeadList,
    accHeadLoading,
    currencyList,
    currencyLoading,
    documentList,
    documentListLoading,
  } = useSelector((state: RootState) => state.bank);

  // Fetch dropdown data sources once on mount
  useEffect(() => {
    dispatch(fetchAccHeadStartWith());
    dispatch(fetchCurrencyStartWith());
    dispatch(fetchDocumentMLists());
  }, [dispatch]);

  const accHeadOptions: SearchableOption[] = useMemo(
    () =>
      accHeadList.map((item) => ({
        value: String(item.HeadID),
        label: item.HeadName?.trim() || "(Unnamed)",
      })),
    [accHeadList]
  );

  const currencyOptions: SearchableOption[] = useMemo(
    () =>
      currencyList.map((item) => ({
        value: String(item.CurrencyID),
        label: item.Currency?.trim() || item.CurrencyCode || "(Unnamed)",
      })),
    [currencyList]
  );

  const documentOptions: SearchableOption[] = useMemo(
    () =>
      documentList.map((item) => ({
        value: String(item.DocumentID),
        label: item.DocumentName?.trim() || "(Unnamed)",
      })),
    [documentList]
  );

  // ── Bank details ──────────────────────────────────────────────────────
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [swift, setSwift] = useState("");
  const [accountHead, setAccountHead] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [common, setCommon] = useState(true);

  // ── Loan accounts ─────────────────────────────────────────────────────
  const [loanAccounts, setLoanAccounts] = useState<LoanAccountRow[]>([
    { id: nextRowId(), documentType: "", accountHead: "", currency: "" },
  ]);

  const addLoanAccountRow = () =>
    setLoanAccounts((rows) => [
      ...rows,
      { id: nextRowId(), documentType: "", accountHead: "", currency: "" },
    ]);

  const removeLoanAccountRow = (id: number) =>
    setLoanAccounts((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const updateLoanAccountRow = (
    id: number,
    field: keyof Omit<LoanAccountRow, "id">,
    value: string
  ) =>
    setLoanAccounts((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  // ── Bank facility ─────────────────────────────────────────────────────
  const [preshipmentCredit, setPreshipmentCredit] = useState("");
  const [postshipmentCredit, setPostshipmentCredit] = useState("");
  const [facilityRows, setFacilityRows] = useState<BankFacilityRow[]>([
    { id: nextRowId(), weDate: "", pcfcRate: "", pclRate: "" },
  ]);

  const addFacilityRow = () =>
    setFacilityRows((rows) => [
      ...rows,
      { id: nextRowId(), weDate: "", pcfcRate: "", pclRate: "" },
    ]);

  const removeFacilityRow = (id: number) =>
    setFacilityRows((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const updateFacilityRow = (
    id: number,
    field: keyof Omit<BankFacilityRow, "id">,
    value: string
  ) =>
    setFacilityRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  // ── Documents ──────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState<DocumentRow[]>([
    { id: nextRowId(), document: "" },
  ]);

  const addDocumentRow = () =>
    setDocuments((rows) => [...rows, { id: nextRowId(), document: "" }]);

  const removeDocumentRow = (id: number) =>
    setDocuments((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const updateDocumentRow = (id: number, value: string) =>
    setDocuments((rows) =>
      rows.map((r) => (r.id === id ? { ...r, document: value } : r))
    );

  // ── Prefill from an existing bank when editing ──────────────────────────
  useEffect(() => {
    if (!editBank) return;

    setBankName(editBank.BankName ?? "");
    setBranch(editBank.Branch ?? "");
    setAccountNo(editBank.AccountNo ?? "");
    setIfsc(editBank.IFSC ?? "");
    setSwift(editBank.SWIFT ?? "");
    setAccountHead(editBank.AcHeadID ? String(editBank.AcHeadID) : "");
    setContactPerson(editBank.ContactPerson ?? "");
    setContactNumber(editBank.ContactNum ?? "");
    setAddress(editBank.Address ?? "");
    setPhone(editBank.Phone ?? "");
    setIsDefault(!!editBank.Default);
    setActive(editBank.Active);
    setCommon(editBank.Common);

    setLoanAccounts(
      editBank.LstBankLoanAcHeads.length
        ? editBank.LstBankLoanAcHeads.map((row) => ({
            id: nextRowId(),
            documentType: row.DocTypeID ? String(row.DocTypeID) : "",
            accountHead: row.HeadID ? String(row.HeadID) : "",
            currency: row.CurrencyID ? String(row.CurrencyID) : "",
          }))
        : [{ id: nextRowId(), documentType: "", accountHead: "", currency: "" }]
    );

    const facility = editBank.LstBankFacility[0];
    setPreshipmentCredit(facility?.PreshipmentCredit ?? "");
    setPostshipmentCredit(facility?.PostShipmentCredit ?? "");

    setFacilityRows(
      editBank.LstBankInterest.length
        ? editBank.LstBankInterest.map((row) => ({
            id: nextRowId(),
            weDate: row.RateDate ? row.RateDate.slice(0, 10) : "",
            pcfcRate: row.PCFCFixedRate != null ? String(row.PCFCFixedRate) : "",
            pclRate: row.PCLFixedRate != null ? String(row.PCLFixedRate) : "",
          }))
        : [{ id: nextRowId(), weDate: "", pcfcRate: "", pclRate: "" }]
    );

    setDocuments(
      editBank.LstDocuments.length
        ? editBank.LstDocuments.map((row) => ({
            id: nextRowId(),
            document: row.DocumentID ? String(row.DocumentID) : "",
          }))
        : [{ id: nextRowId(), document: "" }]
    );
  }, [editBank]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClear = () => {
    setBankName("");
    setBranch("");
    setAccountNo("");
    setIfsc("");
    setSwift("");
    setAccountHead("");
    setContactPerson("");
    setContactNumber("");
    setAddress("");
    setPhone("");
    setIsDefault(false);
    setActive(true);
    setCommon(true);
    setLoanAccounts([{ id: nextRowId(), documentType: "", accountHead: "", currency: "" }]);
    setPreshipmentCredit("");
    setPostshipmentCredit("");
    setFacilityRows([{ id: nextRowId(), weDate: "", pcfcRate: "", pclRate: "" }]);
    setDocuments([{ id: nextRowId(), document: "" }]);
  };

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      toast.error("Please enter a bank name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isDuplicate = await dispatch(
        checkBankDuplication({ bankName, bankId: editBank?.BankID ?? 0 })
      ).unwrap();

      if (isDuplicate) {
        toast.error(`"${bankName}" already exists. Please use a different name.`);
        return;
      }

      const selectedAccHead = accHeadList.find(
        (item) => String(item.HeadID) === accountHead
      );
      const now = new Date();

      if (editBank) {
        // ── Update existing bank ────────────────────────────────────────
        const originalInterestRows = editBank.LstBankInterest;
        const originalLoanRows = editBank.LstBankLoanAcHeads;
        const originalDocRows = editBank.LstDocuments;
        const originalFacility = editBank.LstBankFacility[0];

        const updatePayload: UpdateBankPayload = {
          ...editBank,
          BankName: bankName,
          Branch: branch,
          AccountNo: accountNo,
          IFSC: ifsc,
          SWIFT: swift,
          AcHeadID: selectedAccHead?.HeadID ?? editBank.AcHeadID,
          HeadName: selectedAccHead?.HeadName ?? editBank.HeadName,
          ContactPerson: contactPerson,
          ContactNum: contactNumber,
          Address: address,
          Phone: phone,
          Active: active,
          Common: common,
          PreshipmentCredit: preshipmentCredit,
          PostShipmentCredit: postshipmentCredit,
          LstBankFacility: [
            {
              BankFacilityID: originalFacility?.BankFacilityID ?? 0,
              BankID: editBank.BankID,
              PreshipmentCredit: preshipmentCredit,
              PostShipmentCredit: postshipmentCredit,
              CompanyID: originalFacility?.CompanyID ?? 0,
              BranchID: originalFacility?.BranchID ?? 0,
              Status: true,
              UserID: originalFacility?.UserID ?? 0,
              EntryDate: originalFacility?.EntryDate ?? now.toISOString(),
              ModifiedUserID: originalFacility?.ModifiedUserID ?? null,
              ModifiedDate: now.toISOString(),
              BankFGUID:
                originalFacility?.BankFGUID ??
                "00000000-0000-0000-0000-000000000000",
            },
          ],
          LstBankInterest: facilityRows.map((row, idx) => {
            const original = originalInterestRows[idx];
            const rateDate = row.weDate ? new Date(row.weDate) : now;
            return {
              BankInterestID: original?.BankInterestID ?? 0,
              BankID: editBank.BankID,
              PCLFixedRate: Number(row.pclRate) || 0,
              PCFCFixedRate: Number(row.pcfcRate) || 0,
              RateDate: rateDate.toISOString(),
              RateDateStr: formatDateStr(rateDate),
              CompanyID: original?.CompanyID ?? 0,
              BranchID: original?.BranchID ?? 0,
              Status: true,
              UserID: original?.UserID ?? 0,
              EntryDate: original?.EntryDate ?? now.toISOString(),
              ModifiedUserID: original?.ModifiedUserID ?? null,
              ModifiedDate: now.toISOString(),
              GUID: original?.GUID ?? "00000000-0000-0000-0000-000000000000",
            };
          }),
          LstBankLoanAcHeads: loanAccounts.map((row, idx) => {
            const original = originalLoanRows[idx];
            const head = accHeadList.find(
              (item) => String(item.HeadID) === row.accountHead
            );
            const curr = currencyList.find(
              (item) => String(item.CurrencyID) === row.currency
            );
            return {
              BankLoanID: original?.BankLoanID ?? 0,
              BankID: editBank.BankID,
              AccBankM: null,
              HeadID: head?.HeadID ?? original?.HeadID ?? 0,
              AccHeadM: null,
              CurrencyID: curr?.CurrencyID ?? original?.CurrencyID ?? 0,
              CurrencyM: null,
              DocTypeID: original?.DocTypeID ?? 0,
              DocumentTypeID: original?.DocTypeID ?? 0,
              DocumentTypeM: null,
              Status: true,
              UserID: original?.UserID ?? 0,
              EntryDate: original?.EntryDate ?? now.toISOString(),
              ModifiedUserID: original?.ModifiedUserID ?? null,
              ModifiedDate: now.toISOString(),
              HeadName: head?.HeadName ?? original?.HeadName ?? "",
              Currency: curr?.Currency ?? original?.Currency ?? "",
              DocumentTypeName: original?.DocumentTypeName ?? null,
            };
          }),
          LstDocuments: documents.map((row, idx) => {
            const original = originalDocRows[idx];
            const doc = documentList.find(
              (item) => String(item.DocumentID) === row.document
            );
            return {
              ID: original?.ID ?? 0,
              BankID: editBank.BankID,
              AccBankM: null,
              DocumentID: doc?.DocumentID ?? original?.DocumentID ?? 0,
              DocumentM: null,
              Status: true,
              CreatedBy: original?.CreatedBy ?? 0,
              CreatedDate: original?.CreatedDate ?? now.toISOString(),
              ModifiedBy: original?.ModifiedBy ?? null,
              ModifiedDate: now.toISOString(),
              DocumentName: doc?.DocumentName ?? original?.DocumentName ?? "",
            };
          }),
        };

        await dispatch(updateBank({ payload: updatePayload })).unwrap();
        toast.success("Bank updated successfully.");
      } else {
        // ── Create new bank ─────────────────────────────────────────────
        const payload: CreateBankPayload = {
          BankID: 0,
          BankName: bankName,
          Branch: branch,
          AccountNo: accountNo,
          IFSC: ifsc,
          SWIFT: swift,
          AcHeadID: selectedAccHead?.HeadID ?? 0,
          HeadName: selectedAccHead?.HeadName ?? "",
          MajorGroupID: selectedAccHead?.MajorGroupID ?? 0,
          LinkGroupID: selectedAccHead?.LinkGroupID ?? 0,
          ContactPerson: contactPerson,
          ContactNum: contactNumber,
          Address: address,
          Phone: phone,
          Active: active,
          Common: common,
          RateDate: now.toISOString(),
          RateDateStr: formatDateStr(now),
          LstBankFacility: [
            {
              Status: true,
              PreshipmentCredit: preshipmentCredit,
              PostshipmentCredit: postshipmentCredit,
            },
          ],
          LstBankInterest: facilityRows.map((row) => ({
            Status: true,
            PCLFixedRate: row.pclRate,
            PCFCFixedRate: row.pcfcRate,
            RateDate: row.weDate ? new Date(row.weDate).toISOString() : now.toISOString(),
          })),
          LstBankLoanAcHeads: loanAccounts.map((row) => {
            const head = accHeadList.find((item) => String(item.HeadID) === row.accountHead);
            const curr = currencyList.find((item) => String(item.CurrencyID) === row.currency);
            return {
              Status: true,
              HeadName: head?.HeadName ?? "",
              HeadID: head?.HeadID ?? 0,
              Currency: curr?.Currency ?? "",
              CurrencyID: curr?.CurrencyID ?? 0,
            };
          }),
          LstDocuments: documents.map((row) => {
            const doc = documentList.find((item) => String(item.DocumentID) === row.document);
            return {
              Status: true,
              DocumentName: doc?.DocumentName ?? "",
              DocumentID: doc?.DocumentID ?? 0,
            };
          }),
        };

        await dispatch(createNewBank({ payload })).unwrap();
        toast.success("Bank saved successfully.");
      }

      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save bank.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Bank"
        subtitle="Bank Setup"
        icon={<Landmark size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Bank Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5 space-y-5">
        {/* ── Bank details card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldShell icon={<Landmark size={11} />} label="Bank">
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank Name"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<MapPinned size={11} />} label="Branch">
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Branch Name"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Hash size={11} />} label="Account No">
                <Input
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Account No"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<ShieldCheck size={11} />} label="IFSC">
                <Input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="IFSC Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldShell icon={<ShieldCheck size={11} />} label="Swift">
                <Input
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                  placeholder="SWIFT Code"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Wallet size={11} />} label="Account Head">
                <SearchableSelect
                  options={accHeadOptions}
                  value={accountHead}
                  onChange={setAccountHead}
                  placeholder="Select Account Head"
                  loading={accHeadLoading}
                />
              </FieldShell>

              <FieldShell icon={<User size={11} />} label="Contact Person">
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contact Person Name"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <FieldShell icon={<Phone size={11} />} label="Contact Number">
                <Input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number, If Any"
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
              <div className="lg:col-span-2">
                <FieldShell icon={<Home size={11} />} label="Address">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    rows={2}
                    className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 resize-none transition-shadow"
                    style={{ ["--tw-ring-color" as any]: BRAND }}
                  />
                </FieldShell>
              </div>

              <FieldShell icon={<Phone size={11} />} label="Phone">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile/Phone No."
                  className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                  style={{ ["--tw-ring-color" as any]: BRAND }}
                />
              </FieldShell>

              <div className="flex items-end h-full pb-1.5">
                <div className="flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Default</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Loan Accounts / Bank Facility / Documents accordions ───────── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <Accordion
            type="multiple"
            defaultValue={["loan-accounts", "bank-facility", "documents"]}
          >
            {/* ── Loan Accounts ─────────────────────────────────────────── */}
            <AccordionItem value="loan-accounts" className="border-b border-slate-100">
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
                    style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
                  >
                    <Wallet size={13} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Loan Accounts
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="flex justify-end mb-3">
                  <AddRowButton onClick={addLoanAccountRow} label="Add Row" />
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: BRAND_LIGHT }}>
                        <th className="w-12 text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          No
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Document Type
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Account Head
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Currency
                        </th>
                        <th className="w-20 text-center font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanAccounts.map((row, idx) => (
                        <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-3 py-2 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <ComboField
                              value={row.documentType}
                              onChange={(v) => updateLoanAccountRow(row.id, "documentType", v)}
                              placeholder="Select Document Type"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <SearchableSelect
                              options={accHeadOptions}
                              value={row.accountHead}
                              onChange={(v) => updateLoanAccountRow(row.id, "accountHead", v)}
                              placeholder="Select Account Head"
                              loading={accHeadLoading}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <SearchableSelect
                              options={currencyOptions}
                              value={row.currency}
                              onChange={(v) => updateLoanAccountRow(row.id, "currency", v)}
                              placeholder="Select Currency"
                              loading={currencyLoading}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLoanAccountRow(row.id)}
                              disabled={loanAccounts.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ── Bank Facility ─────────────────────────────────────────── */}
            <AccordionItem value="bank-facility" className="border-b border-slate-100">
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
                    style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
                  >
                    <Percent size={13} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Bank Facility
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldShell icon={<Wallet size={11} />} label="Preshipment Credit">
                    <Input
                      value={preshipmentCredit}
                      onChange={(e) => setPreshipmentCredit(e.target.value)}
                      placeholder="Preshipment Credit"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>

                  <FieldShell icon={<Wallet size={11} />} label="Postshipment Credit">
                    <Input
                      value={postshipmentCredit}
                      onChange={(e) => setPostshipmentCredit(e.target.value)}
                      placeholder="Postshipment Credit"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                      style={{ ["--tw-ring-color" as any]: BRAND }}
                    />
                  </FieldShell>
                </div>

                <div className="flex justify-end">
                  <AddRowButton onClick={addFacilityRow} label="Add Row" />
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: BRAND_LIGHT }}>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          W.E Date
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          PCFC Interest Rate
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          PCL Interest Rate
                        </th>
                        <th className="w-20 text-center font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityRows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-3 py-2">
                            <div className="relative">
                              <input
                                type="date"
                                value={row.weDate}
                                onChange={(e) => updateFacilityRow(row.id, "weDate", e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-700 outline-none focus:ring-1 transition-shadow"
                                style={{ ["--tw-ring-color" as any]: BRAND }}
                              />
                              <CalendarDays
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.pcfcRate}
                              onChange={(e) => updateFacilityRow(row.id, "pcfcRate", e.target.value)}
                              placeholder="PCFC Interest Rate"
                              className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                              style={{ ["--tw-ring-color" as any]: BRAND }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.pclRate}
                              onChange={(e) => updateFacilityRow(row.id, "pclRate", e.target.value)}
                              placeholder="PCL Interest Rate"
                              className="h-9 text-sm border-slate-200 focus-visible:ring-1"
                              style={{ ["--tw-ring-color" as any]: BRAND }}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeFacilityRow(row.id)}
                              disabled={facilityRows.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ── Documents ─────────────────────────────────────────────── */}
            <AccordionItem value="documents" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
                    style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
                  >
                    <FileStack size={13} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Documents
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="flex justify-end mb-3">
                  <AddRowButton onClick={addDocumentRow} label="Add Row" />
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: BRAND_LIGHT }}>
                        <th className="w-12 text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          No
                        </th>
                        <th className="text-left font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Documents
                        </th>
                        <th className="w-20 text-center font-semibold text-[11px] uppercase tracking-wide px-3 py-2.5" style={{ color: BRAND }}>
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((row, idx) => (
                        <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-3 py-2 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <SearchableSelect
                              options={documentOptions}
                              value={row.document}
                              onChange={(v) => updateDocumentRow(row.id, v)}
                              placeholder="Select Document"
                              loading={documentListLoading}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeDocumentRow(row.id)}
                              disabled={documents.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* ── Footer actions ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <Check size={14} />
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
          >
            <RotateCcw size={13} />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
