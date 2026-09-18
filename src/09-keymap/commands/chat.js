/** @type {Commands} */
({
  'chat.down': { title: 'Next message', hint: 'Next', run: () => ui.chat.down() },
  'chat.up': { title: 'Previous message', hint: 'Previous', run: () => ui.chat.up() },
  'chat.first': { title: 'Oldest loaded message', hint: 'Oldest', run: () => ui.chat.first() },
  'chat.last': { title: 'Newest message', hint: 'Newest', run: () => ui.chat.selectLast() },
  'chat.open': { title: 'Open media or link', hint: 'Open', run: () => actions.openSelected() },
  'chat.copy': { title: 'Copy message text', hint: 'Copy', run: () => actions.copySelected() },
});
