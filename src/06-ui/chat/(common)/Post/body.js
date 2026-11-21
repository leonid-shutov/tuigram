// What a message shows, the same in every style: the forward line, the reply, the album counter,
// the picture, the media label, the text and the reactions. Every node exists up front, hidden
// until `paint` gives it something to draw (a hidden child takes no rows), so flipping an album or
// editing a caption only ever repaints — nothing is rebuilt. The picture exists only when some
// medium is drawable, sized once by the album size. The style's frame goes around these nodes.
/** @type {typeof Post.body} */
(message) => {
  const { forwardedFrom } = message;
  const protocol = config.imageProtocol;
  const size = Post.albumSize(message.media);
  const muted = { fg: config.theme.muted, flexShrink: 0, visible: false };
  const counter = Text(muted);
  const picture = protocol === 'off' || size === null ? null : Picture(protocol, size);
  const label = Text({ ...muted, attributes: tui.TextAttributes.ITALIC });
  // Always two rows, unresolved or not, so a reply resolving later never changes the post's
  // height; `wrapMode: 'none'` keeps each line its own row even in a frame narrower than it.
  const reply = Text({ flexShrink: 0, wrapMode: 'none', visible: false });
  // `flexShrink: 1` (opentui's default, spelled out because it matters) so the text is the second
  // child to yield to the post's height cap, after the picture (see Picture.js) has given up rows
  // down to its own floor: yoga then hands the text whatever rows are left, and it becomes the
  // post's scroll window — see scrollMessage. Everything else is `flexShrink: 0`, so it keeps its
  // own rows instead of being squeezed onto shared lines.
  const text = Text({ fg: config.theme.fg, flexShrink: 1, visible: false });
  // One row at most (`Reactions.paint` folds the overflow into `+N`), and never squeezed: when the
  // post hits its height cap the text scrolls, the reactions stay put under it.
  const reactions = Text({ flexShrink: 0, wrapMode: 'none', visible: false });

  const forward =
    forwardedFrom &&
    Text({
      content: new tui.StyledText([
        tui.fg(config.theme.muted)(tui.italic('↪ Forwarded from ')),
        tui.fg(Sender.color(String(forwardedFrom.id ?? forwardedFrom.displayName)))(
          tui.italic(forwardedFrom.displayName.slice(0, 24)),
        ),
      ]),
      flexShrink: 0,
    });

  const nodes = [forward || null, reply, counter, picture, label, text, reactions];
  return { nodes, reply, counter, picture, label, text, reactions };
};
