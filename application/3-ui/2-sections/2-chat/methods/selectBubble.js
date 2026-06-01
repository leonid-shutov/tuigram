(index) => {
  $.selected = $.messages.at(index);
  const bubbles = $.component.getChildren();
  const nextBubble = bubbles.at(index);
  $.component.scrollChildIntoView(nextBubble.id);
  nextBubble.focus();
};
