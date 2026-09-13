/** @type {Commands} */
({
  'picker.down': { title: 'Next result', run: () => ui.picker.moveDown() },
  'picker.up': { title: 'Previous result', run: () => ui.picker.moveUp() },
  'picker.pick': { title: 'Open the selected chat', run: () => ui.picker.pick() },
  'picker.close': { title: 'Close the search', run: () => ui.picker.close() },
});
