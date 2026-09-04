/** @type {ChatStore['on']} */
(event, handler) => {
  self.chatEvents.on(event, handler);
};
