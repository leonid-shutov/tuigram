// Everything tuigram writes lives under XDG directories, never the cwd: credentials and
// settings in config/, the session database in data/, the log in state/.
const home = node.os.homedir();
const xdg = (variable, ...fallback) =>
  node.path.join(process.env[variable] || node.path.join(home, ...fallback), 'tuigram');

const config = xdg('XDG_CONFIG_HOME', '.config');
const data = xdg('XDG_DATA_HOME', '.local', 'share');
const state = xdg('XDG_STATE_HOME', '.local', 'state');

// 0700: an api_hash and a live session live here.
for (const dir of [config, data]) node.fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

({
  config,
  data,
  state,
  settings: node.path.join(config, 'config.json'),
  credentials: node.path.join(config, 'credentials.json'),
  // better-sqlite3 also creates `-wal` / `-shm` siblings next to this file.
  session: node.path.join(data, 'session.db'),
  log: process.env.TUIGRAM_LOG || node.path.join(state, 'tuigram.log'),
});
