// PageFilters.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  Package,
  X,
} from "lucide-react";

interface PageFiltersProps {
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  selectedItem: string;
  setSelectedItem: (value: string) => void;
  items: any[];
  itemsLoading: boolean;
  loading: boolean;
  onSearch: () => void;
}

export function PageFilters({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedItem,
  setSelectedItem,
  items,
  itemsLoading,
  loading,
  onSearch,
}: PageFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div className="grid gap-3 items-end" style={{ gridTemplateColumns: "1fr 1fr 2fr auto" }}>
        {/* From Date - Calendar Picker */}
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

        {/* To Date - Calendar Picker */}
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

        {/* Item */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Package size={10} /> Item
          </label>
          <div className="relative">
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="h-8 text-sm border-slate-200 rounded-lg w-full">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                {itemsLoading ? (
                  <SelectItem value="__loading__" disabled>
                    Loading items...
                  </SelectItem>
                ) : items.length === 0 ? (
                  <SelectItem value="__no-items__" disabled>
                    No items available
                  </SelectItem>
                ) : (
                  items.map((item) => (
                    <SelectItem
                      key={item.ItemID}
                      value={String(item.ItemID)}
                    >
                      {item.ItemName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedItem && (
              <button
                onClick={() => setSelectedItem("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search & Advanced */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onSearch}
            disabled={loading}
            className="h-8 px-4 bg-[#004687] hover:bg-[#003a70] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-none whitespace-nowrap cursor-pointer"
          >
            <Search size={12} /> {loading ? "Searching…" : "Search"}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:text-[#004687]"
              >
                <SlidersHorizontal size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Advanced filters
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}