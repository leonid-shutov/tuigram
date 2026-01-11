const prevWindow = () => {
  if ($.isAtFirstWindow) return;
  $.window = { start: $.window.start - 1, end: $.window.end - 1 };
};

() => {
  const prevDialog = $.dialogs[$.selected.index - 1];
  if (prevDialog === undefined) return [];
  const remainder = prevDialog.index - $.window.start;
  const shouldScroll = remainder === $.SCROLLOFF - 1;
  if (shouldScroll) prevWindow();
  $.selected = prevDialog;
  return $.getDialogs();
};
