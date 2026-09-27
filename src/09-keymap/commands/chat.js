/** @type {Commands} */
({
  'chat.down': { title: 'Next message', hint: 'Next', run: () => ui.chat.down() },
  'chat.up': { title: 'Previous message', hint: 'Previous', run: () => ui.chat.up() },
  'chat.first': { title: 'Oldest loaded message', hint: 'Oldest', run: () => ui.chat.first() },
  'chat.last': { title: 'Newest message', hint: 'Newest', run: () => ui.chat.selectLast() },
  'chat.albumNext': { title: 'Next picture in album', hint: 'Next pic', run: () => ui.chat.flipSelectedAlbum(1) },
  'chat.albumPrevious': {
    title: 'Previous picture in album',
    hint: 'Prev pic',
    run: () => ui.chat.flipSelectedAlbum(-1),
  },
  'chat.open': { title: 'Open media or link', hint: 'Open', run: () => actions.openSelected() },
  'chat.copy': { title: 'Copy message text', hint: 'Copy', run: () => actions.copySelected() },
  'chat.edit': { title: 'Edit message', hint: 'Edit', run: () => actions.editSelected() },
  'chat.scrollDown': { title: 'Scroll message down', hint: 'Scroll down', run: () => ui.chat.scrollMessage(1) },
  'chat.scrollUp': { title: 'Scroll message up', hint: 'Scroll up', run: () => ui.chat.scrollMessage(-1) },
});
