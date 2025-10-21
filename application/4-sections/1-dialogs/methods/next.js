async () => {
  const state = module.state;

  const shouldLazyLoad =
    state.dialogs.length === 0 ||
    state.dialogs.length - state.selected.index === 3;
  if (shouldLazyLoad) {
    module.state.startLoading();
    module.loadMore().then((moreDialogs) => {
      module.state.uploadDialogs(moreDialogs);
      module.ui.setDialogs(module.state.getDialogs());
    });
  }

  const updatedDialogs = module.state.next();
  module.ui.setDialogs(updatedDialogs);
};
