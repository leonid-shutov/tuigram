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
  ScrollBox.reveal(self.scroll, bubble);
  // Land on the message's first line every time, agreeing with `reveal`'s own top-pinning of a
  // bubble too tall for the viewport.
  const text = self.selectedText;
  if (text !== null) text.scrollY = 0;
  if (self.focused) bubble.focus();
};
