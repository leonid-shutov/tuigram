/** @type {ChatStore['newest']} */
() => self.messages.tail?.value ?? null;
