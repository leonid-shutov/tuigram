/** @type {ChatSection['clear']} */
() => {
  for (const child of self.component.getChildren()) child.destroy();
  self.bubbles.clear();
  self.selectedIndex = -1;
  self.component.bottomTitle = undefined;
};
