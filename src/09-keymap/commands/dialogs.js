/** @type {Commands} */
({
  'dialogs.down': {
    title: 'Next chat',
    hint: 'Next',
    priority: 'obvious',
    pair: { with: 'dialogs.up', hint: 'Move' },
    run: () => ui.dialogs.moveDown(),
  },
  'dialogs.up': { title: 'Previous chat', hint: 'Previous', priority: 'obvious', run: () => ui.dialogs.moveUp() },
  'dialogs.first': {
    title: 'First chat',
    hint: 'First',
    priority: 'obvious',
    pair: { with: 'dialogs.last', hint: 'Ends' },
    run: () => ui.dialogs.first(),
  },
  'dialogs.last': { title: 'Last chat', hint: 'Last', priority: 'obvious', run: () => ui.dialogs.last() },
  'dialogs.open': { title: 'Open chat', hint: 'Open', priority: 'obvious', run: () => ui.dialogs.open() },
});
