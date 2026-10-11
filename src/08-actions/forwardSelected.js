// The forward goes out as soon as a chat is picked, and focus returns to the source chat, so
// several messages can be forwarded in a row.
/** @type {Actions['forwardSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (!Message.isConfirmed(message)) return;
  const dialogs = store.dialogs.all();
  ui.picker.open({
    title: ` ${keymap.commands.chat['chat.forward'].title} `,
    placeholder: 'Forward to…',
    pickHint: 'Forward',
    items: dialogs.map(Dialog.toPickerItem),
    /** @param {number} toChatId */
    onPick: async (toChatId) => {
      navigation.select('chat');
      const sent = await Result.fromPromise(messenger.forwardMessage(message.chatId, message, toChatId));
      if (!sent.ok) {
        ui.errors.report('Could not forward the message.', sent.error);
        return;
      }
      // The same path as a message from the stream: it dedupes against the update that follows,
      // and lands the bubble when the forward went into the chat that is open.
      actions.receiveMessage(sent.unwrap());
      const name = dialogs.find((dialog) => dialog.chatId === toChatId)?.name ?? 'chat';
      ui.chat.flashStatus(`forwarded to ${name}`);
    },
  });
  navigation.select('picker');
};
