/** @type {Actions['repaintReceipt']} */
() => {
  const { openChatId, opened } = store.chat;
  if (openChatId === null || opened === null) return;
  const readUpTo = store.dialogs.find(openChatId)?.readUpTo ?? 0;
  ui.chat.paintReceipt(Message.receipt(opened.messages.at(-1), readUpTo));
};
