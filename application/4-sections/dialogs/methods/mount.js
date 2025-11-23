async (parent) => {
  await module.loadMore();
  const dialogs = module.state.getDialogs();
  module.ui.setDialogs(dialogs);
  parent.append(module.ui.container);
  parent.render();
};
