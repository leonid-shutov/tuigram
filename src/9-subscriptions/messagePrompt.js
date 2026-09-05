ui.sections.messagePrompt.on('send', actions.send);
ui.sections.messagePrompt.on('exit', () => navigation.select('chat'));
