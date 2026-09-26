/** @type {Actions['notify']} */
(message) => {
  const preview = Preview.of(message) || 'New message';
  const sender = message.sender.displayName;
  const notification = message.isGroup && sender !== null ? `${sender}: ${preview}` : preview;
  OS.notify(message.chatName, notification);
};
