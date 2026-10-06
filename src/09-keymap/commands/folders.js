/** @type {Commands} */
({
  'folders.next': { title: 'Next folder', hint: 'Next folder', run: () => actions.stepFolder(1) },
  'folders.previous': {
    title: 'Previous folder',
    hint: 'Prev folder',
    pair: { with: 'folders.next', hint: 'Folder' },
    run: () => actions.stepFolder(-1),
  },
  'folders.pick': { title: 'Pick folder', hint: 'Folders', priority: 'essential', run: () => actions.pickFolder() },
});
