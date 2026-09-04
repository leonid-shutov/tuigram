// store.chat.open carries its own "already open" guard, so the layout no longer tracks which
// chat is open — it only moves focus and the list cursor.
/** @type {LayoutSelf['openChat']} */
(dialog) => {
  void store.chat.open(dialog.chatId);
  ui.sections.dialogs.select(dialog.chatId);
  self.select('chat');
};
