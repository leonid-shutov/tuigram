// The draft stays: a reply is a new message, so whatever was being typed is what it will say.
/** @type {MessagePromptSection['reply']} */
(messageId, quote) => {
  if (self.editing !== null) self.clearEdit();
  self.replyingTo = messageId;
  self.setQuote(Quote.from(quote));
};
