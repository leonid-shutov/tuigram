/** @type {ChatSelf['Bubble']} */
({ text, media, sender, isGroup }) => {
  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;
  const label = Media.placeholder(media);

  return Box({
    flexDirection: 'column',
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: config.theme.selected,
    focusable: true,
    children: [
      label && Text({ content: label, fg: config.theme.muted, attributes: tui.TextAttributes.ITALIC }),
      text && Text({ content: text, fg: config.theme.fg }),
    ],

    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: self.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });
};
