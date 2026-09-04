/** @type {ChatStore['append']} */
(message) => {
  self.messages.push(message);
  self.emit('appended', message);
};
