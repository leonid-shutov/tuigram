() => {
  if (!$.loading) return;
  $.dialogs.pop();
  $.loading = false;
};
