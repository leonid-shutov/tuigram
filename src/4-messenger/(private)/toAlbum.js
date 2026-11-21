// Telegram sends an album as one message per picture. Here they become the one message the rest
// of the app sees: the part carrying the caption (or the first part, when there is none) gives
// the message its id and text, so an edit lands on the right Telegram message, and every part
// gives its medium, in the order they were sent. Reactions sit on a single part, and not
// necessarily the captioned one, so the album takes the first part that has any.
/** @type {MessengerSelf['toAlbum']} */
(parts) => {
  const sorted = parts.toSorted((a, b) => a.id - b.id).map((part) => self.toMessage(part));
  const captioned = sorted.find(({ text }) => text !== '') ?? sorted[0];
  const reacted = sorted.find(({ reactions }) => reactions.length > 0) ?? captioned;
  return {
    ...captioned,
    media: sorted.flatMap(({ media }) => media),
    reactions: reacted.reactions,
    partIds: sorted.map(({ id }) => id),
  };
};
