const nextWindow = () => {
  if ($.isAtLastWindow) return;
  $.window = { start: $.window.start + 1, end: $.window.end + 1 };
};

() => {
  if ($.isLastSelected) return $.getDialogs();
  const nextDialog = $.dialogs[$.selected.index + 1];
  const remainder = $.window.end - nextDialog.index;
  const shouldScroll = remainder === $.SCROLLOFF - 1 || remainder === -1;
  if (shouldScroll) nextWindow();
  $.selected = nextDialog;
  return $.getDialogs();
};
