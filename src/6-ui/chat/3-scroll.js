ScrollBox({
  flexGrow: 1,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
    paddingY: 1,
  },
  // The track defaults to #252527 and the thumb to #9a9ea3 — a near-black bar down the pane
  // on a light terminal. A track the color of the background reads as an empty gutter.
  scrollbarOptions: {
    visible: false,
    trackOptions: { backgroundColor: config.theme.bg, foregroundColor: config.theme.muted },
  },
});
