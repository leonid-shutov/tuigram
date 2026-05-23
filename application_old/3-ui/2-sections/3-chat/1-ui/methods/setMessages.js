const renderFromBottom = (messages) => {
  let bottom = 0;

  return messages.map((message) => {
    const child = $.Item.from(message, { bottom });
    bottom += $.Message.calcHeight(message);
    return child;
  });
};

const renderFromTop = (messages) => {
  let top = 0;

  return messages.map((message) => {
    const child = $.Item.from(message, { top });
    top += $.Message.calcHeight(message);
    return child;
  });
};

(messages, stickTo) => {
  for (const messageToRemove of $.container.children.slice(1)) {
    $.container.remove(messageToRemove);
  }

  const children = stickTo === 'bottom' ? renderFromBottom(messages) : renderFromTop(messages.toReversed());

  for (const child of children) $.container.append(child);
  ui.screen.render();
};
