(dialogs) => {
  $.stopLoading();
  for (const dialog of dialogs) $.addDialog(dialog);
};
