/** @type {ChatSelf['renderReceipt']} */
() => {
  const last = store.chat.newest();
  if (last === null || !last.sender.isSelf) {
    self.component.bottomTitle = undefined;
  } else {
    const read = !last.pending && last.id <= store.chat.readUpTo();
    self.component.bottomTitle = read ? ' read ' : ' unread ';
  }
};
