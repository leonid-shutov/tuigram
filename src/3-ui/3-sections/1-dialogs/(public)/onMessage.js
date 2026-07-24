(message) => {
  const isMatch = (d) => d.chatId === message.chatId;

  const pinned = self.pinned.find(isMatch);
  if (pinned) {
    pinned.lastMessage = message.text;
  } else {
    const bumped = self.unpinned.moveToFront(isMatch);
    if (bumped) bumped.lastMessage = message.text;
    else self.unpinned.unshift(Dialog.fromMessage(message));
  }

  self.render();
};
