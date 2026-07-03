const wrapper = new tui.BoxRenderable(self.renderer, {
  id: 'wrapper',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

self.renderer.root.add(wrapper);

wrapper;
