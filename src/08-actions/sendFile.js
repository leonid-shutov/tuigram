/** @type {Actions['sendFile']} */
async (filePath) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  const fileName = node.path.basename(filePath);
  const pending = Message.pending('', { type: 'document', fileId: '', fileName, mimeType: 'application/octet-stream' });
  store.chat.append(pending);
  ui.chat.append(pending);
  ui.chat.selectLast();
  actions.repaintReceipt();

  const sent = await Result.fromPromise(messenger.sendFile(chatId, filePath));
  if (!sent.ok) {
    store.chat.drop(pending.id);
    ui.chat.drop(pending.id);
    actions.repaintReceipt();
    ui.errors.report('Could not send the file.', sent.error);
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
