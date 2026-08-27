(maxReadId) => {
  if (maxReadId > self.readUpTo) {
    self.readUpTo = maxReadId;
    self.renderReceipt();
  }
};
