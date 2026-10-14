/** @type {typeof Message.receipt} */
(last, readUpTo) => {
  if (last === undefined || !last.sender.isSelf) return null;
  return !last.pending && last.id <= readUpTo ? 'read' : 'unread';
};
