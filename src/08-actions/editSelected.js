/** @type {Actions['editSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  if (!message.sender.isSelf || message.pending) return;
  ui.messagePrompt.edit(message.id, message.text);
  navigation.select('messagePrompt');
};
