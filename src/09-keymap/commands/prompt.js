/** @type {Commands} */
({
  'prompt.send': { title: 'Send', priority: 'obvious', run: () => ui.messagePrompt.send() },
  'prompt.exit': {
    title: 'Leave the message box',
    hint: 'Leave',
    priority: 'obvious',
    run: () => ui.messagePrompt.exit(),
  },
  'prompt.attach': {
    title: 'Attach a file',
    hint: 'Attach',
    priority: 'essential',
    run: () => navigation.select('filePicker'),
  },
});
