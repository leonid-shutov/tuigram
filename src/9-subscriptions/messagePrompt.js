ui.messagePrompt.on('send', actions.send);
ui.messagePrompt.on('exit', () => navigation.select('chat'));
