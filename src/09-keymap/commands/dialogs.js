/** @type {Commands} */
({
  'dialogs.down': { title: 'Next chat', hint: 'Next', run: () => ui.dialogs.moveDown() },
  'dialogs.up': { title: 'Previous chat', hint: 'Previous', run: () => ui.dialogs.moveUp() },
  'dialogs.first': { title: 'First chat', hint: 'First', run: () => ui.dialogs.first() },
  'dialogs.last': { title: 'Last chat', hint: 'Last', run: () => ui.dialogs.last() },
  'dialogs.open': { title: 'Open chat', hint: 'Open', run: () => ui.dialogs.open() },
});
