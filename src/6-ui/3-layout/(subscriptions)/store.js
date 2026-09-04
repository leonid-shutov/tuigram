// The only thing the layout still decides about an incoming message: whether to bother the user
// outside the terminal. Everything else about it is store policy.
store.dialogs.on('message', (message) => {
  if (store.chat.opened() === message.chatId) return;
  if (message.sender.isSelf || store.dialogs.isMuted(message.chatId)) return;
  self.notifyMessage(message);
});
