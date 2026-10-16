const QUOTE_BAR = '▎';

/** @param {string} text @param {number} at */
const startsLine = (text, at) => at === 0 || text[at - 1] === '\n';

// The text is cut at every point where some entity starts or ends, and each piece takes the style
// of every entity covering it, so overlapping and nested spans (bold inside a link) need no tree.
// A quote is also cut at each of its line starts, where its bar goes. A spoiler stays readable,
// only dimmed: a terminal has nothing to tap to reveal it with.
/** @type {typeof Entities.paint} */
(text, entities) => {
  const { muted, code, link, accentAlt } = config.theme;
  /** @typedef {import('@opentui/core').TextChunk} TextChunk */
  /** @type {[import('../../../../types/domain').EntityKind, (input: TextChunk) => TextChunk][]} */
  const styles = [
    ['bold', tui.bold],
    ['italic', tui.italic],
    ['underline', tui.underline],
    ['strikethrough', tui.strikethrough],
    ['spoiler', tui.dim],
    ['code', tui.fg(code)],
    ['pre', tui.fg(code)],
    ['mention', tui.fg(accentAlt)],
    // Last, so a link inside code still reads as a link.
    ['link', (chunk) => tui.underline(tui.fg(link)(chunk))],
  ];

  const clamp = (/** @type {number} */ at) => Math.min(Math.max(at, 0), text.length);
  const spans = entities
    .map((entity) => ({ ...entity, start: clamp(entity.offset), end: clamp(entity.offset + entity.length) }))
    .filter(({ start, end }) => end > start);

  const cuts = new Set([0, text.length]);
  for (const { start, end, kind } of spans) {
    cuts.add(start);
    cuts.add(end);
    if (kind !== 'blockquote') continue;
    for (let at = text.indexOf('\n', start); at !== -1 && at < end - 1; at = text.indexOf('\n', at + 1)) {
      cuts.add(at + 1);
    }
  }
  const points = [...cuts].sort((a, b) => a - b);

  /** @type {import('@opentui/core').TextChunk[]} */
  const chunks = [];
  for (const [i, from] of points.slice(0, -1).entries()) {
    const to = points[i + 1];
    const covering = spans.filter(({ start, end }) => start <= from && end >= to);
    const kinds = new Set(covering.map(({ kind }) => kind));
    if (kinds.has('blockquote') && startsLine(text, from)) chunks.push(tui.fg(muted)(QUOTE_BAR));
    /** @type {import('@opentui/core').TextChunk} */
    let chunk = { __isChunk: true, text: text.slice(from, to) };
    for (const [kind, style] of styles) if (kinds.has(kind)) chunk = style(chunk);
    const url = covering.findLast(({ kind, url }) => kind === 'link' && url)?.url;
    if (url) chunk = tui.link(url)(chunk);
    chunks.push(chunk);
  }
  return new tui.StyledText(chunks);
};
