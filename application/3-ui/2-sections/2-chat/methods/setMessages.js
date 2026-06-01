(messages) => {
  $.messages = messages;
  for (const child of $.component.getChildren()) child.destroy();
  for (const message of messages) $.component.add($.Bubble(message));
  $.selectBubble(-1);
};
