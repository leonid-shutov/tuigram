({ text, sender }) =>
  // Outline bubble, no fill (a fill + border produces an ugly halo in opentui). Unselected
  // self uses theme.selfBorder (same as incoming unless the theme differentiates); the
  // selected/focused bubble uses theme.selected, distinct from both.
  Box({
    flexDirection: 'column',
    borderStyle: theme.borderStyle,
    customBorderChars: theme.borderChars,
    borderColor: sender.isSelf ? theme.selfBorder : theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: theme.selected,
    focusable: true,
    children: [Text({ content: text, fg: theme.fg })],
  });
