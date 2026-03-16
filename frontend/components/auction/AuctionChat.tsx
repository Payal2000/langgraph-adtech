'use client';

import { useState } from 'react';
import { MessageSquare, Send, Radio } from 'lucide-react';
import { KPIBar } from '@/components/ui/KPIBar';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BidDecisionChip } from '@/components/ui/BidDecisionChip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReasoningPanel } from '@/components/ui/ReasoningPanel';
import { FilterBar } from '@/components/ui/FilterBar';
import { auctionSlots, auctionReasoning, type AuctionSlot } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime } from '@/lib/format';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'Why did we skip the TTD slot?',
  'What is the current win rate?',
  'Should I increase Meta budget?',
  'Explain competitor pressure on Amazon',
];

function PlatformDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-13 font-medium text-tp">{label}</span>
    </div>
  );
}

function ToolChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-11 font-medium bg-[#F1F3F4] text-ts border border-bdr mr-1 mb-0.5">
      {name}
    </span>
  );
}

// ─────────────────────────────────────────
// TABLE COLUMNS
// ─────────────────────────────────────────

const COLUMNS: Column<AuctionSlot>[] = [
  {
    key: 'slot',
    header: 'Slot',
    sortable: true,
    render: (row) => (
      <div>
        <p className="text-13 font-medium text-tp leading-tight">{row.slotName}</p>
        <p className="text-11 text-tt leading-tight mt-0.5">{row.slotSub}</p>
      </div>
    ),
  },
  {
    key: 'platform',
    header: 'Platform',
    render: (row) => <PlatformDot color={row.platformColor} label={row.platform} />,
  },
  {
    key: 'audience',
    header: 'Audience',
    render: (row) => <span className="text-13 text-ts">{row.audience}</span>,
  },
  {
    key: 'floor',
    header: 'Floor',
    align: 'right',
    sortable: true,
    render: (row) => <span className="text-13 text-ts num">{formatCurrency(row.floorPrice)}</span>,
  },
  {
    key: 'bid',
    header: 'Rec. bid',
    align: 'right',
    sortable: true,
    render: (row) => <span className="text-13 font-semibold text-tp num">{formatCurrency(row.recommendedBid)}</span>,
  },
  {
    key: 'decision',
    header: 'Decision',
    align: 'center',
    render: (row) => <BidDecisionChip decision={row.decision} />,
  },
  {
    key: 'outcome',
    header: 'Outcome',
    render: (row) => {
      const map: Record<string, Parameters<typeof StatusBadge>[0]['status']> = {
        Won: 'active', Lost: 'error', Pending: 'pending', Skipped: 'paused',
      };
      return <StatusBadge status={map[row.outcome] ?? 'pending'} label={row.outcome} />;
    },
  },
  {
    key: 'tools',
    header: 'Tools called',
    render: (row) => (
      <div className="flex flex-wrap max-w-[200px]">
        {row.toolsCalled.map((t) => <ToolChip key={t} name={t} />)}
      </div>
    ),
  },
  {
    key: 'time',
    header: 'Time',
    align: 'right',
    render: (row) => <span className="text-11 text-tt">{formatRelativeTime(row.timestamp)}</span>,
  },
];

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export function AuctionChat() {
  const [filterDecision, setFilterDecision] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'won' | 'skipped'>('all');
  const [isStreaming, setIsStreaming] = useState(false);

  const filteredSlots = auctionSlots.filter((s) => {
    if (filterDecision && s.decision !== filterDecision) return false;
    if (filterPlatform && s.platform !== filterPlatform) return false;
    if (activeTab === 'live'    && s.status !== 'live')  return false;
    if (activeTab === 'won'     && s.status !== 'won')   return false;
    if (activeTab === 'skipped' && s.status !== 'lost')  return false;
    return true;
  });

  const handleQuestion = (q: string) => {
    if (!q.trim()) return;
    setIsStreaming(true);
    setChatHistory((prev) => [
      ...prev,
      {
        q,
        a: `Based on current auction data: the agent evaluated ${auctionSlots.length} slots in the last hour, achieving a 71.3% win rate. The recommended bid strategy was calibrated using live floor prices and competitor pressure signals from 5 platforms.`,
      },
    ]);
    setQuestion('');
    setTimeout(() => setIsStreaming(false), 2500);
  };

  const liveCount = auctionSlots.filter((s) => s.status === 'live').length;
  const wonCount  = auctionSlots.filter((s) => s.status === 'won').length;
  const winRate   = ((wonCount / auctionSlots.length) * 100).toFixed(1);
  const avgBid    = auctionSlots.reduce((sum, s) => sum + s.recommendedBid, 0) / auctionSlots.length;

  const kpiMetrics = [
    { label: 'Active auctions',    value: String(liveCount), delta: '+3 vs yesterday',  deltaDir: 'up'      as const },
    { label: 'Win rate today',     value: `${winRate}%`,     delta: '+2.1% WoW',        deltaDir: 'up'      as const },
    { label: 'Avg recommended bid',value: formatCurrency(avgBid), delta: '+$0.42',      deltaDir: 'up'      as const },
    { label: 'Budget remaining',   value: '$37,420',         delta: '29.9% of daily',   deltaDir: 'neutral' as const },
    { label: 'Tools invoked today',value: '1,247',           delta: 'Across 8 agents',  deltaDir: 'neutral' as const },
  ];

  const TABS = [
    { id: 'all'     as const, label: 'All slots' },
    { id: 'live'    as const, label: `Bidding now (${liveCount})` },
    { id: 'won'     as const, label: `Won (${wonCount})` },
    { id: 'skipped' as const, label: 'Skipped' },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-20 font-semibold text-tp">Live auction</h1>
          <p className="text-13 text-ts mt-0.5">Real-time bid recommendations — LangGraph agent active</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-g100 border border-[#C3E6CA]">
          <Radio size={13} strokeWidth={1.5} className="text-g500" aria-hidden="true" />
          <span className="text-12 font-medium text-g700">{liveCount} auctions active</span>
        </div>
      </div>

      {/* KPI Bar */}
      <KPIBar metrics={kpiMetrics} />

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-bdr -mb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 pb-3 pt-1 text-13 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-b500 text-tp'
                : 'border-transparent text-ts hover:text-tp hover:border-bdr-strong'
            }`}
            aria-current={activeTab === tab.id ? 'true' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data table */}
      <DataTable
        columns={COLUMNS}
        data={filteredSlots}
        getRowKey={(row) => row.id}
        isRowLive={(row) => row.status === 'live'}
        toolbar={
          <FilterBar
            searchPlaceholder="Search slots..."
            filters={[
              {
                key: 'decision',
                label: 'Decision',
                options: [
                  { label: 'BID',  value: 'BID'  },
                  { label: 'HOLD', value: 'HOLD' },
                  { label: 'SKIP', value: 'SKIP' },
                ],
              },
              {
                key: 'platform',
                label: 'Platform',
                options: [
                  { label: 'Google',   value: 'Google'   },
                  { label: 'Meta',     value: 'Meta'     },
                  { label: 'Amazon',   value: 'Amazon'   },
                  { label: 'TTD',      value: 'TTD'      },
                  { label: 'LinkedIn', value: 'LinkedIn' },
                ],
              },
            ]}
            onFilterChange={(key, val) => {
              if (key === 'decision') setFilterDecision(val);
              if (key === 'platform') setFilterPlatform(val);
            }}
          />
        }
        maxHeight="400px"
      />

      {/* Bottom split: Reasoning (60%) | Ask agent (40%) */}
      <div className="grid grid-cols-5 gap-5">
        {/* Reasoning */}
        <div className="col-span-3">
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-13 font-semibold text-tp">Slot reasoning</h3>
                <p className="text-11 text-tt mt-0.5">Meta — Retargeting L30</p>
              </div>
              <BidDecisionChip decision="BID" size="md" />
            </div>
            <ReasoningPanel reasoning={auctionReasoning} streaming={isStreaming} />
          </div>
        </div>

        {/* Agent chat */}
        <div className="col-span-2">
          <div className="bg-surface border border-bdr rounded-xl p-4 shadow-card flex flex-col" style={{ minHeight: 340 }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} strokeWidth={1.5} className="text-b500" aria-hidden="true" />
              <h3 className="text-13 font-semibold text-tp">Ask the agent</h3>
            </div>

            {/* Suggested questions */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuestion(q)}
                  className="px-2.5 py-1 rounded-full border border-bdr text-12 text-ts hover:border-b500 hover:text-b700 hover:bg-b100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat history */}
            {chatHistory.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
                {chatHistory.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-b500 text-white rounded-xl rounded-br-sm px-3 py-2 text-13">
                        {item.q}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[90%] bg-hov border border-bdr rounded-xl rounded-bl-sm px-3 py-2 text-13 text-tp leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="mt-auto pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleQuestion(question); }}
                  placeholder="Ask about any slot, strategy, or bid..."
                  className="flex-1 h-9 px-3 border border-bdr rounded-lg text-13 text-tp placeholder:text-tt bg-hov focus:bg-surface focus:border-b500 transition-colors outline-none"
                  aria-label="Ask the agent"
                />
                <button
                  onClick={() => handleQuestion(question)}
                  disabled={!question.trim()}
                  className="h-9 w-9 rounded-lg bg-b500 text-white flex items-center justify-center hover:bg-b700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="Send question"
                >
                  <Send size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
