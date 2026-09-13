// The funnel: every mutation of store.dialogs must be followed by this.
/** @type {Actions['repaintDialogs']} */
() => {
  const dialogs = store.dialogs.all();
  ui.dialogs.render(dialogs);
  ui.picker.setItems(dialogs);
};
