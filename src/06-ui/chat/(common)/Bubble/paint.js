/** @param {import('@opentui/core').TextRenderable} node @param {string} content */
const put = (node, content) => {
  node.content = content;
  node.visible = content !== '';
};

/** @type {typeof Bubble.paint} */
(view) => {
  const { message, mediumIndex, picture, label, counter, text } = view;
  const { media } = message;
  const medium = media[mediumIndex] ?? null;
  const drawn = picture !== null && Media.isImage(medium);
  if (picture !== null) {
    picture.visible = drawn;
    if (drawn) picture.source = medium.thumb ?? medium.preview ?? undefined;
  }
  put(label, medium === null || (drawn && medium.type === 'photo') ? '' : Preview.ofMedia(medium));
  put(counter, media.length > 1 ? `‹ ${mediumIndex + 1}/${media.length} ›` : '');
  put(text, message.text);
};
