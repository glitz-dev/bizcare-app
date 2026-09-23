"use client";

import { useState } from "react";
import {
  Boxes,
  PackageX,
  Wrench,
  Truck,
  Layers,
  AlertTriangle,
  CalendarClock,
  Percent,
  Star,
  Gift,
  Landmark,
  Building2,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ⚠️ adjust this path if your PageHeader lives elsewhere
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
import { cn } from "@/lib/utils";

// ─── Brand tokens (sourced from PageHeader.tsx) ────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#EAF1FA";

// ─── Shared input style helpers ────────────────────────────────────────────
const inputClass = "h-9 text-sm border-slate-200 focus-visible:ring-1";
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
  loading,
}: {
  displayValue: string;
  onSelect: (item: SelectItem) => void;
  onClear: () => void;
  placeholder: string;
  items: SelectItem[];
  /** Called the moment the dropdown opens — use to lazily fetch options. */
  onOpen?: () => void;
  /** Shows a loading state in place of the empty-results message. */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) onOpen?.();
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

// ─── Shared checkbox row ────────────────────────────────────────────────────
function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-[#004687]"
      />
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </label>
  );
}

// ─── Static option lists (UI only — wire these to real slices/APIs) ───────
const STOCK_TYPE_ITEMS: SelectItem[] = [
  { id: "good", label: "GOOD STOCK" },
  { id: "damage", label: "DAMAGE STOCK" },
];
const SERVICE_TYPE_ITEMS: SelectItem[] = [
  { id: "damage", label: "DAMAGE STOCK" },
  { id: "warranty", label: "WARRANTY SERVICE" },
];
const CONSIGNMENT_ITEM_TYPE_ITEMS: SelectItem[] = [
  { id: "own", label: "Own Stock" },
  { id: "consignment", label: "Consignment Stock" },
];
const COMBO_ITEM_TYPE_ITEMS: SelectItem[] = [
  { id: "ttype1", label: "ttype1" },
  { id: "ttype2", label: "ttype2" },
];
const MARGIN_BASIS_ITEMS: SelectItem[] = [
  { id: "purchase_rate", label: "Purchase Rate" },
  { id: "sales_rate", label: "Sales Rate" },
  { id: "mrp", label: "MRP" },
];
// TODO: wire this to your account-head API (e.g. fetchAccHeadStartWith) once
// a General Preference slice exists — same pattern as CreateDocument.tsx.
const ACCOUNT_HEAD_ITEMS: SelectItem[] = [];

// ─── Tabs ───────────────────────────────────────────────────────────────────
const TABS = ["General", "Purchase", "Sales", "Accounts"] as const;
type Tab = (typeof TABS)[number];

// ─── Tax → Account mapping table (shared by Purchase & Sales tabs) ────────
interface TaxAccountRow {
  taxKey: string;
  accountId: string;
  accountLabel: string;
}

function TaxAccountTable({
  rows,
  onChangeRow,
}: {
  rows: TaxAccountRow[];
  onChangeRow: (index: number, patch: Partial<TaxAccountRow>) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor: BRAND }}>
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white w-14">
              Sl No.
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white min-w-[160px]">
              Tax Key
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white min-w-[220px]">
              Account
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.taxKey} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
              <td className="px-3 py-2.5 text-slate-500 font-medium align-middle">{idx + 1}</td>
              <td className="px-3 py-2.5 text-slate-700 font-medium align-middle">{row.taxKey}</td>
              <td className="px-2 py-2 align-middle">
                <StaticSelect
                  displayValue={row.accountLabel}
                  onSelect={(item) => onChangeRow(idx, { accountId: item.id, accountLabel: item.label })}
                  onClear={() => onChangeRow(idx, { accountId: "", accountLabel: "" })}
                  placeholder="Select Account"
                  items={ACCOUNT_HEAD_ITEMS}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const makeTaxRows = (keys: string[]): TaxAccountRow[] =>
  keys.map((taxKey) => ({ taxKey, accountId: "", accountLabel: "" }));

interface CreateGeneralPreferenceProps {
  /** Called when the user clicks "General Preference Details" — typically navigates back to the list. */
  onBack?: () => void;
}

export default function CreateGeneralPreference({ onBack }: CreateGeneralPreferenceProps) {
  const [activeTab, setActiveTab] = useState<Tab>("General");

  // ── General ──────────────────────────────────────────────────────────────
  const [stockConsume, setStockConsume] = useState("Sales");
  const [nonStockType, setNonStockType] = useState("");
  const [nonStockTypeLabel, setNonStockTypeLabel] = useState("");
  const [serviceType, setServiceType] = useState("damage");
  const [serviceTypeLabel, setServiceTypeLabel] = useState("DAMAGE STOCK");
  const [consignmentItemType, setConsignmentItemType] = useState("");
  const [consignmentItemTypeLabel, setConsignmentItemTypeLabel] = useState("");
  const [comboItemType, setComboItemType] = useState("ttype1");
  const [comboItemTypeLabel, setComboItemTypeLabel] = useState("ttype1");
  const [damageType, setDamageType] = useState("damage");
  const [damageTypeLabel, setDamageTypeLabel] = useState("DAMAGE STOCK");
  const [enableBatch, setEnableBatch] = useState(false);
  const [autoGenerateItemcode, setAutoGenerateItemcode] = useState(false);
  const [enableRoundoff, setEnableRoundoff] = useState(false);

  // ── Purchase ─────────────────────────────────────────────────────────────
  const [purchaseStockType, setPurchaseStockType] = useState("good");
  const [purchaseStockTypeLabel, setPurchaseStockTypeLabel] = useState("GOOD STOCK");
  const [purchaseOrderDueDays, setPurchaseOrderDueDays] = useState("0");
  const [purchaseMarginBasedOn, setPurchaseMarginBasedOn] = useState("purchase_rate");
  const [purchaseMarginBasedOnLabel, setPurchaseMarginBasedOnLabel] = useState("Purchase Rate");
  const [newBatchOnPurchaseRate, setNewBatchOnPurchaseRate] = useState(true);
  const [newBatchOnSalesRate, setNewBatchOnSalesRate] = useState(true);
  const [newBatchOnWholesaleRate, setNewBatchOnWholesaleRate] = useState(false);
  const [newBatchOnNetPurchaseRate, setNewBatchOnNetPurchaseRate] = useState(false);
  const [newBatchOnUnitMultiplier, setNewBatchOnUnitMultiplier] = useState(false);
  const [newBatchOnMrp, setNewBatchOnMrp] = useState(false);
  const [enablePurchaseOrderVerification, setEnablePurchaseOrderVerification] = useState(true);
  const [enablePurchaseVerification, setEnablePurchaseVerification] = useState(true);
  const [allowPurchaseQtyGreaterThanPoQty, setAllowPurchaseQtyGreaterThanPoQty] = useState(true);
  const [purchaseTaxRows, setPurchaseTaxRows] = useState<TaxAccountRow[]>(
    makeTaxRows(["SGST INPUT", "CGST INPUT", "IGST INPUT", "UTGST INPUT", "VAT INPUT"])
  );

  // ── Sales ────────────────────────────────────────────────────────────────
  const [salesMarginBasedOn, setSalesMarginBasedOn] = useState("purchase_rate");
  const [salesMarginBasedOnLabel, setSalesMarginBasedOnLabel] = useState("Purchase Rate");
  const [loyaltyPointsDivider, setLoyaltyPointsDivider] = useState("");
  const [loyaltyRedeemDivider, setLoyaltyRedeemDivider] = useState("");
  const [showBarcode, setShowBarcode] = useState(true);
  const [showMultipleBatches, setShowMultipleBatches] = useState(true);
  const [allowMultipleBatchConsumption, setAllowMultipleBatchConsumption] = useState(false);
  const [showBatchesIfBarcodeEntered, setShowBatchesIfBarcodeEntered] = useState(false);
  const [allowToAddSubItems, setAllowToAddSubItems] = useState(false);
  const [takeBatchesFromDefaultStoreOnly, setTakeBatchesFromDefaultStoreOnly] = useState(true);
  const [salesTaxRows, setSalesTaxRows] = useState<TaxAccountRow[]>(
    makeTaxRows(["SGST OUTPUT", "CGST OUTPUT", "IGST OUTPUT", "UTGST OUTPUT", "VAT OUTPUT"])
  );

  // ── Accounts ─────────────────────────────────────────────────────────────
  const [openingStockHead, setOpeningStockHead] = useState("");
  const [openingStockHeadLabel, setOpeningStockHeadLabel] = useState("");
  const [cashAccountGroup, setCashAccountGroup] = useState("");
  const [cashAccountGroupLabel, setCashAccountGroupLabel] = useState("");
  const [bankAccountGroup, setBankAccountGroup] = useState("");
  const [bankAccountGroupLabel, setBankAccountGroupLabel] = useState("");
  const [creditAccountGroup, setCreditAccountGroup] = useState("");
  const [creditAccountGroupLabel, setCreditAccountGroupLabel] = useState("");
  const [majorGroupForAssets, setMajorGroupForAssets] = useState("");
  const [majorGroupForAssetsLabel, setMajorGroupForAssetsLabel] = useState("");
  const [majorGroupForLiabilities, setMajorGroupForLiabilities] = useState("");
  const [majorGroupForLiabilitiesLabel, setMajorGroupForLiabilitiesLabel] = useState("");
  const [sundryCreditors, setSundryCreditors] = useState("");
  const [sundryCreditorsLabel, setSundryCreditorsLabel] = useState("");
  const [sundryDebtors, setSundryDebtors] = useState("");
  const [sundryDebtorsLabel, setSundryDebtorsLabel] = useState("");
  const [roundoffHead, setRoundoffHead] = useState("");
  const [roundoffHeadLabel, setRoundoffHeadLabel] = useState("");
  const [taxOnService, setTaxOnService] = useState(false);
  const [directPostingWithoutVerification, setDirectPostingWithoutVerification] = useState(true);
  const [openingBalanceEditableInAccountHead, setOpeningBalanceEditableInAccountHead] = useState(true);

  const [savingTab, setSavingTab] = useState<Tab | null>(null);

  function updateTaxRow(
    setRows: React.Dispatch<React.SetStateAction<TaxAccountRow[]>>,
    index: number,
    patch: Partial<TaxAccountRow>
  ) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  // TODO: replace with a real save call once a General Preference slice exists.
  async function handleSubmit(tab: Tab, payload: unknown) {
    setSavingTab(tab);
    try {
      console.log(`Saving ${tab} preferences:`, payload);
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(`${tab} preferences saved.`);
    } finally {
      setSavingTab(null);
    }
  }

  const isSaving = savingTab !== null;

  function SubmitButton({ tab, onClick }: { tab: Tab; onClick: () => void }) {
    return (
      <div className="flex items-center justify-end pt-5 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50/50">
        <Button
          type="button"
          onClick={onClick}
          disabled={isSaving}
          className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
          style={{ backgroundColor: BRAND }}
        >
          <Check size={14} />
          {savingTab === tab ? "Saving..." : "Submit"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="GENERAL PREFERENCE"
        subtitle="Configure module-wide preferences"
        icon={<Boxes size={16} className="text-white" />}
        {...(onBack
          ? {
              showCreateButton: true,
              createButtonLabel: "General Preference Details",
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

          {/* ── General ──────────────────────────────────────────────────── */}
          {activeTab === "General" ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FieldShell icon={<Boxes size={11} />} label="Stock Consume">
                  <Input
                    value={stockConsume}
                    onChange={(e) => setStockConsume(e.target.value)}
                    placeholder="Enter Stock Consume"
                    className={inputClass}
                    style={ringStyle}
                  />
                </FieldShell>

                <FieldShell icon={<PackageX size={11} />} label="Non Stock Type">
                  <StaticSelect
                    displayValue={nonStockTypeLabel}
                    onSelect={(item) => {
                      setNonStockType(item.id);
                      setNonStockTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setNonStockType("");
                      setNonStockTypeLabel("");
                    }}
                    placeholder="Select Non Stock Type"
                    items={STOCK_TYPE_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Wrench size={11} />} label="Service Type">
                  <StaticSelect
                    displayValue={serviceTypeLabel}
                    onSelect={(item) => {
                      setServiceType(item.id);
                      setServiceTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setServiceType("");
                      setServiceTypeLabel("");
                    }}
                    placeholder="Select Service Type"
                    items={SERVICE_TYPE_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Truck size={11} />} label="Consignment Item Type">
                  <StaticSelect
                    displayValue={consignmentItemTypeLabel}
                    onSelect={(item) => {
                      setConsignmentItemType(item.id);
                      setConsignmentItemTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setConsignmentItemType("");
                      setConsignmentItemTypeLabel("");
                    }}
                    placeholder="Select Consignment Item Type"
                    items={CONSIGNMENT_ITEM_TYPE_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Layers size={11} />} label="Combo Item Type">
                  <StaticSelect
                    displayValue={comboItemTypeLabel}
                    onSelect={(item) => {
                      setComboItemType(item.id);
                      setComboItemTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setComboItemType("");
                      setComboItemTypeLabel("");
                    }}
                    placeholder="Select Combo Item Type"
                    items={COMBO_ITEM_TYPE_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<AlertTriangle size={11} />} label="Damage Type">
                  <StaticSelect
                    displayValue={damageTypeLabel}
                    onSelect={(item) => {
                      setDamageType(item.id);
                      setDamageTypeLabel(item.label);
                    }}
                    onClear={() => {
                      setDamageType("");
                      setDamageTypeLabel("");
                    }}
                    placeholder="Select Damage Type"
                    items={SERVICE_TYPE_ITEMS}
                  />
                </FieldShell>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <CheckboxRow checked={enableBatch} onChange={setEnableBatch} label="Enable Batch" />
                <CheckboxRow
                  checked={autoGenerateItemcode}
                  onChange={setAutoGenerateItemcode}
                  label="Auto Generate Itemcode"
                />
                <CheckboxRow checked={enableRoundoff} onChange={setEnableRoundoff} label="Enable Roundoff" />
              </div>

              <SubmitButton
                tab="General"
                onClick={() =>
                  handleSubmit("General", {
                    stockConsume,
                    nonStockType,
                    serviceType,
                    consignmentItemType,
                    comboItemType,
                    damageType,
                    enableBatch,
                    autoGenerateItemcode,
                    enableRoundoff,
                  })
                }
              />
            </div>
          ) : activeTab === "Purchase" ? (
            /* ── Purchase ───────────────────────────────────────────────── */
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <FieldShell icon={<Boxes size={11} />} label="Purchase Stock Type">
                    <StaticSelect
                      displayValue={purchaseStockTypeLabel}
                      onSelect={(item) => {
                        setPurchaseStockType(item.id);
                        setPurchaseStockTypeLabel(item.label);
                      }}
                      onClear={() => {
                        setPurchaseStockType("");
                        setPurchaseStockTypeLabel("");
                      }}
                      placeholder="Select Purchase Stock Type"
                      items={STOCK_TYPE_ITEMS}
                    />
                  </FieldShell>

                  <FieldShell icon={<CalendarClock size={11} />} label="Purchase Order Due Days">
                    <Input
                      type="number"
                      value={purchaseOrderDueDays}
                      onChange={(e) => setPurchaseOrderDueDays(e.target.value)}
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<Percent size={11} />} label="Purchase Margin Based On">
                    <StaticSelect
                      displayValue={purchaseMarginBasedOnLabel}
                      onSelect={(item) => {
                        setPurchaseMarginBasedOn(item.id);
                        setPurchaseMarginBasedOnLabel(item.label);
                      }}
                      onClear={() => {
                        setPurchaseMarginBasedOn("");
                        setPurchaseMarginBasedOnLabel("");
                      }}
                      placeholder="Select Margin Basis"
                      items={MARGIN_BASIS_ITEMS}
                    />
                  </FieldShell>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-600">New Batch Creation On</p>
                  <div className="space-y-2.5">
                    <CheckboxRow
                      checked={newBatchOnPurchaseRate}
                      onChange={setNewBatchOnPurchaseRate}
                      label="New Batch On Purchase Rate"
                    />
                    <CheckboxRow
                      checked={newBatchOnSalesRate}
                      onChange={setNewBatchOnSalesRate}
                      label="New Batch On Sales Rate"
                    />
                    <CheckboxRow
                      checked={newBatchOnWholesaleRate}
                      onChange={setNewBatchOnWholesaleRate}
                      label="New Batch On Wholesale Rate"
                    />
                    <CheckboxRow
                      checked={newBatchOnNetPurchaseRate}
                      onChange={setNewBatchOnNetPurchaseRate}
                      label="New Batch On Net Purchase Rate"
                    />
                    <CheckboxRow
                      checked={newBatchOnUnitMultiplier}
                      onChange={setNewBatchOnUnitMultiplier}
                      label="New Batch On Unit Multiplier"
                    />
                    <CheckboxRow checked={newBatchOnMrp} onChange={setNewBatchOnMrp} label="New Batch On MRP" />
                  </div>
                </div>

                <div className="space-y-2.5 lg:pt-7">
                  <CheckboxRow
                    checked={enablePurchaseOrderVerification}
                    onChange={setEnablePurchaseOrderVerification}
                    label="Enable Purchase Order Verification"
                  />
                  <CheckboxRow
                    checked={enablePurchaseVerification}
                    onChange={setEnablePurchaseVerification}
                    label="Enable Purchase Verification"
                  />
                  <CheckboxRow
                    checked={allowPurchaseQtyGreaterThanPoQty}
                    onChange={setAllowPurchaseQtyGreaterThanPoQty}
                    label="Allow Purchase Qty. Greater Than PO Qty."
                  />
                </div>
              </div>

              <TaxAccountTable
                rows={purchaseTaxRows}
                onChangeRow={(idx, patch) => updateTaxRow(setPurchaseTaxRows, idx, patch)}
              />

              <SubmitButton
                tab="Purchase"
                onClick={() =>
                  handleSubmit("Purchase", {
                    purchaseStockType,
                    purchaseOrderDueDays,
                    purchaseMarginBasedOn,
                    newBatchOnPurchaseRate,
                    newBatchOnSalesRate,
                    newBatchOnWholesaleRate,
                    newBatchOnNetPurchaseRate,
                    newBatchOnUnitMultiplier,
                    newBatchOnMrp,
                    enablePurchaseOrderVerification,
                    enablePurchaseVerification,
                    allowPurchaseQtyGreaterThanPoQty,
                    purchaseTaxRows,
                  })
                }
              />
            </div>
          ) : activeTab === "Sales" ? (
            /* ── Sales ──────────────────────────────────────────────────── */
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <FieldShell icon={<Percent size={11} />} label="Sales Margin Based On">
                    <StaticSelect
                      displayValue={salesMarginBasedOnLabel}
                      onSelect={(item) => {
                        setSalesMarginBasedOn(item.id);
                        setSalesMarginBasedOnLabel(item.label);
                      }}
                      onClear={() => {
                        setSalesMarginBasedOn("");
                        setSalesMarginBasedOnLabel("");
                      }}
                      placeholder="Select Margin Basis"
                      items={MARGIN_BASIS_ITEMS}
                    />
                  </FieldShell>

                  <FieldShell icon={<Star size={11} />} label="Loyalty Points Divider">
                    <Input
                      type="number"
                      value={loyaltyPointsDivider}
                      onChange={(e) => setLoyaltyPointsDivider(e.target.value)}
                      placeholder="Loyalty Points Divider"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>

                  <FieldShell icon={<Gift size={11} />} label="Loyalty Redeem Divider">
                    <Input
                      type="number"
                      value={loyaltyRedeemDivider}
                      onChange={(e) => setLoyaltyRedeemDivider(e.target.value)}
                      placeholder="Loyalty Redeem Divider"
                      className={inputClass}
                      style={ringStyle}
                    />
                  </FieldShell>
                </div>

                <div className="space-y-2.5 lg:pt-7">
                  <CheckboxRow checked={showBarcode} onChange={setShowBarcode} label="Show Barcode" />
                  <CheckboxRow
                    checked={showMultipleBatches}
                    onChange={setShowMultipleBatches}
                    label="Show Multiple Batches"
                  />
                  <CheckboxRow
                    checked={allowMultipleBatchConsumption}
                    onChange={setAllowMultipleBatchConsumption}
                    label="Allow Multiple Batch Consumption"
                  />
                </div>

                <div className="space-y-2.5 lg:pt-7">
                  <CheckboxRow
                    checked={showBatchesIfBarcodeEntered}
                    onChange={setShowBatchesIfBarcodeEntered}
                    label="Show Batches, If Barcode Entered"
                  />
                  <CheckboxRow
                    checked={allowToAddSubItems}
                    onChange={setAllowToAddSubItems}
                    label="Allow To Add Sub Items"
                  />
                  <CheckboxRow
                    checked={takeBatchesFromDefaultStoreOnly}
                    onChange={setTakeBatchesFromDefaultStoreOnly}
                    label="Take Batches From Default Store Only"
                  />
                </div>
              </div>

              <TaxAccountTable
                rows={salesTaxRows}
                onChangeRow={(idx, patch) => updateTaxRow(setSalesTaxRows, idx, patch)}
              />

              <SubmitButton
                tab="Sales"
                onClick={() =>
                  handleSubmit("Sales", {
                    salesMarginBasedOn,
                    loyaltyPointsDivider,
                    loyaltyRedeemDivider,
                    showBarcode,
                    showMultipleBatches,
                    allowMultipleBatchConsumption,
                    showBatchesIfBarcodeEntered,
                    allowToAddSubItems,
                    takeBatchesFromDefaultStoreOnly,
                    salesTaxRows,
                  })
                }
              />
            </div>
          ) : (
            /* ── Accounts ───────────────────────────────────────────────── */
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldShell icon={<Landmark size={11} />} label="Opening Stock Head">
                  <StaticSelect
                    displayValue={openingStockHeadLabel}
                    onSelect={(item) => {
                      setOpeningStockHead(item.id);
                      setOpeningStockHeadLabel(item.label);
                    }}
                    onClear={() => {
                      setOpeningStockHead("");
                      setOpeningStockHeadLabel("");
                    }}
                    placeholder="Select Op. Stock Head"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Cash Account Group">
                  <StaticSelect
                    displayValue={cashAccountGroupLabel}
                    onSelect={(item) => {
                      setCashAccountGroup(item.id);
                      setCashAccountGroupLabel(item.label);
                    }}
                    onClear={() => {
                      setCashAccountGroup("");
                      setCashAccountGroupLabel("");
                    }}
                    placeholder="Select Cash Account Group"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Bank Account Group">
                  <StaticSelect
                    displayValue={bankAccountGroupLabel}
                    onSelect={(item) => {
                      setBankAccountGroup(item.id);
                      setBankAccountGroupLabel(item.label);
                    }}
                    onClear={() => {
                      setBankAccountGroup("");
                      setBankAccountGroupLabel("");
                    }}
                    placeholder="Select Bank Account Group"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Credit Account Group">
                  <StaticSelect
                    displayValue={creditAccountGroupLabel}
                    onSelect={(item) => {
                      setCreditAccountGroup(item.id);
                      setCreditAccountGroupLabel(item.label);
                    }}
                    onClear={() => {
                      setCreditAccountGroup("");
                      setCreditAccountGroupLabel("");
                    }}
                    placeholder="Select Credit Account Group"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Building2 size={11} />} label="Major Groups For Assets">
                  <StaticSelect
                    displayValue={majorGroupForAssetsLabel}
                    onSelect={(item) => {
                      setMajorGroupForAssets(item.id);
                      setMajorGroupForAssetsLabel(item.label);
                    }}
                    onClear={() => {
                      setMajorGroupForAssets("");
                      setMajorGroupForAssetsLabel("");
                    }}
                    placeholder="Select Major Groups For Assets"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Building2 size={11} />} label="Major Groups For Liabilities">
                  <StaticSelect
                    displayValue={majorGroupForLiabilitiesLabel}
                    onSelect={(item) => {
                      setMajorGroupForLiabilities(item.id);
                      setMajorGroupForLiabilitiesLabel(item.label);
                    }}
                    onClear={() => {
                      setMajorGroupForLiabilities("");
                      setMajorGroupForLiabilitiesLabel("");
                    }}
                    placeholder="Select Major Groups For Liabilities"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Sundry Creditors">
                  <StaticSelect
                    displayValue={sundryCreditorsLabel}
                    onSelect={(item) => {
                      setSundryCreditors(item.id);
                      setSundryCreditorsLabel(item.label);
                    }}
                    onClear={() => {
                      setSundryCreditors("");
                      setSundryCreditorsLabel("");
                    }}
                    placeholder="Select Sundry Creditors"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="Sundry Debtors">
                  <StaticSelect
                    displayValue={sundryDebtorsLabel}
                    onSelect={(item) => {
                      setSundryDebtors(item.id);
                      setSundryDebtorsLabel(item.label);
                    }}
                    onClear={() => {
                      setSundryDebtors("");
                      setSundryDebtorsLabel("");
                    }}
                    placeholder="Select Sundry Debtors"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>

                <FieldShell icon={<Landmark size={11} />} label="RoundOff Head">
                  <StaticSelect
                    displayValue={roundoffHeadLabel}
                    onSelect={(item) => {
                      setRoundoffHead(item.id);
                      setRoundoffHeadLabel(item.label);
                    }}
                    onClear={() => {
                      setRoundoffHead("");
                      setRoundoffHeadLabel("");
                    }}
                    placeholder="Select RoundOff"
                    items={ACCOUNT_HEAD_ITEMS}
                  />
                </FieldShell>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <CheckboxRow checked={taxOnService} onChange={setTaxOnService} label="Tax On Service" />
                <CheckboxRow
                  checked={directPostingWithoutVerification}
                  onChange={setDirectPostingWithoutVerification}
                  label="Direct Posting With Out Verification"
                />
                <CheckboxRow
                  checked={openingBalanceEditableInAccountHead}
                  onChange={setOpeningBalanceEditableInAccountHead}
                  label="Opening Balance Editable In Account Head"
                />
              </div>

              <SubmitButton
                tab="Accounts"
                onClick={() =>
                  handleSubmit("Accounts", {
                    openingStockHead,
                    cashAccountGroup,
                    bankAccountGroup,
                    creditAccountGroup,
                    majorGroupForAssets,
                    majorGroupForLiabilities,
                    sundryCreditors,
                    sundryDebtors,
                    roundoffHead,
                    taxOnService,
                    directPostingWithoutVerification,
                    openingBalanceEditableInAccountHead,
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
