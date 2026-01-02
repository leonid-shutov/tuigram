const mapping = {
  1: 'dialogs',
  2: 'chat',
  3: 'messagePrompt',
};

for (const [index, section] of Object.entries(mapping)) {
  ui.sections[section].setLabel(` ${index} `);
}

ui.screen.on('keypress', (ch) => {
  if (!$.selectable) return;

  const section = mapping[ch];
  if (section !== undefined) {
    if ($.selected !== undefined) {
      ui.sections[$.selected].deselect();
    }
    $.selected = section;
    ui.sections[section].focus();
    ui.sections[section].select();
    ui.screen.render();
  }
});

$.reserved.push(...Object.keys(mapping));
