"use client";

import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Boxes,
  Rows3,
  Printer,
  Download,
  ArrowLeft,
  Scale,
  Check,
  Layers,
  Group,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import {
  fetchBalanceSheetMajorGroupwise,
  fetchBalanceSheetGroupwise,
  BalanceSheetMajorGroupItem,
  BalanceSheetGroupItem,
} from "../../../store/features/Accounts/reports/balanceSheetSlice"; 

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormatMode = "Groupwise" | "Headwise";

interface BSLineItem {
  label: string;
  amount: number;
}

interface BalanceSheetData {
  liabilities: BSLineItem[];
  assets: BSLineItem[];
  totalLiability: number;
  totalAsset: number;
}

const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayIso = () => new Date().toISOString().slice(0, 10);
const fyStartIso = () => `${new Date().getFullYear()}-04-01`;

// ─── FieldLabel ───────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label
      className="flex items-center gap-1.5 text-xs font-semibold tracking-wide mb-1.5"
      style={{ color: BRAND }}
    >
      <Icon size={13} strokeWidth={2.2} style={{ color: BRAND }} />
      {label}
    </label>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────
function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
        className={cn(
          "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all outline-none placeholder:text-gray-300 font-medium",
          readOnly
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none"
            : "bg-white text-gray-700"
        )}
        style={
          !readOnly
            ? { borderColor: "#d1dff0", boxShadow: "0 1px 3px rgba(0,70,135,0.05)" }
            : undefined
        }
        onFocus={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND}22`;
          }
        }}
        onBlur={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = "#d1dff0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,70,135,0.05)";
          }
        }}
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: readOnly ? "#cbd5e1" : "#93b8d8" }}
      >
        {icon}
      </span>
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 h-[42px] cursor-pointer select-none"
    >
      <span
        className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0"
        style={{
          borderColor: checked ? BRAND : "#d1dff0",
          background: checked ? BRAND : "white",
        }}
      >
        {checked && <Check size={11} strokeWidth={3} color="white" />}
      </span>
      {label && <span className="text-sm font-medium text-gray-600">{label}</span>}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BalanceSheet = ({ onBack }: { onBack?: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux Selectors
  const {
    balanceSheetMajorList,
    balanceSheetMajorLoading,
    balanceSheetMajorError,
    balanceSheetGroupList,
    balanceSheetGroupLoading,
    balanceSheetGroupError,
  } = useSelector((state: RootState) => state.balanceSheet);

  const [fromDate, setFromDate] = useState(fyStartIso());
  const [toDate, setToDate] = useState(todayIso());
  const [showStockValue, setShowStockValue] = useState(false);
  const [formatMode, setFormatMode] = useState<FormatMode>("Groupwise");
  const [activeReportType, setActiveReportType] = useState<"major" | "group" | null>(null);

  const isLoading = balanceSheetMajorLoading || balanceSheetGroupLoading;
  const currentError = activeReportType === "major" ? balanceSheetMajorError : balanceSheetGroupError;

  // --- Determine mode param dynamically based on selected formatMode ---
  // Mode = 1 for Headwise, Mode = 2 for Groupwise
  const currentMode = formatMode === "Headwise" ? 1 : 2;

  // --- Handlers ---
  const handleShowMajorGroups = () => {
    setActiveReportType("major");
    dispatch(
      fetchBalanceSheetMajorGroupwise({
        fromDate,
        toDate,
        mode: currentMode,
        branchId: 1,
        companyId: 1,
      })
    );
  };

  const handleShowGroups = () => {
    setActiveReportType("group");
    dispatch(
      fetchBalanceSheetGroupwise({
        fromDate,
        toDate,
        mode: currentMode,
        branchId: 1,
        companyId: 1,
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Map raw Redux list into Liabilities vs Assets ---
  const formattedData: BalanceSheetData | null = useMemo(() => {
    if (!activeReportType) return null;

    const list: (BalanceSheetMajorGroupItem | BalanceSheetGroupItem)[] =
      activeReportType === "major" ? balanceSheetMajorList : balanceSheetGroupList;

    if (!list || list.length === 0) return null;

    const liabilities: BSLineItem[] = [];
    const assets: BSLineItem[] = [];
    let totalLiability = 0;
    let totalAsset = 0;

    list.forEach((item) => {
      const lineItem: BSLineItem = {
        label: item.AcGroupName,
        amount: Math.abs(item.NetBalance),
      };

      // MajourGroupID 1 = Assets, MajourGroupID 2 = Liabilities
      if (item.MajourGroupID === 1) {
        assets.push(lineItem);
        totalAsset += item.NetBalance;
      } else {
        liabilities.push(lineItem);
        totalLiability += item.NetBalance;
      }
    });

    return {
      liabilities,
      assets,
      totalLiability: Math.abs(totalLiability),
      totalAsset: Math.abs(totalAsset),
    };
  }, [activeReportType, balanceSheetMajorList, balanceSheetGroupList]);

  const rowCount = useMemo(
    () => Math.max(formattedData?.liabilities.length ?? 0, formattedData?.assets.length ?? 0),
    [formattedData]
  );

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0" style={{ background: BRAND }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Scale size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">Balance Sheet</h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">Accounts · Financial Reports</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white font-semibold text-xs h-8 px-3 rounded-lg shadow-none flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ color: BRAND }}
        >
          <ArrowLeft size={13} />
          Back
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-5 flex-1">
        {/* ── Filter Card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BRAND_MID }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
              <Rows3 size={15} strokeWidth={2.2} style={{ color: BRAND }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>
              Report Filters
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: BRAND_MID }} />
          </div>

          {/* Row 1 : From Date | To Date | Show Stock Value | Groupwise | Headwise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div>
              <FieldLabel icon={Calendar} label="From Date" />
              <InputField icon={<Calendar size={14} />} placeholder="From Date" value={fromDate} onChange={setFromDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="To Date" />
              <InputField icon={<Calendar size={14} />} placeholder="To Date" value={toDate} onChange={setToDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Boxes} label="Stock Value" />
              <div className="h-[42px] flex items-center">
                <Checkbox checked={showStockValue} onChange={() => setShowStockValue((v) => !v)} label="Show Stock Value" />
              </div>
            </div>
            <div>
              <FieldLabel icon={Group} label="Groupwise" />
              <div className="h-[42px] flex items-center">
                <Checkbox
                  checked={formatMode === "Groupwise"}
                  onChange={() => setFormatMode("Groupwise")}
                  label="Groupwise Format"
                />
              </div>
            </div>
            <div>
              <FieldLabel icon={Layers} label="Headwise" />
              <div className="h-[42px] flex items-center">
                <Checkbox
                  checked={formatMode === "Headwise"}
                  onChange={() => setFormatMode("Headwise")}
                  label="Headwise Format"
                />
              </div>
            </div>
          </div>

          {/* Row 2 : Action buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleShowMajorGroups}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: BRAND }}
            >
              {balanceSheetMajorLoading ? "Loading..." : "Show MajorGroups"}
            </button>
            <button
              type="button"
              onClick={handleShowGroups}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: BRAND }}
            >
              {balanceSheetGroupLoading ? "Loading..." : "Show Groups"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-md"
              style={{ borderColor: BRAND, color: BRAND, background: "white" }}
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={onBack}
              type="button"
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90"
              style={{ background: BRAND }}
            >
              <ArrowLeft size={13} />
              Back
            </button>
          </div>
        </div>

        {/* ── Report Card ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
          {/* Header bar */}
          <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: BRAND }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Scale size={14} strokeWidth={2.2} color="white" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                Balance Sheet {activeReportType ? `(${activeReportType === "major" ? "Major Groups" : "Groups"} - ${formatMode})` : ""}
              </span>
            </div>
            <button
              type="button"
              disabled={!formattedData}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={12} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto bg-white">
            {currentError ? (
              <div className="px-3 py-10 text-center text-red-500 text-xs font-semibold">
                Error: {currentError}
              </div>
            ) : isLoading ? (
              <div className="px-3 py-10 text-center text-gray-500 text-xs">
                Generating balance sheet...
              </div>
            ) : !formattedData ? (
              <div className="px-3 py-10 text-center text-gray-400 text-xs">
                Set your filters and click "Show MajorGroups" or "Show Groups" to generate the report.
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
                    <th className="px-4 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>
                      Liability
                    </th>
                    <th className="px-4 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>
                      Asset
                    </th>
                    <th className="px-4 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rowCount === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                        No data found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    Array.from({ length: rowCount }).map((_, idx) => {
                      const liab = formattedData.liabilities[idx];
                      const asset = formattedData.assets[idx];

                      return (
                        <tr
                          key={idx}
                          className="border-b transition-colors hover:bg-blue-50/30"
                          style={{ borderColor: BRAND_MID, background: idx % 2 === 1 ? "#f5f9fd" : "white" }}
                        >
                          <td className="px-4 py-2.5 text-gray-700">{liab?.label ?? ""}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-700">
                            {liab ? fmt(liab.amount) : ""}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">{asset?.label ?? ""}</td>
                          <td
                            className={cn(
                              "px-4 py-2.5 text-right tabular-nums font-semibold",
                              asset && asset.label === "NET LOSS" ? "text-red-600" : "text-gray-700"
                            )}
                          >
                            {asset ? fmt(asset.amount) : ""}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals footer */}
          {!isLoading && formattedData && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4 border-t"
              style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: BRAND }}>
                  Total Liability
                </span>
                <span style={{ color: BRAND }}>:</span>
                <span className="ml-auto font-bold text-gray-800 text-base tabular-nums">
                  {fmt(formattedData.totalLiability)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: BRAND }}>
                  Total Asset
                </span>
                <span style={{ color: BRAND }}>:</span>
                <span className="ml-auto font-bold text-gray-800 text-base tabular-nums">
                  {fmt(formattedData.totalAsset)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
