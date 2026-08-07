// Sibling order on the wrapper is meaningful: layout fills the space, status is the bottom
// bar, and the picker is absolutely positioned on top of both.
ui.screen.wrapper.add(
  Box({
    id: 'layout',
    width: '100%',
    flexGrow: 1,
    flexDirection: 'row',
    children: [
      ui.sections.dialogs.component,
      Box({
        id: 'rightSide',
        flexDirection: 'column',
        children: [ui.sections.chat.component, ui.sections.messagePrompt.component],
      }),
    ],
  }),
);

ui.screen.wrapper.add(ui.sections.status.component);
ui.screen.wrapper.add(ui.sections.picker.component);

ui.sections.dialogs.focus();
