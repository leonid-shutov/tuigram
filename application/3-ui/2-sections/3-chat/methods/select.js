() => {
  $.ui.select();
  $.state.selected = true;
  if ($.state.opened) $.render();
};
