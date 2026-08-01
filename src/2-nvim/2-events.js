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

const readCursor = async () => {
  const [y, x] = await nvim.client.window.cursor;
  return { x, y };
};

nvim.client.channelId.then((chan) => {
  nvim.client.command(`autocmd TextChanged,TextChangedI * call rpcnotify(${chan}, 'lines')`);
  nvim.client.command(`autocmd CursorMoved,CursorMovedI * call rpcnotify(${chan}, 'cursor')`);
  nvim.client.command(`autocmd ModeChanged * call rpcnotify(${chan}, 'mode', mode())`);
});

nvim.client.on('notification', async (method, args) => {
  if (method === 'lines') {
    const buffer = await nvim.client.buffer;
    const lines = await buffer.lines;
    nvim.emit('lines', lines, await readCursor());
  } else if (method === 'cursor') {
    nvim.emit('cursor', await readCursor());
  } else if (method === 'mode') {
    const mode = MODE[args[0]?.[0]] ?? args[0];
    nvim.mode = mode;
    nvim.emit('mode', mode);
  }
});
