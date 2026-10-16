/** @type {Actions['openSelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  // An album opens the medium on screen.
  const medium = ui.chat.selectedMedium;
  if (medium !== null && !message.pending && Media.isFile(medium) && medium.type !== 'sticker') {
    return void actions.openMedia(medium);
  }
  const url = Link.only(message.text);
  if (url !== null) return void OS.open(url);
  // Anything short of a bare URL asks first. A hidden link is listed with where it really goes,
  // since its text can claim anything.
  const links = Message.links(message);
  if (links.length === 0) return;
  if (links.length === 1) return void actions.confirmLink(links[0]);
  ui.choice.open({
    title: ` ${keymap.commands.chat['chat.open'].title} `,
    message: Message.preview(message) ?? '',
    pickHint: 'Open',
    options: links.map(({ label, url }) => ({ name: url.includes(label) ? url : `${label} → ${url}`, value: url })),
    /** @param {string} picked */
    onPick: (picked) => {
      navigation.select('chat');
      OS.open(picked);
    },
  });
  navigation.select('choice');
};
