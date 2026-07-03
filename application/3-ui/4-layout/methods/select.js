(section) => {
  ui.sections[self.selected].blur?.();
  self.selected = section;
  ui.sections[section].focus();
};
