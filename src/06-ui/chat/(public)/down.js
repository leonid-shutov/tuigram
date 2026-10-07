/** @type {ChatSection['down']} */
(count = 1) => {
  if (self.selectedIndex >= self.boxes.length - 1) return;
  self.selectMessage(self.selectedIndex + count);
};
