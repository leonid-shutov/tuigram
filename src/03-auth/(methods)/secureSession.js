// A Telegram session is a full account credential, but better-sqlite3 creates the database
// and its journal siblings 0644. Pre-creating the file 0600 means sqlite inherits it; the
// second call after sign-in catches -wal/-shm, which only appear once the db is written to.
const SESSION_SUFFIXES = ['', '-wal', '-shm'];

/** @type {AuthSelf['secureSession']} */
() => {
  const opened = Result.from(() => node.fs.openSync(config.paths.session, 'a', 0o600));
  if (opened.ok) node.fs.closeSync(opened.unwrap());
  for (const suffix of SESSION_SUFFIXES) {
    Result.from(() => node.fs.chmodSync(config.paths.session + suffix, 0o600));
  }
};
