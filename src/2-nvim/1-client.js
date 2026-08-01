const { findNvim, attach } = npm.neovim;
const path = findNvim({ orderBy: 'desc', minVersion: '0.9.0' }).matches[0].path;

const proc = node.child_process.spawn(path, ['-u', 'NONE', '-i', 'NONE', '-n', '--embed']);
proc.on('error', (err) => console.error('nvim failed to start:', err));

const client = attach({ proc });
client
  .uiAttach(80, 24, {
    rgb: false,
    ext_cmdline: false,
    ext_popupmenu: false,
    ext_tabline: false,
    ext_wildmenu: false,
  })
  .then(() => client);
