const SCROLL_HINT = ' hold shift to scroll ';

/** @type {typeof Bubble} */
({ media, sender, isGroup, forwardedFrom }, picture, text) => {
  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;
  // '📷 Photo' above a visible photo is noise; a video keeps its label for the duration.
  const label = media === null || (picture !== null && media.type === 'photo') ? null : Preview.ofMedia(media);
  const labelText =
    label && Text({ content: label, fg: config.theme.muted, attributes: tui.TextAttributes.ITALIC, flexShrink: 0 });

  const forwardText =
    forwardedFrom &&
    Text({
      content: new tui.StyledText([
        tui.fg(config.theme.muted)(tui.italic('↪ Forwarded from ')),
        tui.fg(self.senderColor(String(forwardedFrom.id ?? forwardedFrom.displayName)))(
          tui.italic(forwardedFrom.displayName.slice(0, 24)),
        ),
      ]),
      flexShrink: 0,
    });

  const bubble = Box({
    flexDirection: 'column',
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: config.theme.selected,
    focusable: true,
    bottomTitleAlignment: 'right',

    // A message longer than the chat section is unreadable and impossible to select sensibly, so
    // the bubble never outgrows the section: '100%' is the scroll viewport's inner height, which
    // yoga re-resolves on every layout pass — it tracks a terminal resize and the message prompt
    // growing under it with nothing to recompute. `flexShrink: 0` here, on the forward line, AND
    // on the label keeps them at their own rows instead of being squeezed onto shared lines (a
    // label landing on the text's first line). The picture and the text are the two children that
    // DO shrink, in that order — see Picture.js and insert.js — so a tall photo gives up rows
    // before the caption loses even one line, and the text only becomes the bubble's scroll
    // window once the picture has hit its own floor. `overflow` then clips whatever the text
    // hasn't scrolled to, inside the bubble's own border.
    maxHeight: '100%',
    flexShrink: 0,
    overflow: 'hidden',

    children: [forwardText, picture, labelText, text],

    // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: self.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });

  if (text !== null) {
    text.on('line-info-change', () => {
      bubble.bottomTitle = text.maxScrollY > 0 ? SCROLL_HINT : undefined;
    });
  }

  return bubble;
};
