/** @type {Navigation['select']} */
(section) => {
  if (navigation.selected === section) return;
  ui[navigation.selected].blur?.();
  navigation.previous = navigation.selected;
  navigation.selected = section;
  ui[section].focus?.();
  actions.repaintHints();
};
