'use strict';

const path = require('path');
const { existsSync, accessSync, constants } = require('fs');

// brew's formula (rewrite_shebang + bin.install_symlink) roots tuigram at
// <prefix>/Cellar/tuigram/<version>/libexec/lib/node_modules/tuigram; npm's global install roots
// it at <prefix>/lib/node_modules/tuigram. Both regexes are POSIX path shapes, consistent with
// the rest of the repo (XDG paths, OS.open, spawnDetached) — this app has no Windows story.
const CELLAR = /\/Cellar\/tuigram\/[^/]+\/libexec\/lib\/node_modules\/tuigram$/;
const GLOBAL = /\/lib\/node_modules\/tuigram$/;
const NPM_SUFFIX = '/lib/node_modules/tuigram';

// git checked before Cellar/global: an `npm link`ed checkout sits under lib/node_modules as a
// symlink and would otherwise match npm.
/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'unknown'} */
const detectUncached = (rootDir) => {
  if (existsSync(path.join(rootDir, '.git'))) return 'git';
  if (CELLAR.test(rootDir)) return 'brew';
  if (GLOBAL.test(rootDir)) return 'npm';
  return 'unknown';
};

/** @type {{ rootDir: string; kind: ReturnType<typeof detectUncached> } | null} */
let cached = null;

/** @param {string} rootDir @returns {'git' | 'brew' | 'npm' | 'unknown'} */
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

/** @param {string} rootDir @param {string} version @returns {Plan | null} */
const upgradePlan = (rootDir, version) => {
  const kind = detect(rootDir);
  if (kind === 'npm') return npmPlan(rootDir, version);
  if (kind === 'brew') return brewPlan(rootDir);
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
