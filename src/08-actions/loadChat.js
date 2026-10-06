/** @type {Actions['loadChat']} */
async (chatId) => {
  // The generator is inert until the first next(), so it is safe to build before opening.
  const pager = messenger.getHistory(chatId, 30, 50);
  store.chat.open(chatId, pager);
  ui.chat.clear();
  const dialog = store.dialogs.find(chatId);
  ui.chat.setHeader(chatId, dialog?.name ?? '');
  if (dialog?.isUser) {
    void messenger.getPresence(chatId).then((presence) => {
      if (store.chat.chatId !== chatId) return;
      store.chat.setPresence(presence);
      actions.repaintPresence();
    });
  }

  const [{ value }, readUpTo] = await Promise.all([pager.next(), messenger.getReadOutboxMaxId(chatId)]);

  if (store.chat.chatId !== chatId) return;

  store.chat.setReadUpTo(readUpTo);
  for (const message of value.toReversed()) {
    store.chat.append(message);
    ui.chat.append(message);
    actions.loadThumb(message);
  }
  actions.repaintReceipt();
  ui.chat.selectLast();

  store.dialogs.markRead(chatId);
  actions.repaintDialogs();
  void messenger.readHistory(chatId).catch((error) => Crash.soft(error));
};
