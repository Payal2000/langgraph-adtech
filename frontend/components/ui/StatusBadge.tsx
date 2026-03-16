'use client';

type StatusVariant = 'active' | 'paused' | 'limited' | 'ended' | 'pending' | 'error';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

const STATUS_CONFIG: Record<StatusVariant, {
  bg: string;
  text: string;
  dot?: boolean;
  defaultLabel: string;
}> = {
  active:  { bg: 'bg-g100',  text: 'text-g700',  dot: true,  defaultLabel: 'Active'  },
  paused:  { bg: 'bg-a100',  text: 'text-a700',  dot: false, defaultLabel: 'Paused'  },
  limited: { bg: 'bg-a100',  text: 'text-a700',  dot: false, defaultLabel: 'Limited' },
  ended:   { bg: 'bg-[#F1F3F4]', text: 'text-ts',dot: false, defaultLabel: 'Ended'   },
  pending: { bg: 'bg-b100',  text: 'text-b700',  dot: false, defaultLabel: 'Pending' },
  error:   { bg: 'bg-r100',  text: 'text-r700',  dot: false, defaultLabel: 'Error'   },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const displayLabel = label ?? cfg.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-11 font-medium ${cfg.bg} ${cfg.text}`}
      aria-label={`Status: ${displayLabel}`}
    >
      {cfg.dot && <span className="status-dot-active" />}
      {displayLabel}
    </span>
  );
}
