const TOAST_MS = 6000;

/** @type {ErrorsSection['report']} */
(notice, error) => {
  Crash.soft(error);
  self.notice.content = notice;
  self.detail.content = Explain.line(error);
  self.component.visible = true;
  node.timers.clearTimeout(self.timer);
  if (!self.expanded) {
    self.timer = node.timers.setTimeout(() => self.dismiss(), TOAST_MS);
    self.timer.unref();
  }
  self.paint();
};
