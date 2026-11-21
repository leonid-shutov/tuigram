/** @type {Actions['replySelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (!Message.isConfirmed(message)) return;
  ui.messagePrompt.reply(message.id, Message.quote(message));
  navigation.select('messagePrompt');
};
