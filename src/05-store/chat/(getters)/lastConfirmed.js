// The newest message the server has confirmed; a pending send of ours may sit below it.
/** @type {() => ChatStoreSelf['lastConfirmed']} */
() => self.messages.findLast(Message.isConfirmed) ?? null;
