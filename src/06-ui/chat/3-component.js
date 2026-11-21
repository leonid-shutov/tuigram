const panel = Panel({
  id: 'chatWrapper',
  focusable: true,
  flexGrow: 1,
  flexDirection: 'column',
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  focusedBorderColor: config.theme.accent,
  titleColor: config.theme.muted,
  titleParts: {
    top: { left: ['label', 'name'], right: ['presence'] },
    bottom: { left: ['status'], center: ['date'], right: ['scrollHint', 'unreadLeft'] },
  },
  children: [self.scroll, self.empty],
});
// Live, since whether the selected post's text is cut off changes with layout, which tells no one.
panel.setTitlePart('scrollHint', () => self.scrollHint);
panel;
