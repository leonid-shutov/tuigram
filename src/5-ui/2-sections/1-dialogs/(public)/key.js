// SelectRenderable's own bindings: j/k, arrows, shift+arrows, Enter (emits ITEM_SELECTED).
/** @type {DialogsSelf['key']} */
(event) => {
  self.list.handleKeyPress(event);
};
