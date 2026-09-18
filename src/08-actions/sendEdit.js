/** @type {Actions['sendEdit']} */
async (messageId, text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;
  const current = store.chat.messages.find(({ id }) => id === messageId);
  if (current === undefined || current.text === text) return;
  if (text.trim() === '') return void ui.chat.flashStatus('cannot be empty');

  ui.chat.setStatus('editing…');

  let message;
  try {
    message = await messenger.editMessage(chatId, messageId, text);
  } catch {
    return void OS.notify('tuigram', 'Could not edit the message');
  }

  if (store.chat.chatId !== chatId) return;
  store.chat.replace(message);
  ui.chat.replace(message);

  const dialog = store.dialogs.find(chatId);
  if (dialog === null) throw new Error();
  if (dialog.lastMessage?.id === messageId) dialog.lastMessage = message;
  actions.repaintDialogs();

  actions.repaintReceipt();
};
