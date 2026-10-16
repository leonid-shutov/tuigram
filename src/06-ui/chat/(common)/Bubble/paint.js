/** @param {import('@opentui/core').TextRenderable} node @param {string} content */
const put = (node, content) => {
  node.content = content;
  node.visible = content !== '';
};

// A line past this, bar included, is clipped, so a long quote never widens the bubble past a
// picture's width.
const QUOTE_CELLS = 41;

/** @type {typeof Bubble.paint} */
(view) => {
  const { message, mediumIndex, picture, reply, label, counter, text, reactions } = view;
  reply.visible = message.replyTo !== null;
  if (message.replyTo !== null) reply.content = Quote.paint(Quote.from(message.replyTo), QUOTE_CELLS);
  const { media } = message;
  const medium = media[mediumIndex] ?? null;
  const drawn = picture !== null && Media.isImage(medium);
  if (picture !== null) {
    picture.visible = drawn;
    if (drawn) picture.source = medium.thumb ?? medium.preview ?? undefined;
  }
  put(label, medium === null || (drawn && medium.type === 'photo') ? '' : Media.label(medium));
  put(counter, media.length > 1 ? `‹ ${mediumIndex + 1}/${media.length} ›` : '');
  text.content = Entities.paint(message.text, message.entities);
  text.visible = message.text !== '';
  reactions.visible = message.reactions.length > 0;
  if (reactions.visible) reactions.content = Reactions.paint(message.reactions);
};
