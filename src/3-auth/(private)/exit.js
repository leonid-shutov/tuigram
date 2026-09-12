/** @type {AuthSelf['exit']} */
(message, code) => {
  self.ui.dispose();
  screen.renderer.destroy();
  auth.client.destroy().finally(() => {
    process.stderr.write(`tuigram: ${message}\n`);
    process.exit(code);
  });
};
