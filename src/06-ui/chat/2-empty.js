// Over the scroll rather than beside it, so the scroll keeps its size and its sticky bottom.
Box({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  children: [Text({ content: Locale.t('No chat open'), fg: config.theme.muted })],
});
