new tui.TextareaRenderable(ui.screen.renderer, {
  width: '100%',
  height: 1,
  maxHeight: 5,
  placeholder: 'Type a message...',
  backgroundColor: '#1a1b26',
  focusedBackgroundColor: '#24283b',
  textColor: '#c0caf5',
  focusedTextColor: '#c0caf5',
  cursorColor: '#7aa2f7',
  wrapMode: 'word',
  //keyBindings: [...defaultTextareaKeyBindings, { name: 'return', ctrl: true, action: 'submit' }],
  onContentChange: (args) => {
    console.log({ text: self.plainText });
  },
  //onSubmit: () => {
  //const value = textarea.plainText;
  //if (!value.trim()) return;
  //addMessage(chatBox, { from: 'me', body: value });
  //textarea.setText('');
  //composerHeight = 1;
  //textarea.height = 1;
  //},
});
