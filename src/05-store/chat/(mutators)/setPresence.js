// Presence is the open chat's alone: fetched on every open, never cached.
Mutation(
  self,
  /** @type {ChatStoreSelf['setPresence']} */
  (chatId, presence) => {
    if (self.isOpen(chatId)) self.presence = presence;
  },
);
