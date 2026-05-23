(dialog) => {
  $.dialogs.push({ ...dialog, index: $.dialogs.length });
  if ($.dialogs.length === 1) $.selected = $.dialogs[0];
};
