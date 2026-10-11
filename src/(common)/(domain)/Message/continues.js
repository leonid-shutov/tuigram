const BURST_MS = 5 * 60 * 1000;

/** @type {typeof Message.continues} */
(previous, message) => {
  if (previous === undefined) return false;
  const a = previous.sender;
  const b = message.sender;
  const sameSender = a.isSelf || b.isSelf ? a.isSelf === b.isSelf : a.id === b.id;
  if (!sameSender || Day.key(previous.date) !== Day.key(message.date)) return false;
  return message.date.getTime() - previous.date.getTime() < BURST_MS;
};
