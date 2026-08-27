// An unencrypted Telegram session is a full account credential, but better-sqlite3 creates
// the database and its journal siblings 0644. Creating the file ourselves first means sqlite
// inherits 0600 instead of briefly exposing it; calling this again after sign-in catches the
// -wal/-shm siblings, which only appear once the database has been written to.
const SUFFIXES = ['', '-wal', '-shm'];

() => {
  const [error, fd] = Err.risk(node.fs.openSync, config.paths.session, 'a', 0o600);
  if (error === null) node.fs.closeSync(fd);
  for (const suffix of SUFFIXES) Err.risk(node.fs.chmodSync, config.paths.session + suffix, 0o600);
};
