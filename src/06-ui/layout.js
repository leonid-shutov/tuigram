screen.wrapper.add(
  Box({
    id: 'app',
    width: screen.size.width,
    height: screen.size.height,
    maxWidth: '100%',
    maxHeight: '100%',
    flexDirection: 'column',
    children: [
      Box({
        id: 'layout',
        width: '100%',
        flexGrow: 1,
        flexDirection: 'row',
        children: [
          ui.dialogs.component,
          Box({
            id: 'rightSide',
            flexDirection: 'column',
            children: [ui.chat.component, ui.messagePrompt.component],
          }),
        ],
      }),
      config.hints && ui.hints.component,
      ui.picker.component,
      ui.filePicker.component,
      ui.errors.component,
    ],
  }),
);
