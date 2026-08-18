(message) => {
  let dialog;
  const node = self.dialogs.findNode(message.chatId);
  if (node !== null) {
    dialog = node.value;
    self.dialogs.bump(node);
  } else {
    dialog = Dialog.fromMessage(message);
    self.dialogs.unshift(dialog);
  }

  dialog.lastMessage = message.text ?? message.placeholder;
  if (!message.sender.isSelf) dialog.unreadCount += 1;

  self.render();
};
