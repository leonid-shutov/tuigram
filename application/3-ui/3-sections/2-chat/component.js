ui.components.ScrollBox({
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
  scrollbarOptions: { visible: false },
});
