// Telegram's own clients read an `online` past its `until` the same way: offline since then.
Mutation(
  self,
  /** @type {PeersStoreSelf['lapse']} */
  (userId) => {
    self.timers.delete(userId);
    const until = self.presence.get(userId)?.until ?? null;
    if (until !== null) self.presence.set(userId, { status: 'offline', lastOnline: until, until: null });
  },
);
