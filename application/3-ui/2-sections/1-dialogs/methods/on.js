(event, handler) => {
  if (event === 'open') $.list.on(tui.SelectRenderableEvents.ITEM_SELECTED, (_, dialog) => handler(dialog));
};
