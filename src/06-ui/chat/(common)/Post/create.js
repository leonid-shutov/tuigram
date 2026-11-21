// A post is a message's body (body.js) in the frame of the style `messageStyle` names (see Styles).
// The style is the post's for good: a new one in config.json takes `ui.chat.restyle` to build every
// post again. Where it sits among its neighbours is `Post.place`'s.
/** @type {typeof Post.create} */
(message) => {
  const style = Styles[config.messageStyle];
  const { nodes, ...body } = Post.body(message);
  const { root, box, header } = style.frame(message, nodes);

  // What the scroll holds: the frame, under its day separator when it is the day's first and the
  // unread divider when it is the first new message. A message longer than the chat section is
  // unreadable and impossible to select sensibly, so the slot never outgrows the section: '100%' is
  // the scroll viewport's inner height, which yoga re-resolves on every layout pass — it tracks a
  // terminal resize and the message prompt growing under it with nothing to recompute — and what
  // sits over the frame takes its rows out of the frame's share, so they always fit together.
  const slot = Box({
    flexDirection: 'column',
    gap: 1,
    maxHeight: '100%',
    flexShrink: 0,
    children: [root],
  });

  /** @type {PostView} */
  const view = { ...body, slot, root, box, header, style, message, mediumIndex: 0 };
  box.renderAfter = (buffer) => Post.drawScrollbar(view, buffer);
  Post.paint(view);
  return view;
};
