/** @type {MessagePromptSection['takeReply']} */
() => {
  const { replyingTo } = self;
  if (replyingTo === null) return null;
  self.replyingTo = null;
  self.setQuote(null);
  return replyingTo;
};
