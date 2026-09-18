ui.messagePrompt.on('send', actions.send);
ui.messagePrompt.on('edit', actions.sendEdit);
ui.messagePrompt.on('exit', () => navigation.select('chat'));
