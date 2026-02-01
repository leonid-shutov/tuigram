() => {
  if ($.numberOfMessages === 0) return 0;
  return $.numberOfMessages - $.selectedMessage.index - 1;
};
