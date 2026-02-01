() => {
  if (!$.loading) return;
  $.messages.pop();
  $.loading = false;
};
