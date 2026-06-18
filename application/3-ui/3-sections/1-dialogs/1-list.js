$.loadMore().then((dialogs) =>
  ui.components.Select({
    id: 'dialogsList',
    height: '100%',
    options: dialogs,
    selectedBackgroundColor: '#2d4f2d',
    focusedBackgroundColor: '#1a1a1a',
  }),
);
