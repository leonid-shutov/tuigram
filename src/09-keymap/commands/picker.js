/** @type {Commands} */
({
  'picker.down': {
    title: 'Next result',
    hint: 'Next',
    priority: 'obvious',
    pair: { with: 'picker.up', hint: 'Move' },
    run: () => ui.picker.moveDown(),
  },
  'picker.up': { title: 'Previous result', hint: 'Previous', priority: 'obvious', run: () => ui.picker.moveUp() },
  'picker.pick': {
    title: 'Choose the highlighted result',
    hint: 'Open',
    priority: 'obvious',
    run: () => ui.picker.pick(),
  },
  'picker.close': { title: 'Close', hint: 'Close', priority: 'obvious', run: () => ui.picker.close() },
});
