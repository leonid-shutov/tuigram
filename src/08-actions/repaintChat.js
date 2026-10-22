/** @type {Actions['repaintChat']} */
() => ui.chat.render(store.chat.opened?.messages ?? []);
