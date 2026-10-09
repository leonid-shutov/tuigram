/** @type {Actions['sendFile']} */
async (filePath) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  const fileName = node.path.basename(filePath);
  const pending = Message.pending('', [
    { type: 'document', fileId: '', fileName, mimeType: 'application/octet-stream' },
  ]);
  store.chat.append(pending);
  ui.chat.selectLast();

  const sent = await Result.fromPromise(messenger.sendFile(chatId, filePath));
  if (!sent.ok) {
    store.chat.drop(pending.id);
    ui.errors.report('Could not send the file.', sent.error);
  } else {
    const message = sent.unwrap();
    store.chat.confirm(pending.id, message);

    store.dialogs.receive(message);
  }
};
