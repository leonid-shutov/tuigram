(message) => {
  self.selected = message;
  const bubble = message.value.bubble;
  self.component.scrollChildIntoView(bubble.id);
  bubble.focus();
};
