/** @type {Commands} */
({
  'choice.down': {
    title: 'Next option',
    hint: 'Next',
    priority: 'obvious',
    pair: { with: 'choice.up', hint: 'Move' },
    run: () => ui.choice.moveDown(),
  },
  'choice.up': { title: 'Previous option', hint: 'Previous', priority: 'obvious', run: () => ui.choice.moveUp() },
  'choice.pick': {
    title: 'Choose the highlighted option',
    get hint() {
      return ui.choice.pickHint;
    },
    priority: 'obvious',
    run: () => ui.choice.pick(),
  },
  'choice.close': { title: 'Close', hint: 'Cancel', priority: 'obvious', run: () => ui.choice.close() },
});
