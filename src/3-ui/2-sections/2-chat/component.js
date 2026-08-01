ScrollBox({
  flexGrow: 1,
  borderStyle: theme.borderStyle,
  customBorderChars: theme.borderChars,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  borderColor: theme.border,
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
    paddingY: 1,
  },
  scrollbarOptions: { visible: false },
});
