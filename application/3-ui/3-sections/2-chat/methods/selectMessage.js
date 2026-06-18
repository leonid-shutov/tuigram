(message) => {
  $.selected = message;
  const bubble = message.value.bubble;
  $.component.scrollChildIntoView(bubble.id);
  bubble.focus();
};
