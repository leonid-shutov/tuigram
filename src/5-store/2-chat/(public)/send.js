// The whole round trip: a pending message the chat can draw immediately, the network call, then
// the server's version swapped in and folded into the dialog list so the chat bumps to the top.
/** @type {ChatStore['send']} */
async (text) => {
  const chatId = self.chatId;
  if (chatId === undefined) return;
  const pending = Message.pending(text, chatId, store.dialogs.find(chatId)?.name ?? '');
  self.append(pending);
  const message = await messenger.sendMessage(chatId, text);
  self.confirm(pending.id, message);
  store.dialogs.applyMessage(message);
};
