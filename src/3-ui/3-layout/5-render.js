const layout = new tui.BoxRenderable(ui.screen.renderer, {
  id: 'layout',
  width: '100%',
  flexGrow: 1,
  flexDirection: 'row',
});

ui.screen.wrapper.add(layout);
ui.screen.wrapper.add(ui.sections.status.component);

layout.add(ui.sections.dialogs.component);

const rightSide = new tui.BoxRenderable(ui.screen.renderer, {
  id: 'rightSide',
  flexDirection: 'column',
});

layout.add(rightSide);

rightSide.add(ui.sections.chat.component);
rightSide.add(ui.sections.messagePrompt.component);
ui.sections.dialogs.component.focus();
