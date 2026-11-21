const RUN_LINE = config.theme.borderChars?.vertical ?? '│';
const RUN_END = config.theme.borderChars ? RUN_LINE : '╵';
const RUN_FG = tui.parseColor(config.theme.muted);
const RUN_BG = tui.parseColor(config.theme.bg);

// Drawn after the posts are laid out, clipped to the viewport, so the bar scrolls and clips with
// them; nothing else paints in the gutter, so painting after them changes nothing. One bar spans
// the gaps, day separators and the posts of a run between the two ends, and its head stays on the
// viewport's first row while the run's top is scrolled away. The monkey is two cells wide, and its
// right half sits over the line: in a right gutter the line takes the outer column, in a left one
// the middle, so the monkey stays inside the gutter either way.
/** @param {PostView} view */
const columnBeside = ({ style, root }) =>
  style.gutter === 'left' ? root.screenX - Post.GUTTER + 1 : root.screenX + root.width + Post.GUTTER - 1;

/** @type {ChatSelf['drawOutboxUnread']} */
(buffer) => {
  const first = self.views.at(self.marks.outboxUnreadFrom)?.root ?? null;
  const last = self.views.at(self.views.length - 1) ?? null;
  if (first === null || last === null) return;
  const x = columnBeside(last);
  const bottom = last.root.screenY + last.root.height - 1;
  const { viewport } = self.scroll;
  const head = Math.max(first.screenY, viewport.screenY);
  if (head > bottom) return;
  buffer.pushScissorRect(viewport.screenX, viewport.screenY, viewport.width, viewport.height);
  for (let y = head + 1; y < bottom; y++) buffer.drawText(RUN_LINE, x, y, RUN_FG, RUN_BG);
  if (bottom > head) buffer.drawText(RUN_END, x, bottom, RUN_FG, RUN_BG);
  if (config.receipt === 'tick') buffer.drawText('✓', x, head, RUN_FG, RUN_BG);
  else buffer.drawText('🙈', x - 1, head, RUN_FG, RUN_BG);
  buffer.popScissorRect();
};
