/** @type {Actions['sendFile']} */
async (filePath, replyTo = null) => {
  const chatId = store.chat.chatId;
  if (chatId === null) return;

  const fileName = node.path.basename(filePath);
  const quoted = replyTo === null ? null : { id: replyTo, ...Message.quote(store.chat.findConfirmed(replyTo)) };
  const pending = Message.pending(
    '',
    [{ type: 'document', fileId: '', fileName, mimeType: 'application/octet-stream' }],
    quoted,
  );
  store.chat.append(pending);
  ui.chat.selectLast();

  const sent = await Result.fromPromise(messenger.sendFile(chatId, filePath, { replyTo: replyTo ?? undefined }));
  if (!sent.ok) {
    store.chat.drop(pending.id);
    ui.errors.report('Could not send the file.', sent.error);
  } else {
    const message = sent.unwrap();
    store.chat.confirm(pending.id, message);
    actions.loadReplies([message]);

    store.dialogs.receive(message);
  }
};
