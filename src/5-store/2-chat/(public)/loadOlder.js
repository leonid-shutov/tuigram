/** @type {ChatStore['loadOlder']} */
async () => {
  if (self.loadingMore || self.iterator === undefined) return;
  self.loadingMore = true;
  try {
    const { value, done } = await self.iterator.next();
    if (done || value === undefined || value.length === 0) return;

    // value is newest-first; unshifting in that order leaves the batch ordered oldest-at-head,
    // contiguous with the existing window. The chat section mirrors the same order when it
    // inserts the bubbles, so `prepended` is emitted newest-first too.
    for (const message of value) self.messages.unshift(message);
    self.emit('prepended', value);
  } finally {
    self.loadingMore = false;
  }
};
