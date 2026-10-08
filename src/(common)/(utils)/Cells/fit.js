/** @type {typeof Cells.fit} */
(text, width) => {
  const { text: clipped, cells } = Cells.cut(text, width);
  return clipped + ' '.repeat(width - cells);
};
