/** @type {Actions['send']} */
async (text) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  const pending = Message.pending(text);
  store.chat.append(pending);
  ui.chat.append(pending);
  ui.chat.selectLast();
  actions.repaintReceipt();

  const sent = await Result.fromPromise(messenger.sendMessage(chatId, text));
  if (!sent.ok) {
    store.chat.drop(pending.id);
    ui.chat.drop(pending.id);
    actions.repaintReceipt();
    actions.reportError(sent.error, 'Could not send the message.');
  } else {
    const message = sent.unwrap();
    const outcome = store.chat.confirm(pending.id, message);
    if (outcome === 'confirmed') ui.chat.confirm(pending.id, message.id);
    else if (outcome === 'dropped') ui.chat.drop(pending.id);
    if (outcome !== 'gone') actions.repaintReceipt();

    store.dialogs.receive(message);
    actions.repaintDialogs();
  }
};
