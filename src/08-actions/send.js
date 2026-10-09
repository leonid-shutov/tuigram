/** @type {Actions['send']} */
async (text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  const pending = Message.pending(text);
  store.chat.append(pending);
  ui.chat.selectLast();

  const sent = await Result.fromPromise(messenger.sendMessage(chatId, text));
  if (!sent.ok) {
    store.chat.drop(pending.id);
    ui.errors.report('Could not send the message.', sent.error);
  } else {
    const message = sent.unwrap();
    store.chat.confirm(pending.id, message);

    store.dialogs.receive(message);
  }
};
