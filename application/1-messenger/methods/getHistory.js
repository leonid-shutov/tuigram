(() =>
  async function* (pageSize) {
    const clientId = messenger.clientId;

    let offset;
    while (true) {
      const params = { offset, limit: pageSize };
      const messages = await tg.getHistory(clientId, params);

      yield messages;

      if (messages.next === undefined) return;
      offset = messages.next;
    }
  })();
