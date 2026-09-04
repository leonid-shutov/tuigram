// One-line summary of a message for a list row: its text, or a placeholder for whatever medium
// stands in place of text. `null` is a chat with no messages; mtcute can also hand back
// `undefined` for a dialog whose last message it could not resolve.
/** @type {typeof Preview.from} */
(message) => {
  if (message === null || message === undefined) return '';
  else if (message.text !== '') return message.text;
  else if (message.media !== null) return Media.placeholder(message.media);
  else return '';
};
