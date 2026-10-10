/** @type {ChatSelf['selectAt']} */
(index) => {
  const view = self.views.at(Math.max(0, Math.min(index, self.views.length - 1)));
  if (view === null) {
    self.selectedMessageId = null;
    self.paintDate();
    return;
  }
  self.selectedMessageId = view.message.id;
  self.paintDate();
  // A day's first bubble brings its separator along, so the oldest message never lands with its
  // date just off screen. The bubble's reveal runs second: a tall one still pins its own top.
  const children = self.scroll.getChildren();
  const above = children[children.indexOf(view.box) - 1];
  const isSeparator = [...self.days.values()].some((separator) => separator === above);
  if (above !== undefined && isSeparator) ScrollBox.reveal(self.scroll, above);
  ScrollBox.reveal(self.scroll, view.box);
  // Land on the message's first line every time, agreeing with `reveal`'s own top-pinning of a
  // bubble too tall for the viewport.
  view.text.scrollY = 0;
  if (self.focused) view.box.focus();
};
