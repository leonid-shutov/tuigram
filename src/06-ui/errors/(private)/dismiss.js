/** @type {ErrorsSelf['dismiss']} */
() => {
  node.timers.clearTimeout(self.timer);
  self.expanded = false;
  self.component.visible = false;
};
