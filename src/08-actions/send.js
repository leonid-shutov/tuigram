/** @type {Actions['send']} */
async (text, replyTo = null) => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return;

  // The original is on screen — it was just picked — so the pending bubble quotes it at once.
  const quoted = replyTo === null ? null : { id: replyTo, ...Message.quote(store.chat.findConfirmed(chatId, replyTo)) };
  const pending = Message.pending(text, [], quoted);
  store.chat.append(chatId, pending);
  ui.chat.selectLast();

  const sent = await Result.fromPromise(messenger.sendMessage(chatId, text, replyTo ?? undefined));
  if (!sent.ok) {
    store.chat.drop(chatId, pending.id);
    ui.errors.report('Could not send the message.', sent.error);
  } else {
    // In a private chat or a basic group Telegram answers with a short update, which mtcute
    // rebuilds without the reply header: the pending copy's quote is the one that knows.
    const answer = sent.unwrap();
    const message = { ...answer, replyTo: answer.replyTo ?? pending.replyTo };
    store.chat.confirm(chatId, pending.id, message);
    actions.loadReplies([message]);

    store.dialogs.receive(message);
  }
};
