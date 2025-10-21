async (parent) => {
  parent.append(module.ui.container);
  await module.next();
  const dialogs = module.state.getDialogs();
  module.ui.setDialogs(dialogs);
  parent.render();
};
