/** @type {MessagePromptSection['exit']} */
() => {
  if (self.editing !== null) {
    self.clearEdit();
    return;
  }
  self.emit('exit');
};
