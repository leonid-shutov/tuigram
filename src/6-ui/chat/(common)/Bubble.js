/** @type {typeof Bubble} */
({ text, media, sender, isGroup }, picture) => {
  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;
  // '📷 Photo' above a visible photo is noise. A video keeps its label — the duration is real
  // information a poster frame doesn't carry.
  const label = media === null || (picture !== null && media.type === 'photo') ? null : Preview.ofMedia(media);

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
      picture,
      label && Text({ content: label, fg: config.theme.muted, attributes: tui.TextAttributes.ITALIC }),
      text && Text({ content: text, fg: config.theme.fg }),
    ],

    // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: self.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });
};
