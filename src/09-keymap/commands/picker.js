/** @type {Commands} */
({
  'picker.down': { title: 'Next result', hint: 'Next', run: () => ui.picker.moveDown() },
  'picker.up': { title: 'Previous result', hint: 'Previous', run: () => ui.picker.moveUp() },
  'picker.pick': { title: 'Open the selected chat', hint: 'Open', run: () => ui.picker.pick() },
  'picker.close': { title: 'Close the search', hint: 'Close', run: () => ui.picker.close() },
});
