// Reconcile the posts with the store's window by message id. A post whose id is still held is kept
// — its picture stays decoded, its album page and its text's scroll survive — and redrawn only when
// the store swapped in a new copy of the message (see 05-store/chat/2-chat.js for the two rules this
// relies on). Since held messages never change order, walking the window from the newest end and
// inserting each new post above the one after it lays everything out in place. Each post is then
// placed among its neighbours (Post.place): the divider breaks a run, so the first new message heads
// one. Only the outbox-unread run makes room for the bar, and it is always the chat's end: a post
// resized there can't move a view scrolled up, and sticky scroll keeps a view at the bottom pinned.
// Older history landing never changes the run; the old head it now follows and the divider it may
// move up are laid out inside `preserveScroll`, and the anchor holds the view through them.
// The divider and the day separators move between slots, so they go where they belong before the
// posts gone are destroyed: one of their slots may still hold them, and they would go with it.
/** @param {readonly ChatMessage[]} messages @param {ChatMarks} marks */
const reconcile = (messages, { outboxUnreadFrom, inboxUnreadFrom, inboxUnreadCount }) => {
  const previous = self.views;
  /** @type {PostView[]} */
  const views = new Array(messages.length);
  /** @type {import('@opentui/core').Renderable | null} */
  let below = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    let view = previous.get(message.id);
    if (view === null) {
      view = Post.create(message);
      if (below === null) self.scroll.add(view.slot);
      else self.scroll.insertBefore(view.slot, below);
    } else if (view.message !== message) Post.update(view, message);
    Post.place(view, {
      first: i === 0,
      continued: i !== inboxUnreadFrom && Message.continues(messages[i - 1], message),
      outboxUnread: i >= outboxUnreadFrom,
    });
    views[i] = view;
    below = view.slot;
  }

  self.views = KeyedList.from(views, (view) => view.message.id);
  // `below` is always a post still held, so the ones gone can wait until the walk is done.
  self.placeDivider(inboxUnreadCount);
  self.redate();
  for (const view of previous) if (!self.views.has(view.message.id)) view.slot.destroyRecursively();
};

/** @type {ChatSection['render']} */
(messages, marks) => {
  const { selectedIndex } = self;
  self.marks = marks;
  // Older history landed above what was on screen: keep the view where it was. The old head's
  // post's box is held through it, and is the anchor rather than its slot: `redate` moves the day
  // separator from that slot up to the new head, and the divider may move too.
  const head = self.views.at(0) ?? null;
  const prepended = head !== null && messages.findIndex(({ id }) => id === head.message.id) > 0;
  if (prepended) ScrollBox.preserveScroll(self.scroll, head.box, () => reconcile(messages, marks));
  else reconcile(messages, marks);

  // The message under the cursor went away (a failed send dropped, or a pending one swapped for
  // the server's copy under a new id): the cursor stays at its place, on whatever now fills it.
  // No reveal — a scroll write would unlatch the sticky bottom — but a destroyed post took
  // opentui focus with it, so focus moves on with the cursor.
  if (self.selectedMessageId !== null && !self.views.has(self.selectedMessageId)) {
    const view = self.views.at(Math.min(selectedIndex, self.views.length - 1));
    self.selectedMessageId = view?.message.id ?? null;
    if (self.focused) (view?.box ?? self.component).focus();
  }

  self.paintDate();
  self.paintUnreadLeft();
};
