const { dialogs, messagePrompt } = ui.sections;

dialogs.on('open', (dialog) => self.openChat(dialog.chatId));

messagePrompt.on('send', async (text) => self.sendMessage(text));
