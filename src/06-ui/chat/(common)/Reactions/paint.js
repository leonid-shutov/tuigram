// A custom emoji is a sticker, so it gets a stand-in glyph: its count still adds up.
const CUSTOM = '✦';
// Past this many the rest fold into `+N`, so the row is always one line.
const SHOWN = 5;
const SPACING = ' ';
// Half discs round a filled chip's ends. They take the cells an unfilled chip pads with a space, so
// every chip stays the same width either way. Where they would come out as bumps — a terminal not
// known to draw them well, or a theme drawing its own borders (ascii-terminal) for a font without
// such glyphs — the ends stay square: padding inside the fill.
const CAPS = { round: ['◖', '◗'], square: [' ', ' '] };

/** @type {typeof Reactions.paint} */
(reactions) => {
  const { accent, muted, bg, borderChars } = config.theme;
  const round = screen.drawsHalfDiscs && !borderChars;
  const [left, right] = round ? CAPS.round : CAPS.square;
  const fill = tui.bg(accent);
  /** @type {import('@opentui/core').TextChunk[]} */
  const chunks = [];
  for (const [i, { emoji, count, mine }] of reactions.slice(0, SHOWN).entries()) {
    // A lone emoji already reads as one, and most reactions in a private chat are exactly that.
    const glyph = emoji ?? CUSTOM;
    const label = count > 1 ? `${glyph} ${Reactions.count(count)}` : glyph;
    if (i > 0) chunks.push(tui.fg(muted)(SPACING));
    if (mine) {
      const cap = round ? tui.fg(accent) : fill;
      chunks.push(cap(left), fill(tui.fg(bg)(tui.bold(label))), cap(right));
    } else {
      chunks.push(tui.fg(muted)(` ${label} `));
    }
  }
  const rest = reactions.length - SHOWN;
  if (rest > 0) chunks.push(tui.fg(muted)(`${SPACING}+${rest}`));
  return new tui.StyledText(chunks);
};
