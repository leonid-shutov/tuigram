() => {
  if ($.selected === $.messages.tail) return;
  $.selectMessage($.selected.next);
};
