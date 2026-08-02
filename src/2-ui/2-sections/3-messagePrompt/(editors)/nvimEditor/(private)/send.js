() => {
  events.emit('send', input.plainText);
  self.clear();
};
