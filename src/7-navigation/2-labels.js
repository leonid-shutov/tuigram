for (const { label, section } of Object.values(navigation.shortcuts)) {
  if (label !== undefined) ui[section].setLabel(label);
}
