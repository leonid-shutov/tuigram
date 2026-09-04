/** @type {ChatSelf['selectMessage']} */
(id) => {
  self.selectedId = id;
  // Nothing to scroll to on an empty chat, or before the bubble has been rendered.
  const bubble = id === null ? undefined : self.bubbles.get(id);
  if (bubble === undefined) return;
  self.component.scrollChildIntoView(bubble.id);
  bubble.focus();
};
