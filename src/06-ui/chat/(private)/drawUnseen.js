const RUN_LINE = config.theme.borderChars?.vertical ?? '│';
const RUN_END = config.theme.borderChars ? RUN_LINE : '╵';
const RUN_HEAD = config.theme.borderChars?.topRight ?? '╮';
const RUN_FG = tui.parseColor(config.theme.muted);
const RUN_BG = tui.parseColor(config.theme.bg);

// Drawn before the bubbles paint but after they are laid out, inside the viewport's scissor, so the
// bar scrolls and clips with them; nothing else paints in the gutter. One bar spans the gaps, day
// separators and grouped bubbles between the two ends, and its head stays on the viewport's first
// row while the run's top is scrolled away. The monkey is two cells wide, so no one-cell line can sit
// under its middle: it hangs to the left of the head, and the line turns down out of a corner.
/** @type {ChatSelf['drawUnseen']} */
(buffer) => {
  const first = self.views.at(self.unseenFrom)?.box ?? null;
  const last = self.views.at(self.views.length - 1)?.box ?? null;
  if (first === null || last === null) return;
  const x = last.screenX + last.width + Bubble.GUTTER - 1;
  const bottom = last.screenY + last.height - 1;
  const head = Math.max(first.screenY, self.scroll.viewport.screenY);
  if (head > bottom) return;
  for (let y = head + 1; y < bottom; y++) buffer.drawText(RUN_LINE, x, y, RUN_FG, RUN_BG);
  if (bottom > head) {
    buffer.drawText(RUN_HEAD, x, head, RUN_FG, RUN_BG);
    buffer.drawText(RUN_END, x, bottom, RUN_FG, RUN_BG);
  }
  buffer.drawText('🙈', x - 2, head, RUN_FG, RUN_BG);
};
