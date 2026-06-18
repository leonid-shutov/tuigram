ui.sections.dialogs.on('open', (dialog) => {
  ui.sections.chat.open(dialog.chatId);
  $.select('chat');
});
