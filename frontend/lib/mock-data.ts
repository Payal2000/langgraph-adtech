/**
 * Realistic mock data for AdBid Intelligence Platform.
 * All data represents a mid-size programmatic advertising account.
 */

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type BidDecision = 'BID' | 'HOLD' | 'SKIP';
export type SlotStatus = 'live' | 'won' | 'lost' | 'pending';
export type AuctionOutcome = 'Won' | 'Lost' | 'Pending' | 'Skipped';

export interface AuctionSlot {
  id: string;
  slotName: string;
  slotSub: string;
  platform: string;
  platformColor: string;
  audience: string;
  floorPrice: number;
  recommendedBid: number;
  decision: BidDecision;
  outcome: AuctionOutcome;
  toolsCalled: string[];
  status: SlotStatus;
  winRate?: number;
  cpm?: number;
  timestamp: Date;
}

export interface BudgetAllocation {
  platform: string;
  icon: string;
  color: string;
  allocated: number;
  total: number;
  roas: number;
  trend: number;
}

export interface PerformanceDataPoint {
  date: string;
  google: number;
  meta: number;
  amazon: number;
  ttd: number;
  total: number;
}

export interface AudienceSegment {
  id: string;
  segment: string;
  cpmMult: number;
  ctr: number;
  cvr: number;
  recSpend: number;
  priorityTier: 'P1' | 'P2' | 'P3' | 'P4';
}

export interface StrategyRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'conditional' | 'paused';
  lastUpdated: Date;
  triggeredCount: number;
}

export interface CompetitorBid {
  platform: string;
  p25: number;
  p50: number;
  p75: number;
  yourLastBid: number;
  pressure: 'extreme' | 'high' | 'medium' | 'low';
  pressureScore: number;
}

export interface AgentActivity {
  id: string;
  action: string;
  type: 'bid' | 'info' | 'warning' | 'success' | 'strategy';
  timestamp: Date;
}

export interface SimulationResult {
  strategy: string;
  isAIOptimized: boolean;
  winRate: number;
  avgCostPerWin: number;
  totalWins: number;
  confidence: number;
}

export interface SimSlotOutcome {
  id: string;
  slot: string;
  platform: string;
  projectedWinRate: number;
  estCPM: number;
  verdict: 'Pursue' | 'Consider' | 'Caution' | 'Avoid';
}

// ─────────────────────────────────────────
// AUCTION SLOTS
// ─────────────────────────────────────────

export const auctionSlots: AuctionSlot[] = [
  {
    id: 'slot-001',
    slotName: 'Google Search — Brand',
    slotSub: 'High-intent branded keywords',
    platform: 'Google',
    platformColor: '#4285F4',
    audience: 'In-market / Brand',
    floorPrice: 1.20,
    recommendedBid: 4.85,
    decision: 'BID',
    outcome: 'Won',
    toolsCalled: ['evaluate_bid', 'get_floor_price', 'check_budget'],
    status: 'won',
    winRate: 0.87,
    cpm: 4.12,
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: 'slot-002',
    slotName: 'Meta — Retargeting L30',
    slotSub: 'Last 30-day site visitors',
    platform: 'Meta',
    platformColor: '#0866FF',
    audience: 'Retargeting',
    floorPrice: 3.50,
    recommendedBid: 7.20,
    decision: 'BID',
    outcome: 'Pending',
    toolsCalled: ['evaluate_bid', 'get_audience_signal', 'check_budget', 'get_creative_score'],
    status: 'live',
    winRate: 0.61,
    cpm: 6.80,
    timestamp: new Date(Date.now() - 12000),
  },
  {
    id: 'slot-003',
    slotName: 'Amazon DSP — Electronics',
    slotSub: 'Electronics category shoppers',
    platform: 'Amazon',
    platformColor: '#FF9900',
    audience: 'In-market / Electronics',
    floorPrice: 5.00,
    recommendedBid: 5.10,
    decision: 'HOLD',
    outcome: 'Pending',
    toolsCalled: ['evaluate_bid', 'check_budget'],
    status: 'pending',
    winRate: 0.34,
    cpm: 5.05,
    timestamp: new Date(Date.now() - 3000),
  },
  {
    id: 'slot-004',
    slotName: 'TTD — Programmatic Display',
    slotSub: 'Premium publisher inventory',
    platform: 'TTD',
    platformColor: '#007BFF',
    audience: 'Lookalike 3%',
    floorPrice: 0.80,
    recommendedBid: 1.05,
    decision: 'SKIP',
    outcome: 'Skipped',
    toolsCalled: ['evaluate_bid', 'get_floor_price'],
    status: 'lost',
    winRate: 0.18,
    cpm: 0.92,
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: 'slot-005',
    slotName: 'Google Display — Prospecting',
    slotSub: 'Similar audiences to converters',
    platform: 'Google',
    platformColor: '#4285F4',
    audience: 'Similar / Converters',
    floorPrice: 1.50,
    recommendedBid: 3.20,
    decision: 'BID',
    outcome: 'Won',
    toolsCalled: ['evaluate_bid', 'get_audience_signal', 'check_budget'],
    status: 'won',
    winRate: 0.72,
    cpm: 3.05,
    timestamp: new Date(Date.now() - 320000),
  },
  {
    id: 'slot-006',
    slotName: 'LinkedIn — B2B Decision Makers',
    slotSub: 'VP+ title targeting',
    platform: 'LinkedIn',
    platformColor: '#0A66C2',
    audience: 'Job title / Seniority',
    floorPrice: 8.00,
    recommendedBid: 11.50,
    decision: 'BID',
    outcome: 'Pending',
    toolsCalled: ['evaluate_bid', 'get_audience_signal', 'check_budget', 'evaluate_creative'],
    status: 'live',
    winRate: 0.53,
    cpm: 10.80,
    timestamp: new Date(Date.now() - 8000),
  },
  {
    id: 'slot-007',
    slotName: 'Meta — Broad Prospecting',
    slotSub: 'Interest-based cold audience',
    platform: 'Meta',
    platformColor: '#0866FF',
    audience: 'Interest / Broad',
    floorPrice: 2.20,
    recommendedBid: 2.40,
    decision: 'HOLD',
    outcome: 'Pending',
    toolsCalled: ['evaluate_bid', 'check_budget'],
    status: 'pending',
    winRate: 0.29,
    cpm: 2.35,
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 'slot-008',
    slotName: 'Google Video — YouTube TrueView',
    slotSub: 'Skippable in-stream video',
    platform: 'Google',
    platformColor: '#4285F4',
    audience: 'Custom intent',
    floorPrice: 0.05,
    recommendedBid: 0.18,
    decision: 'BID',
    outcome: 'Won',
    toolsCalled: ['evaluate_bid', 'get_creative_score', 'check_budget'],
    status: 'won',
    winRate: 0.91,
    cpm: 0.16,
    timestamp: new Date(Date.now() - 420000),
  },
];

// ─────────────────────────────────────────
// BUDGET ALLOCATION
// ─────────────────────────────────────────

export const totalBudget = 125000;

export const budgetAllocations: BudgetAllocation[] = [
  { platform: 'Google Ads',   icon: 'G',  color: '#4285F4', allocated: 45000, total: 125000, roas: 4.2, trend: 12.3 },
  { platform: 'Meta Ads',     icon: 'M',  color: '#0866FF', allocated: 32000, total: 125000, roas: 3.1, trend: -5.1 },
  { platform: 'Amazon DSP',   icon: 'A',  color: '#FF9900', allocated: 18000, total: 125000, roas: 5.8, trend: 22.7 },
  { platform: 'The Trade Desk',icon:'T',  color: '#007BFF', allocated: 15000, total: 125000, roas: 2.9, trend: -1.2 },
  { platform: 'LinkedIn Ads', icon: 'Li', color: '#0A66C2', allocated: 8500,  total: 125000, roas: 1.8, trend: 8.4 },
];

// ─────────────────────────────────────────
// PERFORMANCE CHART DATA
// ─────────────────────────────────────────

export const performanceData: PerformanceDataPoint[] = [
  { date: 'Mar 8',  google: 4200, meta: 3100, amazon: 1800, ttd: 1400, total: 10500 },
  { date: 'Mar 9',  google: 4800, meta: 2900, amazon: 2100, ttd: 1200, total: 11000 },
  { date: 'Mar 10', google: 3900, meta: 3400, amazon: 1950, ttd: 1600, total: 10850 },
  { date: 'Mar 11', google: 5200, meta: 3200, amazon: 2400, ttd: 1300, total: 12100 },
  { date: 'Mar 12', google: 5600, meta: 3600, amazon: 2200, ttd: 1500, total: 12900 },
  { date: 'Mar 13', google: 4900, meta: 3100, amazon: 2600, ttd: 1800, total: 12400 },
  { date: 'Mar 14', google: 5800, meta: 3800, amazon: 2800, ttd: 1900, total: 14300 },
];

export const roasData: PerformanceDataPoint[] = [
  { date: 'Mar 8',  google: 3.8, meta: 2.8, amazon: 5.2, ttd: 2.6, total: 3.5 },
  { date: 'Mar 9',  google: 4.0, meta: 2.9, amazon: 5.5, ttd: 2.7, total: 3.7 },
  { date: 'Mar 10', google: 3.7, meta: 3.1, amazon: 5.1, ttd: 2.9, total: 3.5 },
  { date: 'Mar 11', google: 4.1, meta: 3.0, amazon: 5.8, ttd: 2.8, total: 3.8 },
  { date: 'Mar 12', google: 4.4, meta: 3.2, amazon: 6.0, ttd: 2.9, total: 4.0 },
  { date: 'Mar 13', google: 4.2, meta: 3.0, amazon: 5.9, ttd: 3.1, total: 3.9 },
  { date: 'Mar 14', google: 4.5, meta: 3.4, amazon: 6.2, ttd: 3.0, total: 4.2 },
];

// ─────────────────────────────────────────
// AUDIENCE SEGMENTS
// ─────────────────────────────────────────

export const audienceSegments: AudienceSegment[] = [
  { id: 'seg-1', segment: 'In-market: Electronics',     cpmMult: 1.85, ctr: 3.2, cvr: 4.1, recSpend: 28000, priorityTier: 'P1' },
  { id: 'seg-2', segment: 'Retargeting: Cart abandon',  cpmMult: 2.40, ctr: 5.8, cvr: 8.9, recSpend: 22000, priorityTier: 'P1' },
  { id: 'seg-3', segment: 'Lookalike 1%: Purchasers',   cpmMult: 1.55, ctr: 2.9, cvr: 3.2, recSpend: 19500, priorityTier: 'P2' },
  { id: 'seg-4', segment: 'Interest: Tech enthusiasts', cpmMult: 1.20, ctr: 1.8, cvr: 1.9, recSpend: 14000, priorityTier: 'P2' },
  { id: 'seg-5', segment: 'Broad prospecting',          cpmMult: 0.85, ctr: 0.9, cvr: 0.8, recSpend: 8000,  priorityTier: 'P3' },
  { id: 'seg-6', segment: 'LinkedIn B2B Decision',      cpmMult: 3.10, ctr: 0.6, cvr: 2.1, recSpend: 16000, priorityTier: 'P2' },
  { id: 'seg-7', segment: 'Video completion audience',  cpmMult: 1.10, ctr: 1.2, cvr: 1.4, recSpend: 6500,  priorityTier: 'P3' },
  { id: 'seg-8', segment: 'Seasonal: Holiday shoppers', cpmMult: 0.70, ctr: 0.7, cvr: 0.6, recSpend: 3000,  priorityTier: 'P4' },
];

// ─────────────────────────────────────────
// STRATEGY RULES
// ─────────────────────────────────────────

export const strategyRules: StrategyRule[] = [
  {
    id: 'rule-1',
    name: 'Aggressive bid on branded terms',
    description: 'Always bid at 2.5x floor price for branded keyword slots. Competitor defense takes priority over margin optimization when brand share drops below 80%.',
    status: 'active',
    lastUpdated: new Date(Date.now() - 86400000 * 2),
    triggeredCount: 847,
  },
  {
    id: 'rule-2',
    name: 'Budget pacing guardrail',
    description: 'When daily spend reaches 85% of budget before 6PM local time, switch all non-P1 segments to HOLD status and notify the optimization queue.',
    status: 'active',
    lastUpdated: new Date(Date.now() - 86400000 * 5),
    triggeredCount: 23,
  },
  {
    id: 'rule-3',
    name: 'Competitor pressure response',
    description: 'When competitor bid pressure score exceeds 0.75 on a slot, increase bid by 15% up to max CPM cap. Conditional on ROAS target being met for the last 3 days.',
    status: 'conditional',
    lastUpdated: new Date(Date.now() - 86400000 * 1),
    triggeredCount: 156,
  },
  {
    id: 'rule-4',
    name: 'Weekend ROAS floor',
    description: 'On Saturdays and Sundays, skip any slot where projected ROAS falls below 2.5x. Weekend conversion rates historically run 18% lower; this rule protects margin.',
    status: 'conditional',
    lastUpdated: new Date(Date.now() - 86400000 * 10),
    triggeredCount: 412,
  },
  {
    id: 'rule-5',
    name: 'LinkedIn B2B budget cap',
    description: 'Cap LinkedIn daily spend at $2,500. Despite strong CVR, CPM is disproportionately high for acquisition objectives. Revisit when remarketing list grows past 50K.',
    status: 'active',
    lastUpdated: new Date(Date.now() - 86400000 * 30),
    triggeredCount: 62,
  },
];

// ─────────────────────────────────────────
// COMPETITOR BID LANDSCAPE
// ─────────────────────────────────────────

export const competitorBids: CompetitorBid[] = [
  { platform: 'Google Search',    p25: 1.80, p50: 3.40, p75: 6.20, yourLastBid: 4.85, pressure: 'high',    pressureScore: 0.72 },
  { platform: 'Meta Feed',        p25: 2.60, p50: 4.80, p75: 8.50, yourLastBid: 7.20, pressure: 'medium',  pressureScore: 0.55 },
  { platform: 'Amazon DSP',       p25: 3.10, p50: 5.60, p75: 9.80, yourLastBid: 5.10, pressure: 'extreme', pressureScore: 0.91 },
  { platform: 'Display / TTD',    p25: 0.60, p50: 1.10, p75: 2.40, yourLastBid: 1.05, pressure: 'low',     pressureScore: 0.28 },
  { platform: 'LinkedIn',         p25: 6.50, p50: 9.20, p75: 14.0, yourLastBid: 11.50, pressure: 'medium', pressureScore: 0.61 },
];

// ─────────────────────────────────────────
// AGENT ACTIVITY LOG
// ─────────────────────────────────────────

export const agentActivity: AgentActivity[] = [
  { id: 'act-1', action: 'Submitted BID $4.85 on Google Search — Brand slot',          type: 'bid',      timestamp: new Date(Date.now() - 45000)   },
  { id: 'act-2', action: 'Budget guardrail rule triggered — Q1 cap at 84.2%',          type: 'warning',  timestamp: new Date(Date.now() - 180000)  },
  { id: 'act-3', action: 'Skipped TTD Display slot — win probability 18% below floor', type: 'info',     timestamp: new Date(Date.now() - 320000)  },
  { id: 'act-4', action: 'Won Google Video slot at $0.16 CPV — 91% win rate',          type: 'success',  timestamp: new Date(Date.now() - 420000)  },
  { id: 'act-5', action: 'Strategy "Aggressive bid on branded terms" triggered x3',    type: 'strategy', timestamp: new Date(Date.now() - 600000)  },
  { id: 'act-6', action: 'Meta retargeting HOLD — audience signal score below 0.4',    type: 'info',     timestamp: new Date(Date.now() - 900000)  },
  { id: 'act-7', action: 'Evaluated 6 new slots from Amazon DSP inventory feed',       type: 'info',     timestamp: new Date(Date.now() - 1800000) },
  { id: 'act-8', action: 'Daily win rate 71.3% — above 7-day avg of 68.1%',           type: 'success',  timestamp: new Date(Date.now() - 3600000) },
];

// ─────────────────────────────────────────
// SIMULATION RESULTS
// ─────────────────────────────────────────

export const simulationResults: SimulationResult[] = [
  { strategy: 'AI Optimized',        isAIOptimized: true,  winRate: 71.3, avgCostPerWin: 3.82, totalWins: 713, confidence: 0.94 },
  { strategy: 'Fixed CPM ($5.00)',   isAIOptimized: false, winRate: 58.2, avgCostPerWin: 5.00, totalWins: 582, confidence: 0.88 },
  { strategy: 'Floor + 20%',         isAIOptimized: false, winRate: 44.7, avgCostPerWin: 2.91, totalWins: 447, confidence: 0.85 },
  { strategy: 'Aggressive (max bid)',isAIOptimized: false, winRate: 89.1, avgCostPerWin: 7.40, totalWins: 891, confidence: 0.96 },
  { strategy: 'Conservative (P50)',  isAIOptimized: false, winRate: 52.8, avgCostPerWin: 3.20, totalWins: 528, confidence: 0.82 },
];

export const simSlotOutcomes: SimSlotOutcome[] = [
  { id: 'so-1', slot: 'Google Search — Brand',   platform: 'Google',   projectedWinRate: 0.87, estCPM: 4.12, verdict: 'Pursue'   },
  { id: 'so-2', slot: 'Meta — Retargeting L30',  platform: 'Meta',     projectedWinRate: 0.61, estCPM: 6.80, verdict: 'Pursue'   },
  { id: 'so-3', slot: 'Amazon DSP — Electronics',platform: 'Amazon',   projectedWinRate: 0.34, estCPM: 5.05, verdict: 'Consider' },
  { id: 'so-4', slot: 'TTD — Display Premium',   platform: 'TTD',      projectedWinRate: 0.18, estCPM: 0.92, verdict: 'Avoid'    },
  { id: 'so-5', slot: 'LinkedIn — B2B VP+',      platform: 'LinkedIn', projectedWinRate: 0.53, estCPM: 10.8, verdict: 'Consider' },
  { id: 'so-6', slot: 'Meta — Broad Prospecting',platform: 'Meta',     projectedWinRate: 0.29, estCPM: 2.35, verdict: 'Caution'  },
  { id: 'so-7', slot: 'Google Video — YouTube',  platform: 'Google',   projectedWinRate: 0.91, estCPM: 0.16, verdict: 'Pursue'   },
];

// ─────────────────────────────────────────
// AGENT REASONING SAMPLES
// ─────────────────────────────────────────

export const auctionReasoning = `Evaluating **Meta — Retargeting L30** slot. Audience signal score is **0.82** (strong), indicating high purchase intent from the last-30-day visitor pool.

Floor price is $3.50 CPM. Competitor P50 on Meta Feed is $4.80, placing this slot in moderate competition territory. Our historical CVR on this audience is **8.9%** — the highest across all active segments.

Budget check: current daily spend at **71.4%** of cap with 6 hours remaining. Pacing is on track. The "Aggressive bid on branded terms" rule does not apply here, but the retargeting priority rule triggers a **1.2x CPM multiplier**.

Recommendation: **BID at $7.20** — above P50 but below P75 competitor pressure. Expected win rate: 61%. Projected ROAS contribution: 3.4x.`;

export const budgetReasoning = `Budget reallocation analysis for the current period. Amazon DSP is delivering **6.2x ROAS** — the highest across all channels — yet accounts for only 14.4% of total spend allocation.

Meta's performance has declined 5.1% week-over-week due to audience fatigue on broad prospecting segments. The retargeting audience remains strong but is capped by available inventory.

Recommendation: Shift **$4,500** from Meta Broad to Amazon DSP and **$2,000** from TTD Display to LinkedIn for B2B prospecting. This reallocation is projected to improve blended ROAS from **3.8x to 4.1x** with high confidence (92%).

Budget guardrail: LinkedIn daily cap of $2,500 will be maintained regardless of allocation.`;

export const simReasoning = `Simulation complete across **1,000 auction scenarios** using current market conditions and historical win/loss data.

The AI Optimized strategy outperforms all fixed-bid approaches on the **ROAS-adjusted win rate** metric. The key differentiator is dynamic CPM adjustment per audience segment, which avoids overpaying on low-value slots while staying competitive on high-intent inventory.

Aggressive bidding (max CPM) wins more auctions (89.1%) but at a **93.7% higher cost-per-win** — making it viable only if conversion volume is the sole objective.

Confidence in AI Optimized results: **94%** based on 6-month historical calibration. Recommend maintaining current strategy with a weekly recalibration cycle.`;
