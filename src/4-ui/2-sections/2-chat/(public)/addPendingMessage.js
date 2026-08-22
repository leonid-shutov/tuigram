(text) => {
  const message = Message.pending(text);
  self.addMessage(message);
  return message.id;
};
