'use strict';

const path = require('path');
const { existsSync, accessSync, readdirSync, constants } = require('fs');

// brew's formula (rewrite_shebang + bin.install_symlink) roots tuigram at
// <prefix>/Cellar/tuigram/<version>/libexec/lib/node_modules/tuigram; npm's global install roots
// it at <prefix>/lib/node_modules/tuigram on POSIX (Windows npm installs skip the `lib/` layer
// entirely -- see WIN_GLOBAL below). realpathSync gives back backslash paths on Windows, so
// rootDir is normalized to forward slashes before any of these run; brew/pacman never exist on
// Windows, so CELLAR/AUR_ROOT stay POSIX-only by construction.
const CELLAR = /\/Cellar\/tuigram\/[^/]+\/libexec\/lib\/node_modules\/tuigram$/;
const GLOBAL = /\/lib\/node_modules\/tuigram$/;
const NPM_SUFFIX = '/lib/node_modules/tuigram';

// Windows-only, gated on process.platform: without that gate, a POSIX checkout sitting under
// some unrelated project's local node_modules/tuigram would also match this shape.
const WIN_GLOBAL = /\/node_modules\/tuigram$/;
const WIN_NPM_SUFFIX = '/node_modules/tuigram';

// mise's npm backend doesn't go through lib/node_modules at all -- its bin is a shim that execs
// Node directly on .../mise/installs/npm-tuigram/<version>/node_modules/.mise/tuigram@<version>/
// node_modules/tuigram/bin/tuigram.js. The `.*` covers that `.mise/tuigram@<version>/` dedup
// layer, which is mise's own linker's implementation detail and not worth pinning exactly.
const MISE = /\/mise\/installs\/npm-tuigram\/.*\/node_modules\/tuigram$/;

// Arch's npm prefix is /usr, so the AUR package's `npm install --prefix /usr` lands at exactly
// the same path a plain `sudo npm i -g` would use -- GLOBAL alone can't tell them apart. Only
// pacman's own local database can, and that's what decides whether upgrading in place would
// fight pacman for ownership of these files.
const AUR_ROOT = '/usr/lib/node_modules/tuigram';
const PACMAN_LOCAL_DB = '/var/lib/pacman/local';
const isPacmanOwned = () => {
  try {
    return readdirSync(PACMAN_LOCAL_DB).some((entry) => /^tuigram-\d/u.test(entry));
  } catch {
    return false;
  }
};

/** @param {string} rootDir @returns {string | null} */
const npmPrefix = (rootDir) => {
  const normalized = rootDir.replaceAll('\\', '/');
  if (normalized.endsWith(NPM_SUFFIX)) return rootDir.slice(0, -NPM_SUFFIX.length);
  const winMatch = process.platform === 'win32' && normalized.endsWith(WIN_NPM_SUFFIX);
  if (winMatch) return rootDir.slice(0, -WIN_NPM_SUFFIX.length);
  return null;
};

// install.sh npm-installs into a prefix of its own (~/.local/lib/tuigram) with a private Node, so
// by path alone it is indistinguishable from npm's global layout -- its receipt is what tells them
// apart. It matters: an npm upgrade would run whichever npm is on PATH, against whichever Node,
// and better_sqlite3.node is ABI-bound to the Node that fetched it.
const INSTALLER = 'https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.sh';
const SCRIPT_RECEIPT = 'install.json';

// git checked before Cellar/global/mise/aur: an `npm link`ed checkout sits under lib/node_modules
// as a symlink and would otherwise match npm. script before npm, whose GLOBAL shape it shares.
/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'mise' | 'aur' | 'script' | 'unknown'} */
const detectUncached = (rootDir) => {
  if (existsSync(path.join(rootDir, '.git'))) return 'git';
  const normalized = rootDir.replaceAll('\\', '/');
  if (CELLAR.test(normalized)) return 'brew';
  if (rootDir === AUR_ROOT && isPacmanOwned()) return 'aur';
  const prefix = npmPrefix(rootDir);
  if (prefix !== null && existsSync(path.join(prefix, SCRIPT_RECEIPT))) return 'script';
  if (GLOBAL.test(normalized)) return 'npm';
  if (process.platform === 'win32' && WIN_GLOBAL.test(normalized)) return 'npm';
  if (MISE.test(normalized)) return 'mise';
  return 'unknown';
};

/** @type {{ rootDir: string; kind: ReturnType<typeof detectUncached> } | null} */
let cached = null;

/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'mise' | 'aur' | 'script' | 'unknown'} */
const detect = (rootDir) => {
  if (cached === null || cached.rootDir !== rootDir) cached = { rootDir, kind: detectUncached(rootDir) };
  return cached.kind;
};

// Resolved from the Cellar path we're running from, so a brew that isn't on PATH still works.
/** @param {string} rootDir */
const brewBinary = (rootDir) => {
  const [prefix] = rootDir.split('/Cellar/');
  const binary = path.join(prefix, 'bin', 'brew');
  return existsSync(binary) ? binary : 'brew';
};

// An empty `steps` means there is nothing this process can run itself -- `manualCommand` is the
// only thing to show, unconditionally (unlike brew's `null`, which relies on `writable()` always
// being true for a null prefix). The aur plan always is, and npm's on a Windows Node without npm-cli.js.
/** @typedef {{ prefix: string | null; manualCommand: string | null; steps: { cmd: string; args: string[] }[] }} Plan */

// On Windows `npm` is npm.cmd, a batch file only cmd.exe can start, and Node hands a shell its
// args unquoted (DEP0190), so a prefix with a space in it would break. npm.cmd only runs
// npm-cli.js, which Node's Windows builds keep next to node.exe -- running that directly needs no
// shell, and it is the npm of the Node that runs tuigram, whose ABI better-sqlite3's addon needs.
const npmCommand = () => {
  if (process.platform !== 'win32') return { cmd: 'npm', args: [] };
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return existsSync(npmCli) ? { cmd: process.execPath, args: [npmCli] } : null;
};

// npm on a machine with several Node versions on PATH (mise, nvm, asdf) has several global
// prefixes; --prefix pins the upgrade to the installation that is actually running, and an
// exact version (not @latest, unless that's what's passed) pins it to what was actually offered.
/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const npmPlan = (rootDir, version) => {
  const prefix = npmPrefix(rootDir);
  if (prefix === null) return null;
  const npm = npmCommand();
  // npm 11 only warns about install scripts missing from its allow-list, but is moving to skipping
  // them -- and without better-sqlite3's, there is no addon and tuigram dies at its first login.
  // Same flag as install.sh; an npm that predates it warns about an unknown option and goes on.
  const args = ['install', '--global', `--prefix=${prefix}`, '--allow-scripts=better-sqlite3', `tuigram@${version}`];
  return {
    prefix,
    manualCommand: `npm i -g tuigram@${version}`,
    // No npm-cli.js beside node.exe: an unusual Windows setup, left to the manual command.
    steps: npm === null ? [] : [{ cmd: npm.cmd, args: [...npm.args, ...args] }],
  };
};

// brew cannot install a tap bump it hasn't fetched, so callers run `brew update` first.
/** @param {string} rootDir @returns {Plan} */
const brewPlan = (rootDir) => {
  const brew = brewBinary(rootDir);
  return {
    prefix: null,
    // Never shown: writable() is always true when prefix is null, so nothing reads this.
    manualCommand: null,
    steps: [
      { cmd: brew, args: ['update'] },
      { cmd: brew, args: ['upgrade', 'leonid-shutov/tap/tuigram'] },
    ],
  };
};

// mise owns its own install directory the same way brew owns the Cellar, so there is no prefix
// to check -- and `mise upgrade` (unlike npm's `install`) already re-resolves to whatever's
// newest under the version constraint the user configured, so no explicit version is passed.
/** @returns {Plan} */
const misePlan = () => ({
  prefix: null,
  manualCommand: null,
  steps: [{ cmd: 'mise', args: ['upgrade', 'npm:tuigram'] }],
});

// pacman's package is the source of truth here, and only an AUR helper knows which one the user
// prefers (yay, paru, ...) and has the sudo prompt for it -- there is nothing to run in-process.
/** @returns {Plan} */
const aurPlan = () => ({
  prefix: null,
  manualCommand: 'update tuigram with your AUR helper, e.g. yay -Syu tuigram',
  steps: [],
});

// Upgrading is re-running the installer: it picks the Node the new release's engines.node asks
// for, so unlike npm a Node bump never blocks it. --install-dir pins it to the install that is
// actually running; it finds the launcher's directory in that install's receipt itself. No
// prefix to check: the directory is the user's own, and `sudo` in front of `curl | bash` would be
// the wrong advice anyway -- if it can't be written, the installer itself says so.
/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const scriptPlan = (rootDir, version) => {
  const prefix = npmPrefix(rootDir);
  if (prefix === null) return null;
  const pin = version === 'latest' ? [] : ['--version', version];
  // pipefail: a failed download must fail the step, not hand bash an empty script that exits 0.
  const script = 'set -o pipefail; curl -fsSL "$0" | bash -s -- --no-modify-path --install-dir "$@"';
  return {
    prefix: null,
    manualCommand: null,
    steps: [{ cmd: 'bash', args: ['-c', script, INSTALLER, prefix, ...pin] }],
  };
};

/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const upgradePlan = (rootDir, version) => {
  const kind = detect(rootDir);
  if (kind === 'npm') return npmPlan(rootDir, version);
  if (kind === 'brew') return brewPlan(rootDir);
  if (kind === 'mise') return misePlan();
  if (kind === 'aur') return aurPlan();
  if (kind === 'script') return scriptPlan(rootDir, version);
  return null;
};

/** @param {Plan | null} installPlan @returns {boolean} */
const writable = (installPlan) => {
  const prefix = installPlan?.prefix ?? null;
  if (prefix === null) return true;
  try {
    accessSync(prefix, constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

module.exports = { detect, brewBinary, npmPrefix, upgradePlan, writable };
