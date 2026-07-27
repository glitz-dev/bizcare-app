"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Column } from "react-data-grid";
import { Scale, CalendarDays, FileBarChart, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store";
import {
  fetchTrialBalance,
  type TrialBalanceGroupItem,
} from "../../../store/features/Accounts/reports/trialbalanceSlice"; // adjust path to match actual slice location

import { PageHeader } from "../../../common/PageHeader";
import { DataTable, FilterHeader } from "../../../common/DataTable";
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

// ─── Types ──────────────────────────────────────────────────────────────────
interface ReportOption {
  value: string;
  label: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  { value: "trial-balance", label: "Trial Balance" },
  { value: "cumulative-trial-balance", label: "Cumulative Trial Balance" },
  { value: "trial-balance-headwise", label: "Trial Balance ( Headwise )" },
  { value: "cumulative-trial-balance-headwise", label: "Cumulative Trial Balance ( Headwise )" },
];

// Explicit report -> API param mapping, matched to the confirmed payloads:
//   trial-balance                      -> spTrialBalanceCommon_Groupwise ..., false
//   cumulative-trial-balance           -> spTrialBalanceCommon_Groupwise ..., true
//   trial-balance-headwise             -> spTrialBalanceCommon_Headwise  ..., false
//   cumulative-trial-balance-headwise  -> spTrialBalanceCommon_Headwise  ..., true, false
// (the trailing ", false" for the last case is appended automatically inside the slice)
const REPORT_PARAMS: Record<string, { isHeadwise: boolean; cumulative: boolean }> = {
  "trial-balance": { isHeadwise: false, cumulative: false },
  "cumulative-trial-balance": { isHeadwise: false, cumulative: true },
  "trial-balance-headwise": { isHeadwise: true, cumulative: false },
  "cumulative-trial-balance-headwise": { isHeadwise: true, cumulative: true },
};

// API expects dates as "DD-MM-YYYY"; <input type="date"> gives "YYYY-MM-DD"
const toApiDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
};

// ─── Report Combobox (shadcn searchable dropdown) ────────────────────────────
function ReportCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = REPORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="h-8 text-sm border border-slate-200 rounded-lg w-full px-3 flex items-center justify-between bg-white cursor-pointer"
        >
          <span className={selected ? "text-slate-700" : "text-slate-400"}>
            {selected ? selected.label : "Select Report"}
          </span>
          <div className="flex items-center gap-1">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </span>
            )}
            <ChevronsUpDown size={12} className="text-slate-400" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search report..." className="h-8 text-sm" />
          <CommandList>
            <CommandEmpty>No report found.</CommandEmpty>
            <CommandGroup>
              {REPORT_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function TrialBalance() {
  const today = new Date().toISOString().slice(0, 10);
  const fyStart = `${new Date().getFullYear()}-04-01`;

  const dispatch = useDispatch<AppDispatch>();
  const { trialBalanceList, trialBalanceLoading, trialBalanceError } = useSelector(
    (state: RootState) => state.trialBalance
  );

  const [reportType, setReportType] = useState("trial-balance");
  const [fromDate, setFromDate] = useState(fyStart);
  const [toDate, setToDate] = useState(today);
  const [hasSearched, setHasSearched] = useState(false);

  // Call fetchTrialBalance with the params that correspond to the selected
  // report type, on Show click.
  const handleShow = useCallback(() => {
    setHasSearched(true);

    const { isHeadwise, cumulative } =
      REPORT_PARAMS[reportType] ?? REPORT_PARAMS["trial-balance"];

    dispatch(
      fetchTrialBalance({
        fromDate: toApiDate(fromDate),
        toDate: toApiDate(toDate),
        isHeadwise,
        cumulative,
      })
    );
  }, [dispatch, fromDate, toDate, reportType]);

  useEffect(() => {
    if (trialBalanceError) toast.error(trialBalanceError);
  }, [trialBalanceError]);

  // Populate the table straight from whatever fields the response contains —
  // no assumed shape, so it works the same for Groupwise or Headwise responses.
  type TrialBalanceRow = TrialBalanceGroupItem & { id: string };

  const tableRows: TrialBalanceRow[] = useMemo(
    () => trialBalanceList.map((item, idx) => ({ id: String(idx), ...item })),
    [trialBalanceList]
  );

  const columns: Column<TrialBalanceRow>[] = useMemo(() => {
    if (!trialBalanceList.length) return [];
    return Object.keys(trialBalanceList[0]).map((field) => ({
      key: field,
      name: field,
      renderHeaderCell: (props: any) => <FilterHeader {...props} />,
      renderCell: ({ row }: { row: TrialBalanceRow }) => (
        <span className="text-slate-600">{String((row as any)[field] ?? "")}</span>
      ),
    }));
  }, [trialBalanceList]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Trial Balance"
        subtitle="Financial Reports"
        icon={<Scale size={16} className="text-white" />}
        showCreateButton={false}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
        <div
          className="grid gap-3 items-end"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr auto" }}
        >
          {/* Report */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <FileBarChart size={10} /> Report
            </label>
            <ReportCombobox value={reportType} onChange={setReportType} />
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <CalendarDays size={10} /> From Date
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-sm border-slate-200 rounded-lg w-full"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <CalendarDays size={10} /> To Date
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-sm border-slate-200 rounded-lg w-full"
            />
          </div>

          {/* Show button */}
          <Button
            onClick={handleShow}
            disabled={trialBalanceLoading}
            className="h-8 px-5 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg shadow-none whitespace-nowrap cursor-pointer"
          >
            {trialBalanceLoading ? "Loading…" : "Show"}
          </Button>
        </div>
      </div>

      {/* Table */}
      {hasSearched || trialBalanceLoading || trialBalanceError ? (
        <DataTable
          columns={columns}
          rows={tableRows}
          rowKey="id"
          loading={trialBalanceLoading}
          error={trialBalanceError}
          loadingLabel="Generating trial balance…"
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <Scale size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">
              Select a date range and click Show to generate the report
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
