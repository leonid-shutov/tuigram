/** @type {typeof Day.label} */
(date, now = new Date()) => {
  const key = Day.key(date);
  if (key === Day.key(now)) return 'Today';
  // Stepping the calendar rather than subtracting 24h keeps month ends and DST shifts right.
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === Day.key(yesterday)) return 'Yesterday';
  const year = date.getFullYear() === now.getFullYear() ? undefined : 'numeric';
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year });
};
