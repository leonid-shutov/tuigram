// The incoming set is the truth for counts. Only where it doesn't know whose they are (a `min`
// set) does what we knew before stand: the same reaction cached as ours stays ours.
/** @type {typeof Message.mergeReactions} */
(cached, incoming) =>
  incoming.map((reaction) => {
    if (reaction.mine !== null) return reaction;
    const known = cached.find(({ key }) => key === reaction.key);
    return { ...reaction, mine: known?.mine ?? false };
  });
