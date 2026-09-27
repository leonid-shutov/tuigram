const SCROLL_HINT = ' hold shift to scroll ';

// Every bubble gets the same nodes up front, hidden until `paint` gives them something to draw (a
// hidden child takes no rows), so flipping an album or editing a caption only ever repaints —
// nothing is rebuilt. The picture exists only when some medium is drawable, sized once by the
// album size.
/** @type {typeof Bubble.create} */
(message) => {
  const { sender, isGroup, forwardedFrom } = message;
  const protocol = config.imageProtocol;
  const size = Media.albumSize(message.media);
  const muted = { fg: config.theme.muted, flexShrink: 0, visible: false };
  const counter = Text(muted);
  const picture = protocol === 'off' || size === null ? null : Picture(protocol, size);
  const label = Text({ ...muted, attributes: tui.TextAttributes.ITALIC });
  // `flexShrink: 1` (opentui's default, spelled out because it matters) so the text is the second
  // child to yield to the bubble's height cap, after the picture (see Picture.js) has given up
  // rows down to its own floor: yoga then hands the text whatever rows are left, and it becomes
  // the bubble's scroll window — see scrollMessage.
  const text = Text({ fg: config.theme.fg, flexShrink: 1, visible: false });

  const name = isGroup && !sender.isSelf ? sender.displayName?.slice(0, 24) : undefined;

  const forwardText =
    forwardedFrom &&
    Text({
      content: new tui.StyledText([
        tui.fg(config.theme.muted)(tui.italic('↪ Forwarded from ')),
        tui.fg(Bubble.senderColor(String(forwardedFrom.id ?? forwardedFrom.displayName)))(
          tui.italic(forwardedFrom.displayName.slice(0, 24)),
        ),
      ]),
      flexShrink: 0,
    });

  const box = Box({
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
    // on the labels keeps them at their own rows instead of being squeezed onto shared lines (a
    // label landing on the text's first line). The picture and the text are the two children that
    // DO shrink, in that order — see Picture.js and `text` above — so a tall photo gives up rows
    // before the caption loses even one line, and the text only becomes the bubble's scroll
    // window once the picture has hit its own floor. `overflow` then clips whatever the text
    // hasn't scrolled to, inside the bubble's own border.
    maxHeight: '100%',
    flexShrink: 0,
    overflow: 'hidden',

    children: [forwardText, counter, picture, label, text],

    // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
    ...(name && {
      title: ` ${name} `,
      titleAlignment: 'left',
      titleColor: Bubble.senderColor(String(sender.id)),
      minWidth: name.length + 6,
    }),
  });

  text.on('line-info-change', () => {
    // A hidden text (a bare photo) still reports a line it cannot show.
    box.bottomTitle = text.visible && text.maxScrollY > 0 ? SCROLL_HINT : undefined;
  });

  /** @type {BubbleView} */
  const view = { box, counter, picture, label, text, message, mediumIndex: 0 };
  Bubble.paint(view);
  return view;
};
