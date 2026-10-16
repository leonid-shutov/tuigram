// The only targets worth handing a terminal or the OS: a link's target can be anything its sender
// chose, hidden behind other text, and a `file://` or `javascript:` must never become clickable.
const PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/** @type {typeof Link.safe} */
(url) => {
  const parsed = node.url.URL.parse(url);
  if (parsed === null || !PROTOCOLS.has(parsed.protocol)) return null;
  return parsed.href;
};
