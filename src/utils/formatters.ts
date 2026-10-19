export const formatCurrency = (amount: number): string => {
  // Never crash on null/undefined/NaN values from persisted data
  const safe = typeof amount === 'number' && !isNaN(amount) && isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
};

export const formatPercent = (rate: number): string => {
  const safe = typeof rate === 'number' && !isNaN(rate) ? rate : 0;
  return `${safe.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const calculateDaysRemaining = (targetDate: string): number => {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Time-aware greeting based on the user's real local clock.
 * Shared by the login page and dashboard so they always agree.
 *   before noon  -> "Good morning"
 *   noon to 6pm  -> "Good afternoon"
 *   after 6pm    -> "Good evening"
 */
export const getTimeGreeting = (d: Date = new Date()): string => {
  // Guard against an invalid/corrupted date
  if (!d || isNaN(d.getTime())) return 'Good day';
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/** Current time formatted like "2:17:04 PM" — null-safe */
export const formatTime = (d: Date = new Date()): string => {
  if (!d || isNaN(d.getTime())) return '';
  try {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
};

/** Current date formatted like "Wednesday, March 4, 2026" — null-safe */
export const formatLongDate = (d: Date = new Date()): string => {
  if (!d || isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};
