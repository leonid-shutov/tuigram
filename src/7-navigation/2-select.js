/** @type {Navigation['select']} */
(section) => {
  if (self.selected === section) return;
  ui[self.selected].blur?.();
  self.selected = section;
  ui[section].focus();
};
