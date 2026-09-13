/** @type {ChatSection['first']} */
() => {
  self.selectMessage(0);
  self.emit('reachTop');
};
