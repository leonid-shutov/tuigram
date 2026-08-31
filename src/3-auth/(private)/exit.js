/** @type {AuthSelf['exit']} */
(message, code) => {
  self.ui.dispose();
  screen.renderer.destroy();
  self.client.destroy().finally(() => {
    process.stderr.write(`tuigram: ${message}\n`);
    process.exit(code);
  });
};
