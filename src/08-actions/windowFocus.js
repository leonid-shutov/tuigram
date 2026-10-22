/** @type {Actions['windowFocus']} */
() => {
  store.window.focused = true;
  actions.readOpenChat();
};
