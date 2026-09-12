/** @type {DialogsStore['receive']} */
(message) => {
  let dialog;
  const node = self.list.findNode(message.chatId);
  if (node !== null) {
    dialog = node.value;
    dialog.lastMessage = message;
    self.list.bump(node);
  } else {
    dialog = Dialog.fromMessage(message);
    self.list.unshift(dialog);
  }

  if (!message.sender.isSelf) dialog.unreadCount += 1;

  return dialog;
};
