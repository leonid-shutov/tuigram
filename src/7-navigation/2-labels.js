for (const { label, section } of Object.values(self.shortcuts)) {
  if (label !== undefined) ui[section].setLabel(label);
}
