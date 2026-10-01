/** @type {typeof Message.preview} */
(message) => {
  if (message === null || message === undefined) return '';
  if (message.text !== '') return message.text;
  if (message.media.length > 0) return Media.label(message.media[0]);
  return '';
};
