async (parent) => {
  await module.loadMore();
  module.navigator.next();
  parent.append(module.ui.container);
  parent.render();
};
