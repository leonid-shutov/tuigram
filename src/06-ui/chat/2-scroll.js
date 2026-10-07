const scroll = ScrollBox({
  flexGrow: 1,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,

  // No vertical padding, and that is what makes Bubble's `maxHeight: '100%'` honest: a percentage
  // resolves to the viewport's inner height, but the content box counts an over-tall child as at
  // most `viewport - contentPaddingY * 2`. With padding here the two disagree, `scrollHeight`
  // under-reports, and the newest messages become unreachable. Bubbles sit against the section's
  // border rows instead, which also leaves a full-height bubble the whole section to fill.
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
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
