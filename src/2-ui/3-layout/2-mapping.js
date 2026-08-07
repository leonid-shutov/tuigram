for (const [index, section] of Object.entries(self.mapping)) {
  ui.sections[section].setLabel(` ${index} `);
}

self.reserved.push(...Object.keys(self.mapping), ...Object.keys(self.shortcuts));
