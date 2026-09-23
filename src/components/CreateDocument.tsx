import { useEffect, useMemo, useState } from "react";
import {
  FileStack,
  FileText,
  ClipboardList,
  Tag,
  Hash,
  Coins,
  Landmark,
  Printer,
  PenLine,
  Percent,
  FileCheck2,
  ScrollText,
  Building2,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
  RotateCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchDocumentTypeStartWith,
  fetchCurrencyStartWith,
  fetchAccHeadStartWith,
  fetchAccHeadsForDocs,
  fetchTaxMasterDetails,
  fetchInvoiceTaxTypes,
  fetchAccGroupStartWith,
  fetchServiceItemBySearch,
  fetchSelectedDocument,
  saveDocumentChanges,
} from "../store/features/settings/systemsetup/documentSlice";
import type { SaveDocumentChangesPayload } from "../store/features/settings/systemsetup/documentSlice";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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
        <label className="text-xs font-semibold text-slate-600">{label}</label>
      </div>
      {children}
    </div>
  );
}

interface SelectItem {
  id: string;
  label: string;
}

// ─── Static-list searchable select (also used for API-backed dropdowns) ───
function StaticSelect({
  displayValue,
  onSelect,
  onClear,
  placeholder,
  items,
  onOpen,
  canOpen,
  loading,
}: {
  displayValue: string;
  onSelect: (item: SelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SelectItem[];
  /** Called the moment the dropdown opens — use to lazily fetch options. */
  onOpen?: () => void;
  /** Return false to block the dropdown from opening (e.g. a required field isn't set yet). */
  canOpen?: () => boolean;
  /** Shows a loading state in place of the empty-results message. */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      if (canOpen && !canOpen()) return;
      onOpen?.();
    }
    setOpen(next);
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
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
              <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>
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

// ─── Static option lists (UI only — no matching API yet) ──────────────────
const PRINT_MODULE_ITEMS: SelectItem[] = [
  { id: "standard", label: "Standard Print" },
  { id: "thermal", label: "Thermal Print" },
  { id: "a4", label: "A4 Print" },
];

// ─── Tabs ───────────────────────────────────────────────────────────────────
const TABS = ["General", "Additional Heads", "Additional Specifications"] as const;
type Tab = (typeof TABS)[number];

// ─── Dynamic "Additional Heads" row ────────────────────────────────────────
interface AdditionalHeadRow {
  id: string;
  accountHead: string;
  accountHeadLabel: string;
  isAddition: boolean;
  inputAc: string;
  inputAcLabel: string;
  outputAc: string;
  outputAcLabel: string;
}
const emptyAdditionalHeadRow = (): AdditionalHeadRow => ({
  id: crypto.randomUUID(),
  accountHead: "",
  accountHeadLabel: "",
  isAddition: false,
  inputAc: "",
  inputAcLabel: "",
  outputAc: "",
  outputAcLabel: "",
});

interface CreateDocumentProps {
  /** Called when the user clicks "Document Details" — typically navigates back to the Document list. */
  onBack?: () => void;
  /** Called with the core fields when the user clicks "Submit". */
  onSubmit?: (data: { document: string; prefix: string }) => void;
  /** When set, the form loads and prefills this document's data (edit mode). */
  documentId?: number;
}

export default function CreateDocument({ onBack, onSubmit, documentId }: CreateDocumentProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    documentTypeStartWithList,
    documentTypeStartWithLoading,
    currencyStartWithList,
    currencyStartWithLoading,
    accHeadStartWithList,
    accHeadStartWithLoading,
    accHeadsForDocsList,
    accHeadsForDocsLoading,
    taxMasterDetailsList,
    taxMasterDetailsLoading,
    invoiceTaxTypesList,
    invoiceTaxTypesLoading,
    accGroupStartWithList,
    accGroupStartWithLoading,
    serviceItemBySearchList,
    serviceItemBySearchLoading,
    selectedDocument,
    selectedDocumentLoading,
  } = useSelector((state: RootState) => state.document);

  const documentTypeApiItems: SelectItem[] = useMemo(
    () =>
      documentTypeStartWithList.map((item) => ({
        id: String(item.DocumentTypeID),
        label: item.DocumentTypeName,
      })),
    [documentTypeStartWithList]
  );
  const currencyApiItems: SelectItem[] = useMemo(
    () =>
      currencyStartWithList.map((item) => ({
        id: String(item.CurrencyID),
        label: item.Currency,
      })),
    [currencyStartWithList]
  );
  const accHeadApiItems: SelectItem[] = useMemo(
    () =>
      accHeadStartWithList.map((item) => ({
        id: String(item.HeadID),
        label: item.HeadName,
      })),
    [accHeadStartWithList]
  );
  const drHeadApiItems: SelectItem[] = useMemo(
    () =>
      accHeadsForDocsList
        .filter((item) => item.DrOrCr === "Dr")
        .map((item) => ({ id: String(item.HeadID), label: item.HeadName })),
    [accHeadsForDocsList]
  );
  const crHeadApiItems: SelectItem[] = useMemo(
    () =>
      accHeadsForDocsList
        .filter((item) => item.DrOrCr === "Cr")
        .map((item) => ({ id: String(item.HeadID), label: item.HeadName })),
    [accHeadsForDocsList]
  );
  const taxMasterApiItems: SelectItem[] = useMemo(
    () =>
      taxMasterDetailsList.map((item) => ({
        id: String(item.TaxMasterID),
        label: item.TaxMasterName,
      })),
    [taxMasterDetailsList]
  );
  const invoiceTaxTypeApiItems: SelectItem[] = useMemo(
    () =>
      invoiceTaxTypesList.map((item) => ({
        id: String(item.InvoiceTaxTypeID),
        label: item.InvoiceTaxType,
      })),
    [invoiceTaxTypesList]
  );
  const accGroupApiItems: SelectItem[] = useMemo(
    () =>
      accGroupStartWithList.map((item) => ({
        id: String(item.GroupID),
        label: item.GroupName,
      })),
    [accGroupStartWithList]
  );
  const serviceItemApiItems: SelectItem[] = useMemo(
    () =>
      serviceItemBySearchList.map((item) => ({
        id: String(item.ItemID),
        label: item.ItemName,
      })),
    [serviceItemBySearchList]
  );

  const [showTaxMasterAlert, setShowTaxMasterAlert] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("General");

  // ── General tab ─────────────────────────────────────────────────────────
  const [document, setDocument] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTypeLabel, setDocumentTypeLabel] = useState("");
  const [shortName, setShortName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [suffix, setSuffix] = useState("");
  const [acHeadDr, setAcHeadDr] = useState("");
  const [acHeadDrLabel, setAcHeadDrLabel] = useState("");
  const [acHeadCr, setAcHeadCr] = useState("");
  const [acHeadCrLabel, setAcHeadCrLabel] = useState("");
  const [printModule, setPrintModule] = useState("");
  const [printModuleLabel, setPrintModuleLabel] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [startingNo, setStartingNo] = useState("");
  const [taxMaster, setTaxMaster] = useState("");
  const [taxMasterLabel, setTaxMasterLabel] = useState("");
  const [invoiceTaxType, setInvoiceTaxType] = useState("");
  const [invoiceTaxTypeLabel, setInvoiceTaxTypeLabel] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [active, setActive] = useState(false);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [setAsDefaultDocument, setSetAsDefaultDocument] = useState(false);

  // ── Additional Heads tab ────────────────────────────────────────────────
  const [roundoffAccountHead, setRoundoffAccountHead] = useState("");
  const [roundoffAccountHeadLabel, setRoundoffAccountHeadLabel] = useState("");
  const [preferredAccountGroup, setPreferredAccountGroup] = useState("");
  const [preferredAccountGroupLabel, setPreferredAccountGroupLabel] = useState("");
  const [preferredDiscountHead, setPreferredDiscountHead] = useState("");
  const [preferredDiscountHeadLabel, setPreferredDiscountHeadLabel] = useState("");
  const [additionalHeadRows, setAdditionalHeadRows] = useState<AdditionalHeadRow[]>([
    emptyAdditionalHeadRow(),
  ]);

  function addAdditionalHeadRow() {
    setAdditionalHeadRows((rows) => [...rows, emptyAdditionalHeadRow()]);
  }
  function removeAdditionalHeadRow(id: string) {
    setAdditionalHeadRows((rows) => (rows.length === 1 ? rows : rows.filter((r) => r.id !== id)));
  }
  function updateAdditionalHeadRow(id: string, patch: Partial<AdditionalHeadRow>) {
    setAdditionalHeadRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  // ── Additional Specifications tab ───────────────────────────────────────
  const [saveAndPrint, setSaveAndPrint] = useState(false);
  const [sendNotificationEmail, setSendNotificationEmail] = useState(false);
  const [sendNotificationMessage, setSendNotificationMessage] = useState(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [vatBased, setVatBased] = useState(true);
  const [gstBased, setGstBased] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Edit mode: load the document + the dropdown source lists ───────────
  useEffect(() => {
    if (!documentId) return;
    dispatch(fetchSelectedDocument({ documentId }));
    dispatch(fetchAccHeadsForDocs());
    dispatch(fetchServiceItemBySearch());
  }, [dispatch, documentId]);

  // ── Prefill the form once the selected document arrives ────────────────
  useEffect(() => {
    if (!documentId || !selectedDocument || selectedDocument.DocumentID !== documentId) return;

    setDocument(selectedDocument.DocumentName ?? "");
    setDocumentType(selectedDocument.DocumentTypeID ? String(selectedDocument.DocumentTypeID) : "");
    setDocumentTypeLabel(selectedDocument.DocumentTypeName ?? "");
    setShortName(selectedDocument.ShortName ?? "");
    setPrefix(selectedDocument.Prefix ?? "");
    setCurrency(selectedDocument.CurrencyID ? String(selectedDocument.CurrencyID) : "");
    setCurrencyLabel(selectedDocument.Currency ?? "");
    setSuffix(selectedDocument.Suffix ?? "");
    setAcHeadDr(selectedDocument.DebitHeadID ? String(selectedDocument.DebitHeadID) : "");
    setAcHeadDrLabel(selectedDocument.DebitHeadName ?? "");
    setAcHeadCr(selectedDocument.CreditHeadID ? String(selectedDocument.CreditHeadID) : "");
    setAcHeadCrLabel(selectedDocument.CreditHeadName ?? "");
    setPrintModule(selectedDocument.PrintModID ? String(selectedDocument.PrintModID) : "");
    setPrintModuleLabel(selectedDocument.PrintModName ?? "");
    setPrintTitle(selectedDocument.PrintTitle ?? "");
    setStartingNo(selectedDocument.StartingNo != null ? String(selectedDocument.StartingNo) : "");
    setTaxMaster(selectedDocument.TaxMasterID ? String(selectedDocument.TaxMasterID) : "");
    setTaxMasterLabel(selectedDocument.TaxMaster ?? "");
    setInvoiceTaxType(
      selectedDocument.InvoiceTaxTypeID ? String(selectedDocument.InvoiceTaxTypeID) : ""
    );
    setInvoiceTaxTypeLabel(selectedDocument.InvoiceTaxType ?? "");
    setDeclaration(selectedDocument.Declaration ?? "");
    setActive(!!selectedDocument.Active);
    setAutoIncrement(!!selectedDocument.Automation);
    setSetAsDefaultDocument(!!selectedDocument.SetDefault);

    setRoundoffAccountHead(
      selectedDocument.RoundoffHeadID ? String(selectedDocument.RoundoffHeadID) : ""
    );
    setRoundoffAccountHeadLabel(selectedDocument.RoundoffHead ?? "");
    setPreferredAccountGroup(selectedDocument.GroupID ? String(selectedDocument.GroupID) : "");
    setPreferredAccountGroupLabel(selectedDocument.GroupName ?? "");
    setPreferredDiscountHead(
      selectedDocument.DiscountHeadID ? String(selectedDocument.DiscountHeadID) : ""
    );
    setPreferredDiscountHeadLabel(selectedDocument.DiscountHead ?? "");

    setAdditionalHeadRows(
      selectedDocument.LstDocumentAddHead.length
        ? selectedDocument.LstDocumentAddHead.map((row) => ({
            id: crypto.randomUUID(),
            accountHead: row.ServiceItemID ? String(row.ServiceItemID) : "",
            accountHeadLabel: row.ServiceItemName ?? "",
            isAddition: row.IsAddition,
            inputAc: row.InputAccHeadID ? String(row.InputAccHeadID) : "",
            inputAcLabel: row.InputAccHeadName ?? "",
            outputAc: row.OutputAccHeadID ? String(row.OutputAccHeadID) : "",
            outputAcLabel: row.OutputAccHeadName ?? "",
          }))
        : [emptyAdditionalHeadRow()]
    );

    setSendNotificationEmail(!!selectedDocument.NotificationEmail);
    setSendNotificationMessage(!!selectedDocument.NotificationSms);
    setAllowNegativeStock(!!selectedDocument.NegativeStock);
    setVatBased(!!selectedDocument.IsVAT);
    setGstBased(!!selectedDocument.IsGST);
  }, [documentId, selectedDocument]);

  function handleClear() {
    setDocument("");
    setDocumentType("");
    setDocumentTypeLabel("");
    setShortName("");
    setPrefix("");
    setCurrency("");
    setCurrencyLabel("");
    setSuffix("");
    setAcHeadDr("");
    setAcHeadDrLabel("");
    setAcHeadCr("");
    setAcHeadCrLabel("");
    setPrintModule("");
    setPrintModuleLabel("");
    setPrintTitle("");
    setStartingNo("");
    setTaxMaster("");
    setTaxMasterLabel("");
    setInvoiceTaxType("");
    setInvoiceTaxTypeLabel("");
    setDeclaration("");
    setActive(false);
    setAutoIncrement(false);
    setSetAsDefaultDocument(false);
    setSaveAndPrint(false);
    setSendNotificationEmail(false);
    setSendNotificationMessage(false);
    setAllowNegativeStock(false);
    setVatBased(true);
    setGstBased(false);
  }

  function getMissingFields(): string[] {
    const missing: string[] = [];

    // ── General tab ─────────────────────────────────────────────────────
    if (!document.trim()) missing.push("Document");
    if (!documentType) missing.push("Document Type");
    if (!shortName.trim()) missing.push("Short Name");
    if (!prefix.trim()) missing.push("Prefix");
    if (!currency) missing.push("Currency");
    if (!suffix.trim()) missing.push("Suffix");
    if (!acHeadDr) missing.push("A/C Head Dr.");
    if (!acHeadCr) missing.push("A/C Head Cr.");
    if (!printModule) missing.push("Print Module");
    if (!printTitle.trim()) missing.push("Print Title");
    if (!startingNo.trim()) missing.push("Starting No.");
    if (!taxMaster) missing.push("Tax Master");
    if (!invoiceTaxType) missing.push("Invoice TaxType");
    if (!declaration.trim()) missing.push("Declaration");

    // ── Additional Heads tab ────────────────────────────────────────────
    if (!roundoffAccountHead) missing.push("Roundoff Account Head");
    if (!preferredAccountGroup) missing.push("Preferred Account Group");
    if (!preferredDiscountHead) missing.push("Preferred Discount Head");
    additionalHeadRows.forEach((row, idx) => {
      const rowNo = idx + 1;
      if (!row.accountHead) missing.push(`Account Head (row ${rowNo})`);
      if (!row.inputAc) missing.push(`Input A/C (row ${rowNo})`);
      if (!row.outputAc) missing.push(`Output A/C (row ${rowNo})`);
    });

    return missing;
  }

  async function handleSubmit() {
    const missing = getMissingFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      return;
    }

    const trimmedDocument = document.trim();
    const trimmedPrefix = prefix.trim();

    const payload: SaveDocumentChangesPayload = {
      BackgroundColor: "",
      Currency: currencyLabel,
      DebitHeadID: Number(acHeadDr),
      DebitHeadName: acHeadDrLabel,
      DiscountHead: preferredDiscountHeadLabel,
      DiscountHeadID: Number(preferredDiscountHead),
      DocumentName: trimmedDocument,
      DocumentTypeID: Number(documentType),
      DocumentTypeName: documentTypeLabel,
      GroupID: Number(preferredAccountGroup),
      GroupName: preferredAccountGroupLabel,
      InvoiceTaxType: invoiceTaxTypeLabel,
      InvoiceTaxTypeID: Number(invoiceTaxType),
      IsGST: gstBased,
      IsVAT: vatBased,
      LstDocumentAddHead: additionalHeadRows.map((row) => ({
        InputAccHeadID: Number(row.inputAc),
        InputAccHeadName: row.inputAcLabel,
        OutputAccHeadID: Number(row.outputAc),
        OutputAccHeadName: row.outputAcLabel,
        ServiceItemID: Number(row.accountHead),
        ServiceItemName: row.accountHeadLabel,
      })),
      LstDocumentTaxDetails: [],
      NotificationEmail: sendNotificationEmail,
      NotificationSms: sendNotificationMessage,
      PanelColor: "",
      Prefix: trimmedPrefix,
      RoundoffHead: roundoffAccountHeadLabel,
      RoundoffHeadID: Number(roundoffAccountHead),
      TaxMaster: taxMasterLabel,
      TaxMasterID: Number(taxMaster),
    };

    setIsSubmitting(true);
    try {
      await dispatch(saveDocumentChanges({ payload })).unwrap();
      toast.success("Document saved successfully.");
      onSubmit?.({ document: trimmedDocument, prefix: trimmedPrefix });
      onBack?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save document.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="DOCUMENT"
        subtitle="Document Setup"
        icon={<FileStack size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "Document Details",
              onCreateClick: onBack,
            }
          : {})}
      />

      <div className="p-5">
        {documentId && selectedDocumentLoading && (
          <div className="mb-3 text-xs font-medium text-slate-500">Loading document…</div>
        )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <FieldShell icon={<FileText size={11} />} label="Document">
                  <Input
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Document Name"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<ClipboardList size={11} />} label="Document Type">
                  <StaticSelect
                    displayValue={documentTypeLabel}
                    onSelect={(item) => {
                      setDocumentType(item.id);
                      setDocumentTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setDocumentType("");
                      setDocumentTypeLabel("");
                    }}
                    placeholder="Select Document Type"
                    items={documentTypeApiItems}
                    onOpen={() => dispatch(fetchDocumentTypeStartWith())}
                    loading={documentTypeStartWithLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Tag size={11} />} label="Short Name">
                  <Input
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="Enter Shortname"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Hash size={11} />} label="Prefix">
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="Enter Prefix"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Coins size={11} />} label="Currency">
                  <StaticSelect
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
                    items={currencyApiItems}
                    onOpen={() => dispatch(fetchCurrencyStartWith())}
                    loading={currencyStartWithLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Hash size={11} />} label="Suffix">
                  <Input
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="Enter Suffix"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="A/C Head Dr.">
                  <StaticSelect
                    displayValue={acHeadDrLabel}
                    onSelect={(item) => {
                      setAcHeadDr(item.id);
                      setAcHeadDrLabel(item.label);
                    }}
                    onClear={() => {
                      setAcHeadDr("");
                      setAcHeadDrLabel("");
                    }}
                    placeholder="Select Dr. Head"
                    items={drHeadApiItems}
                    onOpen={() => dispatch(fetchAccHeadsForDocs())}
                    loading={accHeadsForDocsLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="A/C Head Cr.">
                  <StaticSelect
                    displayValue={acHeadCrLabel}
                    onSelect={(item) => {
                      setAcHeadCr(item.id);
                      setAcHeadCrLabel(item.label);
                    }}
                    onClear={() => {
                      setAcHeadCr("");
                      setAcHeadCrLabel("");
                    }}
                    placeholder="Select Cr. Head"
                    items={crHeadApiItems}
                    onOpen={() => dispatch(fetchAccHeadsForDocs())}
                    loading={accHeadsForDocsLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Printer size={11} />} label="Print Module">
                  <StaticSelect
                    displayValue={printModuleLabel}
                    onSelect={(item) => {
                      setPrintModule(item.id);
                      setPrintModuleLabel(item.label);
                    }}
                    onClear={() => {
                      setPrintModule("");
                      setPrintModuleLabel("");
                    }}
                    placeholder="Select Print Module"
                    items={PRINT_MODULE_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<PenLine size={11} />} label="Print Title">
                  <Input
                    value={printTitle}
                    onChange={(e) => setPrintTitle(e.target.value)}
                    placeholder="Enter Title"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Hash size={11} />} label="Starting No.">
                  <Input
                    value={startingNo}
                    onChange={(e) => setStartingNo(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter Starting No."
                    inputMode="numeric"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<Percent size={11} />} label="Tax Master">
                  <StaticSelect
                    displayValue={taxMasterLabel}
                    onSelect={(item) => {
                      setTaxMaster(item.id);
                      setTaxMasterLabel(item.label);
                    }}
                    onClear={() => {
                      setTaxMaster("");
                      setTaxMasterLabel("");
                    }}
                    placeholder="Select TaxMaster"
                    items={taxMasterApiItems}
                    onOpen={() => dispatch(fetchTaxMasterDetails())}
                    loading={taxMasterDetailsLoading}
                  />
                </FieldShell>

                <FieldShell icon={<FileCheck2 size={11} />} label="Invoice TaxType">
                  <StaticSelect
                    displayValue={invoiceTaxTypeLabel}
                    onSelect={(item) => {
                      setInvoiceTaxType(item.id);
                      setInvoiceTaxTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setInvoiceTaxType("");
                      setInvoiceTaxTypeLabel("");
                    }}
                    placeholder="Select InvoiceTaxType"
                    items={invoiceTaxTypeApiItems}
                    canOpen={() => {
                      if (!taxMaster) {
                        setShowTaxMasterAlert(true);
                        return false;
                      }
                      return true;
                    }}
                    onOpen={() => dispatch(fetchInvoiceTaxTypes({ taxMasterId: Number(taxMaster) }))}
                    loading={invoiceTaxTypesLoading}
                  />
                </FieldShell>
              </div>

              {/* ── Declaration + checkboxes ─────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
                <FieldShell icon={<ScrollText size={11} />} label="Declaration">
                  <textarea
                    value={declaration}
                    onChange={(e) => setDeclaration(e.target.value)}
                    placeholder="Enter Declaration"
                    rows={4}
                    className={textareaClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <div className="flex flex-wrap items-center gap-6 pt-7">
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
                      checked={autoIncrement}
                      onChange={(e) => setAutoIncrement(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">AutoIncrement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setAsDefaultDocument}
                      onChange={(e) => setSetAsDefaultDocument(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                    />
                    <span className="text-xs font-medium text-slate-600">Set As Default Document</span>
                  </label>
                </div>
              </div>

              {/* ── Footer actions ───────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50/50">
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
                  disabled={isSubmitting}
                  className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                  style={{ backgroundColor: BRAND }}
                >
                  <Check size={14} />
                  {isSubmitting ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          ) : activeTab === "Additional Heads" ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldShell icon={<Landmark size={11} />} label="Roundoff Account Head">
                  <StaticSelect
                    displayValue={roundoffAccountHeadLabel}
                    onSelect={(item) => {
                      setRoundoffAccountHead(item.id);
                      setRoundoffAccountHeadLabel(item.label);
                    }}
                    onClear={() => {
                      setRoundoffAccountHead("");
                      setRoundoffAccountHeadLabel("");
                    }}
                    placeholder="Select Roundoff Head"
                    items={accHeadApiItems}
                    onOpen={() => dispatch(fetchAccHeadStartWith())}
                    loading={accHeadStartWithLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Building2 size={11} />} label="Preferred Account Group">
                  <StaticSelect
                    displayValue={preferredAccountGroupLabel}
                    onSelect={(item) => {
                      setPreferredAccountGroup(item.id);
                      setPreferredAccountGroupLabel(item.label);
                    }}
                    onClear={() => {
                      setPreferredAccountGroup("");
                      setPreferredAccountGroupLabel("");
                    }}
                    placeholder="Select Account Group"
                    items={accGroupApiItems}
                    onOpen={() => dispatch(fetchAccGroupStartWith())}
                    loading={accGroupStartWithLoading}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Preferred Discount Head">
                  <StaticSelect
                    displayValue={preferredDiscountHeadLabel}
                    onSelect={(item) => {
                      setPreferredDiscountHead(item.id);
                      setPreferredDiscountHeadLabel(item.label);
                    }}
                    onClear={() => {
                      setPreferredDiscountHead("");
                      setPreferredDiscountHeadLabel("");
                    }}
                    placeholder="Select Discount Head"
                    items={accHeadApiItems}
                    onOpen={() => dispatch(fetchAccHeadStartWith())}
                    loading={accHeadStartWithLoading}
                  />
                </FieldShell>
              </div>

              {/* ── Additional heads table ───────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalHeadRow}
                    className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Row
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: BRAND }}>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white w-14">
                          Sl No.
                        </th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white min-w-[180px]">
                          Account Head
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white w-24">
                          Is Addition
                        </th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white min-w-[180px]">
                          Input A/C
                        </th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white min-w-[180px]">
                          Output A/C
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white w-16">
                          Options
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {additionalHeadRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                          <td className="px-3 py-2.5 text-slate-500 font-medium align-middle">{idx + 1}</td>
                          <td className="px-2 py-2 align-middle">
                            <StaticSelect
                              displayValue={row.accountHeadLabel}
                              onSelect={(item) =>
                                updateAdditionalHeadRow(row.id, {
                                  accountHead: item.id,
                                  accountHeadLabel: item.label,
                                })
                              }
                              onClear={() =>
                                updateAdditionalHeadRow(row.id, { accountHead: "", accountHeadLabel: "" })
                              }
                              placeholder="Select Account Head"
                              items={serviceItemApiItems}
                              onOpen={() => dispatch(fetchServiceItemBySearch())}
                              loading={serviceItemBySearchLoading}
                            />
                          </td>
                          <td className="px-2 py-2 text-center align-middle">
                            <input
                              type="checkbox"
                              checked={row.isAddition}
                              onChange={(e) =>
                                updateAdditionalHeadRow(row.id, { isAddition: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <StaticSelect
                              displayValue={row.inputAcLabel}
                              onSelect={(item) =>
                                updateAdditionalHeadRow(row.id, {
                                  inputAc: item.id,
                                  inputAcLabel: item.label,
                                })
                              }
                              onClear={() =>
                                updateAdditionalHeadRow(row.id, { inputAc: "", inputAcLabel: "" })
                              }
                              placeholder="Select Input A/c Head"
                              items={accHeadApiItems}
                              onOpen={() => dispatch(fetchAccHeadStartWith())}
                              loading={accHeadStartWithLoading}
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <StaticSelect
                              displayValue={row.outputAcLabel}
                              onSelect={(item) =>
                                updateAdditionalHeadRow(row.id, {
                                  outputAc: item.id,
                                  outputAcLabel: item.label,
                                })
                              }
                              onClear={() =>
                                updateAdditionalHeadRow(row.id, { outputAc: "", outputAcLabel: "" })
                              }
                              placeholder="Select Output A/c Head"
                              items={accHeadApiItems}
                              onOpen={() => dispatch(fetchAccHeadStartWith())}
                              loading={accHeadStartWithLoading}
                            />
                          </td>
                          <td className="px-2 py-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => removeAdditionalHeadRow(row.id)}
                              disabled={additionalHeadRows.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Remove row"
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

              {/* ── Footer actions ───────────────────────────────────────── */}
              <div className="flex items-center justify-end pt-5 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50/50">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                  style={{ backgroundColor: BRAND }}
                >
                  <Check size={14} />
                  {isSubmitting ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAndPrint}
                    onChange={(e) => setSaveAndPrint(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">Save And Print</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendNotificationEmail}
                    onChange={(e) => setSendNotificationEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">Send Notification Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendNotificationMessage}
                    onChange={(e) => setSendNotificationMessage(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">Send Notification Message</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowNegativeStock}
                    onChange={(e) => setAllowNegativeStock(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">Allow Negative Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={vatBased}
                    onChange={(e) => setVatBased(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">VAT Based</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gstBased}
                    onChange={(e) => setGstBased(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
                  />
                  <span className="text-sm text-slate-700">GST Based</span>
                </label>
              </div>

              {/* ── Footer actions ───────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50/50">
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
                  disabled={isSubmitting}
                  className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
                  style={{ backgroundColor: BRAND }}
                >
                  <Check size={14} />
                  {isSubmitting ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showTaxMasterAlert} onOpenChange={setShowTaxMasterAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tax Master required</AlertDialogTitle>
            <AlertDialogDescription>
              Please select Tax Master before choosing Invoice TaxType.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTaxMasterAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Required fields missing</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Please fill in the following fields before submitting:</p>
                <ul className="list-disc pl-5 space-y-0.5 max-h-48 overflow-y-auto">
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidationAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}