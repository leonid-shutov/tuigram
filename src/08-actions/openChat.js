/** @type {Actions['openChat']} */
async (chatId) => {
  ui.dialogs.select(chatId);
  navigation.select('chat');
  if (store.chat.isOpen(chatId)) return;

  ui.messagePrompt.reset();
  const dialog = store.dialogs.find(chatId);
  if (dialog === null) Crash.hard(new Error(`dialog ${chatId} is not in the store`));
  // Ahead of the store, so a cached chat renders against a cleared selection.
  ui.chat.open(chatId, dialog.name);
  store.chat.open(chatId);
  if (dialog.isUser) {
    void messenger.getPresence(chatId).then((presence) => store.chat.setPresence(chatId, presence));
  }

  if (store.chat.needsFirstPage(chatId)) {
    const loaded = await Result.fromPromise(actions.loadFirstPage(chatId));
    if (!loaded.ok) return void ui.errors.report('Could not load the chat.', loaded.error);
  } else {
    for (const message of store.chat.opened?.messages ?? []) {
      if (Message.isConfirmed(message)) actions.loadThumb(message);
    }
  }
  // Left while its page was in flight: the page is cached, but the chat on screen is another one.
  if (!store.chat.isOpen(chatId)) return;

  ui.chat.selectLast();
  store.dialogs.markRead(chatId);
  void messenger.readHistory(chatId).catch((error) => Crash.soft(error));
};
