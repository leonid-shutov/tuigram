/** @type {Actions['notify']} */
(message) => {
  OS.notify(message.chatName, Preview.of(message) || 'New message');
};
