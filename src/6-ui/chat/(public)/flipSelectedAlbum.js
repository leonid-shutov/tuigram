/** @type {ChatSection['flipSelectedAlbum']} */
(step) => {
  if (self.selectedMessageId === null) return;
  const view = self.views.get(self.selectedMessageId);
  if (view !== null) Bubble.flipAlbum(view, step);
};
