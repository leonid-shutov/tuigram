// A chat is cached before anything is fetched for it, so whatever arrives meanwhile lands in it, and
// its first page then lands underneath with no gap between them.
Mutation(
  self,
  /** @type {ChatStoreSelf['cache']} */
  (chatId) => {
    const chat = self.getById(chatId) ?? { messages: [] };
    self.chats.delete(chatId);
    self.chats.set(chatId, chat);
    self.evict();
  },
);
