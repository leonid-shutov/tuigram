self.emitter ??= new node.events.EventEmitter();

/** @type {MessagePromptSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
