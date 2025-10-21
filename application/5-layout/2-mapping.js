const mapping = {
  1: "dialogs",
  2: "chat",
  3: "messagePrompt",
};

for (const [index, section] of Object.entries(mapping)) {
  sections[section].setLabel(` ${index} `);
}

screen.on("keypress", (ch) => {
  if (!layout.selectable) return;

  const section = mapping[ch];
  if (section !== undefined) {
    if (layout.selected !== undefined) {
      sections[layout.selected].deselect();
    }
    layout.selected = section;
    sections[section].focus();
    sections[section].select();
    screen.render();
  }
});

module.reserved.push(...Object.keys(mapping));
