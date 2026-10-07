/** @type {ChatSection['clear']} */
() => {
  for (const child of self.scroll.getChildren()) child.destroy();
  self.bubbles.clear();
  self.days.clear();
  self.selectedIndex = -1;
  for (const part of ['name', 'presence', 'status']) self.component.clearTitlePart(part);
};
