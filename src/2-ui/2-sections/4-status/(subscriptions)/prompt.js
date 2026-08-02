ui.sections.messagePrompt.on('mode', (mode) => (self.mode.content = mode.toUpperCase()));
ui.sections.messagePrompt.on('translit', (on) => (self.translit.content = `TRANSLIT:${on ? 'ON' : 'OFF'}`));
