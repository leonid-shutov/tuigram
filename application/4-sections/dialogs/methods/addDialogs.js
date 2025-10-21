(...dialogs) => {
  let i = 0;
  for (const dialog of dialogs) {
    module.container.append(module.dialog(i, dialog));
    i++;
  }
  screen.render();
};
