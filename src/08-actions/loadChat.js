/** @type {Actions['loadChat']} */
async (chatId) => {
  // The generator is inert until the first next(), so it is safe to build before opening.
  const pager = messenger.getHistory(chatId, 30, 50);
  store.chat.open(chatId, pager);
  const dialog = store.dialogs.find(chatId);
  ui.chat.open(chatId, dialog?.name ?? '');
  if (dialog?.isUser) {
    void messenger.getPresence(chatId).then((presence) => {
      if (store.chat.chatId !== chatId) return;
      store.chat.setPresence(presence);
    });
  }

  const [{ value }, readUpTo] = await Promise.all([pager.next(), messenger.getReadOutboxMaxId(chatId)]);

  // The pager, not the chat id: reopening the same chat mid-load makes a new one, and the stale
  // load must not add its page a second time.
  if (store.chat.pager !== pager) return;

  store.chat.setReadUpTo(readUpTo);
  const messages = value.toReversed();
  store.chat.seed(messages);
  ui.chat.selectLast();
  for (const message of messages) actions.loadThumb(message);

  store.dialogs.markRead(chatId);
  void messenger.readHistory(chatId).catch((error) => Crash.soft(error));
};
