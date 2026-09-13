/** @type {typeof spawnDetached} */
(tag, cmd, args) => {
  const child = node.child_process.spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.on('error', (err) => console.log(`[${tag}] failed:`, err.message));
  child.unref();
};
