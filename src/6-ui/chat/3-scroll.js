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

// `visible: false` in the options is silently ignored: Renderable's constructor assigns the field
// directly, so ScrollBarRenderable never latches `_manualVisibility` and recalculates the bar back
// into view. Going through the setter is what actually keeps it hidden.
scroll.verticalScrollBar.visible = false;

scroll;
