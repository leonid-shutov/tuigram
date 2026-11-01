/** @type {typeof Message.isOpenable} */
(message) =>
  (!message.pending && message.media.some(Media.isOpenable)) ||
  Link.only(message.text) !== null ||
  Message.links(message).length > 0;
