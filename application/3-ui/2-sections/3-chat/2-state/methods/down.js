() => {
  if ($.selectedMessage.index === 0) return;
  $.selectedMessage = $.messages[$.selectedMessage.index - 1];

  const remainder = $.selectedMessage.index - $.bottomMessage.index;
  const shouldScroll = remainder === $.SCROLLOFF - 1 && $.selectedMessage.index !== $.SCROLLOFF - 1;
  if (shouldScroll) {
    $.stickTo = 'bottom';
    $.bottomMessage = $.messages[$.bottomMessage.index - 1];
  }
};
