/** @type {ChatSelf['selectMessage']} */
(index) => {
  const boxes = self.boxes;
  if (boxes.length === 0) {
    self.selectedIndex = -1;
    return;
  }
  const clamped = Math.max(0, Math.min(index, boxes.length - 1));
  self.selectedIndex = clamped;
  const bubble = boxes[clamped];
  // A day's first bubble brings its separator along, so the oldest message never lands with its
  // date just off screen. The bubble's reveal runs second: a tall one still pins its own top.
  const children = self.scroll.getChildren();
  const above = children[children.indexOf(bubble) - 1];
  if (above !== undefined && boxes.indexOf(above) === -1) ScrollBox.reveal(self.scroll, above);
  ScrollBox.reveal(self.scroll, bubble);
  // Land on the message's first line every time, agreeing with `reveal`'s own top-pinning of a
  // bubble too tall for the viewport.
  const text = self.selectedText;
  if (text !== null) text.scrollY = 0;
  if (self.focused) bubble.focus();
};
