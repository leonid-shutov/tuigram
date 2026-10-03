/** @type {Commands} */
({
  'folders.next': { title: 'Next folder', hint: 'Next folder', run: () => actions.stepFolder(1) },
  'folders.previous': { title: 'Previous folder', hint: 'Prev folder', run: () => actions.stepFolder(-1) },
  'folders.pick': { title: 'Pick folder', hint: 'Folders', run: () => actions.pickFolder() },
});
