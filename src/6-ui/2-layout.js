// Sibling order on the wrapper is meaningful: layout fills the space and the picker is
// absolutely positioned on top of it.
screen.wrapper.add(
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

screen.wrapper.add(ui.sections.picker.component);
