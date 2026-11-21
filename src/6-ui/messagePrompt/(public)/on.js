self.emitter ??= new node.events.EventEmitter();

/** @type {MessagePromptOnImpl} */
(event, handler) => void self.emitter.on(event, handler);
