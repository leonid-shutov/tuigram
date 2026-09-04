// Deferred: (subscriptions) sorts before 1-list.js, so `self.list` does not exist yet.
store.dialogs.on('changed', () => self.render());
