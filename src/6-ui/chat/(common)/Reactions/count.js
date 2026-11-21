// A channel's counts run into the thousands; past three digits they shorten the way Telegram's
// own clients do, so the row stays short: 1.2K, 12K, 3.4M.
/** @type {typeof Reactions.count} */
(count) => {
  if (count < 1000) return String(count);
  const [value, unit] = count < 1_000_000 ? [count / 1000, 'K'] : [count / 1_000_000, 'M'];
  const digits = value < 10 ? 1 : 0;
  return `${Number(value.toFixed(digits))}${unit}`;
};
