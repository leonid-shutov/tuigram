// SelectRenderable's own Enter binding is the only way a dialog gets opened; re-emit it as
// the section's own intent so nothing above has to know about opentui's event names.
const events = Emitter();

self.list.on(
  tui.SelectRenderableEvents.ITEM_SELECTED,
  (/** @type {number} */ _index, /** @type {DialogOption} */ option) => events.emit('open', option.chatId),
);

events;
