'use client';

import { CheckCircle2, AlertTriangle, Info, Zap, Clock, Edit2 } from 'lucide-react';
import { KPIBar } from '@/components/ui/KPIBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { strategyRules, competitorBids, agentActivity } from '@/lib/mock-data';
import { formatRelativeTime, formatDate } from '@/lib/format';

// ─────────────────────────────────────────
// PRESSURE BAR
// ─────────────────────────────────────────

function PressureBar({ score, level }: { score: number; level: string }) {
  const color =
    level === 'extreme' ? '#D93025' :
    level === 'high'    ? '#F9AB00' :
    level === 'medium'  ? '#4285F4' : '#1E8E3E';

  const labelColor =
    level === 'extreme' ? 'text-r700' :
    level === 'high'    ? 'text-a700' :
    level === 'medium'  ? 'text-b700' : 'text-g700';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full bg-bdr overflow-hidden">
        <div
          className="h-1.5 rounded-full bar-fill"
          style={{ width: `${score * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-11 font-medium num w-8 text-right capitalize ${labelColor}`}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// ACTIVITY ICON
// ─────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'success':  return <CheckCircle2 size={14} strokeWidth={1.5} className="text-g500" />;
    case 'warning':  return <AlertTriangle size={14} strokeWidth={1.5} className="text-a500" />;
    case 'bid':      return <Zap size={14} strokeWidth={1.5} className="text-b500" />;
    case 'strategy': return <Edit2 size={14} strokeWidth={1.5} className="text-[#8834FF]" />;
    default:         return <Info size={14} strokeWidth={1.5} className="text-ts" />;
  }
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export function StrategyDashboard() {
  const kpiMetrics = [
    { label: 'Strategy score',      value: '87/100',   delta: '+4 pts WoW',         deltaDir: 'up'      as const },
    { label: 'Slots monitored',     value: '8',        delta: '5 platforms',         deltaDir: 'neutral' as const },
    { label: 'Competitor signals',  value: '5',        delta: '1 extreme pressure',  deltaDir: 'down'    as const },
    { label: 'Bid accuracy',        value: '91.4%',    delta: '+1.8% vs last week',  deltaDir: 'up'      as const },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-20 font-semibold text-tp">Strategy dashboard</h1>
        <p className="text-13 text-ts mt-0.5">Active bidding rules, competitor landscape & agent activity</p>
      </div>

      {/* KPI Bar */}
      <KPIBar metrics={kpiMetrics} />

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* Left: Strategy rules */}
        <div className="space-y-3">
          <h2 className="text-15 font-semibold text-tp">Strategy rules</h2>
          {strategyRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-surface border border-bdr rounded-xl p-4 shadow-card border-l-4 ${
                rule.status === 'active'      ? 'border-l-g500' :
                rule.status === 'conditional' ? 'border-l-a500' : 'border-l-bdr-strong'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-14 font-semibold text-tp leading-snug">{rule.name}</h3>
                <StatusBadge
                  status={rule.status === 'active' ? 'active' : rule.status === 'conditional' ? 'limited' : 'paused'}
                  label={rule.status === 'active' ? 'Active' : rule.status === 'conditional' ? 'Conditional' : 'Paused'}
                />
              </div>

              {/* Description */}
              <p className="text-13 text-ts leading-relaxed mb-3">{rule.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-11 text-tt">
                  <span className="flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.5} aria-hidden="true" />
                    Updated {formatRelativeTime(rule.lastUpdated)}
                  </span>
                  <span>Triggered <span className="font-medium text-ts num">{rule.triggeredCount.toLocaleString()}×</span></span>
                </div>
                <button className="text-12 font-medium text-b500 hover:text-b700 hover:underline transition-colors">
                  Edit rule →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Two stacked cards */}
        <div className="space-y-5">
          {/* Competitor bid landscape */}
          <div className="bg-surface border border-bdr rounded-xl overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-13 font-semibold text-tp">Competitor bid landscape</h2>
              <p className="text-11 text-tt mt-0.5">Auction Insights — bid distribution by platform</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-hov border-b border-bdr-strong">
                    <th className="px-4 py-2.5 text-left text-11 font-medium text-tt uppercase tracking-wider">Platform</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">P25</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">P50</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">P75</th>
                    <th className="px-3 py-2.5 text-right text-11 font-medium text-tt uppercase tracking-wider">Your bid</th>
                    <th className="px-4 py-2.5 text-left text-11 font-medium text-tt uppercase tracking-wider w-36">Pressure</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorBids.map((cb) => (
                    <tr key={cb.platform} className="data-row border-b border-bdr last:border-0">
                      <td className="px-4 py-3 text-13 font-medium text-tp">{cb.platform}</td>
                      <td className="px-3 py-3 text-right text-12 text-ts num">${cb.p25.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-12 text-ts num">${cb.p50.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-12 text-ts num">${cb.p75.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-12 font-semibold text-tp num">${cb.yourLastBid.toFixed(2)}</td>
                      <td className="px-4 py-3 w-36">
                        <PressureBar score={cb.pressureScore} level={cb.pressure} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent activity log */}
          <div className="bg-surface border border-bdr rounded-xl overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-13 font-semibold text-tp">Agent activity log</h2>
              <p className="text-11 text-tt mt-0.5">Last 24 hours</p>
            </div>
            <div className="divide-y divide-bdr max-h-72 overflow-y-auto">
              {agentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 px-4 py-3 data-row">
                  <div className="mt-0.5 flex-shrink-0">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <p className="text-13 text-tp leading-snug flex-1">{activity.action}</p>
                  <span className="text-11 text-tt flex-shrink-0 mt-0.5">{formatRelativeTime(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
