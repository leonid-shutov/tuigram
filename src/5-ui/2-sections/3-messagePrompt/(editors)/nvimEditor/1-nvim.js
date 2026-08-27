const { findNvim, attach } = npm.neovim;
const nvimPath = findNvim({ orderBy: 'desc', minVersion: '0.9.0' }).matches[0].path;

const proc = node.child_process.spawn(nvimPath, ['-u', 'NONE', '-i', 'NONE', '-n', '--embed']);
proc.on('error', (err) => console.log('nvim failed to start:', err));

const nvim = attach({ proc });
nvim
  .uiAttach(80, 24, {
    rgb: false,
    ext_cmdline: false,
    ext_popupmenu: false,
    ext_tabline: false,
    ext_wildmenu: false,
  })
  .then(() => nvim);
