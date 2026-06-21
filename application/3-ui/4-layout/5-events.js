const { dialogs, chat, messagePrompt } = ui.sections;

dialogs.on('open', (dialog) => {
  chat.open(dialog.chatId);
  $.select('chat');
});

messagePrompt.on('send', async (text) => {
  const tempId = chat.addPendingMessage(text);
  const message = await messenger.sendMessage(chat.chatId, text);
  chat.confirmMessage(tempId, message);
});
