({ text, placeholder, sender, isGroup }) => {
  const name = isGroup && !sender.isSelf ? sender.displayName.slice(0, 24) : undefined;

  return Box({
    flexDirection: 'column',
    borderStyle: theme.borderStyle,
    customBorderChars: theme.borderChars,
    borderColor: sender.isSelf ? theme.selfBorder : theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: theme.selected,
    focusable: true,
    // Media is never rendered, so a media message stands in with a muted label. Both rows
    // are conditional: Component drops falsy children, so a caption-less media message is
    // just the label and a text message is unchanged.
    children: [
      placeholder && Text({ content: placeholder, fg: theme.muted, attributes: tui.TextAttributes.ITALIC }),
      text && Text({ content: text, fg: theme.fg }),
    ],

    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: self.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });
};
