/** @type {Actions['checkUpdate']} */
async () => {
  if (!config.updateCheck) return;
  // config.proxy is MTProto-only; node.https ignores HTTPS_PROXY, so a proxied user would just
  // get a silently failed check on every launch. Skipping is the honest answer.
  if (config.proxy !== undefined) return void console.log('[update] skipped: proxy configured');

  const release = await Update.check();
  store.update.available = release;
  if (release === null) ui.updateNotification.hide();
  else ui.updateNotification.display(release);
};
