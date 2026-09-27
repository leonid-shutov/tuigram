// The medium on screen in the selected message: the album's medium on screen.
/** @type {() => ChatSection['selectedMedium']} */
() => {
  const message = self.selectedMessage;
  if (message === null) return null;
  const index = self.bubbles.get(message.id)?.mediumIndex ?? 0;
  return message.media[index] ?? null;
};
