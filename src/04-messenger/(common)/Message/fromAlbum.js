// Telegram sends an album as one message per picture. Here they become the one message the rest
// of the app sees: the part carrying the caption (or the first part, when there is none) gives
// the message its id and text, so an edit lands on the right Telegram message, and every part
// gives its medium, in the order they were sent.
/** @type {typeof Message.fromAlbum} */
(parts) => {
  const sorted = parts.toSorted((a, b) => a.id - b.id);
  const captioned = sorted.find(({ text }) => text !== '') ?? sorted[0];
  return { ...Message.from(captioned), media: sorted.flatMap((part) => Message.from(part).media) };
};
