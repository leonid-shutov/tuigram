/** @type {ChatSelf['up']} */
() => {
  if (self.selectedIndex <= 0) return void self.emit('reachTop');
  self.selectMessage(self.selectedIndex - 1);
  if (self.selectedIndex < 10) self.emit('reachTop');
};
