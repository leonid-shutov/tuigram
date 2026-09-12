const scroll = ScrollBox({
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
  // The track and thumb otherwise fall back to opentui's hardcoded greys, which ignore the theme.
  scrollbarOptions: {
    trackOptions: { backgroundColor: config.theme.bg, foregroundColor: config.theme.border },
  },
});

// `visible: false` in the options is silently reverted once content overflows (see
// OPENTUI_BUGS.md); assigning through the setter is what actually sticks.
scroll.verticalScrollBar.visible = false;

scroll;
