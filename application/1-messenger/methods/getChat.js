(chatId) => {
  const cachedChat = module.cache.chats.get(chatId);
  return cachedChat ?? [];
};
