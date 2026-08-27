ScrollBox({
  flexGrow: 1,
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  borderColor: config.theme.border,
  bottomTitleAlignment: 'right',
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
    paddingY: 1,
  },
  scrollbarOptions: { visible: false },
});
