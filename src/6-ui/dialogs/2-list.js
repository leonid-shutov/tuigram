// SelectRenderable's own Enter binding is the only way a dialog gets opened; re-emit it as
// the section's own intent so nothing above has to know about opentui's event names.
Select({
  id: 'dialogsList',
  height: '100%',
  options: [],
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.bg,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  descriptionColor: config.theme.muted,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.fg,
  selectedDescriptionColor: config.theme.muted,
  showSelectionIndicator: false,
  // j/k and the arrows still work.
  keyBindings: [
    { name: 'о', action: 'move-down' },
    { name: 'л', action: 'move-up' },
  ],
}).on(tui.SelectRenderableEvents.ITEM_SELECTED, (/** @type {number} */ _index, /** @type {DialogOption} */ option) =>
  self.emit('open', option.chatId),
);
