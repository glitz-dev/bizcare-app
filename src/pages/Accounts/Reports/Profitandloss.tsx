"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Boxes,
  Rows3,
  Search,
  Printer,
  Download,
  TrendingUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

import type { RootState, AppDispatch } from "@/store";
import {
  fetchUnclosedFinancialYear,
  fetchPandLReportGroupwise,
} from "../../../store/features/Accounts/reports/profitandlossSlice"; // adjust path to match actual slice location

// ─── Brand tokens (matches BankReconciliationDetails) ───────────────────────
const BRAND = "#004687";
const BRAND_LIGHT = "#e8f0f9";
const BRAND_MID = "#ccdff2";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormatMode = "Headwise" | "Groupwise";

interface PLLineItem {
  label: string;
  amount: number;
}

interface ProfitAndLossData {
  expenses: PLLineItem[];
  income: PLLineItem[];
  totalExpense: number;
  totalIncome: number;
  netProfit: number | null; // populated when income > expense
  netLoss: number | null; // populated when expense > income
}

const round2 = (v: number) => Math.round(v * 100) / 100;

const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayIso = () => new Date().toISOString().slice(0, 10);

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

// ─── FormatToggle : Headwise / Groupwise segmented control ──────────────────
function FormatToggle({ value, onChange }: { value: FormatMode; onChange: (v: FormatMode) => void }) {
  return (
    <div className="flex items-center rounded-xl border overflow-hidden h-[42px]" style={{ borderColor: "#d1dff0" }}>
      {(["Headwise", "Groupwise"] as FormatMode[]).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex-1 h-full text-xs font-bold transition-colors"
          style={{
            background: value === opt ? BRAND : "white",
            color: value === opt ? "white" : "#9ca3af",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Checkbox (matches BankReconciliationDetails table checkbox style) ──────
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

// ─── Main component ──────────────────────────────────────────────────────────
const ProfitAndLoss = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    unclosedFinYear,
    pandLGroupwiseList,
    pandLGroupwiseLoading,
    pandLGroupwiseError,
  } = useSelector((state: RootState) => state.profitAndLoss);

  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [showStockValue, setShowStockValue] = useState(false);
  // Headwise is the default selected format when the page first loads.
  const [formatMode, setFormatMode] = useState<FormatMode>("Headwise");

  const [hasShown, setHasShown] = useState(false);

  // Fetch the current unclosed financial year on mount so From/To Date can be prefilled.
  useEffect(() => {
    dispatch(fetchUnclosedFinancialYear());
  }, [dispatch]);

  // Prefill From/To Date from the unclosed financial year response.
  useEffect(() => {
    if (unclosedFinYear) {
      setFromDate(unclosedFinYear.FromDate.slice(0, 10));
      setToDate(unclosedFinYear.ToDate.slice(0, 10));
    }
  }, [unclosedFinYear]);

  const handleShow = () => {
    setHasShown(true);
    // TODO: once a Headwise report endpoint is confirmed, branch on formatMode here.
    dispatch(
      fetchPandLReportGroupwise({
        fromDate,
        toDate,
        showStockVal: showStockValue,
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!data) return;

    const rows: string[][] = [["Expense", "Amount", "Income", "Amount"]];
    const rowCountForExport = Math.max(
      data.expenses.length,
      data.income.length,
      data.netProfit !== null || data.netLoss !== null ? 1 : 0
    );

    for (let idx = 0; idx < rowCountForExport; idx++) {
      const exp = data.expenses[idx];
      const inc = data.income[idx];
      const isLastRow = idx === rowCountForExport - 1;

      const expLabel = exp?.label ?? (isLastRow && data.netProfit !== null ? "Net Profit" : "");
      const expAmount = exp ? fmt(exp.amount) : isLastRow && data.netProfit !== null ? fmt(data.netProfit) : "";
      const incLabel = inc?.label ?? (isLastRow && data.netLoss !== null ? "Net Loss" : "");
      const incAmount = inc ? fmt(inc.amount) : isLastRow && data.netLoss !== null ? fmt(data.netLoss) : "";

      rows.push([expLabel, expAmount, incLabel, incAmount]);
    }

    rows.push([]);
    rows.push(["Total Expense", fmt(data.totalExpense), "Total Income", fmt(data.totalIncome)]);

    const escapeCell = (cell: string) =>
      /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;

    const csvContent = rows.map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Profit_and_Loss_${fromDate}_to_${toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Transform the flat groupwise response into Expense/Income columns + balancing
  // Net Profit / Net Loss line, matching the report's visual layout.
  const data: ProfitAndLossData | null = useMemo(() => {
    if (!pandLGroupwiseList.length) return null;

    const rows = pandLGroupwiseList.filter((item) => item.AcGroupName?.trim() !== "");

    const expenses: PLLineItem[] = rows
      .filter((item) => item.MajorGroupName === "EXPENSE")
      .map((item) => ({ label: item.AcGroupName, amount: item.NetBalance }));

    const income: PLLineItem[] = rows
      .filter((item) => item.MajorGroupName === "INCOME")
      .map((item) => ({ label: item.AcGroupName, amount: item.NetBalance }));

    const sumExpense = round2(expenses.reduce((sum, item) => sum + item.amount, 0));
    const sumIncome = round2(income.reduce((sum, item) => sum + item.amount, 0));
    const diff = round2(sumExpense - sumIncome);

    let totalExpense = sumExpense;
    let totalIncome = sumIncome;
    let netProfit: number | null = null;
    let netLoss: number | null = null;

    if (diff > 0) {
      // Expense exceeds income — show Net Loss on the Income side to balance both totals.
      netLoss = diff;
      totalIncome = round2(sumIncome + diff);
    } else if (diff < 0) {
      // Income exceeds expense — show Net Profit on the Expense side to balance both totals.
      netProfit = round2(-diff);
      totalExpense = round2(sumExpense + -diff);
    }

    return { expenses, income, totalExpense, totalIncome, netProfit, netLoss };
  }, [pandLGroupwiseList]);

  const rowCount = useMemo(
    () => Math.max(data?.expenses.length ?? 0, data?.income.length ?? 0, data?.netProfit !== null || data?.netLoss !== null ? 1 : 0),
    [data]
  );

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 shrink-0" style={{ background: BRAND }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <TrendingUp size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-wide truncate">Profit and Loss</h1>
            <p className="text-blue-200 text-[10px] tracking-widest uppercase">Accounts · Financial Reports</p>
          </div>
        </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 items-end">
            <div>
              <FieldLabel icon={Calendar} label="From Date" />
              <InputField icon={<Calendar size={14} />} placeholder="From Date" value={fromDate} onChange={setFromDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Calendar} label="To Date" />
              <InputField icon={<Calendar size={14} />} placeholder="To Date" value={toDate} onChange={setToDate} type="date" />
            </div>
            <div>
              <FieldLabel icon={Rows3} label="Format" />
              <FormatToggle value={formatMode} onChange={setFormatMode} />
            </div>
            <div>
              <FieldLabel icon={Boxes} label="Stock Value" />
              <div className="h-[42px] flex items-center">
                <Checkbox checked={showStockValue} onChange={() => setShowStockValue((v) => !v)} label="Show Stock Value" />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 h-[42px] rounded-xl text-sm font-bold border-2 transition-all hover:shadow-md"
                style={{ borderColor: BRAND, color: BRAND, background: "white" }}
              >
                <Printer size={14} />
                Print
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={handleShow}
                disabled={pandLGroupwiseLoading}
                className="w-full flex items-center justify-center gap-2 h-[42px] rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: BRAND }}
              >
                <Search size={14} />
                {pandLGroupwiseLoading ? "Loading..." : "Show"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Report Card ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: BRAND_MID }}>
          {/* Header bar */}
          <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: BRAND }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp size={14} strokeWidth={2.2} color="white" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">Profit and Loss</span>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={12} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto bg-white">
            {!hasShown ? (
              <div className="px-3 py-10 text-center text-gray-400 text-xs">
                Set your filters and click "Show" to generate the report.
              </div>
            ) : pandLGroupwiseLoading ? (
              <div className="px-3 py-10 text-center text-gray-400 text-xs">Generating profit &amp; loss...</div>
            ) : pandLGroupwiseError ? (
              <div className="px-3 py-10 text-center text-red-500 text-xs">{pandLGroupwiseError}</div>
            ) : !data ? (
              <div className="px-3 py-10 text-center text-gray-400 text-xs">
                No data found for the selected period.
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: BRAND_LIGHT, borderBottom: `1.5px solid ${BRAND_MID}` }}>
                    <th className="px-4 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>
                      Expense
                    </th>
                    <th className="px-4 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold tracking-wide" style={{ color: BRAND }}>
                      Income
                    </th>
                    <th className="px-4 py-2.5 text-right font-bold tracking-wide" style={{ color: BRAND }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, idx) => {
                    const exp = data.expenses[idx];
                    const inc = data.income[idx];
                    const isLastRow = idx === rowCount - 1;

                    return (
                      <tr
                        key={idx}
                        className="border-b transition-colors hover:bg-blue-50/30"
                        style={{ borderColor: BRAND_MID, background: idx % 2 === 1 ? "#f5f9fd" : "white" }}
                      >
                        <td className="px-4 py-2.5 text-gray-700">
                          {exp?.label ?? (isLastRow && data.netProfit !== null ? "Net Profit" : "")}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums font-semibold",
                            exp && exp.amount < 0 ? "text-red-600" : "text-gray-700"
                          )}
                        >
                          {exp
                            ? fmt(exp.amount)
                            : isLastRow && data.netProfit !== null
                            ? fmt(data.netProfit)
                            : ""}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {inc?.label ?? (isLastRow && data.netLoss !== null ? "Net Loss" : "")}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-700">
                          {inc
                            ? fmt(inc.amount)
                            : isLastRow && data.netLoss !== null
                            ? fmt(data.netLoss)
                            : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals footer */}
          {hasShown && !pandLGroupwiseLoading && !pandLGroupwiseError && data && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4 border-t"
              style={{ borderColor: BRAND_MID, background: BRAND_LIGHT }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: BRAND }}>
                  Total Expense
                </span>
                <span style={{ color: BRAND }}>:</span>
                <span className="ml-auto font-bold text-gray-800 text-base tabular-nums">{fmt(data.totalExpense)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: BRAND }}>
                  Total Income
                </span>
                <span style={{ color: BRAND }}>:</span>
                <span className="ml-auto font-bold text-gray-800 text-base tabular-nums">{fmt(data.totalIncome)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;
