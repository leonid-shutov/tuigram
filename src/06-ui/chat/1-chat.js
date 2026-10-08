({
  focused: false,
  views: KeyedList.from([], (/** @type {BubbleView} */ view) => view.message.id),
  days: new Map(),
  selectedMessageId: null,
});
