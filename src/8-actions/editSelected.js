/** @type {Actions['editSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null || !Message.isEditable(message)) return;
  ui.messagePrompt.edit(message.id, message.text);
  navigation.select('messagePrompt');
};
