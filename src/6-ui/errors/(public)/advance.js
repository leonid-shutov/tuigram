/** @type {ErrorsSection['advance']} */
() => {
  if (!self.component.visible) return;
  if (self.expanded) return void self.dismiss();
  self.expanded = true;
  // Nothing may vanish mid-read once the detail is showing.
  node.timers.clearTimeout(self.timer);
  self.paint();
};
