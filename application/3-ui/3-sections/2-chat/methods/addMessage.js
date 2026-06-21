(message) => {
  $.messages.push(message);
  const bubble = $.Bubble(message);
  $.component.add(bubble);
  message.bubble = bubble;
};
