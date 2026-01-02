(dialogs) => {
  // start from 1 to avoid removing label
  for (const dialogToRemove of $.container.children.slice(1)) {
    $.container.remove(dialogToRemove);
  }

  for (let i = 0; i < dialogs.length; i++) {
    const item = $.item(i, dialogs[i]);
    $.container.append(item);
  }

  ui.screen.render();
};
