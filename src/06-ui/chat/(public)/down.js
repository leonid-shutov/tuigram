/** @type {ChatSection['down']} */
(count = 1) => {
  if (self.selectedIndex >= self.views.length - 1) return;
  self.selectAt(self.selectedIndex + count);
};
