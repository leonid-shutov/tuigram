/** @type {Actions['openSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  const { media } = message;
  if (media !== null && !message.pending && Media.isFile(media) && media.type !== 'sticker') {
    actions.openMedia(media);
  } else {
    const url = Link.only(message.text);
    if (url !== null) OS.open(url);
  }
};
