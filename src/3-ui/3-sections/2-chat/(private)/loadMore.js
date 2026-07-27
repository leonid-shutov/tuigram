async () => {
  if (self.loadingMore || self.iterator === undefined) return;
  self.loadingMore = true;
  try {
    const { value, done } = await self.iterator.next();
    if (done || value === undefined || value.length === 0) return;

    // value is newest-first; unshift + add(_, 0) each in that order leaves the batch
    // ordered oldest-at-head, contiguous with the existing window. preserveScroll keeps the
    // messages already on screen from moving as the older ones are inserted above them.
    ScrollBox.preserveScroll(self.component, () => {
      for (const message of value) {
        self.messages.unshift(message);
        const bubble = self.Bubble(message);
        self.component.add(bubble, 0);
        message.bubble = bubble;
      }
    });
  } finally {
    self.loadingMore = false;
  }
};
