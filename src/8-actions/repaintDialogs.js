// The funnel: every mutation of store.dialogs is immediately followed by this. Both consumers
// of the list are fed from one place, which is what lets picker.focus() stay data-free.
/** @type {Actions['repaintDialogs']} */
() => {
  const dialogs = store.dialogs.all();
  ui.dialogs.render(dialogs);
  ui.picker.setItems(dialogs);
};
