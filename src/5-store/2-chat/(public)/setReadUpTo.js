/** @type {ChatStore['setReadUpTo']} */
(maxReadId) => {
  if (maxReadId <= self.readMaxId) return;
  self.readMaxId = maxReadId;
  self.emit('receipt');
};
