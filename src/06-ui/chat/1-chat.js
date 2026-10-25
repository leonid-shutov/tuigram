({
  focused: false,
  views: KeyedList.from([], (/** @type {BubbleView} */ view) => view.message.id),
  days: new Map(),
  selectedMessageId: null,
  spinner: { stop: () => {} },
  outboxUnreadFrom: 0,
  inboxUnreadFrom: 0,
});
