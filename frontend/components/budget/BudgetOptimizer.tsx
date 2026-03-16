'use client';

import { useState } from 'react';
import { Wand2, TrendingUp } from 'lucide-react';
import { KPIBar } from '@/components/ui/KPIBar';
import { AllocationBar } from '@/components/ui/AllocationBar';
import { PerformanceChart } from '@/components/ui/PerformanceChart';
import { ReasoningPanel } from '@/components/ui/ReasoningPanel';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BidDecisionChip } from '@/components/ui/BidDecisionChip';
import {
  budgetAllocations, audienceSegments, budgetReasoning,
  totalBudget, type AudienceSegment,
} from '@/lib/mock-data';
import { formatCurrency, formatCurrencyCompact, formatPercentage, formatROAS } from '@/lib/format';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

const PRIORITY_CONFIG = {
  P1: { bg: 'bg-r100',  text: 'text-r700',  label: 'Priority 1' },
  P2: { bg: 'bg-a100',  text: 'text-a700',  label: 'Priority 2' },
  P3: { bg: 'bg-b100',  text: 'text-b700',  label: 'Priority 3' },
  P4: { bg: 'bg-[#F1F3F4]', text: 'text-ts', label: 'Priority 4' },
};

// ─────────────────────────────────────────
// AUDIENCE TABLE COLUMNS
// ─────────────────────────────────────────

const AUDIENCE_COLUMNS: Column<AudienceSegment>[] = [
  {
    key: 'segment',
    header: 'Segment',
    sortable: true,
    render: (row) => (
      <span className="text-13 font-medium text-tp">{row.segment}</span>
    ),
  },
  {
    key: 'cpmMult',
    header: 'CPM mult',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-13 num">
        {row.cpmMult >= 2 ? (
          <span className="text-r700 font-medium">{row.cpmMult.toFixed(2)}x</span>
        ) : row.cpmMult >= 1.4 ? (
          <span className="text-a700 font-medium">{row.cpmMult.toFixed(2)}x</span>
        ) : (
          <span className="text-tp">{row.cpmMult.toFixed(2)}x</span>
        )}
      </span>
    ),
  },
  {
    key: 'ctr',
    header: 'CTR',
    align: 'right',
    sortable: true,
    render: (row) => <span className="text-13 num text-tp">{formatPercentage(row.ctr)}</span>,
  },
  {
    key: 'cvr',
    header: 'CVR',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className={`text-13 num font-medium ${row.cvr >= 5 ? 'text-g700' : row.cvr >= 2 ? 'text-a700' : 'text-tp'}`}>
        {formatPercentage(row.cvr)}
      </span>
    ),
  },
  {
    key: 'recSpend',
    header: 'Rec. spend',
    align: 'right',
    sortable: true,
    render: (row) => <span className="text-13 font-semibold text-tp num">{formatCurrencyCompact(row.recSpend)}</span>,
  },
  {
    key: 'priority',
    header: 'Priority tier',
    align: 'center',
    render: (row) => {
      const cfg = PRIORITY_CONFIG[row.priorityTier];
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-11 font-semibold ${cfg.bg} ${cfg.text}`}>
          {row.priorityTier}
        </span>
      );
    },
  },
];

// ─────────────────────────────────────────
// SCENARIO ROW
// ─────────────────────────────────────────

interface ScenarioRow {
  label: string;
  roas: number;
  spend: number;
  wins: number;
  isAI?: boolean;
}

const SCENARIOS: ScenarioRow[] = [
  { label: 'Current allocation', roas: 3.8, spend: 118500, wins: 842,  isAI: false },
  { label: 'AI optimized',       roas: 4.2, spend: 125000, wins: 987,  isAI: true  },
  { label: 'Conservative',       roas: 3.2, spend: 95000,  wins: 701,  isAI: false },
];

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export function BudgetOptimizer() {
  const [optimizing, setOptimizing] = useState(false);

  const allocated   = budgetAllocations.reduce((s, a) => s + a.allocated, 0);
  const projectedROAS   = 4.2;
  const estConversions  = 987;

  const kpiMetrics = [
    { label: 'Total budget',       value: formatCurrencyCompact(totalBudget), delta: 'Q1 2025',       deltaDir: 'neutral' as const },
    { label: 'Allocated',          value: formatCurrencyCompact(allocated),   delta: `${formatPercentage((allocated/totalBudget)*100, 0)} of total`, deltaDir: 'neutral' as const },
    { label: 'Projected ROAS',     value: formatROAS(projectedROAS),          delta: '+0.4x WoW',     deltaDir: 'up'      as const },
    { label: 'Est. conversions',   value: String(estConversions),             delta: '+12.3% WoW',    deltaDir: 'up'      as const },
  ];

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => setOptimizing(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-20 font-semibold text-tp">Budget optimizer</h1>
          <p className="text-13 text-ts mt-0.5">Channel allocation & AI-driven pacing recommendations</p>
        </div>
      </div>

      {/* KPI Bar */}
      <KPIBar metrics={kpiMetrics} />

      {/* 3-column grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '5fr 4fr 3fr' }}>
        {/* Col 1: Channel allocation */}
        <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-15 font-semibold text-tp">Channel allocation</h2>
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-b500 text-white text-12 font-medium hover:bg-b700 disabled:opacity-60 transition-colors"
            >
              <Wand2 size={13} strokeWidth={1.5} />
              {optimizing ? 'Optimizing…' : 'Optimize'}
            </button>
          </div>

          {/* Allocation bars */}
          <div className="space-y-5">
            {budgetAllocations.map((alloc) => (
              <AllocationBar
                key={alloc.platform}
                label={alloc.platform}
                iconLetter={alloc.icon}
                iconColor={alloc.color}
                allocated={alloc.allocated}
                total={totalBudget}
                roas={alloc.roas}
                trend={alloc.trend}
                animated
              />
            ))}
          </div>

          {/* Total bar */}
          <div className="mt-5 pt-4 border-t border-bdr">
            <div className="flex items-center justify-between mb-2">
              <span className="text-13 font-medium text-tp">Total allocated</span>
              <span className="text-13 font-semibold text-tp num">
                {formatCurrencyCompact(allocated)} / {formatCurrencyCompact(totalBudget)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-bdr overflow-hidden">
              <div
                className="h-2 rounded-full bg-b500 bar-fill"
                style={{ width: `${(allocated / totalBudget) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-11 text-tt">Pacing: <span className="text-g700 font-medium">On track</span></span>
              <span className="text-11 text-tt num">{formatPercentage((allocated / totalBudget) * 100, 0)} allocated</span>
            </div>
          </div>
        </div>

        {/* Col 2: Performance chart */}
        <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} strokeWidth={1.5} className="text-b500" />
            <h2 className="text-15 font-semibold text-tp">Performance — 7 days</h2>
          </div>
          <PerformanceChart />
        </div>

        {/* Col 3: AI reasoning + scenarios */}
        <div className="space-y-4">
          {/* Compact reasoning */}
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
            <h2 className="text-15 font-semibold text-tp mb-3">AI analysis</h2>
            <ReasoningPanel
              reasoning={budgetReasoning}
              compact
              title="Budget agent"
            />
          </div>

          {/* Scenario comparison */}
          <div className="bg-surface border border-bdr rounded-xl overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-13 font-semibold text-tp">Scenario comparison</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-hov border-b border-bdr">
                  <th className="px-3 py-2 text-left text-11 font-medium text-tt uppercase tracking-wider">Strategy</th>
                  <th className="px-3 py-2 text-right text-11 font-medium text-tt uppercase tracking-wider">ROAS</th>
                  <th className="px-3 py-2 text-right text-11 font-medium text-tt uppercase tracking-wider">Wins</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s) => (
                  <tr
                    key={s.label}
                    className={`border-b border-bdr last:border-0 ${s.isAI ? 'bg-b100 border-l-2 border-l-b500' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-12 font-medium text-tp">{s.label}</td>
                    <td className={`px-3 py-2.5 text-right text-12 font-semibold num ${s.isAI ? 'text-b700' : 'text-tp'}`}>
                      {formatROAS(s.roas)}
                    </td>
                    <td className={`px-3 py-2.5 text-right text-12 num ${s.isAI ? 'text-b700 font-semibold' : 'text-ts'}`}>
                      {s.wins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audience segment table */}
      <DataTable
        columns={AUDIENCE_COLUMNS}
        data={audienceSegments}
        getRowKey={(row) => row.id}
        toolbar={
          <div className="flex items-center gap-3">
            <h3 className="text-13 font-semibold text-tp">Audience segment performance</h3>
            <span className="text-11 text-tt">{audienceSegments.length} segments</span>
          </div>
        }
      />
    </div>
  );
}
