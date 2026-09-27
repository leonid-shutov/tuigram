// The bubble's scroll window: the TextRenderable under the cursor, or null when the chat is empty.
// A bare photo's text is hidden and empty, so scrolling it is a no-op.
/** @type {() => ChatSelf['selectedText']} */
() => {
  const message = self.selectedMessage;
  if (message === null) return null;
  return self.bubbles.get(message.id)?.text ?? null;
};
