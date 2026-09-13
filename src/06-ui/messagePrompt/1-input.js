Textarea({
  width: '100%',
  height: 1,
  placeholder: 'Type a message...',
  placeholderColor: config.theme.muted,
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.surface,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  cursorColor: config.theme.accent,
  wrapMode: 'word',
  cursorStyle: { blinking: true },
  // The textarea binds a bare Enter to a newline and the keymap takes that for sending, so the
  // shifted Enter is what has to carry it.
  keyBindings: [{ name: 'return', shift: true, action: 'newline' }],
  // Typing reaches the textarea directly now, so the box resizes off its content rather than off
  // the keys that produced it — which also catches pastes, never key events to begin with.
  // `virtualLineCount` would count wrapped lines but is bounded by the height it would set.
  onContentChange: () => void (self.input.height = Math.max(1, self.input.lineCount)),
});
