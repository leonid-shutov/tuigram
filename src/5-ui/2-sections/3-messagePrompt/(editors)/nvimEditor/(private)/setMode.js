/** @type {Record<string, string | undefined>} */
const MODE = {
  n: 'normal',
  i: 'insert',
  v: 'visual',
  V: 'visual',
  R: 'replace',
  c: 'command',
  t: 'terminal',
  s: 'select',
};

/** @type {NvimEditorSelf['setMode']} */
(raw) => {
  const { events, input } = ui.sections.messagePrompt;
  const mode = MODE[raw?.[0]] ?? raw;
  self.mode = mode;
  input.cursorStyle = { style: mode === 'insert' ? 'line' : 'block', blinking: true };
  events.emit('mode', mode);
};
