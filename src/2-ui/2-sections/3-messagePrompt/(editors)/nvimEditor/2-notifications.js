self.nvim.on('notification', (method, args) => {
  if (method === 'lines') self.syncText();
  else if (method === 'cursor') self.syncCursor();
  else if (method === 'mode') self.setMode(args[0]);
});
