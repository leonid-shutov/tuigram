/** @type {Actions['windowFocus']} */
() => {
  store.window.focused = true;
  // What landed while the window was away is unread to us: it gets the divider before it is read.
  const chatId = store.chat.openChatId;
  const dialog = chatId === null ? null : store.dialogs.find(chatId);
  if (chatId !== null && dialog !== null) store.chat.holdInboxUnread(chatId, Dialog.inboxUnread(dialog));
  actions.readOpenChat();
};
