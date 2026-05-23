() => {
  if ($.selectedMessage.index + 1 === $.numberOfMessages) return;
  $.selectedMessage = $.messages[$.selectedMessage.index + 1];

  const remainder = $.topMessage.index - $.selectedMessage.index;
  const shouldScroll = remainder < $.SCROLLOFF && remainder !== $.messagesLeft;
  if (shouldScroll) {
    $.stickTo = 'top';
    $.topMessage = $.messages[$.topMessage.index + 1];
  }
};
