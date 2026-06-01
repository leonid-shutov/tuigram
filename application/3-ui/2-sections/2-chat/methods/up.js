() => {
  if ($.selected.index === 0) return;
  const nextIndex = $.selected.index - 1;
  $.selectBubble(nextIndex);
};
