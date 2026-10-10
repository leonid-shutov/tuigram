// Reconcile the bubbles with the store's window by message id. A bubble whose id is still held is
// kept — its picture stays decoded, its album page and its text's scroll survive — and redrawn
// only when the store swapped in a new copy of the message (see 05-store/chat/2-chat.js for the
// two rules this relies on). Since held messages never change order, walking the window from the
// newest end and inserting each new bubble above the one after it lays everything out in place.
/** @param {readonly ChatMessage[]} messages */
const reconcile = (messages) => {
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
      if (below === null) self.scroll.add(view.box);
      else self.scroll.insertBefore(view.box, below);
    } else if (view.message !== message) Bubble.update(view, message);
    views[i] = view;
    below = view.box;
  }

  self.views = KeyedList.from(views, (view) => view.message.id);
  // `below` is always a bubble still held, so the ones gone can wait until the walk is done.
  for (const view of previous) if (!self.views.has(view.message.id)) view.box.destroy();
  self.redate();
};

/** @type {ChatSection['render']} */
({ messages, receipt, presence }) => {
  const { selectedIndex } = self;
  // Older history landed above what was on screen: keep the view where it was. `redate` runs
  // inside, so the separators it adds count toward the height preserveScroll anchors by.
  const head = self.views.at(0)?.message ?? null;
  const prepended = head !== null && messages.findIndex(({ id }) => id === head.id) > 0;
  if (prepended) ScrollBox.preserveScroll(self.scroll, () => reconcile(messages));
  else reconcile(messages);

  // The message under the cursor went away (a failed send dropped, or a pending one swapped for
  // the server's copy under a new id): the cursor stays at its place, on whatever now fills it.
  // No reveal — a scroll write would unlatch the sticky bottom — but a destroyed bubble took
  // opentui focus with it, so focus moves on with the cursor.
  if (self.selectedMessageId !== null && !self.views.has(self.selectedMessageId)) {
    const view = self.views.at(Math.min(selectedIndex, self.views.length - 1));
    self.selectedMessageId = view?.message.id ?? null;
    if (self.focused) (view?.box ?? self.component).focus();
  }

  self.paintHeader(receipt, presence);
  self.paintDate();
};
