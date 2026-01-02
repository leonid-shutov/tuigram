(messages) => {
  const { numberOfLines } = common.text;

  for (const dialogToRemove of $.container.children.slice(1)) {
    $.container.remove(dialogToRemove);
  }

  let top = 0;

  const children = messages.map((message) => {
    const child = $.item(message, { top });
    top += numberOfLines(message.text) + 1;
    return child;
  });

  for (const child of children) $.container.append(child);
  ui.screen.render();
};
