'use client';

import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
  }>;
  onSearchChange?: (q: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  rightSlot?: React.ReactNode;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  filters = [],
  onSearchChange,
  onFilterChange,
  rightSlot,
}: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (q: string) => {
    setSearch(q);
    onSearchChange?.(q);
  };

  const handleFilter = (key: string, value: string) => {
    const next = { ...activeFilters };
    if (value === '' || value === 'all') {
      delete next[key];
    } else {
      next[key] = value;
    }
    setActiveFilters(next);
    onFilterChange?.(key, value);
  };

  const clearFilter = (key: string) => {
    const next = { ...activeFilters };
    delete next[key];
    setActiveFilters(next);
    onFilterChange?.(key, '');
  };

  const activeFilterKeys = Object.keys(activeFilters);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tt"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-60 h-9 pl-8 pr-3 bg-hov border border-bdr rounded-lg text-13 text-tp placeholder:text-tt focus:bg-surface focus:border-b500 transition-colors outline-none"
          aria-label={searchPlaceholder}
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tt hover:text-tp"
            aria-label="Clear search"
          >
            <X size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter) => {
        const isActive = activeFilters[filter.key];
        return (
          <div key={filter.key} className="relative">
            {isActive ? (
              // Active filter pill
              <span className="inline-flex items-center gap-1 h-9 px-3 bg-b100 text-b700 border border-[#BFDBFE] rounded-lg text-12 font-medium">
                {filter.label}: {activeFilters[filter.key]}
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="ml-1 hover:text-b500 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </span>
            ) : (
              <div className="relative">
                <select
                  value={activeFilters[filter.key] ?? ''}
                  onChange={(e) => handleFilter(filter.key, e.target.value)}
                  className="h-9 pl-3 pr-8 bg-surface border border-bdr rounded-lg text-13 text-ts appearance-none cursor-pointer hover:border-bdr-strong hover:text-tp transition-colors outline-none"
                  aria-label={`Filter by ${filter.label}`}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tt pointer-events-none"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Clear all */}
      {activeFilterKeys.length > 0 && (
        <button
          onClick={() => {
            setActiveFilters({});
            activeFilterKeys.forEach(k => onFilterChange?.(k, ''));
          }}
          className="text-12 text-ts hover:text-tp underline underline-offset-2 transition-colors"
        >
          Clear filters
        </button>
      )}

      {/* Right slot */}
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  );
}
