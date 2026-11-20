'use strict';

const channel = require('./channel');
const pkg = require('../package.json');

// The app exits with this to be started again from scratch (src/08-actions/restart.js).
const RESTART = 75;

// The app exits with this for bin/tuigram.js to run the upgrade it wrote to UPGRADE_FILE's path
// (src/08-actions/upgrade.js). The variable also says that bin/tuigram.js can: one from before
// this existed, still running a copy upgraded under it, would take 76 for a plain exit. Both are
// a contract between versions, as RESTART is, so neither may change.
const UPGRADE = 76;
const UPGRADE_FILE = 'TUIGRAM_UPGRADE_FILE';

// The sandbox's context, shared by bin/tuigram.js and test/app.js (docs/decisions/0002).
const createContext = async ({ world, console, process, crashReport }) => {
  const tui = await import('@opentui/core');
  // uncommonjs's `npm` global only carries top-level package names, so the keymap's subpath
  // exports have to come in through the sandbox the way `tui` does.
  const Keymap = {
    host: await import('@opentui/keymap/opentui'),
    extras: await import('@opentui/keymap/extras'),
  };
  return {
    console,
    process,
    crashReport,
    world,
    tui,
    Keymap,
    AbortController,
    Channel: channel,
    packageVersion: pkg.version,
    __restartExitCode: RESTART,
    __upgradeExitCode: UPGRADE,
    __upgradeFile: process.env[UPGRADE_FILE] ?? null,
  };
};

module.exports = { createContext, RESTART, UPGRADE, UPGRADE_FILE };
