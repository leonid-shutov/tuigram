// Runs on every `change` of store.chat (10-subscriptions/store.js).
/** @type {Actions['repaintChat']} */
() => ui.chat.render(store.chat);
