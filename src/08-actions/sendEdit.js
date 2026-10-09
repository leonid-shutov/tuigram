/** @type {Actions['sendEdit']} */
async (messageId, text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;
  const current = store.chat.messages.find(({ id }) => id === messageId);
  if (current === undefined || current.text === text) return;
  if (text.trim() === '') return void ui.chat.flashStatus('cannot be empty');

  ui.chat.setStatus('editing…');
  const edited = await Result.fromPromise(messenger.editMessage(chatId, messageId, text));
  ui.chat.clearStatus();
  if (!edited.ok) return void ui.errors.report('Could not edit the message.', edited.error);

  if (store.chat.chatId !== chatId) return;
  // Telegram answers with one album part, and a thumbnail may have landed while the edit was in
  // flight: the media stay the ones held now.
  const held = store.chat.messages.find(({ id }) => id === messageId);
  if (held === undefined) return;
  const message = { ...edited.unwrap(), media: held.media };
  store.chat.replace(message);
  actions.repaintChat();

  if (store.dialogs.find(chatId) === null) Crash.hard(new Error(`dialog ${chatId} is not held`));
  store.dialogs.replaceLast(message);
};
