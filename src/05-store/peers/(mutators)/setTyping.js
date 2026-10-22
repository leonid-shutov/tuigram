// Telegram holds a typing status for 6 seconds and has the typist send it again to keep it up, so
// each one ends on its own unless renewed in time.
const HOLDS_MS = 6000;

Mutation(
  self,
  /** @type {PeersStoreSelf['setTyping']} */
  (chatId, userId, status) => {
    const typists = self.typing.get(chatId) ?? new Map();
    const typist = typists.get(userId);
    if (typist !== undefined) {
      node.timers.clearTimeout(typist.timer);
      typists.delete(userId);
    }
    if (status !== null) {
      const timer = node.timers.setTimeout(() => self.setTyping(chatId, userId, null), HOLDS_MS);
      timer.unref();
      typists.set(userId, { status, timer });
    }
    if (typists.size > 0) self.typing.set(chatId, typists);
    else self.typing.delete(chatId);
  },
);
