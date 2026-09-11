/** @type {Actions['loadChat']} */
async (chatId) => {
  // The generator is inert until the first next(), so it is safe to build before opening.
  const pager = messenger.getHistory(chatId, 30, 20);
  store.chat.open(chatId, pager);
  ui.chat.clear();
  ui.chat.setHeader(chatId, store.dialogs.find(chatId)?.name ?? '');

  const [{ value }, readUpTo] = await Promise.all([pager.next(), messenger.getReadOutboxMaxId(chatId)]);

  // The user may have opened another chat while this one was loading.
  if (store.chat.chatId !== chatId) return;

  store.chat.setReadUpTo(readUpTo);
  for (const message of value.toReversed()) {
    store.chat.append(message);
    ui.chat.append(message);
    self.loadThumb(message);
  }
  actions.repaintReceipt();
  ui.chat.selectLast();

  store.dialogs.markRead(chatId);
  self.repaintDialogs();
  void messenger.readHistory(chatId);
};
