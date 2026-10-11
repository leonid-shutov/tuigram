/** @type {typeof Cells.ellipsize} */
(text, width) => {
  const flat = text.replaceAll(/\s+/g, ' ');
  return Cells.width(flat) > width ? `${Cells.clip(flat, width - 1)}…` : flat;
};
