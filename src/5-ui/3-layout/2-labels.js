// Every section reachable by a shortcut advertises its name in the border title.
for (const { label, section } of Object.values(self.shortcuts)) {
  ui.sections[section].setLabel(label);
}
