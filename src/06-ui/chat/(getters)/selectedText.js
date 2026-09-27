// The bubble's scroll window: the TextRenderable under the cursor, or null when the selected
// message has no text (a bare photo) or the chat is empty.
/** @type {() => ChatSelf['selectedText']} */
() => {
  const message = self.selectedMessage;
  if (message === null) return null;
  return self.bubbles.get(message.id)?.text ?? null;
};
