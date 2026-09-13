/** @type {Commands} */
({
  'prompt.send': { title: 'Send', run: () => ui.messagePrompt.send() },
  'prompt.exit': { title: 'Leave the message box', hint: 'Leave', run: () => ui.messagePrompt.exit() },
});
