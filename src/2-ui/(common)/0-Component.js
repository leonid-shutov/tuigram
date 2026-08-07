(Renderable) =>
  ({ children, ...options } = {}) => {
    const component = new Renderable(ui.screen.renderer, options);
    for (const child of [children ?? []].flat(Infinity)) if (child) component.add(child);
    return component;
  };
