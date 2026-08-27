// @ts-check
// Everything tuigram writes lives under XDG directories, never the cwd: credentials and
// settings in config/, the session database in data/, the log in state/.
const home = node.os.homedir();
/**
 * @param {string} variable
 * @param {string[]} fallback
 */
const xdg = (variable, ...fallback) =>
  node.path.join(process.env[variable] || node.path.join(home, ...fallback), 'tuigram');

const configDir = xdg('XDG_CONFIG_HOME', '.config');
const dataDir = xdg('XDG_DATA_HOME', '.local', 'share');
const stateDir = xdg('XDG_STATE_HOME', '.local', 'state');

// 0700: an api_hash and a live session live here.
for (const dir of [configDir, dataDir]) node.fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

/** @type {import('../../../types/config').Paths} */
({
  config: configDir,
  data: dataDir,
  state: stateDir,
  settings: node.path.join(configDir, 'config.json'),
  credentials: node.path.join(configDir, 'credentials.json'),
  // better-sqlite3 also creates `-wal` / `-shm` siblings next to this file.
  session: node.path.join(dataDir, 'session.db'),
  log: process.env.TUIGRAM_LOG || node.path.join(stateDir, 'tuigram.log'),
});
