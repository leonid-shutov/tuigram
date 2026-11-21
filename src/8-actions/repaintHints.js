/** @type {Actions['repaintHints']} */
() => {
  if (config.hints) ui.hints.render(keymap.hints(navigation.selected));
};
