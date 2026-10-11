// The picker doubles as the confirmation: nothing goes until a choice is picked, and esc cancels.
/** @type {Actions['deleteSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (!Message.isConfirmed(message)) return;
  const { deleteScopes } = message;
  if (deleteScopes.length === 0) return void ui.chat.flashStatus('cannot delete this');
  const description = Message.preview(message) ?? '';
  const isPrivate = !message.isGroup && store.dialogs.find(message.chatId)?.isUser === true;
  /** @type {Record<DeleteScope, string>} */
  const names = {
    everyone: isPrivate ? `Delete for me and ${message.chatName}` : 'Delete for everyone',
    me: deleteScopes.length === 1 ? 'Delete' : 'Delete for me',
  };
  ui.picker.open({
    title: ` ${keymap.commands.chat['chat.delete'].title} `,
    placeholder: 'Delete…',
    pickHint: 'Delete',
    items: deleteScopes.map((scope) => ({ name: names[scope], description, value: scope })),
    /** @param {DeleteScope} scope */
    onPick: async (scope) => {
      navigation.select('chat');
      const deleted = await Result.fromPromise(messenger.deleteMessage(message.chatId, message, scope));
      if (!deleted.ok) return void ui.errors.report('Could not delete the message.', deleted.error);
      // mtcute does not dispatch the updates of our own delete, so the drop happens here.
      actions.dropMessages(message.chatId, [message.id]);
      ui.chat.flashStatus('deleted');
    },
  });
  navigation.select('picker');
};
