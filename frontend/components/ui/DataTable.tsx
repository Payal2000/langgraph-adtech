'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Columns3, Download } from 'lucide-react';
import clsx from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render: (row: T, selected?: boolean) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isRowLive?: (row: T) => boolean;
  loading?: boolean;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  compact?: boolean;
  maxHeight?: string;
}

type SortDir = 'asc' | 'desc' | null;

function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-4 py-3">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isRowLive,
  loading = false,
  emptyMessage = 'No data matches your filters',
  toolbar,
  compact = false,
  maxHeight = 'none',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const allKeys = data.map(getRowKey);
  const allSelected = allKeys.length > 0 && allKeys.every(k => selected.has(k));
  const someSelected = allKeys.some(k => selected.has(k)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allKeys));
    }
  };
  const toggleRow = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="bg-surface border border-bdr rounded-xl overflow-hidden shadow-card">
      {/* Toolbar */}
      {toolbar && (
        <div className="border-b border-bdr px-4 py-3 flex items-center gap-2">
          {toolbar}
          <div className="ml-auto flex items-center gap-2">
            <button
              className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
              aria-label="Customize columns"
              title="Customize columns"
            >
              <Columns3 size={15} strokeWidth={1.5} />
            </button>
            <button
              className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
              aria-label="Download table data"
              title="Download CSV"
            >
              <Download size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="border-b border-b500 bg-b100 px-4 py-2.5 flex items-center gap-3 animate-fade-in">
          <span className="text-13 font-medium text-b700">{selected.size} row{selected.size > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button className="px-3 py-1.5 rounded-lg bg-b500 text-white text-12 font-medium hover:bg-b700 transition-colors">
              Approve bids
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-bdr text-ts text-12 font-medium hover:bg-hov transition-colors">
              Export
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-ts hover:text-tp text-12"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-hov border-b border-bdr-strong">
              {/* Checkbox */}
              <th className={`${cellPadding} w-10`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-bdr-strong accent-[var(--blue-500)]"
                  aria-label="Select all rows"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    `${cellPadding} text-left`,
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.width,
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 text-12 font-medium text-tt uppercase tracking-wider hover:text-ts transition-colors group"
                    >
                      {col.header}
                      <span className="text-tt">
                        {sortKey === col.key && sortDir === 'asc'  ? <ChevronUp  size={12} strokeWidth={2} className="text-b500" /> :
                         sortKey === col.key && sortDir === 'desc' ? <ChevronDown size={12} strokeWidth={2} className="text-b500" /> :
                         <ChevronsUpDown size={12} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </span>
                    </button>
                  ) : (
                    <span className="text-12 font-medium text-tt uppercase tracking-wider">
                      {col.header}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <SkeletonRows cols={columns.length + 1} rows={6} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-hov flex items-center justify-center text-tt">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 12h18M3 6h18M3 18h12" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-13 text-ts">{emptyMessage}</p>
                    <button className="px-4 py-2 rounded-lg border border-bdr text-13 text-b500 hover:bg-b100 transition-colors">
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const key = getRowKey(row);
                const isSelected = selected.has(key);
                const isLive = isRowLive?.(row);
                return (
                  <tr
                    key={key}
                    className={clsx(
                      'data-row border-b border-bdr last:border-0 relative',
                      isSelected && 'bg-selected',
                      isLive && !isSelected && 'border-l-2 border-l-b500',
                    )}
                  >
                    <td className={`${cellPadding} w-10`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        className="w-3.5 h-3.5 rounded border-bdr-strong accent-[var(--blue-500)]"
                        aria-label={`Select row ${key}`}
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          `${cellPadding} text-13 text-tp`,
                          col.align === 'right'  && 'text-right num',
                          col.align === 'center' && 'text-center',
                        )}
                      >
                        {col.render(row, isSelected)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
