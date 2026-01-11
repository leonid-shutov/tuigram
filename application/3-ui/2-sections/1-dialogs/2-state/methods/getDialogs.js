() => {
  const dialogs = $.dialogs.slice($.window.start, $.window.end + 1);
  return dialogs.map((dialog) => ({
    ...dialog,
    selected: $.selected !== null && dialog.index === $.selected.index,
    opened: $.opened !== null && dialog.index === $.opened.index,
    isLast: $.window.end === dialog.index,
  }));
};
