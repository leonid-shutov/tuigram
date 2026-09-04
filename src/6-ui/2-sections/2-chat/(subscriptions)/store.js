// Deferred: (subscriptions) sorts before component.js, so `self.component` does not exist yet.
store.chat.on('opened', ({ messages }) => {
  for (const child of self.component.getChildren()) child.destroy();
  self.bubbles.clear();
  for (const message of messages) self.component.add(self.mount(message));
  self.selectMessage(store.chat.newest()?.id ?? null);
  self.renderReceipt();
  self.scrollToBottom();
});

store.chat.on('appended', (message) => {
  self.component.add(self.mount(message));
  self.renderReceipt();
});

// The batch is newest-first, so add(_, 0) in that order leaves it oldest-at-head, contiguous
// with the window already on screen. preserveScroll keeps what is on screen from moving as the
// older bubbles are inserted above it — see src/(common)/(components)/ScrollBox.js.
store.chat.on('prepended', (messages) => {
  ScrollBox.preserveScroll(self.component, () => {
    for (const message of messages) self.component.add(self.mount(message), 0);
  });
});

// The server's message carries a different id than the pending one, so the bubble is re-keyed
// in place; the cursor follows if it was sitting on it.
store.chat.on('confirmed', ({ tempId, message }) => {
  const bubble = self.bubbles.get(tempId);
  if (bubble !== undefined) {
    self.bubbles.delete(tempId);
    self.bubbles.set(message.id, bubble);
  }
  if (self.selectedId === tempId) self.selectedId = message.id;
  self.renderReceipt();
});

store.chat.on('receipt', () => self.renderReceipt());
