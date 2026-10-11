/** @type {MessagePromptSection['reset']} */
() => {
  if (self.editing !== null) self.clearEdit();
  if (self.replyingTo !== null) self.takeReply();
};
