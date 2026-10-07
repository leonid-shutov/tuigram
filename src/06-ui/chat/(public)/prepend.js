// `older` is oldest-first, so indices 0, 1, 2… lay the batch out above the current window
// in the right order; the cursor shifts down by the batch size with it. `redate` runs inside the
// mutation so the separators it adds count toward the height preserveScroll anchors by.
/** @type {ChatSection['prepend']} */
(older) => {
  ScrollBox.preserveScroll(self.scroll, () => {
    older.forEach((message, index) => self.insert(message, index));
    self.redate();
  });
  if (self.selectedIndex !== -1) self.selectedIndex += older.length;
};
