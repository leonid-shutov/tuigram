/** @type {Actions['send']} */
async (text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  // Show the message straight away; the server's copy replaces it when it lands.
  const pending = Message.pending(text);
  store.chat.append(pending);
  ui.chat.append(pending);
  actions.repaintReceipt();

  const message = await messenger.sendMessage(chatId, text);
  const outcome = store.chat.confirm(pending.id, message);
  // 'dropped': the update stream drew the server's copy first, so ours is the spare.
  if (outcome === 'confirmed') ui.chat.confirm(pending.id, message.id);
  else if (outcome === 'dropped') ui.chat.drop(pending.id);
  if (outcome !== 'gone') actions.repaintReceipt();

  store.dialogs.receive(message);
  self.repaintDialogs();
};
