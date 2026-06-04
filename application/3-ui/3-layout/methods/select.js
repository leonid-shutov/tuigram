(section) => {
  ui.sections[$.selected].blur?.();
  $.selected = section;
  ui.sections[section].focus();
};
