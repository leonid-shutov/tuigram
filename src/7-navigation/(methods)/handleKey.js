/** @type {Navigation['handleKey']} */
(event) => {
  if (event.name === 'tab') navigation.cycleSection(event.shift ? -1 : 1);
  else {
    const section = ui[navigation.selected];
    const chord = KeyInput.chord(event);
    const target = navigation.shortcuts[chord]?.section ?? navigation.sectionShortcuts[navigation.selected]?.[chord];
    if (target !== undefined && (!section.capturing || KeyInput.modified(event))) navigation.select(target);
    else section.key(event);
  }
};
