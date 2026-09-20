/** @type {Commands} */
({
  'filePicker.down': { title: 'Next entry', hint: 'Next', run: () => ui.filePicker.moveDown() },
  'filePicker.up': { title: 'Previous entry', hint: 'Previous', run: () => ui.filePicker.moveUp() },
  'filePicker.first': { title: 'First entry', run: () => ui.filePicker.first() },
  'filePicker.last': { title: 'Last entry', run: () => ui.filePicker.last() },
  'filePicker.open': { title: 'Open the folder, or attach the file', hint: 'Open', run: () => ui.filePicker.open() },
  'filePicker.goUp': { title: 'Go up a folder', hint: 'Up', run: () => ui.filePicker.goUp() },
  'filePicker.backspace': { title: 'Clear the filter', run: () => ui.filePicker.backspace() },
  'filePicker.filter': { title: 'Filter', hint: 'Filter', run: () => ui.filePicker.startFilter() },
  'filePicker.acceptFilter': { title: 'Apply the filter', hint: 'Apply', run: () => ui.filePicker.acceptFilter() },
  'filePicker.cancel': { title: 'Cancel', hint: 'Cancel', run: () => ui.filePicker.cancel() },
});
