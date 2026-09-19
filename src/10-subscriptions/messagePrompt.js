ui.messagePrompt.on('send', Guard.soft(actions.send, 'Could not send the message.'));
ui.messagePrompt.on('edit', Guard.soft(actions.sendEdit, 'Could not edit the message.'));
ui.messagePrompt.on(
  'exit',
  Guard.soft(() => navigation.select('chat'), 'Something went wrong.'),
);
