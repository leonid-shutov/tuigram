/** @type {Commands} */
({
  // With no chat open there is nowhere to send to, and the text stays in the box.
  'prompt.send': {
    title: 'Send',
    priority: 'obvious',
    run: () => {
      if (store.chat.openChatId !== null) ui.messagePrompt.send();
    },
  },
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
    run: () => {
      if (store.chat.openChatId !== null) navigation.select('filePicker');
    },
  },
});
