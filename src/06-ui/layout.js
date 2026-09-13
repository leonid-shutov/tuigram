screen.wrapper.add(
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
);

screen.wrapper.add(ui.hints.component);

screen.wrapper.add(ui.picker.component);
