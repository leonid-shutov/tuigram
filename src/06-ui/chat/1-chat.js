({
  focused: false,
  views: KeyedList.from([], (/** @type {PostView} */ view) => view.message.id),
  days: new Map(),
  selectedMessageId: null,
  spinner: { stop: () => {} },
  marks: { outboxUnreadFrom: 0, inboxUnreadFrom: 0, inboxUnreadCount: 0 },
  readUpTo: 0,
});
