() => {
  if ($.selected.index === $.messages.length - 1) return;
  const nextIndex = $.selected.index + 1;
  $.selectBubble(nextIndex);
};
