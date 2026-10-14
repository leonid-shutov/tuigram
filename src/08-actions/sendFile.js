/** @type {Actions['sendFile']} */
async (filePath, replyTo = null) => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return;

  const fileName = node.path.basename(filePath);
  const quoted = replyTo === null ? null : { id: replyTo, ...Message.quote(store.chat.findConfirmed(chatId, replyTo)) };
  const pending = Message.pending(
    '',
    [{ type: 'document', fileId: '', fileName, mimeType: 'application/octet-stream' }],
    quoted,
  );
  store.chat.append(chatId, pending);
  ui.chat.selectLast();

  const sent = await Result.fromPromise(messenger.sendFile(chatId, filePath, { replyTo: replyTo ?? undefined }));
  if (!sent.ok) {
    store.chat.drop(chatId, pending.id);
    ui.errors.report('Could not send the file.', sent.error);
  } else {
    const message = sent.unwrap();
    store.chat.confirm(chatId, pending.id, message);
    actions.loadReplies([message]);

    store.dialogs.receive(message);
  }
};
