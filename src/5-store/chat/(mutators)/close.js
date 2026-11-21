// The open chat is left with none in its place. Not a `Mutation`: the store emits only for the
// open chat, and once this has run there is none, so the repaints are told directly.
/** @type {ChatStoreSelf['close']} */
() => {
  const left = self.opened;
  if (left === null) return;
  self.trim(left);
  self.openChatId = null;
  self.inboxUnread = null;
  self.emitter.emit('change');
};
