const GAP = '  ';
const MORE = '…';

/** @type {HintsSection['render']} */
(entries) => {
  const budget = screen.renderer.width - 2;
  /** @type {any[]} */
  const chunks = [];
  let used = 0;
  let dropped = false;

  for (const { keys, label } of entries) {
    const gap = chunks.length === 0 ? '' : GAP;
    const width = gap.length + keys.length + 1 + label.length;
    if (used + width > budget) {
      dropped = true;
      break;
    }
    if (gap !== '') chunks.push(tui.fg(config.theme.muted)(gap));
    chunks.push(tui.fg(config.theme.accent)(keys), tui.fg(config.theme.muted)(` ${label}`));
    used += width;
  }

  if (dropped && used + MORE.length <= budget) chunks.push(tui.fg(config.theme.muted)(MORE));

  self.text.content = chunks.length === 0 ? '' : new tui.StyledText(chunks);
};
