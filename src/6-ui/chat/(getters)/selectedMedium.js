// The medium on screen in the selected message: the album's medium on screen.
/** @type {() => ChatSection['selectedMedium']} */
() => {
  if (self.selectedMessageId === null) return null;
  const view = self.views.get(self.selectedMessageId);
  if (view === null) return null;
  return view.message.media[view.mediumIndex] ?? null;
};
