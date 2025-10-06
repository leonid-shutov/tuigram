const mapping = {
  3: "messagePrompt",
  2: "dialog",
};

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
