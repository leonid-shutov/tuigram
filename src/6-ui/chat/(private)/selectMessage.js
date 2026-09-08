// Move the cursor to a row of the ScrollBox, clamped to what is actually rendered.
/** @type {ChatSelf['selectMessage']} */
(index) => {
  const children = self.scroll.getChildren();
  if (children.length === 0) {
    self.selectedIndex = -1;
    return;
  }
  const clamped = Math.max(0, Math.min(index, children.length - 1));
  self.selectedIndex = clamped;
  const bubble = children[clamped];
  self.scroll.scrollChildIntoView(bubble.id);
  bubble.focus();
};
