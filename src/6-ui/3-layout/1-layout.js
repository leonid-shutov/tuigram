({
  selected: 'dialogs',
  cycle: ['dialogs', 'chat', 'messagePrompt'],
  shortcuts: {
    1: { label: ' 1 ', section: 'dialogs' },
    2: { label: ' 2 ', section: 'chat' },
    3: { label: ' 3 ', section: 'messagePrompt' },
    [Keys.CTRL_P]: { label: ' Jump to chat ', section: 'picker' },
  },
  sectionShortcuts: {
    dialogs: { [Keys.SLASH]: 'picker' },
  },
});
