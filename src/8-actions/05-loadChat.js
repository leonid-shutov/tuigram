/** @type {Actions['loadChat']} */
async (chatId) => {
  // The generator is inert until the first next(), so it is safe to build before opening.
  const pager = messenger.getHistory(chatId, 30, 20);
  store.chat.open(chatId, pager);
  ui.sections.chat.clear();

  const [{ value }, readUpTo] = await Promise.all([pager.next(), messenger.getReadOutboxMaxId(chatId)]);

  // The user may have opened another chat while this one was loading.
  if (store.chat.chatId !== chatId) return;

  store.chat.setReadUpTo(readUpTo);
  for (const message of value.toReversed()) {
    store.chat.append(message);
    ui.sections.chat.append(message);
  }
  ui.sections.chat.setReceipt(store.chat.receipt());
  ui.sections.chat.selectLast();

  store.dialogs.markRead(chatId);
  self.repaintDialogs();
  void messenger.readHistory(chatId);
};
