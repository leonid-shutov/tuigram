// Named Preview rather than Media because 4-messenger's (common) already owns a
// branch-local `Media` namespace.
/** @type {typeof Preview.of} */
(message) => {
  if (message === null || message === undefined) return '';
  if (message.text !== '') return message.text;
  if (message.media !== null && message.media !== undefined) return Preview.ofMedia(message.media);
  return '';
};
