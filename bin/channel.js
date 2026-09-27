'use strict';

const path = require('path');
const { existsSync, accessSync, readdirSync, constants } = require('fs');

// brew's formula (rewrite_shebang + bin.install_symlink) roots tuigram at
// <prefix>/Cellar/tuigram/<version>/libexec/lib/node_modules/tuigram; npm's global install roots
// it at <prefix>/lib/node_modules/tuigram. Both regexes are POSIX path shapes, consistent with
// the rest of the repo (XDG paths, OS.open, spawnDetached) — this app has no Windows story.
const CELLAR = /\/Cellar\/tuigram\/[^/]+\/libexec\/lib\/node_modules\/tuigram$/;
const GLOBAL = /\/lib\/node_modules\/tuigram$/;
const NPM_SUFFIX = '/lib/node_modules/tuigram';

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

// git checked before Cellar/global/mise/aur: an `npm link`ed checkout sits under lib/node_modules
// as a symlink and would otherwise match npm.
/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'mise' | 'aur' | 'unknown'} */
const detectUncached = (rootDir) => {
  if (existsSync(path.join(rootDir, '.git'))) return 'git';
  if (CELLAR.test(rootDir)) return 'brew';
  if (rootDir === AUR_ROOT && isPacmanOwned()) return 'aur';
  if (GLOBAL.test(rootDir)) return 'npm';
  if (MISE.test(rootDir)) return 'mise';
  return 'unknown';
};

/** @type {{ rootDir: string; kind: ReturnType<typeof detectUncached> } | null} */
let cached = null;

/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'mise' | 'aur' | 'unknown'} */
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

/** @param {string} rootDir @returns {string | null} */
const npmPrefix = (rootDir) => (rootDir.endsWith(NPM_SUFFIX) ? rootDir.slice(0, -NPM_SUFFIX.length) : null);

// An empty `steps` means there is nothing this process can run itself -- `manualCommand` is the
// only thing to show, unconditionally (unlike brew's `null`, which relies on `writable()` always
// being true for a null prefix). Right now only the aur plan is shaped this way.
/** @typedef {{ prefix: string | null; manualCommand: string | null; steps: { cmd: string; args: string[] }[] }} Plan */

// npm on a machine with several Node versions on PATH (mise, nvm, asdf) has several global
// prefixes; --prefix pins the upgrade to the installation that is actually running, and an
// exact version (not @latest, unless that's what's passed) pins it to what was actually offered.
/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const npmPlan = (rootDir, version) => {
  const prefix = npmPrefix(rootDir);
  if (prefix === null) return null;
  return {
    prefix,
    manualCommand: `npm i -g tuigram@${version}`,
    steps: [{ cmd: 'npm', args: ['install', '--global', `--prefix=${prefix}`, `tuigram@${version}`] }],
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

/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const upgradePlan = (rootDir, version) => {
  const kind = detect(rootDir);
  if (kind === 'npm') return npmPlan(rootDir, version);
  if (kind === 'brew') return brewPlan(rootDir);
  if (kind === 'mise') return misePlan();
  if (kind === 'aur') return aurPlan();
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
