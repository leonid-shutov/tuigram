/** @type {MessageCommands} */
({
  'message.open': {
    title: 'Open media or link',
    hint: 'Open',
    priority: 'essential',
    appliesTo: Message.isOpenable,
    run: () => actions.openSelected(),
  },
  'message.copy': {
    title: 'Copy message text',
    hint: 'Copy',
    priority: 'essential',
    appliesTo: (message) => message.text !== '',
    run: () => actions.copySelected(),
  },
  'message.view': {
    title: 'View message in editor',
    hint: false,
    appliesTo: (message) => message.text !== '',
    run: () => actions.viewSelected(),
  },
  'message.reply': {
    title: 'Reply to message',
    hint: 'Reply',
    priority: 'essential',
    appliesTo: Message.isConfirmed,
    run: () => actions.replySelected(),
  },
  'message.forward': {
    title: 'Forward message',
    hint: 'Forward',
    priority: 'essential',
    appliesTo: Message.isConfirmed,
    run: () => actions.forwardSelected(),
  },
  'message.edit': {
    title: 'Edit message',
    hint: 'Edit',
    priority: 'essential',
    appliesTo: Message.isEditable,
    run: () => actions.editSelected(),
  },
  'message.delete': {
    title: 'Delete message',
    hint: 'Delete',
    priority: 'essential',
    appliesTo: (message) => message.deleteScopes.length > 0,
    run: () => actions.deleteSelected(),
  },
});
