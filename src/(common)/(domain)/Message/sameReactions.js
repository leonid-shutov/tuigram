/** @type {typeof Message.sameReactions} */
(a, b) =>
  a.reactions.length === b.reactions.length &&
  a.reactions.every(
    ({ key, count, mine }, i) =>
      key === b.reactions[i].key && count === b.reactions[i].count && mine === b.reactions[i].mine,
  );
