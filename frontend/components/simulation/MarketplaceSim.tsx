'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Play, Users, Wallet } from 'lucide-react';
import { KPIBar } from '@/components/ui/KPIBar';
import { ReasoningPanel } from '@/components/ui/ReasoningPanel';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BidDecisionChip } from '@/components/ui/BidDecisionChip';
import { simulationResults, simSlotOutcomes, simReasoning, type SimSlotOutcome } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/format';

// ─────────────────────────────────────────
// GOAL SEGMENT BUTTON
// ─────────────────────────────────────────

const GOALS = ['Conversions', 'Awareness', 'Clicks', 'Target ROAS'] as const;
type Goal = typeof GOALS[number];

function GoalPicker({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  return (
    <div
      className="flex rounded-lg border border-bdr overflow-hidden"
      role="group"
      aria-label="Campaign goal"
    >
      {GOALS.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`flex-1 px-3 py-2 text-12 font-medium transition-colors border-r border-bdr last:border-0 ${
            value === g
              ? 'bg-b500 text-white'
              : 'bg-surface text-ts hover:bg-hov hover:text-tp'
          }`}
          aria-pressed={value === g}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────

function StyledSlider({
  label, value, min, max, step, unit, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-13 font-medium text-tp">{label}</label>
        <span className="text-13 font-semibold text-b700 num">
          {unit === '$' ? `$${formatNumber(value)}` : `${value}${unit}`}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="w-full h-1.5 rounded-full bg-bdr relative">
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full bg-b500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-surface border-2 border-b500 shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-11 text-tt">
        <span>{unit === '$' ? `$${formatNumber(min)}` : `${min}${unit}`}</span>
        <span>{unit === '$' ? `$${formatNumber(max)}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SLOT OUTCOME TABLE COLUMNS
// ─────────────────────────────────────────

const SIM_COLUMNS: Column<SimSlotOutcome>[] = [
  {
    key: 'slot',
    header: 'Slot',
    sortable: true,
    render: (row) => <span className="text-13 font-medium text-tp">{row.slot}</span>,
  },
  {
    key: 'platform',
    header: 'Platform',
    render: (row) => <span className="text-13 text-ts">{row.platform}</span>,
  },
  {
    key: 'winRate',
    header: 'Win rate',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className={`text-13 font-medium num ${row.projectedWinRate >= 0.6 ? 'text-g700' : row.projectedWinRate >= 0.4 ? 'text-a700' : 'text-r700'}`}>
        {formatPercentage(row.projectedWinRate * 100)}
      </span>
    ),
  },
  {
    key: 'cpm',
    header: 'Est. CPM',
    align: 'right',
    sortable: true,
    render: (row) => <span className="text-13 text-tp num">{formatCurrency(row.estCPM)}</span>,
  },
  {
    key: 'verdict',
    header: 'Verdict',
    align: 'center',
    render: (row) => <BidDecisionChip decision={row.verdict} />,
  },
];

// ─────────────────────────────────────────
// CUSTOM BAR TOOLTIP
// ─────────────────────────────────────────

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-bdr rounded-lg shadow-tooltip p-2.5 text-13">
      <p className="text-12 font-medium text-tp mb-1">{label}</p>
      <p className="text-13 font-semibold text-tp num">{formatPercentage(payload[0].value)} win rate</p>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export function MarketplaceSim() {
  const [competitors, setCompetitors] = useState(8);
  const [budget, setBudget] = useState(125000);
  const [goal, setGoal] = useState<Goal>('Conversions');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const handleRunSim = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setRan(true);
    }, 2000);
  };

  const aiResult = simulationResults.find((r) => r.isAIOptimized);

  const kpiMetrics = [
    { label: 'Sim runs',           value: ran ? '1,000' : '—',                             delta: ran ? 'Completed' : 'Run simulation',            deltaDir: ran ? 'up' as const : 'neutral' as const },
    { label: 'Projected win rate', value: ran && aiResult ? formatPercentage(aiResult.winRate) : '—',      delta: ran ? 'AI optimized' : 'Pending',               deltaDir: ran ? 'up' as const : 'neutral' as const },
    { label: 'Avg cost per win',   value: ran && aiResult ? formatCurrency(aiResult.avgCostPerWin) : '—', delta: ran ? '−$1.18 vs fixed' : 'Pending',            deltaDir: ran ? 'up' as const : 'neutral' as const },
    { label: 'Confidence',         value: ran && aiResult ? formatPercentage((aiResult.confidence) * 100) : '—', delta: ran ? '6-month calibration' : 'Pending', deltaDir: 'neutral' as const },
  ];

  const chartData = simulationResults.map((r) => ({
    strategy: r.strategy.length > 18 ? r.strategy.slice(0, 18) + '…' : r.strategy,
    winRate:  r.winRate,
    isAI:     r.isAIOptimized,
  }));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-20 font-semibold text-tp">Marketplace simulation</h1>
        <p className="text-13 text-ts mt-0.5">Monte Carlo auction scenarios — 1,000 simulated runs</p>
      </div>

      {/* KPI Bar */}
      <KPIBar metrics={kpiMetrics} />

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* Left: Strategy comparison */}
        <div className="space-y-4">
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
            <h2 className="text-15 font-semibold text-tp mb-1">Strategy performance</h2>
            <p className="text-12 text-tt mb-4">1,000 simulated auctions — win rate by strategy</p>

            {/* Horizontal bar chart */}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 2" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="strategy"
                  width={120}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.isAI ? 'var(--blue-500)' : 'var(--border-strong)'}
                      fillOpacity={entry.isAI ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--blue-500)' }} />
                <span className="text-12 text-ts">AI Optimized</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--border-strong)' }} />
                <span className="text-12 text-ts">Other strategies</span>
              </div>
            </div>
          </div>

          {/* Sim verdict */}
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
            <ReasoningPanel
              reasoning={simReasoning}
              title="Simulation verdict"
              compact={false}
            />
          </div>
        </div>

        {/* Right: two stacked cards */}
        <div className="space-y-4">
          {/* Simulation parameters */}
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
            <h2 className="text-15 font-semibold text-tp mb-4">Simulation parameters</h2>

            <div className="space-y-5">
              {/* Competitors slider */}
              <StyledSlider
                label="Competitors"
                value={competitors}
                min={2}
                max={20}
                step={1}
                unit=""
                onChange={setCompetitors}
              />

              {/* Budget slider */}
              <StyledSlider
                label="Budget"
                value={budget}
                min={10000}
                max={500000}
                step={5000}
                unit="$"
                onChange={setBudget}
              />

              {/* Campaign goal */}
              <div className="space-y-2">
                <p className="text-13 font-medium text-tp">Campaign goal</p>
                <GoalPicker value={goal} onChange={setGoal} />
              </div>

              {/* Run button */}
              <button
                onClick={handleRunSim}
                disabled={running}
                className="w-full h-10 rounded-lg bg-b500 text-white text-13 font-medium flex items-center justify-center gap-2 hover:bg-b700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                aria-label="Run simulation"
              >
                {running ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Running 1,000 scenarios…
                  </>
                ) : (
                  <>
                    <Play size={14} strokeWidth={2} />
                    Run simulation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Slot-level outcomes */}
          <div className="bg-surface border border-bdr rounded-xl overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-13 font-semibold text-tp">Slot-level outcomes</h2>
              <p className="text-11 text-tt mt-0.5">Pursuit recommendations by slot</p>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 280 }}>
              <table className="w-full">
                <thead>
                  <tr className="bg-hov border-b border-bdr-strong sticky top-0">
                    <th className="px-3 py-2.5 text-left text-11 font-medium text-tt uppercase tracking-wider">Slot</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">Win %</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">CPM</th>
                    <th className="px-3 py-2.5 text-center text-11 font-medium text-tt uppercase tracking-wider">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {simSlotOutcomes.map((row) => (
                    <tr key={row.id} className="data-row border-b border-bdr last:border-0">
                      <td className="px-3 py-2.5">
                        <p className="text-12 font-medium text-tp leading-tight">{row.slot}</p>
                        <p className="text-11 text-tt">{row.platform}</p>
                      </td>
                      <td className={`px-3 py-2.5 text-right text-12 font-medium num ${
                        row.projectedWinRate >= 0.6 ? 'text-g700' :
                        row.projectedWinRate >= 0.4 ? 'text-a700' : 'text-r700'
                      }`}>
                        {formatPercentage(row.projectedWinRate * 100)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-12 text-ts num">
                        {formatCurrency(row.estCPM)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <BidDecisionChip decision={row.verdict} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width slot outcomes table */}
      <DataTable
        columns={SIM_COLUMNS}
        data={simSlotOutcomes}
        getRowKey={(row) => row.id}
        compact
        toolbar={
          <div className="flex items-center gap-3">
            <h3 className="text-13 font-semibold text-tp">Detailed slot outcomes</h3>
            <span className="text-11 text-tt">{simSlotOutcomes.length} slots evaluated</span>
          </div>
        }
      />
    </div>
  );
}
