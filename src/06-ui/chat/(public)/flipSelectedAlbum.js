/** @type {ChatSection['flipSelectedAlbum']} */
(step) => {
  const message = self.selectedMessage;
  if (message === null) return;
  const view = self.bubbles.get(message.id);
  if (view !== undefined) Bubble.flipAlbum(view, step);
};
