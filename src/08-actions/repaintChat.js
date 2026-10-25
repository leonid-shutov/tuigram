// The divider counts what Telegram counted when the chat came into view — the true total even when
// the oldest of them never loaded — or, once more have landed below it during the visit, those.
/** @type {Actions['repaintChat']} */
() => {
  const { openChatId, opened, inboxUnread } = store.chat;
  const messages = opened?.messages ?? [];
  const dialog = openChatId === null ? null : store.dialogs.find(openChatId);
  const outboxUnreadFrom =
    dialog === null ? messages.length : Message.outboxUnreadFrom(messages, dialog.outboxReadUpTo);
  const inboxUnreadFrom = Message.inboxUnreadFrom(messages, inboxUnread?.after ?? null);
  const landed = messages.slice(inboxUnreadFrom).filter(({ sender }) => !sender.isSelf).length;
  const inboxUnreadCount = Math.max(inboxUnread?.count ?? 0, landed);
  ui.chat.render(messages, { outboxUnreadFrom, inboxUnreadFrom, inboxUnreadCount });
};
