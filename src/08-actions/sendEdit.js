/** @type {Actions['sendEdit']} */
async (messageId, text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;
  const current = store.chat.messages.find(({ id }) => id === messageId);
  if (current === undefined || current.text === text) return;
  if (text.trim() === '') return void ui.chat.flashStatus('cannot be empty');

  ui.chat.setStatus('editing…');

  const edited = await Result.fromPromise(messenger.editMessage(chatId, messageId, text));
  if (!edited.ok) return void Crash.soft(edited.error, 'Could not edit the message.');
  const message = edited.unwrap();

  if (store.chat.chatId !== chatId) return;
  store.chat.replace(message);
  ui.chat.replace(message);

  const dialog = store.dialogs.find(chatId);
  if (dialog === null) Crash.hard(new Error(`dialog ${chatId} is not held`));
  if (dialog.lastMessage?.id === messageId) dialog.lastMessage = message;
  actions.repaintDialogs();

  actions.repaintReceipt();
};
