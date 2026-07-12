"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface ModuleFilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface ModuleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ModuleFilterConfig[];
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  className?: string;
}

export function ModuleFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search records…",
  filters = [],
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
  className,
}: ModuleFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center",
        className
      )}
    >
      <div className="relative min-w-0 w-full flex-1 sm:min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
        />
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="flex w-full min-w-0 flex-col gap-1 sm:min-w-[160px] sm:w-auto">
          <label
            htmlFor={filter.id}
            className="text-xs font-medium text-muted-foreground"
          >
            {filter.label}
          </label>
          <select
            id={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="flex h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {onDateFromChange ? (
        <div className="flex w-full min-w-0 flex-col gap-1 sm:min-w-[140px] sm:w-auto">
          <label htmlFor="filter-date-from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-9"
          />
        </div>
      ) : null}

      {onDateToChange ? (
        <div className="flex w-full min-w-0 flex-col gap-1 sm:min-w-[140px] sm:w-auto">
          <label htmlFor="filter-date-to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            id="filter-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-9"
          />
        </div>
      ) : null}
    </div>
  );
}
