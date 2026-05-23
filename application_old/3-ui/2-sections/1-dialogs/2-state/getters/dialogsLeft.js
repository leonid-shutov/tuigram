() => {
  if ($.numberOfDialogs === 0) return 0;
  return $.numberOfDialogs - $.selected.index;
};
