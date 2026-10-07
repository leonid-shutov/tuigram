/** @type {ChatSection['clear']} */
() => {
  for (const child of self.scroll.getChildren()) child.destroy();
  self.bubbles.clear();
  self.days.clear();
  self.selectedIndex = -1;
  self.component.bottomTitle = undefined;
};
