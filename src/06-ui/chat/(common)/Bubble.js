/** @type {typeof Bubble} */
({ media, sender, isGroup }, picture, text) => {
  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;
  // '📷 Photo' above a visible photo is noise; a video keeps its label for the duration.
  const label = media === null || (picture !== null && media.type === 'photo') ? null : Preview.ofMedia(media);
  const labelText =
    label && Text({ content: label, fg: config.theme.muted, attributes: tui.TextAttributes.ITALIC, flexShrink: 0 });

  return Box({
    flexDirection: 'column',
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: config.theme.selected,
    focusable: true,

    // A message longer than the chat section is unreadable and impossible to select sensibly, so
    // the bubble never outgrows the section: '100%' is the scroll viewport's inner height, which
    // yoga re-resolves on every layout pass — it tracks a terminal resize and the message prompt
    // growing under it with nothing to recompute. The two companions are load-bearing, not
    // decoration: opentui defaults `flexShrink` to 1, so without it here AND on every child the
    // children get squeezed onto shared lines instead of cut off (a label lands on the text's
    // first line); `overflow` then clips what is past the fold, inside the bubble's own border.
    maxHeight: '100%',
    flexShrink: 0,
    overflow: 'hidden',

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
