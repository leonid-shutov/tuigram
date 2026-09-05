// Absorb a message into the list: bump its chat to the top (pinned chats stay put) or
// insert one if the chat is not in the loaded window yet.
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
