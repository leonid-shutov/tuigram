// A `min` set is the one Telegram sends everyone alike: right counts, but nothing about which of
// them are ours. Those reactions say so with `mine: null`, for `Message.mergeReactions` to fill
// in from what was known before.
/** @type {MessengerSelf['toReactions']} */
(reactions) => {
  if (reactions === null) return [];
  const { min = false } = reactions.raw;
  return reactions.reactions.map((reaction) => {
    const { emoji, count, isPaid } = reaction;
    const isCustom = typeof emoji !== 'string';
    const key = isPaid ? 'paid' : isCustom ? `custom:${emoji}` : emoji;
    return { key, emoji: isCustom ? null : emoji, count, mine: min ? null : reaction.order !== null };
  });
};
