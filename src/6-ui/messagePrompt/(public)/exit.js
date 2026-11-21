/** @type {MessagePromptSection['exit']} */
() => {
  if (self.replyingTo !== null) {
    self.takeReply();
    return;
  }
  if (self.editing !== null) {
    self.clearEdit();
    return;
  }
  self.emit('exit');
};
