const layout = new tui.BoxRenderable(ui.screen.renderer, {
  id: 'wrapper',
  width: '100%',
  height: '100%',
  //justifyContent: 'center',
  //alignItems: 'center',
  flexDirection: 'row',
});

ui.screen.wrapper.add(layout);

layout.add(ui.sections.dialogs.component);

const rightSide = new tui.BoxRenderable(ui.screen.renderer, {
  id: 'rightSide',
  flexGrow: 1,
  flexDirection: 'column',
});

layout.add(rightSide);

rightSide.add(ui.sections.chat.component);
rightSide.add(ui.sections.messagePrompt.component);
ui.sections.dialogs.component.focus();

ui.sections.chat.open(1);
