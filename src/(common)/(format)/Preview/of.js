// One-line summary of a message. The dialogs list and the OS notification were computing
// this separately before the store/ui split; they now share it from the root context, which
// is also why it is named Preview rather than Media — 4-messenger's (common) already owns a
// branch-local `Media` namespace for Media.from.
/** @type {typeof Preview.of} */
(message) => {
  if (message === null || message === undefined) return '';
  if (message.text !== '') return message.text;
  if (message.media !== null && message.media !== undefined) return Preview.ofMedia(message.media);
  return '';
};
