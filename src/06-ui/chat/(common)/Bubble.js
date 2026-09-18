/** @type {typeof Bubble} */
({ media, sender, isGroup }, picture, text) => {
  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;
  // '📷 Photo' above a visible photo is noise; a video keeps its label for the duration.
  const label = media === null || (picture !== null && media.type === 'photo') ? null : Preview.ofMedia(media);
  const labelText = label && Text({ content: label, fg: config.theme.muted, attributes: tui.TextAttributes.ITALIC });

  return Box({
    flexDirection: 'column',
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: config.theme.selected,
    focusable: true,
    children: [picture, labelText, text],

    // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: self.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });
};
