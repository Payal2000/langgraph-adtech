'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface AllocationBarProps {
  label: string;
  iconLetter: string;
  iconColor: string;
  allocated: number;
  total: number;
  roas?: number;
  trend?: number;
  animated?: boolean;
}

export function AllocationBar({
  label,
  iconLetter,
  iconColor,
  allocated,
  total,
  roas,
  trend,
  animated = true,
}: AllocationBarProps) {
  const percentage = total > 0 ? (allocated / total) * 100 : 0;
  const [barWidth, setBarWidth] = useState(animated ? 0 : percentage);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animated && !animatedRef.current) {
      animatedRef.current = true;
      const timer = setTimeout(() => setBarWidth(percentage), 50);
      return () => clearTimeout(timer);
    }
  }, [animated, percentage]);

  return (
    <div className="space-y-1.5" role="meter" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {/* Label row */}
      <div className="flex items-center gap-2.5">
        {/* Platform icon */}
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-white"
          style={{ backgroundColor: iconColor, fontSize: 9, fontWeight: 700 }}
          aria-hidden="true"
        >
          {iconLetter}
        </div>
        <span className="text-13 font-medium text-tp flex-1 truncate">{label}</span>
        <span className="text-13 text-ts num">{formatCurrency(allocated, 0)}</span>
        <span className="text-12 font-medium text-tt num w-10 text-right">
          {formatPercentage(percentage, 0)}
        </span>
      </div>

      {/* Bar track */}
      <div className="h-2 rounded-full bg-bdr overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: iconColor,
            opacity: 0.85,
          }}
        />
      </div>

      {/* ROAS + trend */}
      {(roas !== undefined || trend !== undefined) && (
        <div className="flex items-center gap-3 pl-7">
          {roas !== undefined && (
            <span className="text-11 text-tt">ROAS <span className="text-tp font-medium num">{roas.toFixed(1)}x</span></span>
          )}
          {trend !== undefined && (
            <span className={`text-11 font-medium num ${trend >= 0 ? 'text-g700' : 'text-r700'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% WoW
            </span>
          )}
        </div>
      )}
    </div>
  );
}
