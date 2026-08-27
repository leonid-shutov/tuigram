(() =>
  /** @type {MessengerModule['getHistory']} */
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  (async function* (chatId, firstPageSize, pageSize = firstPageSize) {
    let offset = undefined;
    let limit = firstPageSize;

    while (true) {
      const params = { offset, limit };

      // the first message in the array is the most recent message in the chat
      const history = await messenger.tg.getHistory(chatId, params);

      const messages = history.map(Message.from);

      yield messages;

      if (history.next === undefined) return;
      offset = history.next;
      limit = pageSize;
    }
  }))();
