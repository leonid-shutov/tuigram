process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');
process.on('uncaughtException', (error) => Crash.hard(error, 'uncaught exception'));
process.on('unhandledRejection', (reason) => Crash.hard(reason, 'unhandled rejection'));

ui[navigation.selected].focus();
actions.repaintHints();

actions.loadDialogsPreview();
actions.loadDialogs();
actions.loadArchivedDialogs();

actions.checkUpdate();
