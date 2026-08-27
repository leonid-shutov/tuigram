void self.nvim.channelId.then((chan) => {
  self.nvim.command(`autocmd TextChanged,TextChangedI * call rpcnotify(${chan}, 'lines')`);
  self.nvim.command(`autocmd CursorMoved,CursorMovedI * call rpcnotify(${chan}, 'cursor')`);
  self.nvim.command(`autocmd ModeChanged * call rpcnotify(${chan}, 'mode', mode())`);
});
