const a = new tui.ScrollBoxRenderable(ui.screen.renderer, {
  flexGrow: 1,
  borderStyle: 'rounded',
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  focusedBorderColor: '#42AAFF',
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
    paddingY: 1,
  },
});

a.verticalScrollBar.visible = false;

a;
