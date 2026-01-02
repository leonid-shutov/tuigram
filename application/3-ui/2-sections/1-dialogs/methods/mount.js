async (parent) => {
  parent.append($.ui.container);
  await $.next();
  const dialogs = $.state.getDialogs();
  $.ui.setDialogs(dialogs);
  parent.render();
};
