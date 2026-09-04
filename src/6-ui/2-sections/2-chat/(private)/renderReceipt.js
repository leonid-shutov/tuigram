/** @type {ChatSelf['renderReceipt']} */
() => {
  const last = self.messages.tail?.value;
  if (last === undefined || !last.sender.isSelf) {
    self.component.bottomTitle = undefined;
  } else {
    const read = !last.pending && last.id <= self.readUpTo;
    self.component.bottomTitle = read ? ' read ' : ' unread ';
  }
};
