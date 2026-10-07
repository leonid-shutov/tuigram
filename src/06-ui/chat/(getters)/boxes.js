// The scroll holds day separators between the bubbles; the cursor counts messages only, so
// everything that indexes the chat reads this instead of the raw children.
/** @type {() => ChatSelf['boxes']} */
() => {
  /** @type {Set<import('@opentui/core').Renderable>} */
  const separators = new Set(self.days.values());
  return self.scroll.getChildren().filter((child) => !separators.has(child));
};
