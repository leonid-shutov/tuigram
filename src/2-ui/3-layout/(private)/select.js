(section) => {
  if (self.selected === section) return;
  ui.sections[self.selected].blur?.();
  self.selected = section;
  ui.sections[section].focus();
};
