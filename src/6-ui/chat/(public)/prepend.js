// `older` is oldest-first, so adding at 0, 1, 2… lays the batch out above the current window
// in the right order. preserveScroll keeps the messages already on screen from moving as the
// older ones are inserted above them, and the cursor shifts down by the batch size with them.
/** @type {ChatSection['prepend']} */
(older) => {
  ScrollBox.preserveScroll(self.scroll, () => older.forEach((message, index) => self.insert(message, index)));
  if (self.selectedIndex !== -1) self.selectedIndex += older.length;
};
