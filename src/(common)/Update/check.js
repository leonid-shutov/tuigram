/** @type {typeof Update.check} */
async () => {
  const channel = Channel.detect(__rootDir);
  if (channel === 'git' || channel === 'unknown') return null;

  const found = await Source[channel]();
  if (found === null) return null;
  console.log(`[update] checked; latest is ${found.version}`);

  if (!Version.newer(found.version, packageVersion)) return null;

  console.log(`[update] ${found.version} available (${channel}); running ${packageVersion}`);
  return found;
};
