const LOGOUT_SUFFIXES = ['', '-wal', '-shm'];
const REVOKE_TIMEOUT = 10_000;

if (config.cli.command === 'logout') {
  const revoke = auth.client.logOut().catch(() => false);
  const expire = node.timers.promises.setTimeout(REVOKE_TIMEOUT, false);
  Promise.race([revoke, expire]).then((revoked) => {
    for (const suffix of LOGOUT_SUFFIXES) {
      Result.from(() => node.fs.rmSync(config.paths.session + suffix, { force: true }));
    }
    const where = revoked ? 'signed out' : 'session removed locally (Telegram was not reachable)';
    auth.exit(`${where}; deleted ${config.paths.session}`, 0);
  });
}
