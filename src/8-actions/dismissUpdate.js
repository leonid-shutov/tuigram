/** @type {Actions['dismissUpdate']} */
() => {
  const release = store.update.available;
  if (release === null) return;
  store.update.available = null;
  ui.updateNotification.hide();
};
