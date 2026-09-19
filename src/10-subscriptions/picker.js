ui.picker.on('pick', Guard.soft(actions.openChat, 'Could not open the chat.'));
ui.picker.on(
  'close',
  Guard.soft(() => navigation.select('chat'), 'Something went wrong.'),
);
