// Strict on purpose: the whole text, one token, http(s) only. Anything looser would hand a
// stranger's `file://` — or a word with a dot in it — to the OS's default handler.
/** @type {typeof Link.only} */
(text) => {
  const trimmed = text.trim();
  if (trimmed === '' || /\s/u.test(trimmed)) return null;
  const url = node.url.URL.parse(trimmed);
  if (url === null) return null;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url.href;
};
