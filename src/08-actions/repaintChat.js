/** @type {Actions['repaintChat']} */
() => {
  const { openChatId, opened } = store.chat;
  const messages = opened?.messages ?? [];
  const dialog = openChatId === null ? null : store.dialogs.find(openChatId);
  const unseenFrom = dialog === null ? messages.length : Message.unseenFrom(messages, dialog.readUpTo);
  ui.chat.render(messages, unseenFrom);
};
