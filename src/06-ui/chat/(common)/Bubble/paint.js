/** @param {import('@opentui/core').TextRenderable} node @param {string} content */
const put = (node, content) => {
  node.content = content;
  node.visible = content !== '';
};

const BAR = '▎';
// A line past this is clipped, so a long quote never widens the bubble past a picture's width.
const QUOTE_CELLS = 40;

/** @param {string} line */
const clipQuote = (line) => {
  const flat = line.replaceAll(/\s+/g, ' ');
  return Cells.width(flat) > QUOTE_CELLS ? `${Cells.clip(flat, QUOTE_CELLS - 1)}…` : flat;
};

// Two rows whatever state the reply is in, so resolving it never changes the bubble's height:
// unresolved it is `…` under `…`; with no one to name (a deleted original, a story) it is the
// one line it has over a bare bar.
/** @param {NonNullable<import('../../../../../types/domain').Message['replyTo']>} replyTo */
const paintQuote = ({ sender, preview, deleted }) => {
  const { muted } = config.theme;
  if (sender === null && (deleted || preview !== null)) {
    const bar = tui.fg(muted)(BAR);
    const only = deleted ? 'Deleted message' : String(preview);
    const line = tui.fg(muted)(tui.italic(clipQuote(only)));
    return new tui.StyledText([bar, line, tui.fg(muted)(`\n${BAR}`)]);
  }
  const color = sender === null ? muted : Bubble.senderColor(String(sender.id ?? sender.displayName));
  return new tui.StyledText([
    tui.fg(color)(BAR),
    tui.fg(color)(tui.bold(clipQuote(sender?.displayName ?? '…'))),
    tui.fg(color)(`\n${BAR}`),
    tui.fg(muted)(clipQuote(preview ?? (sender === null ? '…' : 'Message'))),
  ]);
};

/** @type {typeof Bubble.paint} */
(view) => {
  const { message, mediumIndex, picture, reply, label, counter, text } = view;
  reply.visible = message.replyTo !== null;
  if (message.replyTo !== null) reply.content = paintQuote(message.replyTo);
  const { media } = message;
  const medium = media[mediumIndex] ?? null;
  const drawn = picture !== null && Media.isImage(medium);
  if (picture !== null) {
    picture.visible = drawn;
    if (drawn) picture.source = medium.thumb ?? medium.preview ?? undefined;
  }
  put(label, medium === null || (drawn && medium.type === 'photo') ? '' : Media.label(medium));
  put(counter, media.length > 1 ? `‹ ${mediumIndex + 1}/${media.length} ›` : '');
  put(text, message.text);
};
