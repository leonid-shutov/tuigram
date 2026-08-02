ui.sections.messagePrompt.on('capture', (capturing) => (self.selectable = !capturing));
ui.sections.messagePrompt.on('exit', () => self.select('chat'));
