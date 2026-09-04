/** @type {LayoutSelf['notifyMessage']} */
(message) => {
  let notitication = 'New message';
  if (message.text !== '') notitication = message.text;
  else if (message.media !== null) notitication = Media.placeholder(message.media);
  OS.notify(message.chatName, notitication);
};
