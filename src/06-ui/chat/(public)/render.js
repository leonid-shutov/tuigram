// Reconcile the bubbles with the store's window by message id. A bubble whose id is still held is
// kept — its picture stays decoded, its album page and its text's scroll survive — and redrawn
// only when the store swapped in a new copy of the message (see 05-store/chat/2-chat.js for the
// two rules this relies on). Since held messages never change order, walking the window from the
// newest end and inserting each new bubble above the one after it lays everything out in place.
// Only the outbox-unread run makes room for the bar, and it is always the chat's end: a bubble
// resized there can't move a view scrolled up, and sticky scroll keeps a view at the bottom pinned.
// Older history landing never changes the run, so inside `preserveScroll` the gutter writes are
// no-ops; the divider it may move up is laid out in there too, and counts toward the height kept.
// The divider and the day separators move between slots, so they go where they belong before the
// bubbles gone are destroyed: one of their slots may still hold them, and they would go with it.
/** @param {readonly ChatMessage[]} messages @param {ChatMarks} marks */
const reconcile = (messages, { outboxUnreadFrom, inboxUnreadFrom, inboxUnreadCount }) => {
  const previous = self.views;
  /** @type {BubbleView[]} */
  const views = new Array(messages.length);
  /** @type {import('@opentui/core').Renderable | null} */
  let below = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    let view = previous.get(message.id);
    if (view === null) {
      view = Bubble.create(message);
      if (below === null) self.scroll.add(view.slot);
      else self.scroll.insertBefore(view.slot, below);
    } else if (view.message !== message) Bubble.update(view, message);
    // Only a changed margin is written: opentui's setters schedule a render whatever the value, and
    // most passes (any dialog changing, say) change nothing here. The divider breaks a run of
    // grouped bubbles: the first new one keeps its gap.
    const isGrouped = i !== inboxUnreadFrom && Message.continues(messages[i - 1], message);
    const top = isGrouped ? -1 : 0;
    if (view.slot.marginTop !== top) view.slot.marginTop = top;
    const right = i >= outboxUnreadFrom ? Bubble.GUTTER : 0;
    if (view.slot.marginRight !== right) view.slot.marginRight = right;
    views[i] = view;
    below = view.slot;
  }

  self.views = KeyedList.from(views, (view) => view.message.id);
  // `below` is always a bubble still held, so the ones gone can wait until the walk is done.
  self.placeDivider(inboxUnreadCount);
  self.redate();
  for (const view of previous) if (!self.views.has(view.message.id)) view.slot.destroyRecursively();
};

/** @type {ChatSection['render']} */
(messages, marks) => {
  const { selectedIndex } = self;
  self.outboxUnreadFrom = marks.outboxUnreadFrom;
  self.inboxUnreadFrom = marks.inboxUnreadFrom;
  // Older history landed above what was on screen: keep the view where it was. `redate` runs
  // inside, so the separators it adds count toward the height preserveScroll anchors by.
  const head = self.views.at(0)?.message ?? null;
  const prepended = head !== null && messages.findIndex(({ id }) => id === head.id) > 0;
  if (prepended) ScrollBox.preserveScroll(self.scroll, () => reconcile(messages, marks));
  else reconcile(messages, marks);

  // The message under the cursor went away (a failed send dropped, or a pending one swapped for
  // the server's copy under a new id): the cursor stays at its place, on whatever now fills it.
  // No reveal — a scroll write would unlatch the sticky bottom — but a destroyed bubble took
  // opentui focus with it, so focus moves on with the cursor.
  if (self.selectedMessageId !== null && !self.views.has(self.selectedMessageId)) {
    const view = self.views.at(Math.min(selectedIndex, self.views.length - 1));
    self.selectedMessageId = view?.message.id ?? null;
    if (self.focused) (view?.box ?? self.component).focus();
  }

  self.paintDate();
};
