'use strict';

const channel = require('./channel');
const pkg = require('../package.json');

// The app exits with this to be started again from scratch (src/08-actions/restart.js).
const RESTART = 75;

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
  };
};

module.exports = { createContext, RESTART };
