// Each word replaces the last, and an `online` holds only until its `until`: with no word by then,
// `lapse` takes the user offline.
// Past this Node clamps a timer to 1 ms (and warns on stderr, over the screen). Telegram sends an
// `online` until 2038 for bots and hidden presence: that one just holds until the next word.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

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
    const delay = Math.max(0, presence.until.getTime() - Date.now());
    if (delay > MAX_TIMEOUT_MS) return;
    const timer = node.timers.setTimeout(() => self.lapse(userId), delay);
    timer.unref();
    self.timers.set(userId, timer);
  },
);
