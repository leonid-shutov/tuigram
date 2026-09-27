/** @type {Actions['openSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  // An album opens the medium on screen.
  const medium = ui.chat.selectedMedium;
  if (medium !== null && !message.pending && Media.isFile(medium) && medium.type !== 'sticker') {
    actions.openMedia(medium);
  } else {
    const url = Link.only(message.text);
    if (url !== null) OS.open(url);
  }
};
