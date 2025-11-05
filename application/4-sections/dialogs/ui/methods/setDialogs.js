(dialogs) => {
  // start from 1 to avoid removing label
  for (const dialogToRemove of module.container.children.slice(1)) {
    module.container.remove(dialogToRemove);
  }

  for (let i = 0; i < dialogs.length; i++) {
    const item = module.item(i, dialogs[i]);
    module.container.append(item);
  }

  console.dir(1);
};
