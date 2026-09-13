/** @type {Commands} */
({
  'dialogs.down': { title: 'Next chat', run: () => ui.dialogs.moveDown() },
  'dialogs.up': { title: 'Previous chat', run: () => ui.dialogs.moveUp() },
  'dialogs.first': { title: 'First chat', run: () => ui.dialogs.first() },
  'dialogs.last': { title: 'Last chat', run: () => ui.dialogs.last() },
  'dialogs.open': { title: 'Open chat', run: () => ui.dialogs.open() },
});
