(() =>
  async function* (chatId, pageSize) {
    const cachedMessages = module.cache.chats.get(chatId) ?? [];
    cachedMessages.forEach(yield);

    let offset;
    while (true) {
      const params = { offset, limit: pageSize };
      const messages = await messenger.tg.getHistory(chatId, params);

      cachedMessages.push(messages);
      yield messages;

      if (messages.next === undefined) return;
      offset = messages.next;
    }
  })();
