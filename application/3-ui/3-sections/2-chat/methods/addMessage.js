(message) => {
  self.messages.push(message);
  const bubble = self.Bubble(message);
  self.component.add(bubble);
  message.bubble = bubble;
};
