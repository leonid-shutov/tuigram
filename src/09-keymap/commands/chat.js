/** @type {Commands} */
({
  'chat.down': { title: 'Next message', run: () => ui.chat.down() },
  'chat.up': { title: 'Previous message', run: () => ui.chat.up() },
  'chat.first': { title: 'Oldest loaded message', run: () => ui.chat.first() },
  'chat.last': { title: 'Newest message', run: () => ui.chat.selectLast() },
});
