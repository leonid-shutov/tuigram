self.ee ??= new node.events.EventEmitter();
(event, handler) => self.ee.on(event, handler);
