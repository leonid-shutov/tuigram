/** @type {DialogsSelf['onMessage']} */
(message) => {
  let dialog;
  const node = self.dialogs.findNode(message.chatId);
  if (node !== null) {
    dialog = node.value;
    dialog.lastMessage = UiDialog.preview(message);
    self.dialogs.bump(node);
  } else {
    dialog = UiDialog.fromMessage(message);
    self.dialogs.unshift(dialog);
  }

  if (!message.sender.isSelf) dialog.unreadCount += 1;

  self.render();
};
