ScrollBox({
  flexGrow: 1,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  // On the box, not `contentOptions`: since opentui 0.8 the content is a facade that takes layout
  // options only, and drops a hook given there without a word.
  renderAfter: (buffer) => self.drawOutboxUnread(buffer),

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

  // No bar: a tall bubble draws its own (Bubble.drawScrollbar). With `scrollX: false` there is no
  // horizontal one either.
  verticalScrollbarOptions: { visible: false },
});
