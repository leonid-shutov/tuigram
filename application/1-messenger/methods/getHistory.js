(() =>
  async function* (chatId, pageSize) {
    console.log('get history from cache');
    const cachedMessages = $.cache.chats.read(chatId);
    if (cachedMessages.length > 0) yield cachedMessages;

    let offset = undefined;

    while (true) {
      const params = { offset, limit: pageSize };

      // the first message in the array is the most recent message in the chat
      console.log('get history from tg');
      const history = await messenger.tg.getHistory(chatId, params);

      const messages = history.map(({ id, text, sender }) => ({ id, text, sender: Obj.pick(sender, ['isSelf']) }));

      $.cache.chats.append(chatId, messages);

      yield messages;

      if (messages.next === undefined) return;
      offset = messages.next;
    }
  })();
