ui.sections.picker.on('pick', actions.openChat);
ui.sections.picker.on('close', () => navigation.select('chat'));
