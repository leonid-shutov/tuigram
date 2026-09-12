// `older` is oldest-first, so indices 0, 1, 2… lay the batch out above the current window
// in the right order; the cursor shifts down by the batch size with it.
/** @type {ChatSection['prepend']} */
(older) => {
  ScrollBox.preserveScroll(self.scroll, () => older.forEach((message, index) => self.insert(message, index)));
  if (self.selectedIndex !== -1) self.selectedIndex += older.length;
};
