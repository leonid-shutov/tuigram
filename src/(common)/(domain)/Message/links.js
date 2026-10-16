/** @type {typeof Message.links} */
(message) => {
  /** @type {Map<string, string>} */
  const labels = new Map();
  for (const { offset, length, kind, url } of message.entities) {
    if (kind !== 'link' || !url || url.startsWith('mailto:') || labels.has(url)) continue;
    labels.set(url, message.text.slice(offset, offset + length));
  }
  return [...labels].map(([url, label]) => ({ label, url }));
};
