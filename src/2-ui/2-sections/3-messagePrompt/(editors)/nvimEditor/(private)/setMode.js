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

(raw) => {
  const mode = MODE[raw?.[0]] ?? raw;
  self.mode = mode;
  input.cursorStyle = { style: mode === 'insert' ? 'line' : 'block', blinking: true };
  events.emit('capture', mode !== 'normal');
  events.emit('mode', mode);
};
