/** @type {typeof spawnDetached} */
(tag, cmd, args) => {
  const child = node.child_process.spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true });
  child.on('error', (err) => console.log(`[${tag}] failed:`, err.message));
  // stdio is ignored, so a command that launches fine but fails internally (e.g. a missing
  // PowerShell module for notify's win32 branch) would otherwise fail completely silently.
  child.on('exit', (code) => {
    if (code) console.log(`[${tag}] exited with code ${code}`);
  });
  child.unref();
};
