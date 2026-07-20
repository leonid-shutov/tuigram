(() =>
  async function* (chunkSize) {
    console.log('get dialogs from cache');

    const cachedDialogs = self.cache.dialogs.read();
    if (cachedDialogs.length > 0) yield cachedDialogs;

    console.log('get dialogs from tg');
    const iterator = messenger.tg.iterDialogs({ chunkSize });
    let page = [];
    for await (const dialog of iterator) {
      page.push({
        chatId: dialog.lastMessage.chat.id,
        name: dialog.peer.displayName,
        lastMessage: dialog.lastMessage.text,
      });
      if (page.length === chunkSize) {
        self.cache.dialogs.append(page);
        yield page;
        page = [];
      }
    }
    if (page.length > 0) yield page;
  })();
