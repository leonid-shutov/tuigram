self.emitter ??= new node.events.EventEmitter();

/** @type {FoldersStoreSelf['on']} */
(event, handler) => void self.emitter.on(event, handler);
