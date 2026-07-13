const { dialogs, messagePrompt } = ui.sections;

dialogs.on('open', (dialog) => self.openChat(dialog.chatId));
messagePrompt.on('send', self.sendMessage);
messenger.on('message', self.receiveMessage);
