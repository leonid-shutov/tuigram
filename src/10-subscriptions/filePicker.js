ui.filePicker.on('select', (filePath) => {
  navigation.select('messagePrompt');
  actions.sendFile(filePath);
});
ui.filePicker.on('cancel', () => navigation.select('messagePrompt'));
ui.filePicker.on('mode', actions.repaintHints);
ui.filePicker.on('error', (error) => ui.errors.report('Could not read that folder.', error));
