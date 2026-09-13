// The store's chat and this section's bubbles are appended, prepended and dropped by the same
// actions in the same order, so the cursor's index names the same message in both — the section
// never needs to cache message data itself.
/** @type {() => ChatSection['selectedMessage']} */
() => {
  if (self.selectedIndex === -1) return null;
  return store.chat.messages[self.selectedIndex] ?? null;
};
