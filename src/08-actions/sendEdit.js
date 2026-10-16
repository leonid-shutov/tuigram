/** @type {Actions['sendEdit']} */
async (messageId, text) => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return;
  const current = store.chat.findConfirmed(chatId, messageId);
  if (current === null || current.text === text) return;
  if (text.trim() === '') return void ui.chat.flashStatus('cannot be empty');

  ui.chat.setStatus('editing…');
  const edited = await Result.fromPromise(messenger.editMessage(chatId, messageId, text));
  ui.chat.clearStatus();
  if (!edited.ok) return void ui.errors.report('Could not edit the message.', edited.error);

  // Telegram answers with one album part, and a thumbnail may have landed while the edit was in
  // flight: the media stay the ones cached now, and so do the parts and the reactions, which may be
  // another part's. So does the reply, which comes back unresolved.
  const cached = store.chat.findConfirmed(chatId, messageId);
  if (cached === null) return;
  const { media, replyTo, reactions, partIds } = cached;
  const message = { ...edited.unwrap(), media, replyTo, reactions, partIds };
  store.chat.replace(chatId, message);

  if (store.dialogs.find(chatId) === null) Crash.hard(new Error(`dialog ${chatId} is not in the store`));
  // The list previews each dialog's last message, so only an edit of that one changes the dialog.
  if (store.dialogs.previews(chatId, messageId)) store.dialogs.setLast(chatId, message);
};
