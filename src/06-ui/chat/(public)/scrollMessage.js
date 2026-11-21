/** @type {ChatSection['scrollMessage']} */
(lines) => {
  const text = self.selectedText;
  // `scrollY` clamps to the text's own `maxScrollY`, which is 0 unless the post's cap actually
  // cut it off — so this is a no-op on a post that fits, with nothing here to check for that.
  if (text !== null) text.scrollY += lines;
};
