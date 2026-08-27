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
});
