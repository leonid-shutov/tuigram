/** @type {Commands} */
({
  'chat.down': {
    title: 'Next message',
    hint: 'Next',
    priority: 'obvious',
    pair: { with: 'chat.up', hint: 'Move' },
    run: () => ui.chat.down(),
  },
  'chat.up': { title: 'Previous message', hint: 'Previous', priority: 'obvious', run: () => ui.chat.up() },
  'chat.first': {
    title: 'Oldest loaded message',
    hint: 'Oldest',
    pair: { with: 'chat.last', hint: 'Ends' },
    run: () => ui.chat.first(),
  },
  'chat.last': { title: 'Newest message', hint: 'Newest', run: () => ui.chat.selectLast() },
  'chat.albumNext': {
    title: 'Next picture in album',
    hint: 'Next pic',
    priority: 'essential',
    run: () => ui.chat.flipSelectedAlbum(1),
  },
  'chat.albumPrevious': {
    title: 'Previous picture in album',
    hint: 'Prev pic',
    priority: 'essential',
    pair: { with: 'chat.albumNext', hint: 'Album' },
    run: () => ui.chat.flipSelectedAlbum(-1),
  },
  'chat.actions': {
    title: 'Message actions',
    hint: 'Actions',
    priority: 'essential',
    run: () => actions.showActions(),
  },
  // Off the bar: the selected bubble's own border says "shift+↓/↑ scroll" exactly when there is more to see.
  'chat.scrollDown': { title: 'Scroll message down', hint: false, run: () => ui.chat.scrollMessage(1) },
  'chat.scrollUp': { title: 'Scroll message up', hint: false, run: () => ui.chat.scrollMessage(-1) },
});
