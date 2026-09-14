/** @param {KeymapBindingConfig} config */
const group = (config) => Keymap.extras.createBindingLookup(config).bindings;

({
  // Always active, so these are the chords that must also work mid-message.
  global: group({
    'app.cycleNext': 'tab',
    'app.cyclePrevious': 'shift+tab',
    'app.focusDialogs': 'alt+1',
    'app.focusChat': 'alt+2',
    'app.focusPrompt': 'alt+3',
    'app.search': 'ctrl+p',
  }),

  // The unmodified pane jumps. Installed only in the panes that are not a text field, which is
  // what keeps them from firing while a message is being typed.
  panes: group({
    'app.focusDialogs': '1',
    'app.focusChat': '2',
    'app.focusPrompt': '3',
    'app.search': '/',
  }),

  dialogs: group({
    'dialogs.down': ['j', 'down'],
    'dialogs.up': ['k', 'up'],
    'dialogs.first': 'gg',
    'dialogs.last': 'shift+g',
    'dialogs.open': 'return',
  }),

  chat: group({
    'chat.down': ['j', 'down'],
    'chat.up': ['k', 'up'],
    'chat.first': 'gg',
    'chat.last': 'shift+g',
    'chat.open': 'return',
  }),

  prompt: group({
    'prompt.send': 'return',
    'prompt.exit': 'escape',
  }),

  picker: group({
    'picker.down': 'down',
    'picker.up': 'up',
    'picker.pick': 'return',
    'picker.close': 'escape',
  }),
});
