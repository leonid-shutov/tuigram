/** @type {Commands} */
({
  'chat.down': { title: 'Next message', hint: 'Next', run: () => ui.chat.down() },
  'chat.up': { title: 'Previous message', hint: 'Previous', run: () => ui.chat.up() },
  'chat.first': { title: 'Oldest loaded message', hint: 'Oldest', run: () => ui.chat.first() },
  'chat.last': { title: 'Newest message', hint: 'Newest', run: () => ui.chat.selectLast() },
  'chat.openMedia': { title: 'Open in external viewer', hint: 'Open', run: () => void actions.openMedia() },
});
