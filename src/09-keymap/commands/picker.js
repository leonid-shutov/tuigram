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
  'picker.pageDown': {
    title: 'Next page of results',
    pair: { with: 'picker.pageUp', hint: 'Page' },
    run: () => ui.picker.pageDown(),
  },
  'picker.pageUp': { title: 'Previous page of results', run: () => ui.picker.pageUp() },
  'picker.first': {
    title: 'First result',
    pair: { with: 'picker.last', hint: 'Ends' },
    run: () => ui.picker.first(),
  },
  'picker.last': { title: 'Last result', run: () => ui.picker.last() },
  'picker.pick': {
    title: 'Choose the highlighted result',
    hint: 'Open',
    priority: 'obvious',
    run: () => ui.picker.pick(),
  },
  'picker.close': { title: 'Close', hint: 'Close', priority: 'obvious', run: () => ui.picker.close() },
});
