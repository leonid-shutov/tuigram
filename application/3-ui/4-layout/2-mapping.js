const mapping = {
  1: 'dialogs',
  2: 'chat',
  3: 'messagePrompt',
};

for (const [index, section] of Object.entries(mapping)) {
  ui.sections[section].setLabel(` ${index} `);
}

ui.screen.renderer.keyInput.on('keypress', (key) => {
  if (!$.selectable) return;

  const section = mapping[key.name];
  if (section !== undefined) $.select(section);
});

$.reserved.push(...Object.keys(mapping));
