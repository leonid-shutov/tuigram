import { h } from '@opentui/core';
import { FilePickerRenderable } from './FilePickerRenderable.js';

/**
 * Construct-style factory, the same shape `@opentui/core`'s own `Select`/`Box` use for
 * composition-tree consumers (React/Solid bindings, or anything else built on `h`).
 *
 * @param {ConstructorParameters<typeof FilePickerRenderable>[1]} [props]
 * @param {...import('@opentui/core').VNode | import('@opentui/core').Renderable} children
 */
export function FilePicker(props, ...children) {
  return h(FilePickerRenderable, props ?? {}, ...children);
}
