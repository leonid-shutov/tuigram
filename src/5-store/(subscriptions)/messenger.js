// Deferred on purpose: (subscriptions) sorts before 1-dialogs, so `store.dialogs` is still
// undefined while this file runs — only the callback body may touch it.
messenger.onNewMessage((message) => store.dialogs.receive(message));
