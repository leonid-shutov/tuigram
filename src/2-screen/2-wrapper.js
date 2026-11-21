const wrapper = new tui.BoxRenderable(screen.renderer, {
  id: 'wrapper',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

screen.renderer.root.add(wrapper);

wrapper;
