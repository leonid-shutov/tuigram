/** @type {Actions['send']} */
async (text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  // Show the message straight away; the server's copy replaces it when it lands.
  const pending = Message.pending(text);
  store.chat.append(pending);
  ui.chat.append(pending);
  ui.chat.setReceipt(store.chat.receipt());

  const message = await messenger.sendMessage(chatId, text);
  if (store.chat.confirm(pending.id, message)) {
    ui.chat.confirm(pending.id, message.id);
    ui.chat.setReceipt(store.chat.receipt());
  }

  store.dialogs.receive(message);
  self.repaintDialogs();
};
