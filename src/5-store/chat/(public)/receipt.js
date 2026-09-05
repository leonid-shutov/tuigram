// Whether the chat should advertise a read receipt, and which one. Only our own last
// message carries one — there is nothing to report about someone else's.
/** @type {ChatStore['receipt']} */
() => {
  const last = self.messages.at(-1);
  if (last === undefined || !last.sender.isSelf) return null;
  return !last.pending && last.id <= self.readUpTo ? 'read' : 'unread';
};
