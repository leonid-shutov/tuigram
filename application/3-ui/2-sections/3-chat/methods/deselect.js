() => {
  $.ui.deselect();
  $.state.selected = false;
  if ($.state.opened) $.render();
};
