'use strict';

const { spawn } = require('child_process');
const https = require('https');

// Every way src/ reaches outside its own process; test/world.js swaps it (docs/decisions/0002).
const createWorld = async () => {
  const tui = await import('@opentui/core');
  // Required here, not at the top: bin/tuigram.js loads this file before `--version` and the
  // relaunch, which have no use for mtcute.
  const { TelegramClient } = require('./mtcute');
  return {
    terminal: { createRenderer: (config) => tui.createCliRenderer(config) },
    telegram: { Client: TelegramClient },
    spawn,
    https: { get: https.get },
  };
};

module.exports = { createWorld };
