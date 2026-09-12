/** @type {typeof Fuzzy.score} */
(query, text) => {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  let score = 0;
  let from = 0;
  let previous = -2;

  for (const ch of q) {
    const at = t.indexOf(ch, from);
    if (at === -1) return null;

    if (at === 0 || /[\s_\-./]/.test(t[at - 1])) score += 10; // word-start bonus
    if (at === previous + 1) score += 5; // contiguous bonus
    score -= at - from; // gap penalty

    previous = at;
    from = at + 1;
  }

  return score;
};
