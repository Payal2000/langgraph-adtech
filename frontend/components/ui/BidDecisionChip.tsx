'use client';

import type { BidDecision } from '@/lib/mock-data';

interface BidDecisionChipProps {
  decision: BidDecision | 'Pursue' | 'Consider' | 'Caution' | 'Avoid';
  size?: 'sm' | 'md';
}

const DECISION_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  BID:     { bg: 'bg-g100', text: 'text-g700', border: 'border-[#C3E6CA]' },
  HOLD:    { bg: 'bg-a100', text: 'text-a700', border: 'border-[#FDE68A]' },
  SKIP:    { bg: 'bg-r100', text: 'text-r700', border: 'border-[#F5C6C2]' },
  Pursue:  { bg: 'bg-g100', text: 'text-g700', border: 'border-[#C3E6CA]' },
  Consider:{ bg: 'bg-b100', text: 'text-b700', border: 'border-[#BFDBFE]' },
  Caution: { bg: 'bg-a100', text: 'text-a700', border: 'border-[#FDE68A]' },
  Avoid:   { bg: 'bg-r100', text: 'text-r700', border: 'border-[#F5C6C2]' },
};

export function BidDecisionChip({ decision, size = 'sm' }: BidDecisionChipProps) {
  const cfg = DECISION_CONFIG[decision] ?? DECISION_CONFIG.HOLD;
  const sizeClass = size === 'sm'
    ? 'text-11 px-2.5 py-1'
    : 'text-12 px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}
      aria-label={`Decision: ${decision}`}
    >
      {decision}
    </span>
  );
}
