/** @type {Actions['repaintChat']} */
() => {
  const { openChatId, opened, presence } = store.chat;
  const messages = opened === null ? [] : opened.messages;
  const dialog = openChatId === null ? null : store.dialogs.find(openChatId);
  ui.chat.render({ messages, receipt: Message.receipt(messages.at(-1), dialog?.readUpTo ?? 0), presence });
};
