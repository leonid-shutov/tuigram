/** @type {Actions['resizeDialogs']} */
(delta) => {
  if (ui.dialogs.resize(delta)) actions.repaintDialogs();
};
