(messages) => {
  for (const dialogToRemove of module.container.children.slice(1)) {
    module.container.remove(dialogToRemove);
  }

  let top = 0;

  const children = messages.map((message) => {
    const child = module.item(message, { top });
    top += message.text.split("\n").length + 1;
    return child;
  });

  for (const child of children) module.container.append(child);
  screen.render();
};
