// The funnel: every mutation of store.chat must be followed by this.
/** @type {Actions['repaintChat']} */
() => ui.chat.render(store.chat);
