ui.sections.messagePrompt.on('send', (text) => void store.chat.send(text));

void ui.sections.messagePrompt.on('exit', () => self.select('chat'));
