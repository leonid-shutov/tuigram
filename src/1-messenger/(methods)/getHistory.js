(() =>
  async function* (chatId, pageSize) {
    let offset = undefined;

    while (true) {
      const params = { offset, limit: pageSize };

      // the first message in the array is the most recent message in the chat
      const history = await messenger.tg.getHistory(chatId, params);

      const messages = history.map(Message.from);

      yield messages;

      if (messages.next === undefined) return;
      offset = messages.next;
    }
  })();
