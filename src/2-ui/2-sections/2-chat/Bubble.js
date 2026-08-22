({ text, media, sender, isGroup }) => {
  const name = isGroup && !sender.isSelf ? sender.displayName.slice(0, 24) : undefined;
  const label = Media.placeholder(media);

  return Box({
    flexDirection: 'column',
    borderStyle: theme.borderStyle,
    customBorderChars: theme.borderChars,
    borderColor: sender.isSelf ? theme.selfBorder : theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: theme.selected,
    focusable: true,
    children: [
      label && Text({ content: label, fg: theme.muted, attributes: tui.TextAttributes.ITALIC }),
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
