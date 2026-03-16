'use client';

import { useEffect, useState } from 'react';

export interface KPIMetric {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

interface KPIBarProps {
  metrics: KPIMetric[];
}

function DeltaBadge({ delta, dir }: { delta: string; dir: 'up' | 'down' | 'neutral' }) {
  const styles = {
    up:      'bg-g100 text-g700',
    down:    'bg-r100 text-r700',
    neutral: 'bg-[#F1F3F4] text-ts',
  };
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-11 font-medium num ${styles[dir]}`}>
      {arrow} {delta}
    </span>
  );
}

function SkeletonPulse() {
  return (
    <div className="space-y-2">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-7 w-28 rounded" />
      <div className="skeleton h-4 w-16 rounded" />
    </div>
  );
}

export function KPIBar({ metrics }: KPIBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="bg-surface rounded-xl border border-bdr shadow-card flex items-stretch"
      role="region"
      aria-label="Key performance indicators"
    >
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className={`flex-1 px-5 py-4 ${i < metrics.length - 1 ? 'border-r border-bdr' : ''}`}
        >
          {!mounted || metric.loading ? (
            <SkeletonPulse />
          ) : (
            <>
              <p className="text-12 font-medium text-tt mb-1 tracking-wide">{metric.label}</p>
              <p className="text-24 font-semibold text-tp num leading-tight mb-1.5">
                {metric.value}
              </p>
              {metric.delta && metric.deltaDir && (
                <DeltaBadge delta={metric.delta} dir={metric.deltaDir} />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
