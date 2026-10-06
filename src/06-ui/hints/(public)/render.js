const GAP = '  ';
const MORE = '…';
/** @type {Record<HintPriority, number>} */
const RANK = { essential: 0, normal: 1, obvious: 2 };

/** @type {HintsSection['render']} */
(entries) => {
  const budget = screen.size.width - 2;

  // Most important first, so the keys nobody would guess sit leftmost and a narrow bar cuts from the
  // right. The sort is stable: within a level, hints keep their declared order. A hint that does not
  // fit is skipped rather than ending the bar: a shorter one after it may still fit.
  const ranked = [...entries].sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  /** @type {Hint[]} */
  const chosen = [];
  let used = 0;
  let dropped = false;
  for (const hint of ranked) {
    const gap = chosen.length === 0 ? 0 : GAP.length;
    const width = gap + hint.keys.length + 1 + hint.label.length;
    if (used + width > budget) {
      dropped = true;
      continue;
    }
    chosen.push(hint);
    used += width;
  }

  /** @type {any[]} */
  const chunks = [];
  for (const hint of chosen) {
    if (chunks.length > 0) chunks.push(tui.fg(config.theme.muted)(GAP));
    chunks.push(tui.fg(config.theme.accent)(hint.keys), tui.fg(config.theme.muted)(` ${hint.label}`));
  }

  if (dropped && used + MORE.length <= budget) chunks.push(tui.fg(config.theme.muted)(MORE));

  self.text.content = chunks.length === 0 ? '' : new tui.StyledText(chunks);
};
