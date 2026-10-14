// The chats cached longest ago go first. The open chat always stays, even when chats cached after
// it — the top of the chat list, preloaded at start — have left it first in line.
/** @type {ChatStoreSelf['evict']} */
() => {
  for (const chatId of self.chats.keys()) {
    if (self.chats.size <= config.history.maxCachedChats) break;
    if (!self.isOpen(chatId)) self.chats.delete(chatId);
  }
};
