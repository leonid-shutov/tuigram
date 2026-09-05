// SelectRenderable's own Enter binding is the only way a dialog gets opened; re-emit it as
// the section's own intent so nothing above has to know about opentui's event names.
Select({
  id: 'dialogsList',
  height: '100%',
  options: [],
  textColor: config.theme.fg,
  descriptionColor: config.theme.muted,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.fg,
  showSelectionIndicator: false,
}).on(tui.SelectRenderableEvents.ITEM_SELECTED, (/** @type {number} */ _index, /** @type {DialogOption} */ option) =>
  self.emit('open', option.chatId),
);
