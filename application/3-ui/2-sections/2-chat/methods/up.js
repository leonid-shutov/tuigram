() => {
  if ($.selected === $.messages.head) return;
  $.selectMessage($.selected.prev);
};
