/** @type {AuthUiSelf['ask']} */
({ label, hint, placeholder }) =>
  new Promise((resolve) => {
    const input = Input({
      width: 32,
      placeholder,
      placeholderColor: config.theme.muted,
      backgroundColor: config.theme.surface,
      focusedBackgroundColor: config.theme.selection,
      textColor: config.theme.fg,
      focusedTextColor: config.theme.fg,
      cursorColor: config.theme.accent,
    });

    const handle = self.mount({
      title: 'Sign in to Telegram',
      children: [Text({ content: label, fg: config.theme.fg }), input, Text({ content: hint, fg: config.theme.muted })],
    });

    handle.onKey((event) => {
      if (event.name === 'return' && input.value.trim() !== '') resolve(input.value.trim());
    });

    input.focus();
  });
