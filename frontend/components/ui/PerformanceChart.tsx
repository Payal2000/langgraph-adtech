'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { performanceData, roasData } from '@/lib/mock-data';
import { formatCurrencyCompact, formatROAS } from '@/lib/format';

type MetricTab = 'spend' | 'roas' | 'conversions';

const CHANNELS = [
  { key: 'google',  label: 'Google',  color: '#4285F4' },
  { key: 'meta',    label: 'Meta',    color: '#0866FF' },
  { key: 'amazon',  label: 'Amazon',  color: '#FF9900' },
  { key: 'ttd',     label: 'TTD',     color: '#007BFF' },
];

// Synthetic conversions data
const convData = performanceData.map(d => ({
  ...d,
  google: Math.round(d.google / 12),
  meta:   Math.round(d.meta   / 18),
  amazon: Math.round(d.amazon / 8),
  ttd:    Math.round(d.ttd    / 22),
  total:  Math.round(d.total  / 13),
}));

const METRIC_CONFIG: Record<MetricTab, {
  data: typeof performanceData;
  formatter: (v: number) => string;
  label: string;
}> = {
  spend:       { data: performanceData, formatter: formatCurrencyCompact, label: 'Daily Spend' },
  roas:        { data: roasData,        formatter: formatROAS,            label: 'ROAS' },
  conversions: { data: convData,        formatter: (v) => `${v}`,         label: 'Conversions' },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
  formatter: (v: number) => string;
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-bdr rounded-lg shadow-tooltip p-2.5 text-13">
      <p className="text-12 font-medium text-tp mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-12">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-ts">{entry.name}</span>
          </div>
          <span className="font-medium text-tp num">{formatter(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface PerformanceChartProps {
  loading?: boolean;
}

export function PerformanceChart({ loading = false }: PerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>('spend');
  const { data, formatter, label } = METRIC_CONFIG[activeTab];

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex items-center gap-1 mb-4">
        {(['spend', 'roas', 'conversions'] as MetricTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-12 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-b100 text-b700'
                : 'text-ts hover:text-tp hover:bg-hov'
            }`}
          >
            {tab === 'roas' ? 'ROAS' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            {CHANNELS.map(ch => (
              <linearGradient key={ch.key} id={`grad-${ch.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ch.color} stopOpacity={0.12} />
                <stop offset="95%" stopColor={ch.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 2" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatter}
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatter} />}
            cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          {CHANNELS.map(ch => (
            <Area
              key={ch.key}
              type="monotone"
              dataKey={ch.key}
              name={ch.label}
              stroke={ch.color}
              strokeWidth={2}
              fill={`url(#grad-${ch.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {CHANNELS.map(ch => (
          <div key={ch.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
            <span className="text-12 text-ts">{ch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
