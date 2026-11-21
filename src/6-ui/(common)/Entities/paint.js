// The text is cut at every point where some entity starts or ends, and each piece takes the style
// of every entity covering it, so overlapping and nested spans (bold inside a link) need no tree.
// A quote is drawn as plain text for now: a bar led only its first row once a line wrapped. A
// spoiler stays readable, only dimmed: a terminal has nothing to tap to reveal it with.
/** @type {typeof Entities.paint} */
(text, entities) => {
  const { code, link, accentAlt } = config.theme;
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
  for (const { start, end } of spans) {
    cuts.add(start);
    cuts.add(end);
  }
  const points = [...cuts].sort((a, b) => a - b);

  /** @type {import('@opentui/core').TextChunk[]} */
  const chunks = [];
  for (const [i, from] of points.slice(0, -1).entries()) {
    const to = points[i + 1];
    const covering = spans.filter(({ start, end }) => start <= from && end >= to);
    const kinds = new Set(covering.map(({ kind }) => kind));
    /** @type {import('@opentui/core').TextChunk} */
    let chunk = { __isChunk: true, text: text.slice(from, to) };
    for (const [kind, style] of styles) if (kinds.has(kind)) chunk = style(chunk);
    const url = covering.findLast(({ kind, url }) => kind === 'link' && url)?.url;
    if (url) chunk = tui.link(url)(chunk);
    chunks.push(chunk);
  }
  return new tui.StyledText(chunks);
};
