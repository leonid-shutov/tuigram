// Telegram sends an album as one message per picture. Here they become the one message the rest
// of the app sees: the part carrying the caption (or the first part, when there is none) gives
// the message its id and text, so an edit lands on the right Telegram message, and every part
// gives its medium, in the order they were sent.
/** @type {MessengerSelf['toAlbum']} */
(parts) => {
  const sorted = parts.toSorted((a, b) => a.id - b.id);
  const captioned = sorted.find(({ text }) => text !== '') ?? sorted[0];
  return { ...self.toMessage(captioned), media: sorted.flatMap((part) => self.toMessage(part).media) };
};
