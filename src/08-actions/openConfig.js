/** @type {Actions['openConfig']} */
async () => {
  const [cmd, ...args] = (process.env.VISUAL || process.env.EDITOR || 'vi').split(' ');
  screen.renderer.suspend();
  const { promise, resolve, reject } = Promise.withResolvers();
  node.child_process
    .spawn(cmd, [...args, config.paths.settings], { stdio: 'inherit' })
    .on('exit', resolve)
    .on('error', reject);
  await promise;
  config.reload();
  actions.repaintDialogs();
  actions.repaintHints();
  screen.renderer.resume();
};
