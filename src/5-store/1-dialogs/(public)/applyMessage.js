// Fold a message into the dialog list, whichever direction it came from — received from the
// dispatcher or just sent by us. `receive` adds the policy that only applies to incoming ones.
/** @type {DialogsStore['applyMessage']} */
(message) => {
  let dialog;
  const node = self.dialogs.findNode(message.chatId);
  if (node !== null) {
    dialog = node.value;
    dialog.lastMessage = message;
    self.dialogs.bump(node);
  } else {
    dialog = Dialog.fromMessage(message);
    self.dialogs.unshift(dialog);
  }

  if (!message.sender.isSelf) dialog.unreadCount += 1;

  self.emit('changed');
};
