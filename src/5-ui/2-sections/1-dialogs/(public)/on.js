/** @type {DialogsSelf['on']} */
(event, handler) => {
  if (event === 'open') self.list.on(tui.SelectRenderableEvents.ITEM_SELECTED, (_, dialog) => handler(dialog));
};
