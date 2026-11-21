// The bubble's scroll window: the TextRenderable under the cursor, or null when the chat is empty.
// A bare photo's text is hidden and empty, so scrolling it is a no-op.
/** @type {() => ChatSelf['selectedText']} */
() => {
  if (self.selectedMessageId === null) return null;
  return self.views.get(self.selectedMessageId)?.text ?? null;
};
