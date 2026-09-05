// Returns whether the watermark actually moved, so the caller knows to repaint the receipt.
/** @type {ChatStore['setReadUpTo']} */
(maxReadId) => {
  if (maxReadId <= self.readUpTo) return false;
  self.readUpTo = maxReadId;
  return true;
};
