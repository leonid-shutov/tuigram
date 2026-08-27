// @ts-check
/**
 * @template {object} TOptions
 * @template {import('@opentui/core').BaseRenderable} TInstance
 * @param {new (ctx: import('@opentui/core').RenderContext, options: TOptions) => TInstance} Renderable
 * @returns {(props?: { children?: OpenTUIChildren } & TOptions) => TInstance}
 */
(Renderable) =>
  (/** @type {any} */ props) => {
    const { children, ...options } = props ?? {};
    const component = new Renderable(screen.renderer, options);
    /** @type {any[]} */
    const flattened = [children ?? []].flat(Infinity);
    for (const child of flattened) if (child) component.add(child);
    return component;
  };
