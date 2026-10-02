/** @type {typeof Cells.fit} */
(text, width) => {
  const clipped = Cells.clip(text, width);
  return clipped + ' '.repeat(width - Cells.width(clipped));
};
