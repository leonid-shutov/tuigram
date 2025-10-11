const mapping = {
  1: "sideBar",
  2: "chat",
  3: "messagePrompt",
};

for (const [index, section] of Object.entries(mapping)) {
  sections[section].component.setLabel(` ${index} `);
}

screen.on("keypress", (ch) => {
  if (!layout.selectable) return;

  const section = mapping[ch];
  if (section !== undefined) {
    if (layout.selected !== undefined) {
      sections[layout.selected].deselect();
    }
    layout.selected = section;
    sections[section].component.focus();
    sections[section].select();
    screen.render();
  }
});

module.reserved = Object.keys(mapping);
