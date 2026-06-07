(messages) => {
  $.messages = messages;
  $.clear();
  for (const message of messages) {
    const bubble = $.Bubble(message);
    $.component.add(bubble);
    message.bubble = bubble;
  }
  $.selectMessage(messages.tail);
};
