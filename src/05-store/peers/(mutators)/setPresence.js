// Each word replaces the last, and an `online` holds only until its `until`: with no word by then,
// `lapse` takes the user offline.
Mutation(
  self,
  /** @type {PeersStoreSelf['setPresence']} */
  (userId, presence) => {
    node.timers.clearTimeout(self.timers.get(userId));
    self.timers.delete(userId);
    if (presence === null) {
      self.presence.delete(userId);
      return;
    }
    self.presence.set(userId, presence);
    if (presence.until === null) return;
    const timer = node.timers.setTimeout(() => self.lapse(userId), presence.until.getTime() - Date.now());
    timer.unref();
    self.timers.set(userId, timer);
  },
);
