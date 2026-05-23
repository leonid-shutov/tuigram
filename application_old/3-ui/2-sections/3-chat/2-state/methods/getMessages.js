const { maxLines, Message } = ui.sections.chat.ui;

const sliceBottom = () => {
  const fittingMessages = [];
  let totalHeight = 0;
  for (let i = $.bottomMessage.index; totalHeight <= maxLines && i < $.numberOfMessages; i++) {
    const message = $.messages[i];
    fittingMessages.push(message);
    totalHeight += Message.calcHeight(message);
  }
  if (totalHeight > maxLines) fittingMessages.pop();
  $.topMessage = fittingMessages.at(-1);
  return fittingMessages;
};

const sliceTop = () => {
  const fittingMessages = [];
  let totalHeight = 0;
  for (let i = $.topMessage.index; totalHeight <= maxLines; i--) {
    const message = $.messages[i];
    fittingMessages.push(message);
    totalHeight += Message.calcHeight(message);
  }
  if (totalHeight > maxLines) fittingMessages.pop();
  $.bottomMessage = fittingMessages.at(-1);
  return fittingMessages.toReversed();
};

() => {
  const messages = $.stickTo === 'bottom' ? sliceBottom() : sliceTop();

  return messages.map((message) => ({
    ...message,
    selected: $.selected && $.selectedMessage !== null && message.index === $.selectedMessage.index,
  }));
};
