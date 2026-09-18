/** @type {Commands} */
({
  'app.cycleNext': { title: 'Next pane', run: () => navigation.cycleSection(1) },
  'app.cyclePrevious': { title: 'Previous pane', run: () => navigation.cycleSection(-1) },
  'app.focusDialogs': { title: 'Chat list', run: () => navigation.select('dialogs') },
  'app.focusChat': { title: 'Messages', run: () => navigation.select('chat') },
  'app.focusPrompt': { title: 'Message box', run: () => navigation.select('messagePrompt') },
  'app.search': { title: 'Jump to chat', hint: 'Search', run: () => navigation.select('picker') },
  'app.openConfig': { title: 'Edit config', run: () => actions.openConfig() },
});
