/**
 * Formatting utilities — all numbers pass through these functions.
 * Never display raw floats or unformatted values in the UI.
 */

/** $1,234.56 */
export function formatCurrency(n: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** $1.2M / $45.6K / $890 */
export function formatCurrencyCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `$${(n / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(n, 0);
}

/** 45.2% */
export function formatPercentage(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

/** 1.2M / 45.6K / 890 */
export function formatLargeNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

/** Always tabular: 1,234 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

/** CPM: $12.50 */
export function formatCPM(n: number): string {
  return formatCurrency(n, 2);
}

/** ROAS: 3.2x */
export function formatROAS(n: number): string {
  return `${n.toFixed(1)}x`;
}

/** Multiplier: 1.35x */
export function formatMultiplier(n: number): string {
  return `${n.toFixed(2)}x`;
}

/** Delta with sign: +12.3% or -4.5% */
export function formatDelta(n: number, type: 'percent' | 'currency' = 'percent'): string {
  const sign = n >= 0 ? '+' : '';
  if (type === 'currency') return `${sign}${formatCurrency(Math.abs(n), 0)}`;
  return `${sign}${n.toFixed(1)}%`;
}

/** Relative time: "2m ago", "1h ago", "just now" */
export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Date: "Mar 14, 2025" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Time: "14:32:07" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
